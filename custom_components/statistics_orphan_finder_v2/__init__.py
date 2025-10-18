"""Statistics Orphan Finder V2 integration."""
import logging
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType
from homeassistant.components import frontend
from homeassistant.components.http import HomeAssistantView
from aiohttp import web

from .const import DOMAIN
from .coordinator import StatisticsOrphanCoordinator

_LOGGER = logging.getLogger(__name__)

PLATFORMS = []


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Statistics Orphan Finder V2 component."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Statistics Orphan Finder V2 from a config entry."""
    coordinator = StatisticsOrphanCoordinator(hass, entry)

    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = coordinator

    # Register the API view
    hass.http.register_view(StatisticsOrphanView(coordinator))

    # Copy frontend files to www synchronously
    def copy_frontend_file():
        www_path = Path(hass.config.path("www/community/statistics_orphan_finder_v2"))
        www_path.mkdir(parents=True, exist_ok=True)

        import shutil

        # Copy main JS file
        source_file = Path(__file__).parent / "www" / "statistics-orphan-panel.js"
        target_file = www_path / "statistics-orphan-panel.js"

        if source_file.exists():
            shutil.copy(source_file, target_file)
            _LOGGER.info("Copied frontend panel to %s", target_file)
        else:
            _LOGGER.error("Source file not found: %s", source_file)
            return False

        # Copy source map file (optional)
        source_map = Path(__file__).parent / "www" / "statistics-orphan-panel.js.map"
        target_map = www_path / "statistics-orphan-panel.js.map"

        if source_map.exists():
            shutil.copy(source_map, target_map)
            _LOGGER.info("Copied source map to %s", target_map)

        return True

    await hass.async_add_executor_job(copy_frontend_file)

    # Register frontend panel
    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title="Statistics Orphans V2",
        sidebar_icon="mdi:database-search",
        frontend_url_path="statistics-orphans-v2",
        config={
            "_panel_custom": {
                "name": "statistics-orphan-panel-v2",
                "module_url": "/local/community/statistics_orphan_finder_v2/statistics-orphan-panel.js",
            }
        },
        require_admin=True,
    )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    coordinator = hass.data[DOMAIN].pop(entry.entry_id)
    await coordinator.async_shutdown()

    return True


class StatisticsOrphanView(HomeAssistantView):
    """View to handle statistics orphan requests."""

    url = "/api/statistics_orphan_finder_v2"
    name = "api:statistics_orphan_finder_v2"
    requires_auth = True

    def __init__(self, coordinator: StatisticsOrphanCoordinator):
        """Initialize the view."""
        self.coordinator = coordinator

    async def get(self, request):
        """Handle GET request."""
        action = request.query.get("action", "list")

        if action == "list":
            await self.coordinator.async_refresh()
            orphans = self.coordinator.data or {}
            categorized_storage = self.coordinator._categorized_storage

            return web.json_response({
                "orphans": [
                    {
                        "entity_id": entity_id,
                        "count": data["count"],
                        "status": data["status"],
                        "last_update": data["last_update"],
                        "origin": data["origin"],
                        "metadata_id": data["metadata_id"]
                    }
                    for entity_id, data in orphans.items()
                ],
                "deleted_storage": categorized_storage["deleted_storage"],
                "unavailable_storage": categorized_storage["unavailable_storage"]
            })
        elif action == "database_size":
            db_size = await self.coordinator.async_get_database_size()
            return web.json_response(db_size)
        elif action == "entity_storage_overview":
            overview = await self.coordinator.async_get_entity_storage_overview()
            return web.json_response(overview)
        elif action == "generate_delete_sql":
            origin = request.query.get("origin")
            entity_id = request.query.get("entity_id")

            if not origin:
                return web.json_response({"error": "Missing origin"}, status=400)

            try:
                # New mode: entity_id + flags (from Storage Overview)
                if entity_id:
                    in_states_meta = request.query.get("in_states_meta", "false").lower() == "true"
                    in_statistics_meta = request.query.get("in_statistics_meta", "false").lower() == "true"

                    sql = self.coordinator.generate_delete_sql(
                        entity_id=entity_id,
                        origin=origin,
                        in_states_meta=in_states_meta,
                        in_statistics_meta=in_statistics_meta
                    )
                    storage_saved = self.coordinator._calculate_entity_storage(
                        entity_id=entity_id,
                        origin=origin,
                        in_states_meta=in_states_meta,
                        in_statistics_meta=in_statistics_meta
                    )
                else:
                    # Legacy mode: metadata_id + origin (from Orphan Finder)
                    metadata_id = request.query.get("metadata_id")
                    if not metadata_id:
                        return web.json_response({"error": "Missing entity_id or metadata_id"}, status=400)

                    metadata_id = int(metadata_id)
                    # Legacy mode assumes statistics only
                    sql = self.coordinator.generate_delete_sql(
                        entity_id=str(metadata_id),  # Will be looked up in backend
                        origin=origin,
                        in_states_meta=False,
                        in_statistics_meta=True,
                        metadata_id_statistics=metadata_id
                    )
                    storage_saved = self.coordinator._calculate_entity_storage(
                        entity_id=str(metadata_id),
                        origin=origin,
                        in_states_meta=False,
                        in_statistics_meta=True,
                        metadata_id_statistics=metadata_id
                    )

                return web.json_response({
                    "sql": sql,
                    "storage_saved": storage_saved
                })
            except ValueError as err:
                return web.json_response({"error": f"Invalid parameters: {err}"}, status=400)

        return web.json_response({"error": "Invalid action"}, status=400)
