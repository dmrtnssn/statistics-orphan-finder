# CLOUDE.md - Home Assistant Custom Components Guide

This guide provides instructions for Claude when helping users create custom components for Home Assistant.

## Overview

Home Assistant custom components are Python-based integrations that extend Home Assistant's functionality. They follow a specific structure and use Home Assistant's APIs and conventions.

## Component Structure

A typical custom component has this directory structure:

```
custom_components/
└── your_component/
    ├── __init__.py
    ├── manifest.json
    ├── config_flow.py (optional, for UI configuration)
    ├── sensor.py, switch.py, etc. (platform files)
    └── strings.json (optional, for translations)
```

## Key Files

### 1. manifest.json

**Required**. Defines component metadata:

```json
{
  "domain": "your_component",
  "name": "Your Component Name",
  "documentation": "https://github.com/username/repo",
  "codeowners": ["@username"],
  "requirements": ["library==1.0.0"],
  "version": "1.0.0",
  "iot_class": "cloud_polling"
}
```

**Important fields:**
- `domain`: Unique identifier (lowercase, underscores)
- `requirements`: Python dependencies (pip installable)
- `iot_class`: How component interacts (local_polling, cloud_polling, local_push, cloud_push, etc.)

### 2. __init__.py

**Required**. Entry point for the component:

```python
"""Your Component integration."""
import logging
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

DOMAIN = "your_component"

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up component from configuration.yaml."""
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up component from a config entry."""
    # Store data for platforms
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = YourComponentData(hass, entry)
    
    # Forward setup to platforms
    await hass.config_entries.async_forward_entry_setups(entry, ["sensor"])
    
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(
        entry, ["sensor"]
    )
    
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    
    return unload_ok
```

### 3. Platform Files (e.g., sensor.py)

Implements specific entity types:

```python
"""Sensor platform for Your Component."""
from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import DOMAIN

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensors from a config entry."""
    coordinator = hass.data[DOMAIN][entry.entry_id]
    
    async_add_entities([
        YourSensor(coordinator, "sensor_1"),
        YourSensor(coordinator, "sensor_2"),
    ])

class YourSensor(SensorEntity):
    """Representation of a sensor."""
    
    def __init__(self, coordinator, sensor_id):
        """Initialize the sensor."""
        self._coordinator = coordinator
        self._attr_unique_id = f"{DOMAIN}_{sensor_id}"
        self._attr_name = f"Your Sensor {sensor_id}"
    
    @property
    def native_value(self):
        """Return the state of the sensor."""
        return self._coordinator.get_sensor_value(self._sensor_id)
    
    @property
    def device_info(self):
        """Return device information."""
        return {
            "identifiers": {(DOMAIN, "unique_device_id")},
            "name": "Your Device",
            "manufacturer": "Your Company",
            "model": "Model Name",
        }
```

### 4. config_flow.py (Optional but Recommended)

Enables UI-based configuration:

```python
"""Config flow for Your Component."""
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback

from . import DOMAIN

class YourComponentConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow."""
    
    VERSION = 1
    
    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}
        
        if user_input is not None:
            # Validate input
            try:
                # Test connection or validate data
                await self._test_connection(user_input)
                return self.async_create_entry(
                    title=user_input["name"],
                    data=user_input
                )
            except Exception:
                errors["base"] = "cannot_connect"
        
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required("name"): str,
                vol.Required("host"): str,
                vol.Optional("port", default=8080): int,
            }),
            errors=errors,
        )
```

## Best Practices

### 1. Use DataUpdateCoordinator for Polling

```python
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    CoordinatorEntity,
)
from datetime import timedelta

coordinator = DataUpdateCoordinator(
    hass,
    _LOGGER,
    name="your_component",
    update_method=async_update_data,
    update_interval=timedelta(seconds=30),
)

class YourSensor(CoordinatorEntity, SensorEntity):
    """Sensor using coordinator."""
    
    def __init__(self, coordinator):
        """Initialize."""
        super().__init__(coordinator)
```

### 2. Proper Entity Properties

Always set these properties:
- `unique_id`: Unique identifier for the entity
- `name` or `_attr_name`: Display name
- `device_info`: Links entity to a device (optional but recommended)

### 3. Async Methods

Use async methods whenever possible:
- `async_setup_entry` instead of `setup_entry`
- `async_update` instead of `update`
- Use `async with` for network calls

### 4. Error Handling

```python
try:
    result = await self._api.get_data()
except TimeoutError:
    _LOGGER.error("Timeout connecting to device")
    raise ConfigEntryNotReady
except Exception as err:
    _LOGGER.error("Unexpected error: %s", err)
    raise
```

### 5. Configuration Validation

Use voluptuous for schema validation:

```python
import voluptuous as vol
from homeassistant.const import CONF_HOST, CONF_PORT

CONFIG_SCHEMA = vol.Schema({
    DOMAIN: vol.Schema({
        vol.Required(CONF_HOST): str,
        vol.Optional(CONF_PORT, default=8080): int,
    })
}, extra=vol.ALLOW_EXTRA)
```

## Common Entity Types

### Sensor
```python
from homeassistant.components.sensor import (
    SensorEntity,
    SensorDeviceClass,
    SensorStateClass,
)

class MySensor(SensorEntity):
    _attr_device_class = SensorDeviceClass.TEMPERATURE
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = "°C"
```

### Binary Sensor
```python
from homeassistant.components.binary_sensor import BinarySensorEntity

class MyBinarySensor(BinarySensorEntity):
    @property
    def is_on(self):
        """Return true if the binary sensor is on."""
        return self._state
```

### Switch
```python
from homeassistant.components.switch import SwitchEntity

class MySwitch(SwitchEntity):
    async def async_turn_on(self, **kwargs):
        """Turn the entity on."""
        await self._api.turn_on()
        self._attr_is_on = True
        self.async_write_ha_state()
    
    async def async_turn_on(self, **kwargs):
        """Turn the entity off."""
        await self._api.turn_off()
        self._attr_is_on = False
        self.async_write_ha_state()
```

## Testing Checklist

When creating components, ensure:
- [ ] `manifest.json` has all required fields
- [ ] Unique IDs are set for all entities
- [ ] Async methods used throughout
- [ ] Proper error handling implemented
- [ ] Coordinator used for polling (if applicable)
- [ ] Config flow implemented (recommended)
- [ ] Device info provided for entities
- [ ] Proper device classes and units set
- [ ] Component unloads cleanly
- [ ] No blocking I/O in event loop

## Installation Instructions

Include these instructions for users:

1. Copy the `your_component` folder to `custom_components/` in your Home Assistant configuration directory
2. Restart Home Assistant
3. Add integration via UI (Settings → Devices & Services → Add Integration) or configuration.yaml

## Common Patterns

### API Client Pattern
```python
class YourAPI:
    """API client."""
    
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self._session = None
    
    async def async_get_data(self):
        """Get data from API."""
        if self._session is None:
            self._session = aiohttp.ClientSession()
        
        async with self._session.get(f"http://{self.host}:{self.port}/api") as resp:
            return await resp.json()
```

### Options Flow
```python
@staticmethod
@callback
def async_get_options_flow(config_entry):
    """Get the options flow."""
    return YourOptionsFlowHandler(config_entry)

class YourOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options."""
    
    async def async_step_init(self, user_input=None):
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)
        
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({
                vol.Optional("update_interval", default=30): int,
            })
        )
```

## Resources

- [Home Assistant Developer Docs](https://developers.home-assistant.io/)
- [Integration Quality Scale](https://developers.home-assistant.io/docs/integration_quality_scale_index/)
- [Architecture](https://developers.home-assistant.io/docs/architecture_index)
- [Cookiecutter Template](https://github.com/oncleben31/cookiecutter-homeassistant-custom-component)

## Claude's Approach

When helping create Home Assistant components, Claude should:

1. **Ask clarifying questions** about:
   - What type of integration (sensor, switch, climate, etc.)
   - Data source (API, local device, polling vs push)
   - Configuration method (UI vs YAML)

2. **Provide complete, working code** including:
   - All required files
   - Proper async/await patterns
   - Error handling
   - Type hints

3. **Follow Home Assistant conventions**:
   - Use underscores in domain names
   - Implement proper entity properties
   - Use coordinators for polling
   - Include device_info when appropriate

4. **Explain key concepts** relevant to the implementation

5. **Provide installation and testing instructions**

* This custom component is not yet deployable via HACS