"""Registry adapter for Home Assistant entity enrichment."""
import logging
from datetime import datetime, timezone
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import device_registry as dr

from .entity_analyzer import EntityAnalyzer

_LOGGER = logging.getLogger(__name__)


class RegistryAdapter:
    """Adapter for Home Assistant registry access and entity enrichment.

    Encapsulates complexity of multi-registry coordination (entity, device, config).
    Delegates business logic to EntityAnalyzer while handling registry data access.
    """

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize registry adapter.

        Args:
            hass: Home Assistant instance for registry access
        """
        self.hass = hass

    def enrich_entities(self, entity_map: dict[str, Any]) -> list[dict[str, Any]]:
        """Enrich entity map with registry and state machine information.

        Main orchestrator for Step 6 entity enrichment. Processes all entities
        in the entity_map and returns a fully enriched list ready for display.

        Args:
            entity_map: Dictionary mapping entity_id to entity data from steps 1-5

        Returns:
            list: Enriched entity dictionaries with all metadata
        """
        # Get registries
        entity_registry = er.async_get(self.hass)
        device_registry = dr.async_get(self.hass)

        # PERFORMANCE OPTIMIZATION: Pre-fetch config entries to avoid N+1 lookups
        config_entries_map = self._get_config_entries_map()

        entities_list = []
        for entity_id, info in sorted(entity_map.items()):
            # Get registry and state info
            registry_entry = entity_registry.async_get(entity_id)
            state = self._get_entity_state(entity_id)

            # Determine statuses
            in_registry = registry_entry is not None
            registry_status = self._determine_registry_status(registry_entry)
            in_state_machine = state is not None
            state_status = self._determine_state_status(state)

            # Collect metadata
            platform = registry_entry.platform if registry_entry else None
            disabled_by = registry_entry.disabled_by if registry_entry else None

            # Get device information
            device_name, device_disabled = self._get_device_info(
                registry_entry, device_registry
            )

            # Get config entry information (O(1) lookup)
            config_entry_state, config_entry_title = self._get_config_entry_info(
                registry_entry, config_entries_map
            )

            # Determine availability reason
            availability_reason = EntityAnalyzer.determine_availability_reason(
                self.hass, entity_id, registry_entry, state, device_registry
            )

            # Calculate unavailable duration
            unavailable_duration_seconds = self._calculate_unavailable_duration(state)

            # PERFORMANCE OPTIMIZATION: Use update frequency from step 2
            update_frequency_data = info.get('update_frequency')

            # Determine statistics eligibility
            statistics_eligibility_reason = self._determine_statistics_eligibility(
                entity_id, registry_entry, state, info
            )

            # Determine origin from table presence
            origin = self._determine_entity_origin(info)

            # Build enriched entity dict
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
                'metadata_id': info.get('metadata_id'),
                'origin': origin,
            })

        return entities_list

    def _get_config_entries_map(self) -> dict[str, Any]:
        """Pre-fetch all config entries for O(1) lookup.

        Returns:
            dict: Mapping of entry_id to config entry
        """
        return {
            entry.entry_id: entry
            for entry in self.hass.config_entries.async_entries()
        }

    def _get_entity_state(self, entity_id: str):
        """Get current state for entity.

        Args:
            entity_id: Entity ID to look up

        Returns:
            State object or None if not in state machine
        """
        return self.hass.states.get(entity_id)

    def _determine_registry_status(self, registry_entry) -> str:
        """Determine registry status string.

        Args:
            registry_entry: Entity registry entry or None

        Returns:
            str: "Disabled", "Enabled", or "Not in Registry"
        """
        if registry_entry is not None:
            return "Disabled" if registry_entry.disabled else "Enabled"
        return "Not in Registry"

    def _determine_state_status(self, state) -> str:
        """Determine state machine status string.

        Args:
            state: State object or None

        Returns:
            str: "Unavailable", "Available", or "Not Present"
        """
        if state is not None:
            if state.state in ["unavailable", "unknown"]:
                return "Unavailable"
            return "Available"
        return "Not Present"

    def _get_device_info(self, registry_entry, device_registry) -> tuple[str | None, bool]:
        """Get device name and disabled status.

        Args:
            registry_entry: Entity registry entry or None
            device_registry: Device registry instance

        Returns:
            tuple: (device_name, device_disabled)
        """
        device_name = None
        device_disabled = False

        if registry_entry and registry_entry.device_id:
            device_entry = device_registry.async_get(registry_entry.device_id)
            if device_entry:
                device_name = device_entry.name
                device_disabled = device_entry.disabled or False

        return device_name, device_disabled

    def _get_config_entry_info(
        self, registry_entry, config_entries_map: dict
    ) -> tuple[str | None, str | None]:
        """Get config entry state and title.

        Args:
            registry_entry: Entity registry entry or None
            config_entries_map: Pre-fetched config entries map

        Returns:
            tuple: (config_entry_state, config_entry_title)
        """
        config_entry_state = None
        config_entry_title = None

        if registry_entry and registry_entry.config_entry_id:
            config_entry = config_entries_map.get(registry_entry.config_entry_id)
            if config_entry:
                config_entry_state = config_entry.state.name
                config_entry_title = config_entry.title

        return config_entry_state, config_entry_title

    def _calculate_unavailable_duration(self, state) -> int | None:
        """Calculate how long entity has been unavailable.

        Args:
            state: State object or None

        Returns:
            int: Seconds unavailable, or None if not unavailable
        """
        if state and state.state in ["unavailable", "unknown"]:
            now = datetime.now(timezone.utc)
            return int((now - state.last_changed).total_seconds())
        return None

    def _determine_statistics_eligibility(
        self, entity_id: str, registry_entry, state, info: dict
    ) -> str | None:
        """Determine why entity is not eligible for statistics.

        Args:
            entity_id: Entity ID
            registry_entry: Entity registry entry or None
            state: State object or None
            info: Entity info from entity_map

        Returns:
            str: Eligibility reason, or None if entity has statistics
        """
        if info['in_statistics_meta']:
            return None

        try:
            return EntityAnalyzer.determine_statistics_eligibility(
                entity_id, registry_entry, state
            )
        except Exception as err:
            _LOGGER.debug(
                "Could not determine statistics eligibility for %s: %s",
                entity_id, err
            )
            return "Unable to determine eligibility"

    def _determine_entity_origin(self, info: dict[str, Any]) -> str | None:
        """Determine origin string for entity based on table presence.

        Args:
            info: Entity info dictionary with table presence flags

        Returns:
            str: Origin string ("Both", "Long-term", "Short-term") or None
        """
        if not info['in_statistics_meta']:
            return None

        if info['in_statistics_long_term'] and info['in_statistics_short_term']:
            return "Both"
        elif info['in_statistics_long_term']:
            return "Long-term"
        elif info['in_statistics_short_term']:
            return "Short-term"

        return None
