"""Statistics Orphan Finder integration."""
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
    """Set up the Statistics Orphan Finder component."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Statistics Orphan Finder from a config entry."""
    coordinator = StatisticsOrphanCoordinator(hass, entry)

    hass.data[DOMAIN][entry.entry_id] = coordinator

    # Register the API view
    hass.http.register_view(StatisticsOrphanView(coordinator))

    # Copy frontend files to www synchronously
    def copy_frontend_file():
        www_path = Path(hass.config.path("www/community/statistics_orphan_finder"))
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

        # Copy chunks directory (for code-split bundles)
        source_chunks = Path(__file__).parent / "www" / "chunks"
        target_chunks = www_path / "chunks"

        if source_chunks.exists() and source_chunks.is_dir():
            # Remove old chunks directory if exists
            if target_chunks.exists():
                shutil.rmtree(target_chunks)
            # Copy entire chunks directory
            shutil.copytree(source_chunks, target_chunks)
            _LOGGER.info("Copied %d chunk files to %s", len(list(source_chunks.glob("*"))), target_chunks)
        else:
            _LOGGER.warning("Chunks directory not found at %s", source_chunks)

        return True

    await hass.async_add_executor_job(copy_frontend_file)

    # Get timestamp of JS file for cache busting
    js_file = Path(__file__).parent / "www" / "statistics-orphan-panel.js"
    cache_bust = f"?t={int(js_file.stat().st_mtime)}" if js_file.exists() else ""

    # Register frontend panel
    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title="Statistics Orphans",
        sidebar_icon="mdi:database-search",
        frontend_url_path="statistics-orphans",
        config={
            "_panel_custom": {
                "name": "statistics-orphan-panel",
                "module_url": f"/local/community/statistics_orphan_finder/statistics-orphan-panel.js{cache_bust}",
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

    url = "/api/statistics_orphan_finder"
    name = "api:statistics_orphan_finder"
    requires_auth = True

    def __init__(self, coordinator: StatisticsOrphanCoordinator):
        """Initialize the view."""
        self.coordinator = coordinator

    async def get(self, request):
        """Handle GET request."""
        action = request.query.get("action")

        if action == "database_size":
            db_size = await self.coordinator.async_get_database_size()
            return web.json_response(db_size)

        elif action == "entity_storage_overview_step":
            # New action for step-by-step fetching
            step_param = request.query.get("step")
            if not step_param:
                return web.json_response({"error": "Missing step parameter"}, status=400)

            try:
                step = int(step_param)
                # Validate step range (0-8 as per architecture)
                if not 0 <= step <= 8:
                    return web.json_response(
                        {"error": f"Step must be between 0 and 8, got {step}"},
                        status=400
                    )
                result = await self.coordinator.async_execute_overview_step(step)
                return web.json_response(result)
            except ValueError as err:
                return web.json_response({"error": f"Invalid step parameter: {err}"}, status=400)
            except Exception as err:
                _LOGGER.error("Error executing step %s: %s", step_param, err, exc_info=True)
                return web.json_response({"error": f"Error executing step: {err}"}, status=500)

        elif action == "entity_message_histogram":
            entity_id = request.query.get("entity_id")
            hours = request.query.get("hours", "24")

            # Validate entity_id
            if not entity_id or "." not in entity_id:
                return web.json_response({"error": "Invalid or missing entity_id"}, status=400)

            # Validate hours parameter
            try:
                hours_int = int(hours)
                if hours_int not in [24, 48, 168]:  # 24h, 48h, or 7d (168h)
                    return web.json_response(
                        {"error": "hours must be 24, 48, or 168"},
                        status=400
                    )

                histogram = await self.coordinator.async_get_message_histogram(entity_id, hours_int)
                return web.json_response(histogram)
            except ValueError as err:
                return web.json_response({"error": f"Invalid hours parameter: {err}"}, status=400)
            except Exception as err:
                _LOGGER.error("Error fetching message histogram for %s: %s", entity_id, err, exc_info=True)
                return web.json_response({"error": f"Error fetching histogram: {err}"}, status=500)

        elif action == "generate_delete_sql":
            origin = request.query.get("origin")
            entity_id = request.query.get("entity_id")

            if not origin or not entity_id:
                return web.json_response({"error": "Missing origin or entity_id"}, status=400)

            # Validate entity_id format (domain.entity)
            if "." not in entity_id or len(entity_id.split(".")) != 2:
                return web.json_response({"error": "Invalid entity_id format (must be domain.entity)"}, status=400)

            # Validate origin value
            valid_origins = {"States", "Short-term", "Long-term", "Both", "States+Statistics"}
            if origin not in valid_origins:
                return web.json_response(
                    {"error": f"Invalid origin. Must be one of: {', '.join(sorted(valid_origins))}"},
                    status=400
                )

            try:
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

                return web.json_response({
                    "sql": sql,
                    "storage_saved": storage_saved
                })
            except ValueError as err:
                return web.json_response({"error": f"Invalid parameters: {err}"}, status=400)
            except Exception as err:
                _LOGGER.error("Error generating SQL for %s: %s", entity_id, err, exc_info=True)
                return web.json_response({"error": f"Error generating SQL: {err}"}, status=500)

        return web.json_response({"error": "Invalid action"}, status=400)
