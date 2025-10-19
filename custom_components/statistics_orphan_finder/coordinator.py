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

    def _fetch_entity_storage_overview(self) -> dict[str, Any]:
        """Fetch comprehensive overview of entity storage across all tables (blocking I/O)."""
        engine = self._get_engine()
        from collections import defaultdict

        entity_map = defaultdict(lambda: {
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
        })

        with engine.connect() as conn:
            # 1. Get entities from states_meta
            _LOGGER.info("Querying states_meta...")
            query = text("SELECT DISTINCT entity_id FROM states_meta")
            result = conn.execute(query)
            for row in result:
                entity_map[row[0]]['in_states_meta'] = True

            # 2. Get entities from states with counts and last update
            _LOGGER.info("Querying states...")
            query = text("""
                SELECT sm.entity_id, COUNT(*) as count, MAX(s.last_updated_ts) as last_update
                FROM states s
                JOIN states_meta sm ON s.metadata_id = sm.metadata_id
                GROUP BY sm.entity_id
            """)
            result = conn.execute(query)
            for row in result:
                entity_id = row[0]
                entity_map[entity_id]['in_states'] = True
                entity_map[entity_id]['states_count'] = row[1]
                if row[2]:
                    from datetime import datetime
                    entity_map[entity_id]['last_state_update'] = datetime.fromtimestamp(row[2]).isoformat()

            # 3. Get entities from statistics_meta
            _LOGGER.info("Querying statistics_meta...")
            query = text("SELECT DISTINCT statistic_id FROM statistics_meta")
            result = conn.execute(query)
            for row in result:
                entity_map[row[0]]['in_statistics_meta'] = True

            # 4. Get entities from statistics_short_term with counts
            _LOGGER.info("Querying statistics_short_term...")
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
                    entity_map[entity_id]['in_statistics_short_term'] = True
                    entity_map[entity_id]['stats_short_count'] = row[1]
                    if row[2]:
                        from datetime import datetime
                        last_update = datetime.fromtimestamp(row[2]).isoformat()
                        if not entity_map[entity_id]['last_stats_update'] or \
                           last_update > entity_map[entity_id]['last_stats_update']:
                            entity_map[entity_id]['last_stats_update'] = last_update
            except Exception as err:
                _LOGGER.warning("Could not query statistics_short_term: %s", err)

            # 5. Get entities from statistics (long-term) with counts
            _LOGGER.info("Querying statistics (long-term)...")
            query = text("""
                SELECT sm.statistic_id, COUNT(*) as count, MAX(s.start_ts) as last_update
                FROM statistics s
                JOIN statistics_meta sm ON s.metadata_id = sm.id
                GROUP BY sm.statistic_id
            """)
            result = conn.execute(query)
            for row in result:
                entity_id = row[0]
                entity_map[entity_id]['in_statistics_long_term'] = True
                entity_map[entity_id]['stats_long_count'] = row[1]
                if row[2]:
                    from datetime import datetime
                    last_update = datetime.fromtimestamp(row[2]).isoformat()
                    if not entity_map[entity_id]['last_stats_update'] or \
                       last_update > entity_map[entity_id]['last_stats_update']:
                        entity_map[entity_id]['last_stats_update'] = last_update

        # Get entity registry and device registry for comparison
        entity_registry = er.async_get(self.hass)
        device_registry = dr.async_get(self.hass)

        # Convert to list format and add registry info
        entities_list = []
        for entity_id, info in sorted(entity_map.items()):
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

            # Collect additional metadata for entity details
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

            # Determine statistics eligibility (only for entities NOT in statistics)
            statistics_eligibility_reason = None
            if not info['in_statistics_meta']:
                try:
                    statistics_eligibility_reason = self._determine_statistics_eligibility(
                        entity_id, registry_entry, state
                    )
                except Exception as err:
                    _LOGGER.debug("Could not determine statistics eligibility for %s: %s", entity_id, err)
                    statistics_eligibility_reason = "Unable to determine eligibility"

            # Get metadata_id and origin for Generate SQL functionality (only for entities in statistics)
            metadata_id = None
            origin = None
            if info['in_statistics_meta']:
                # metadata_id will be fetched later for deleted entities, but we can set origin now
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
                # Additional metadata for entity details
                'platform': platform,
                'disabled_by': disabled_by,
                'device_name': device_name,
                'device_disabled': device_disabled,
                'config_entry_state': config_entry_state,
                'config_entry_title': config_entry_title,
                'availability_reason': availability_reason,
                'unavailable_duration_seconds': unavailable_duration_seconds,
                # Update interval data
                'update_interval': update_frequency_data['interval_text'] if update_frequency_data else None,
                'update_interval_seconds': update_frequency_data['interval_seconds'] if update_frequency_data else None,
                'update_count_24h': update_frequency_data['update_count_24h'] if update_frequency_data else None,
                # Statistics eligibility
                'statistics_eligibility_reason': statistics_eligibility_reason,
                # For Generate SQL functionality (only present for entities with statistics)
                'metadata_id': metadata_id,
                'origin': origin,
            })

        # Calculate storage for deleted entities (those not in registry or state machine but in states_meta or statistics_meta)
        deleted_storage_bytes = 0
        _LOGGER.info("Calculating storage for deleted entities...")

        with engine.connect() as conn:
            for entity in entities_list:
                # Only calculate for truly deleted entities that are in states_meta OR statistics_meta
                if (not entity['in_entity_registry'] and
                    not entity['in_state_machine'] and
                    (entity['in_states_meta'] or entity['in_statistics_meta'])):
                    try:
                        metadata_id = None

                        # Get metadata_id from statistics_meta if entity is in statistics
                        if entity['in_statistics_meta']:
                            meta_query = text("SELECT id FROM statistics_meta WHERE statistic_id = :entity_id")
                            meta_result = conn.execute(meta_query, {"entity_id": entity['entity_id']})
                            meta_row = meta_result.fetchone()

                            if meta_row:
                                metadata_id = meta_row[0]
                                entity['metadata_id'] = metadata_id

                        # Determine origin based on which tables entity is in
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

                        # Calculate storage using existing method
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

        _LOGGER.info("Calculated deleted entity storage: %d bytes (%.2f MB)",
                    deleted_storage_bytes, deleted_storage_bytes / (1024 * 1024))

        # Calculate storage for disabled entities (those in registry but disabled, with data in states or statistics)
        disabled_storage_bytes = 0
        _LOGGER.info("Calculating storage for disabled entities...")

        with engine.connect() as conn:
            for entity in entities_list:
                # Only calculate for disabled entities that have data in states or statistics
                if (entity['registry_status'] == 'Disabled' and
                    (entity['in_states_meta'] or entity['in_statistics_meta'])):
                    try:
                        metadata_id = None

                        # Get metadata_id from statistics_meta if entity is in statistics
                        if entity['in_statistics_meta']:
                            meta_query = text("SELECT id FROM statistics_meta WHERE statistic_id = :entity_id")
                            meta_result = conn.execute(meta_query, {"entity_id": entity['entity_id']})
                            meta_row = meta_result.fetchone()

                            if meta_row:
                                metadata_id = meta_row[0]

                        # Determine origin based on which tables entity is in
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

                        # Calculate storage using existing method
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

        _LOGGER.info("Calculated disabled entity storage: %d bytes (%.2f MB)",
                    disabled_storage_bytes, disabled_storage_bytes / (1024 * 1024))

        # Generate summary statistics
        summary = {
            'total_entities': len(entity_map),
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
            'deleted_storage_bytes': deleted_storage_bytes,
            'disabled_storage_bytes': disabled_storage_bytes,
        }

        _LOGGER.info(
            "Entity storage overview: %d total entities, %d in registry, %d in state machine",
            summary['total_entities'],
            summary['in_entity_registry'],
            summary['in_state_machine']
        )

        return {
            'entities': entities_list,
            'summary': summary
        }

    async def async_get_entity_storage_overview(self) -> dict[str, Any]:
        """Get comprehensive entity storage overview."""
        try:
            return await self.hass.async_add_executor_job(self._fetch_entity_storage_overview)
        except SQLAlchemyError as err:
            _LOGGER.error("Error fetching entity storage overview: %s", err)
            return {
                'entities': [],
                'summary': {}
            }

    async def async_shutdown(self) -> None:
        """Shutdown coordinator."""
        if self._engine:
            await self.hass.async_add_executor_job(self._engine.dispose)
