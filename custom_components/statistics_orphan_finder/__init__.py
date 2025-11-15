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

    # Create and register the API view (view dynamically looks up coordinator)
    view = StatisticsOrphanView(hass, entry.entry_id)
    hass.http.register_view(view)

    # Store coordinator and view for later cleanup
    hass.data[DOMAIN][entry.entry_id] = {
        "coordinator": coordinator,
        "view": view,
    }

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
    _LOGGER.info("Unloading Statistics Orphan Finder integration")

    # Retrieve stored data
    entry_data = hass.data[DOMAIN].pop(entry.entry_id)
    coordinator = entry_data["coordinator"]
    view = entry_data["view"]

    # Shutdown coordinator (closes DB, clears sessions, sets shutdown flag)
    await coordinator.async_shutdown()

    # Unregister the frontend panel
    try:
        frontend.async_remove_panel(hass, "statistics-orphans")
        _LOGGER.info("Unregistered frontend panel: statistics-orphans")
    except Exception as err:
        # Log but don't fail the unload if panel cleanup fails
        _LOGGER.warning("Failed to unregister frontend panel: %s", err)

    # Unregister the HTTP view
    # Home Assistant doesn't provide a direct unregister method, but we can
    # remove the view from the app's router by name
    try:
        # Find and remove all routes matching this view's name
        routes_to_remove = []
        for route in hass.http.app.router.routes():
            if hasattr(route.resource, '_path') and route.resource._path == view.url:
                routes_to_remove.append(route)

        for route in routes_to_remove:
            hass.http.app.router._resources.remove(route.resource)
            _LOGGER.debug("Removed HTTP route: %s", view.url)

        if routes_to_remove:
            _LOGGER.info("Unregistered API view: %s", view.name)
    except Exception as err:
        # Log but don't fail the unload if view cleanup fails
        _LOGGER.warning("Failed to unregister HTTP view %s: %s", view.name, err)

    # Note: Frontend files in www/community/statistics_orphan_finder/ are cleaned up
    # during setup phase (async_setup_entry removes old chunks and copies new ones).
    # This approach avoids race conditions where files might be deleted while
    # a user has the panel open in their browser.

    _LOGGER.info("Statistics Orphan Finder unloaded successfully")
    return True


class StatisticsOrphanView(HomeAssistantView):
    """View to handle statistics orphan requests."""

    url = "/api/statistics_orphan_finder"
    name = "api:statistics_orphan_finder"
    requires_auth = True

    def __init__(self, hass: HomeAssistant, entry_id: str):
        """Initialize the view."""
        self.hass = hass
        self.entry_id = entry_id

    def _get_coordinator(self) -> StatisticsOrphanCoordinator | None:
        """Get the current coordinator instance from hass.data."""
        entry_data = self.hass.data.get(DOMAIN, {}).get(self.entry_id)
        if entry_data:
            return entry_data.get("coordinator")
        return None

    async def get(self, request):
        """Handle GET request."""
        # Get current coordinator (handles reload gracefully)
        coordinator = self._get_coordinator()
        if not coordinator:
            _LOGGER.error("Coordinator not found for entry %s", self.entry_id)
            return web.json_response(
                {"error": "Integration not initialized"},
                status=503
            )

        # Check if coordinator is shutting down
        if coordinator._is_shutting_down:
            _LOGGER.warning("Request received during shutdown, rejecting")
            return web.json_response(
                {"error": "Integration is reloading, please try again in a moment"},
                status=503
            )

        action = request.query.get("action")

        if action == "database_size":
            db_size = await coordinator.async_get_database_size()
            return web.json_response(db_size)

        elif action == "entity_storage_overview_step":
            # New action for step-by-step fetching with session isolation
            step_param = request.query.get("step")
            session_id = request.query.get("session_id")  # Optional for step 0, required for 1-8

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

                # For steps 1-8, session_id is required
                if step > 0 and not session_id:
                    return web.json_response(
                        {"error": "session_id parameter required for steps 1-8"},
                        status=400
                    )

                result = await coordinator.async_execute_overview_step(step, session_id)
                return web.json_response(result)
            except ValueError as err:
                # Sanitize error message for client (log full error server-side)
                _LOGGER.warning("Invalid parameter in step %s: %s", step_param, err)
                return web.json_response({"error": "Invalid parameters provided"}, status=400)
            except Exception as err:
                # Sanitize error message to prevent information disclosure
                _LOGGER.error("Error executing step %s (session %s): %s",
                             step_param, session_id[:8] if session_id else "None", err, exc_info=True)
                return web.json_response({"error": "An error occurred processing the request"}, status=500)

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

                histogram = await coordinator.async_get_message_histogram(entity_id, hours_int)
                return web.json_response(histogram)
            except ValueError as err:
                # Sanitize error message for client
                _LOGGER.warning("Invalid hours parameter for histogram: %s", err)
                return web.json_response({"error": "Invalid hours parameter"}, status=400)
            except Exception as err:
                # Sanitize error message to prevent information disclosure
                _LOGGER.error("Error fetching message histogram for %s: %s", entity_id, err, exc_info=True)
                return web.json_response({"error": "An error occurred fetching histogram data"}, status=500)

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

                sql = coordinator.generate_delete_sql(
                    entity_id=entity_id,
                    origin=origin,
                    in_states_meta=in_states_meta,
                    in_statistics_meta=in_statistics_meta
                )
                storage_saved = coordinator._calculate_entity_storage(
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
                # Sanitize error message for client
                _LOGGER.warning("Invalid parameters for SQL generation: %s", err)
                return web.json_response({"error": "Invalid parameters provided"}, status=400)
            except Exception as err:
                # Sanitize error message to prevent information disclosure
                _LOGGER.error("Error generating SQL for %s: %s", entity_id, err, exc_info=True)
                return web.json_response({"error": "An error occurred generating SQL"}, status=500)

        return web.json_response({"error": "Invalid action"}, status=400)
