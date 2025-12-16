"""DataUpdateCoordinator for Statistics Orphan Finder."""
import logging
from datetime import datetime, timezone
from typing import Any


from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import device_registry as dr

from .const import DOMAIN
from .services import DatabaseService, StorageCalculator, SqlGenerator, SessionManager, EntityRepository
from .services.entity_analyzer import EntityAnalyzer

_LOGGER = logging.getLogger(__name__)


class StatisticsOrphanCoordinator(DataUpdateCoordinator):
    """Coordinator to fetch orphaned statistics entities."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, version: str) -> None:
        """Initialize coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=None,  # Manual updates only
        )
        self.entry = entry

        # Initialize service modules
        self.db_service = DatabaseService(hass, entry)
        self.storage_calculator = StorageCalculator(entry)
        self.sql_generator = SqlGenerator(entry)
        self.session_manager = SessionManager()
        self.entity_repository = EntityRepository()

        # Shutdown flag to prevent processing requests during unload
        self._is_shutting_down = False

        # Cache version from integration manifest (passed from setup)
        self._version = version

    def _get_engine(self):
        """Get or create database engine."""
        return self.db_service.get_engine()

    async def async_get_message_histogram(self, entity_id: str, hours: int) -> dict[str, Any]:
        """Get hourly message counts for an entity.

        Args:
            entity_id: Entity ID to analyze
            hours: Time range in hours (24, 48, or 168)

        Returns:
            Dictionary with hourly_counts, total_messages, and time_range_hours
        """
        def _fetch():
            engine = self._get_engine()
            return EntityAnalyzer.get_hourly_message_counts(engine, entity_id, hours)

        return await self.hass.async_add_executor_job(_fetch)

    async def async_get_database_size(self) -> dict[str, Any]:
        """Get database size information."""
        result = await self.db_service.async_get_database_size()

        # Add cached version (read once during __init__)
        result["version"] = self._version

        return result

    def _calculate_entity_storage(
        self,
        entity_id: str,
        origin: str,
        in_states_meta: bool = False,
        in_statistics_meta: bool = False,
        metadata_id_statistics: int | None = None
    ) -> int:
        """Calculate estimated storage size for an entity's data.

        Args:
            entity_id: The entity_id
            origin: Origin indicator (States, Short-term, Long-term, Both, States+Statistics)
            in_states_meta: Whether entity is in states_meta table
            in_statistics_meta: Whether entity is in statistics_meta table
            metadata_id_statistics: Optional metadata_id for statistics (if known)
        """
        engine = self._get_engine()
        return self.storage_calculator.calculate_entity_storage(
            engine, entity_id, origin, in_states_meta, in_statistics_meta, metadata_id_statistics
        )

    def generate_delete_sql(
        self,
        entity_id: str,
        origin: str,
        in_states_meta: bool = False,
        in_statistics_meta: bool = False,
        metadata_id_statistics: int | None = None
    ) -> str:
        """Generate SQL DELETE statement for removing orphaned entity.

        Args:
            entity_id: The entity_id to delete
            origin: Origin indicator (States, Short-term, Long-term, Both, States+Statistics)
            in_states_meta: Whether entity is in states_meta table
            in_statistics_meta: Whether entity is in statistics_meta table
            metadata_id_statistics: Optional metadata_id for statistics (if known)
        """
        engine = self._get_engine()
        return self.sql_generator.generate_delete_sql(
            engine, entity_id, origin, in_states_meta, in_statistics_meta, metadata_id_statistics
        )

    def _init_step_data(self, session_id: str | None = None):
        """Initialize step data for step-by-step fetching.

        Args:
            session_id: Optional session ID. If None, creates a new session.

        Returns:
            Dictionary with status, total_steps, and session_id
        """
        # Create new session (auto-cleans stale sessions)
        if session_id is None:
            session_id = self.session_manager.create_session()
        else:
            # If session_id provided but doesn't exist, create new one
            if not self.session_manager.validate_session(session_id):
                session_id = self.session_manager.create_session()

        return {'status': 'initialized', 'total_steps': 8, 'session_id': session_id}

    def _fetch_step_1_states_meta(self, session_id: str) -> dict[str, Any]:
        """Step 1: Fetch states_meta entities."""
        engine = self._get_engine()
        step_data = self.session_manager.get_session_data(session_id)

        # Fetch entity IDs from repository
        entity_ids = self.entity_repository.fetch_states_meta(engine)

        # Update session data
        for entity_id in entity_ids:
            step_data['entity_map'][entity_id]['in_states_meta'] = True

        entity_count = sum(1 for e in step_data['entity_map'].values() if e['in_states_meta'])
        self.session_manager.update_timestamp(session_id)
        return {'status': 'complete', 'entities_found': entity_count}

    def _fetch_step_2_states(self, session_id: str) -> dict[str, Any]:
        """Step 2: Fetch states with counts and update frequencies (batched for performance)."""
        engine = self._get_engine()
        step_data = self.session_manager.get_session_data(session_id)

        # Fetch states data and frequency data from repository
        states_data, frequency_data = self.entity_repository.fetch_states_with_counts(engine)

        # Update session data with states info
        for entity_id, data in states_data.items():
            step_data['entity_map'][entity_id]['in_states'] = True
            step_data['entity_map'][entity_id]['states_count'] = data['count']
            if data['last_update']:
                step_data['entity_map'][entity_id]['last_state_update'] = data['last_update']

        # Update session data with frequency info
        for entity_id, freq in frequency_data.items():
            step_data['entity_map'][entity_id]['update_frequency'] = freq

        entity_count = sum(1 for e in step_data['entity_map'].values() if e['in_states'])
        self.session_manager.update_timestamp(session_id)
        return {'status': 'complete', 'entities_found': entity_count}

    def _fetch_step_3_statistics_meta(self, session_id: str) -> dict[str, Any]:
        """Step 3: Fetch statistics_meta entities with metadata_id."""
        engine = self._get_engine()
        step_data = self.session_manager.get_session_data(session_id)

        # Fetch statistics metadata from repository
        metadata_map = self.entity_repository.fetch_statistics_meta(engine)

        # Update session data
        for entity_id, metadata_id in metadata_map.items():
            step_data['entity_map'][entity_id]['in_statistics_meta'] = True
            step_data['entity_map'][entity_id]['metadata_id'] = metadata_id

        entity_count = sum(1 for e in step_data['entity_map'].values() if e['in_statistics_meta'])
        self.session_manager.update_timestamp(session_id)
        return {'status': 'complete', 'entities_found': entity_count}

    def _fetch_step_4_statistics_short_term(self, session_id: str) -> dict[str, Any]:
        """Step 4: Fetch statistics_short_term with counts."""
        engine = self._get_engine()
        step_data = self.session_manager.get_session_data(session_id)

        # Fetch short-term statistics from repository (handles missing table gracefully)
        stats_data = self.entity_repository.fetch_statistics_short_term(engine)

        # Update session data
        for entity_id, data in stats_data.items():
            step_data['entity_map'][entity_id]['in_statistics_short_term'] = True
            step_data['entity_map'][entity_id]['stats_short_count'] = data['count']
            if data['last_update']:
                # Update last_stats_update if this is newer
                if not step_data['entity_map'][entity_id]['last_stats_update'] or \
                   data['last_update'] > step_data['entity_map'][entity_id]['last_stats_update']:
                    step_data['entity_map'][entity_id]['last_stats_update'] = data['last_update']

        entity_count = sum(1 for e in step_data['entity_map'].values() if e['in_statistics_short_term'])
        self.session_manager.update_timestamp(session_id)
        return {'status': 'complete', 'entities_found': entity_count}

    def _fetch_step_5_statistics_long_term(self, session_id: str) -> dict[str, Any]:
        """Step 5: Fetch statistics (long-term) with counts."""
        engine = self._get_engine()
        step_data = self.session_manager.get_session_data(session_id)

        # Fetch long-term statistics from repository
        stats_data = self.entity_repository.fetch_statistics_long_term(engine)

        # Update session data
        for entity_id, data in stats_data.items():
            step_data['entity_map'][entity_id]['in_statistics_long_term'] = True
            step_data['entity_map'][entity_id]['stats_long_count'] = data['count']
            if data['last_update']:
                # Update last_stats_update if this is newer
                if not step_data['entity_map'][entity_id]['last_stats_update'] or \
                   data['last_update'] > step_data['entity_map'][entity_id]['last_stats_update']:
                    step_data['entity_map'][entity_id]['last_stats_update'] = data['last_update']

        entity_count = sum(1 for e in step_data['entity_map'].values() if e['in_statistics_long_term'])
        self.session_manager.update_timestamp(session_id)
        return {'status': 'complete', 'entities_found': entity_count}

    def _fetch_step_6_enrich_with_registry(self, session_id: str) -> dict[str, Any]:
        """Step 6: Enrich with entity registry and state machine info."""
        entity_registry = er.async_get(self.hass)
        device_registry = dr.async_get(self.hass)
        step_data = self.session_manager.get_session_data(session_id)

        # PERFORMANCE OPTIMIZATION: Pre-fetch all config entries into dict to avoid N+1 lookups
        config_entries_map = {
            entry.entry_id: entry
            for entry in self.hass.config_entries.async_entries()
        }

        entities_list = []
        for entity_id, info in sorted(step_data['entity_map'].items()):
            # Check if in entity registry and get status
            registry_entry = entity_registry.async_get(entity_id)
            in_registry = registry_entry is not None

            # Determine registry status
            if registry_entry is not None:
                registry_status = "Disabled" if registry_entry.disabled else "Enabled"
            else:
                registry_status = "Not in Registry"

            # Check if in current state machine and get status
            state = self.hass.states.get(entity_id)
            in_state_machine = state is not None

            # Determine state machine status
            if state is not None:
                if state.state in ["unavailable", "unknown"]:
                    state_status = "Unavailable"
                else:
                    state_status = "Available"
            else:
                state_status = "Not Present"

            # Collect additional metadata
            platform = registry_entry.platform if registry_entry else None
            disabled_by = registry_entry.disabled_by if registry_entry else None

            # Get device information
            device_name = None
            device_disabled = False
            if registry_entry and registry_entry.device_id:
                device_entry = device_registry.async_get(registry_entry.device_id)
                if device_entry:
                    device_name = device_entry.name
                    device_disabled = device_entry.disabled or False

            # Get config entry information - OPTIMIZED: O(1) lookup instead of N+1 query
            config_entry_state = None
            config_entry_title = None
            if registry_entry and registry_entry.config_entry_id:
                config_entry = config_entries_map.get(registry_entry.config_entry_id)
                if config_entry:
                    config_entry_state = config_entry.state.name
                    config_entry_title = config_entry.title

            # Determine availability reason - call static method directly
            availability_reason = EntityAnalyzer.determine_availability_reason(
                self.hass, entity_id, registry_entry, state, device_registry
            )

            # Calculate unavailable duration
            unavailable_duration_seconds = None
            if state and state.state in ["unavailable", "unknown"]:
                now = datetime.now(timezone.utc)
                unavailable_duration_seconds = int((now - state.last_changed).total_seconds())

            # PERFORMANCE OPTIMIZATION: Use update frequency already calculated in step 2
            # This eliminates N+1 queries that would happen here
            update_frequency_data = info.get('update_frequency')

            # Determine statistics eligibility - call static method directly
            statistics_eligibility_reason = None
            if not info['in_statistics_meta']:
                try:
                    statistics_eligibility_reason = EntityAnalyzer.determine_statistics_eligibility(
                        entity_id, registry_entry, state
                    )
                except Exception as err:
                    _LOGGER.debug("Could not determine statistics eligibility for %s: %s", entity_id, err)
                    statistics_eligibility_reason = "Unable to determine eligibility"

            # Get metadata_id and origin for Generate SQL functionality
            # metadata_id was already fetched in step 3
            metadata_id = info.get('metadata_id')
            origin = None
            if info['in_statistics_meta']:
                if info['in_statistics_long_term'] and info['in_statistics_short_term']:
                    origin = "Both"
                elif info['in_statistics_long_term']:
                    origin = "Long-term"
                elif info['in_statistics_short_term']:
                    origin = "Short-term"

            entities_list.append({
                'entity_id': entity_id,
                'in_entity_registry': in_registry,
                'registry_status': registry_status,
                'in_state_machine': in_state_machine,
                'state_status': state_status,
                'in_states_meta': info['in_states_meta'],
                'in_states': info['in_states'],
                'in_statistics_meta': info['in_statistics_meta'],
                'in_statistics_short_term': info['in_statistics_short_term'],
                'in_statistics_long_term': info['in_statistics_long_term'],
                'states_count': info['states_count'],
                'stats_short_count': info['stats_short_count'],
                'stats_long_count': info['stats_long_count'],
                'last_state_update': info['last_state_update'],
                'last_stats_update': info['last_stats_update'],
                'platform': platform,
                'disabled_by': disabled_by,
                'device_name': device_name,
                'device_disabled': device_disabled,
                'config_entry_state': config_entry_state,
                'config_entry_title': config_entry_title,
                'availability_reason': availability_reason,
                'unavailable_duration_seconds': unavailable_duration_seconds,
                'update_interval': update_frequency_data['interval_text'] if update_frequency_data else None,
                'update_interval_seconds': update_frequency_data['interval_seconds'] if update_frequency_data else None,
                'update_count_24h': update_frequency_data['update_count_24h'] if update_frequency_data else None,
                'statistics_eligibility_reason': statistics_eligibility_reason,
                'metadata_id': metadata_id,
                'origin': origin,
            })

        step_data['entities_list'] = entities_list
        self.session_manager.update_timestamp(session_id)
        return {'status': 'complete', 'total_entities': len(entities_list)}

    def _determine_entity_origin(self, entity: dict[str, Any]) -> str:
        """Determine origin string for entity based on table presence.

        Args:
            entity: Entity dictionary with table presence flags

        Returns:
            Origin string: "States", "Short-term", "Long-term", "Both", or "States+Statistics"
        """
        in_states = entity['in_states_meta']
        in_statistics = entity['in_statistics_meta']

        if in_states and in_statistics:
            return "States+Statistics"
        elif in_states:
            return "States"
        elif entity['in_statistics_long_term'] and entity['in_statistics_short_term']:
            return "Both"
        elif entity['in_statistics_long_term']:
            return "Long-term"
        else:
            return "Short-term"

    def _fetch_step_7_calculate_deleted_storage(self, session_id: str) -> dict[str, Any]:
        """Step 7: Calculate storage for deleted entities."""
        engine = self._get_engine()
        step_data = self.session_manager.get_session_data(session_id)
        deleted_storage_bytes = 0

        with engine.connect() as conn:
            for entity in step_data['entities_list']:
                if (not entity['in_entity_registry'] and
                    not entity['in_state_machine'] and
                    (entity['in_states_meta'] or entity['in_statistics_meta'])):
                    try:
                        # Get metadata_id from entity_map (already fetched in step 3)
                        metadata_id = step_data['entity_map'][entity['entity_id']].get('metadata_id')
                        if metadata_id:
                            entity['metadata_id'] = metadata_id

                        # Use helper method to determine origin (DRY - eliminates code duplication)
                        origin = self._determine_entity_origin(entity)
                        entity['origin'] = origin

                        storage = self._calculate_entity_storage(
                            entity_id=entity['entity_id'],
                            origin=origin,
                            in_states_meta=entity['in_states_meta'],
                            in_statistics_meta=entity['in_statistics_meta'],
                            metadata_id_statistics=metadata_id
                        )
                        deleted_storage_bytes += storage
                    except Exception as err:
                        _LOGGER.debug("Could not calculate storage for %s: %s", entity['entity_id'], err)

        step_data['deleted_storage_bytes'] = deleted_storage_bytes
        self.session_manager.update_timestamp(session_id)
        return {'status': 'complete', 'deleted_storage_bytes': deleted_storage_bytes}

    def _fetch_step_8_finalize(self, session_id: str) -> dict[str, Any]:
        """Step 8: Calculate disabled storage and generate summary."""
        engine = self._get_engine()
        step_data = self.session_manager.get_session_data(session_id)
        disabled_storage_bytes = 0

        with engine.connect() as conn:
            for entity in step_data['entities_list']:
                if (entity['registry_status'] == 'Disabled' and
                    (entity['in_states_meta'] or entity['in_statistics_meta'])):
                    try:
                        # Get metadata_id from entity_map (already fetched in step 3)
                        metadata_id = step_data['entity_map'][entity['entity_id']].get('metadata_id')

                        # Use helper method to determine origin (DRY - eliminates code duplication)
                        origin = self._determine_entity_origin(entity)

                        storage = self._calculate_entity_storage(
                            entity_id=entity['entity_id'],
                            origin=origin,
                            in_states_meta=entity['in_states_meta'],
                            in_statistics_meta=entity['in_statistics_meta'],
                            metadata_id_statistics=metadata_id
                        )
                        disabled_storage_bytes += storage
                    except Exception as err:
                        _LOGGER.debug("Could not calculate storage for disabled entity %s: %s", entity['entity_id'], err)

        # Generate summary statistics
        entities_list = step_data['entities_list']
        summary = {
            'total_entities': len(step_data['entity_map']),
            'in_entity_registry': sum(1 for e in entities_list if e['in_entity_registry']),
            'registry_enabled': sum(1 for e in entities_list if e['registry_status'] == 'Enabled'),
            'registry_disabled': sum(1 for e in entities_list if e['registry_status'] == 'Disabled'),
            'in_state_machine': sum(1 for e in entities_list if e['in_state_machine']),
            'state_available': sum(1 for e in entities_list if e['state_status'] == 'Available'),
            'state_unavailable': sum(1 for e in entities_list if e['state_status'] == 'Unavailable'),
            'in_states_meta': sum(1 for e in entities_list if e['in_states_meta']),
            'in_states': sum(1 for e in entities_list if e['in_states']),
            'in_statistics_meta': sum(1 for e in entities_list if e['in_statistics_meta']),
            'in_statistics_short_term': sum(1 for e in entities_list if e['in_statistics_short_term']),
            'in_statistics_long_term': sum(1 for e in entities_list if e['in_statistics_long_term']),
            'only_in_states': sum(1 for e in entities_list if e['in_states'] and not e['in_statistics_meta']),
            'only_in_statistics': sum(1 for e in entities_list if e['in_statistics_meta'] and not e['in_states']),
            'in_both_states_and_stats': sum(1 for e in entities_list if e['in_states'] and e['in_statistics_meta']),
            'orphaned_states_meta': sum(1 for e in entities_list if e['in_states_meta'] and not e['in_states']),
            'orphaned_statistics_meta': sum(1 for e in entities_list if e['in_statistics_meta'] and not (e['in_statistics_short_term'] or e['in_statistics_long_term'])),
            'deleted_from_registry': sum(1 for e in entities_list if not e['in_entity_registry'] and not e['in_state_machine']),
            'deleted_storage_bytes': step_data['deleted_storage_bytes'],
            'disabled_storage_bytes': disabled_storage_bytes,
        }

        result = {
            'entities': entities_list,
            'summary': summary
        }

        # Clean up session data now that we're done
        self.session_manager.delete_session(session_id)

        return result

    def _execute_overview_step(self, step: int, session_id: str | None = None) -> dict[str, Any]:
        """Execute a specific step of the overview process.

        Args:
            step: Step number (0-8)
            session_id: Session ID for steps 1-8. For step 0, can be None (creates new session).

        Returns:
            Step result dictionary with status and data
        """
        # Check if coordinator is shutting down
        if self._is_shutting_down:
            raise RuntimeError("Coordinator is shutting down, cannot process step requests")

        if step == 0:
            return self._init_step_data(session_id)
        elif step == 1:
            if not session_id or not self.session_manager.validate_session(session_id):
                raise ValueError("Invalid or missing session_id for step 1")
            return self._fetch_step_1_states_meta(session_id)
        elif step == 2:
            if not session_id or not self.session_manager.validate_session(session_id):
                raise ValueError("Invalid or missing session_id for step 2")
            return self._fetch_step_2_states(session_id)
        elif step == 3:
            if not session_id or not self.session_manager.validate_session(session_id):
                raise ValueError("Invalid or missing session_id for step 3")
            return self._fetch_step_3_statistics_meta(session_id)
        elif step == 4:
            if not session_id or not self.session_manager.validate_session(session_id):
                raise ValueError("Invalid or missing session_id for step 4")
            return self._fetch_step_4_statistics_short_term(session_id)
        elif step == 5:
            if not session_id or not self.session_manager.validate_session(session_id):
                raise ValueError("Invalid or missing session_id for step 5")
            return self._fetch_step_5_statistics_long_term(session_id)
        elif step == 6:
            if not session_id or not self.session_manager.validate_session(session_id):
                raise ValueError("Invalid or missing session_id for step 6")
            return self._fetch_step_6_enrich_with_registry(session_id)
        elif step == 7:
            if not session_id or not self.session_manager.validate_session(session_id):
                raise ValueError("Invalid or missing session_id for step 7")
            return self._fetch_step_7_calculate_deleted_storage(session_id)
        elif step == 8:
            if not session_id or not self.session_manager.validate_session(session_id):
                raise ValueError("Invalid or missing session_id for step 8")
            return self._fetch_step_8_finalize(session_id)
        else:
            raise ValueError(f"Invalid step: {step}")

    async def async_execute_overview_step(self, step: int, session_id: str | None = None) -> dict[str, Any]:
        """Execute a specific step of the overview process (async wrapper).

        Args:
            step: Step number (0-8)
            session_id: Session ID for steps 1-8. For step 0, can be None.

        Returns:
            Step result dictionary
        """
        try:
            return await self.hass.async_add_executor_job(self._execute_overview_step, step, session_id)
        except Exception as err:
            _LOGGER.error("Error executing overview step %d (session %s): %s",
                         step, session_id[:8] if session_id else "None", err)
            raise

    # Note: Monolithic _fetch_entity_storage_overview method was removed.
    # The step-by-step API (_fetch_step_1 through _fetch_step_8) provides
    # better UX with progress feedback and is exclusively used by the frontend.

    async def async_shutdown(self) -> None:
        """Shutdown coordinator and clean up resources."""
        _LOGGER.info("Starting coordinator shutdown")

        # Set shutdown flag to prevent new requests
        self._is_shutting_down = True

        # Clean up any in-progress step sessions
        self.session_manager.clear_all_sessions()

        # Close database connection
        if self.db_service:
            _LOGGER.debug("Closing database connection")
            await self.hass.async_add_executor_job(self.db_service.close)
            _LOGGER.debug("Database connection closed")

        _LOGGER.info("Coordinator shutdown complete")
