"""Config flow for Statistics Orphan Finder integration."""
import logging
import voluptuous as vol
from typing import Any

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN, CONF_DB_URL, CONF_USERNAME, CONF_PASSWORD

_LOGGER = logging.getLogger(__name__)


async def validate_db_connection(hass: HomeAssistant, data: dict[str, Any]) -> dict[str, Any]:
    """Validate the database connection."""
    from sqlalchemy import create_engine, text
    from sqlalchemy.exc import SQLAlchemyError
    from urllib.parse import quote_plus

    db_url = data[CONF_DB_URL]
    username = data.get(CONF_USERNAME)
    password = data.get(CONF_PASSWORD)

    # Build connection string with proper URL encoding for credentials
    if username and password:
        # Insert credentials into URL
        if "://" in db_url:
            protocol, rest = db_url.split("://", 1)
            # URL-encode credentials to handle special characters
            encoded_username = quote_plus(username)
            encoded_password = quote_plus(password)
            db_url = f"{protocol}://{encoded_username}:{encoded_password}@{rest}"

    try:
        # Test connection
        engine = create_engine(db_url, pool_pre_ping=True)
        with engine.connect() as conn:
            # Try to query the statistics table
            result = conn.execute(text("SELECT COUNT(*) FROM statistics LIMIT 1"))
            result.fetchone()
        engine.dispose()
        return {"title": "Statistics Orphan Finder"}
    except SQLAlchemyError as err:
        _LOGGER.error("Database connection failed: %s", err)
        raise ValueError("cannot_connect") from err
    except Exception as err:
        _LOGGER.error("Unexpected error: %s", err)
        raise ValueError("unknown") from err


class StatisticsOrphanFinderConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Statistics Orphan Finder."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors = {}

        if user_input is not None:
            try:
                info = await validate_db_connection(self.hass, user_input)
                return self.async_create_entry(title=info["title"], data=user_input)
            except ValueError as err:
                if str(err) == "cannot_connect":
                    errors["base"] = "cannot_connect"
                else:
                    errors["base"] = "unknown"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        data_schema = vol.Schema({
            vol.Required(CONF_DB_URL, default="mysql://homeassistant:3306/homeassistant"): str,
            vol.Optional(CONF_USERNAME): str,
            vol.Optional(CONF_PASSWORD): str,
        })

        return self.async_show_form(
            step_id="user",
            data_schema=data_schema,
            errors=errors,
        )
