"""DataUpdateCoordinator for Statistics Orphan Finder."""
import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import device_registry as dr

from .const import DOMAIN
from .services import DatabaseService, StorageCalculator, EntityAnalyzer, SqlGenerator

_LOGGER = logging.getLogger(__name__)


class StatisticsOrphanCoordinator(DataUpdateCoordinator):
    """Coordinator to fetch orphaned statistics entities."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
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

        # Store intermediate data for step-by-step fetching
        self._step_data = None

    def _get_engine(self):
        """Get or create database engine."""
        return self.db_service.get_engine()

    def _determine_availability_reason(self, entity_id, registry_entry, state, device_registry):
        """Determine why an entity is unavailable with user-friendly hint."""
        return EntityAnalyzer.determine_availability_reason(
            self.hass, entity_id, registry_entry, state, device_registry
        )

    def _determine_statistics_eligibility(self, entity_id, registry_entry, state):
        """Determine why an entity is not eligible for statistics with user-friendly explanation."""
        return EntityAnalyzer.determine_statistics_eligibility(entity_id, registry_entry, state)

    def _calculate_update_frequency(self, entity_id):
        """Calculate update frequency from states table."""
        engine = self._get_engine()
        return EntityAnalyzer.calculate_update_frequency(engine, entity_id)

    async def async_get_database_size(self) -> dict[str, Any]:
        """Get database size information."""
        return await self.db_service.async_get_database_size()

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

    def _init_step_data(self):
        """Initialize step data for step-by-step fetching."""
        from collections import defaultdict
        self._step_data = {
            'entity_map': defaultdict(lambda: {
                'in_states_meta': False,
                'in_states': False,
                'in_statistics_meta': False,
                'in_statistics_short_term': False,
                'in_statistics_long_term': False,
                'states_count': 0,
                'stats_short_count': 0,
                'stats_long_count': 0,
                'last_state_update': None,
                'last_stats_update': None,
                'metadata_id': None,
            }),
            'current_step': 0
        }
        return {'status': 'initialized', 'total_steps': 8}

    def _fetch_step_1_states_meta(self) -> dict[str, Any]:
        """Step 1: Fetch states_meta entities."""
        engine = self._get_engine()
        with engine.connect() as conn:
            query = text("SELECT DISTINCT entity_id FROM states_meta")
            result = conn.execute(query)
            for row in result:
                self._step_data['entity_map'][row[0]]['in_states_meta'] = True

        entity_count = sum(1 for e in self._step_data['entity_map'].values() if e['in_states_meta'])
        return {'status': 'complete', 'entities_found': entity_count}

    def _fetch_step_2_states(self) -> dict[str, Any]:
        """Step 2: Fetch states with counts."""
        engine = self._get_engine()
        with engine.connect() as conn:
            query = text("""
                SELECT sm.entity_id, COUNT(*) as count, MAX(s.last_updated_ts) as last_update
                FROM states s
                JOIN states_meta sm ON s.metadata_id = sm.metadata_id
                GROUP BY sm.entity_id
            """)
            result = conn.execute(query)
            for row in result:
                entity_id = row[0]
                self._step_data['entity_map'][entity_id]['in_states'] = True
                self._step_data['entity_map'][entity_id]['states_count'] = row[1]
                if row[2]:
                    self._step_data['entity_map'][entity_id]['last_state_update'] = \
                        datetime.fromtimestamp(row[2]).isoformat()

        entity_count = sum(1 for e in self._step_data['entity_map'].values() if e['in_states'])
        return {'status': 'complete', 'entities_found': entity_count}

    def _fetch_step_3_statistics_meta(self) -> dict[str, Any]:
        """Step 3: Fetch statistics_meta entities with metadata_id."""
        engine = self._get_engine()
        with engine.connect() as conn:
            # Fetch both id and statistic_id to avoid N+1 queries later
            query = text("SELECT id, statistic_id FROM statistics_meta")
            result = conn.execute(query)
            for row in result:
                entity_id = row[1]
                self._step_data['entity_map'][entity_id]['in_statistics_meta'] = True
                self._step_data['entity_map'][entity_id]['metadata_id'] = row[0]

        entity_count = sum(1 for e in self._step_data['entity_map'].values() if e['in_statistics_meta'])
        return {'status': 'complete', 'entities_found': entity_count}

    def _fetch_step_4_statistics_short_term(self) -> dict[str, Any]:
        """Step 4: Fetch statistics_short_term with counts."""
        engine = self._get_engine()
        with engine.connect() as conn:
            try:
                query = text("""
                    SELECT sm.statistic_id, COUNT(*) as count, MAX(s.start_ts) as last_update
                    FROM statistics_short_term s
                    JOIN statistics_meta sm ON s.metadata_id = sm.id
                    GROUP BY sm.statistic_id
                """)
                result = conn.execute(query)
                for row in result:
                    entity_id = row[0]
                    self._step_data['entity_map'][entity_id]['in_statistics_short_term'] = True
                    self._step_data['entity_map'][entity_id]['stats_short_count'] = row[1]
                    if row[2]:
                        last_update = datetime.fromtimestamp(row[2]).isoformat()
                        if not self._step_data['entity_map'][entity_id]['last_stats_update'] or \
                           last_update > self._step_data['entity_map'][entity_id]['last_stats_update']:
                            self._step_data['entity_map'][entity_id]['last_stats_update'] = last_update
            except Exception as err:
                _LOGGER.warning("Could not query statistics_short_term: %s", err)

        entity_count = sum(1 for e in self._step_data['entity_map'].values() if e['in_statistics_short_term'])
        return {'status': 'complete', 'entities_found': entity_count}

    def _fetch_step_5_statistics_long_term(self) -> dict[str, Any]:
        """Step 5: Fetch statistics (long-term) with counts."""
        engine = self._get_engine()
        with engine.connect() as conn:
            query = text("""
                SELECT sm.statistic_id, COUNT(*) as count, MAX(s.start_ts) as last_update
                FROM statistics s
                JOIN statistics_meta sm ON s.metadata_id = sm.id
                GROUP BY sm.statistic_id
            """)
            result = conn.execute(query)
            for row in result:
                entity_id = row[0]
                self._step_data['entity_map'][entity_id]['in_statistics_long_term'] = True
                self._step_data['entity_map'][entity_id]['stats_long_count'] = row[1]
                if row[2]:
                    last_update = datetime.fromtimestamp(row[2]).isoformat()
                    if not self._step_data['entity_map'][entity_id]['last_stats_update'] or \
                       last_update > self._step_data['entity_map'][entity_id]['last_stats_update']:
                        self._step_data['entity_map'][entity_id]['last_stats_update'] = last_update

        entity_count = sum(1 for e in self._step_data['entity_map'].values() if e['in_statistics_long_term'])
        return {'status': 'complete', 'entities_found': entity_count}

    def _fetch_step_6_enrich_with_registry(self) -> dict[str, Any]:
        """Step 6: Enrich with entity registry and state machine info."""
        entity_registry = er.async_get(self.hass)
        device_registry = dr.async_get(self.hass)

        entities_list = []
        for entity_id, info in sorted(self._step_data['entity_map'].items()):
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

            # Get config entry information
            config_entry_state = None
            config_entry_title = None
            if registry_entry and registry_entry.config_entry_id:
                config_entry = self.hass.config_entries.async_get_entry(
                    registry_entry.config_entry_id
                )
                if config_entry:
                    config_entry_state = config_entry.state.name
                    config_entry_title = config_entry.title

            # Determine availability reason
            availability_reason = self._determine_availability_reason(
                entity_id, registry_entry, state, device_registry
            )

            # Calculate unavailable duration
            unavailable_duration_seconds = None
            if state and state.state in ["unavailable", "unknown"]:
                now = datetime.now(timezone.utc)
                unavailable_duration_seconds = int((now - state.last_changed).total_seconds())

            # Calculate update frequency (only for entities with states)
            update_frequency_data = None
            if info['in_states']:
                try:
                    update_frequency_data = self._calculate_update_frequency(entity_id)
                except Exception as err:
                    _LOGGER.debug("Could not calculate frequency for %s: %s", entity_id, err)

            # Determine statistics eligibility
            statistics_eligibility_reason = None
            if not info['in_statistics_meta']:
                try:
                    statistics_eligibility_reason = self._determine_statistics_eligibility(
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

        self._step_data['entities_list'] = entities_list
        return {'status': 'complete', 'total_entities': len(entities_list)}

    def _fetch_step_7_calculate_deleted_storage(self) -> dict[str, Any]:
        """Step 7: Calculate storage for deleted entities."""
        engine = self._get_engine()
        deleted_storage_bytes = 0

        with engine.connect() as conn:
            for entity in self._step_data['entities_list']:
                if (not entity['in_entity_registry'] and
                    not entity['in_state_machine'] and
                    (entity['in_states_meta'] or entity['in_statistics_meta'])):
                    try:
                        # Get metadata_id from entity_map (already fetched in step 3)
                        metadata_id = self._step_data['entity_map'][entity['entity_id']].get('metadata_id')
                        if metadata_id:
                            entity['metadata_id'] = metadata_id

                        # Determine origin
                        if entity['in_states_meta'] and entity['in_statistics_meta']:
                            origin = "States+Statistics"
                        elif entity['in_states_meta']:
                            origin = "States"
                        elif entity['in_statistics_long_term'] and entity['in_statistics_short_term']:
                            origin = "Both"
                        elif entity['in_statistics_long_term']:
                            origin = "Long-term"
                        else:
                            origin = "Short-term"
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

        self._step_data['deleted_storage_bytes'] = deleted_storage_bytes
        return {'status': 'complete', 'deleted_storage_bytes': deleted_storage_bytes}

    def _fetch_step_8_finalize(self) -> dict[str, Any]:
        """Step 8: Calculate disabled storage and generate summary."""
        engine = self._get_engine()
        disabled_storage_bytes = 0

        with engine.connect() as conn:
            for entity in self._step_data['entities_list']:
                if (entity['registry_status'] == 'Disabled' and
                    (entity['in_states_meta'] or entity['in_statistics_meta'])):
                    try:
                        # Get metadata_id from entity_map (already fetched in step 3)
                        metadata_id = self._step_data['entity_map'][entity['entity_id']].get('metadata_id')

                        # Determine origin
                        if entity['in_states_meta'] and entity['in_statistics_meta']:
                            origin = "States+Statistics"
                        elif entity['in_states_meta']:
                            origin = "States"
                        elif entity['in_statistics_long_term'] and entity['in_statistics_short_term']:
                            origin = "Both"
                        elif entity['in_statistics_long_term']:
                            origin = "Long-term"
                        else:
                            origin = "Short-term"

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
        entities_list = self._step_data['entities_list']
        summary = {
            'total_entities': len(self._step_data['entity_map']),
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
            'deleted_storage_bytes': self._step_data['deleted_storage_bytes'],
            'disabled_storage_bytes': disabled_storage_bytes,
        }

        result = {
            'entities': entities_list,
            'summary': summary
        }

        # Clean up step data
        self._step_data = None

        return result

    def _execute_overview_step(self, step: int) -> dict[str, Any]:
        """Execute a specific step of the overview process."""
        if step == 0:
            return self._init_step_data()
        elif step == 1:
            return self._fetch_step_1_states_meta()
        elif step == 2:
            return self._fetch_step_2_states()
        elif step == 3:
            return self._fetch_step_3_statistics_meta()
        elif step == 4:
            return self._fetch_step_4_statistics_short_term()
        elif step == 5:
            return self._fetch_step_5_statistics_long_term()
        elif step == 6:
            return self._fetch_step_6_enrich_with_registry()
        elif step == 7:
            return self._fetch_step_7_calculate_deleted_storage()
        elif step == 8:
            return self._fetch_step_8_finalize()
        else:
            raise ValueError(f"Invalid step: {step}")

    async def async_execute_overview_step(self, step: int) -> dict[str, Any]:
        """Execute a specific step of the overview process (async wrapper)."""
        try:
            return await self.hass.async_add_executor_job(self._execute_overview_step, step)
        except Exception as err:
            _LOGGER.error("Error executing overview step %d: %s", step, err)
            raise

    # Note: Monolithic _fetch_entity_storage_overview method was removed.
    # The step-by-step API (_fetch_step_1 through _fetch_step_8) provides
    # better UX with progress feedback and is exclusively used by the frontend.

    async def async_shutdown(self) -> None:
        """Shutdown coordinator and clean up resources."""
        if self.db_service:
            await self.hass.async_add_executor_job(self.db_service.close)
        # Clean up any in-progress step data
        self._step_data = None
