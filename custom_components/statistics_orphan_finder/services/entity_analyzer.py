"""Entity analysis service for Statistics Orphan Finder."""
import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import text
from sqlalchemy.engine import Engine

_LOGGER = logging.getLogger(__name__)


class EntityAnalyzer:
    """Service for analyzing entity availability and statistics eligibility."""

    @staticmethod
    def determine_availability_reason(
        hass,
        entity_id: str,
        registry_entry,
        state,
        device_registry
    ) -> str | None:
        """Determine why an entity is unavailable with user-friendly hint.

        Args:
            hass: Home Assistant instance
            entity_id: Entity ID being analyzed
            registry_entry: Entity registry entry (or None if not in registry)
            state: Current state object (or None if no state)
            device_registry: Device registry instance

        Returns:
            Human-readable reason for unavailability, or None if entity is available
        """
        # Entity is administratively disabled
        if registry_entry and registry_entry.disabled:
            reasons = {
                "user": "Manually disabled by user",
                "integration": "Disabled by integration",
                "device": "Disabled because parent device is disabled",
                "config_entry": "Disabled because integration config is disabled"
            }
            return reasons.get(registry_entry.disabled_by, "Disabled")

        # Check device status
        if registry_entry and registry_entry.device_id:
            device_entry = device_registry.async_get(registry_entry.device_id)
            if device_entry and device_entry.disabled:
                return f"Parent device '{device_entry.name}' is disabled"

        # Check config entry status
        if registry_entry and registry_entry.config_entry_id:
            config_entry = hass.config_entries.async_get_entry(
                registry_entry.config_entry_id
            )
            if config_entry:
                platform_name = registry_entry.platform or "integration"
                if config_entry.state.name == "SETUP_ERROR":
                    return f"Integration failed to load ({platform_name})"
                elif config_entry.state.name == "SETUP_RETRY":
                    return f"Integration retrying setup ({platform_name})"
                elif config_entry.state.name == "NOT_LOADED":
                    return f"Integration not loaded ({platform_name})"

        # Check if recently unavailable (likely still loading)
        if state and state.state in ["unavailable", "unknown"]:
            now = datetime.now(timezone.utc)
            duration = (now - state.last_changed).total_seconds()

            if duration < 120:  # Less than 2 minutes
                return f"Recently unavailable ({int(duration)}s) - may still be loading"
            elif duration < 3600:  # Less than 1 hour
                return f"Unavailable for {int(duration/60)} minutes - device likely offline or unreachable"
            elif duration < 86400:  # Less than 1 day
                return f"Offline for {int(duration/3600)} hours - device unplugged or unreachable"
            else:
                days = int(duration/86400)
                return f"Offline for {days} day{'s' if days > 1 else ''} - device unplugged or unreachable"

        # Entity doesn't exist in state machine at all
        if not state:
            if registry_entry:
                return "Registered but never loaded - integration may have issues"
            else:
                return "Entity has been deleted - no longer exists in Home Assistant"

        # Entity is available and working normally - no reason to display
        return None

    @staticmethod
    def determine_statistics_eligibility(entity_id: str, registry_entry, state) -> str:
        """Determine why an entity is not eligible for statistics with user-friendly explanation.

        Args:
            entity_id: Entity ID being analyzed
            registry_entry: Entity registry entry (or None if not in registry)
            state: Current state object (or None if no state)

        Returns:
            Human-readable reason for statistics ineligibility
        """
        # Check if entity is deleted or not registered
        if not registry_entry:
            return "Entity has been deleted from Home Assistant"

        # Check if entity is disabled
        if registry_entry.disabled:
            return "Entity is disabled - statistics are not recorded for disabled entities"

        # Check if entity has no state
        if not state:
            return "Entity has no state - it may not be loaded or never provided a state"

        # Check if entity state is unavailable or unknown
        if state.state in ["unavailable", "unknown"]:
            return "Entity is currently unavailable - statistics require valid state values"

        # Check if domain is incompatible with statistics
        domain = entity_id.split('.')[0]
        incompatible_domains = {
            'binary_sensor': "Binary sensors cannot have statistics - they represent on/off states, not numeric measurements",
            'switch': "Switches cannot have statistics - they are control devices, not sensors",
            'light': "Lights cannot have statistics - they are control devices, not sensors",
            'input_boolean': "Input booleans cannot have statistics - they represent on/off states, not numeric measurements",
            'button': "Buttons cannot have statistics - they are trigger-only entities",
            'scene': "Scenes cannot have statistics - they are trigger-only entities",
            'script': "Scripts cannot have statistics - they are automation entities, not sensors",
            'automation': "Automations cannot have statistics - they are automation entities, not sensors",
            'person': "Person entities cannot have statistics - they track location/presence, not numeric values",
            'device_tracker': "Device trackers cannot have statistics - they track location/presence, not numeric values",
            'zone': "Zones cannot have statistics - they are location entities, not sensors",
        }

        if domain in incompatible_domains:
            return incompatible_domains[domain]

        # Check if state value is numeric (before checking for state_class/unit)
        try:
            float(state.state)
        except (ValueError, TypeError):
            return f"State value '{state.state}' is not numeric - statistics only work with numeric values"

        # Get state attributes
        attributes = state.attributes or {}

        # Check for state_class attribute (required for statistics)
        state_class = attributes.get("state_class")
        if not state_class:
            return "Missing 'state_class' attribute - entities need state_class (measurement, total, or total_increasing) to be recorded in statistics"

        # Check for unit_of_measurement (required for statistics)
        unit = attributes.get("unit_of_measurement")
        if not unit:
            return "Missing 'unit_of_measurement' attribute - statistics require a unit of measurement"

        # If all checks pass, entity should be eligible
        return "Entity appears eligible for statistics - it may take time to appear, or check recorder configuration"

    @staticmethod
    def calculate_update_frequency(engine: Engine, entity_id: str) -> dict[str, Any] | None:
        """Calculate update frequency from states table using 24-hour average.

        Uses the count of messages in the last 24 hours to calculate the true average
        interval, including idle periods. This provides a more accurate representation
        for entities that burst activity then go idle (e.g., motion sensors).

        Args:
            engine: Database engine
            entity_id: Entity ID to analyze

        Returns:
            Dictionary with interval_seconds, update_count_24h, and interval_text, or None if insufficient data
        """
        with engine.connect() as conn:
            # Get count of updates in last 24 hours
            cutoff_ts = datetime.now(timezone.utc).timestamp() - 86400
            count_query = text("""
                SELECT COUNT(*)
                FROM states s
                JOIN states_meta sm ON s.metadata_id = sm.metadata_id
                WHERE sm.entity_id = :entity_id
                AND s.last_updated_ts >= :cutoff
            """)
            count_result = conn.execute(count_query, {"entity_id": entity_id, "cutoff": cutoff_ts})
            count_24h = count_result.scalar()

            # Need at least 2 messages to calculate meaningful interval
            if count_24h < 2:
                return None

            # Calculate average interval: 24 hours / message count
            # This gives true average including idle periods
            interval_seconds = 86400 // count_24h

            return {
                'interval_seconds': interval_seconds,
                'update_count_24h': count_24h,
                'interval_text': EntityAnalyzer.format_interval(interval_seconds)
            }

    @staticmethod
    def format_interval(seconds: int | None) -> str | None:
        """Format update interval in human-readable format.

        Args:
            seconds: Interval in seconds

        Returns:
            Formatted string like "5s", "2.5min", "1.2h", or None if invalid
        """
        if seconds == 0 or seconds is None:
            return None

        # Format based on duration
        if seconds < 60:
            # Less than 60 seconds: show in seconds
            return f"{seconds}s"
        elif seconds < 3600:
            # Between 60 and 3599 seconds: show in minutes
            minutes = seconds / 60
            if minutes >= 10:
                return f"{minutes:.1f}min"
            else:
                return f"{minutes:.2f}min"
        else:
            # 3600 seconds or more: show in hours
            hours = seconds / 3600
            if hours >= 10:
                return f"{hours:.1f}h"
            else:
                return f"{hours:.2f}h"

    @staticmethod
    def get_hourly_message_counts(engine: Engine, entity_id: str, hours: int) -> dict[str, Any]:
        """Get message counts per hour for the specified time range.

        Groups state updates by hour to show activity patterns (e.g., burst vs idle periods).
        Useful for visualizing when entities are most active.

        Args:
            engine: Database engine
            entity_id: Entity ID to analyze
            hours: Time range in hours (24, 48, or 168 for 7 days)

        Returns:
            Dictionary with:
            - hourly_counts: List of message counts per hour (length = hours)
            - total_messages: Total number of messages in the time range
            - time_range_hours: The requested time range
        """
        with engine.connect() as conn:
            # Use UTC for consistent timestamp calculations
            now = datetime.now(timezone.utc)

            # Round down to the start of the current hour for aligned buckets
            # This ensures buckets align to clock hours (e.g., 14:00-15:00, 15:00-16:00)
            current_hour_start = now.replace(minute=0, second=0, microsecond=0)
            end_cutoff = current_hour_start.timestamp()

            # Go back the specified number of hours from the current hour start
            cutoff_ts = end_cutoff - (hours * 3600)

            # Get message counts grouped by hour
            # hour_bucket 0 = oldest hour, hour_bucket N-1 = most recent hour
            # Using FLOOR instead of CAST for more consistent behavior across databases
            query = text("""
                SELECT
                    FLOOR((last_updated_ts - :cutoff) / 3600.0) as hour_bucket,
                    COUNT(*) as count
                FROM states s
                JOIN states_meta sm ON s.metadata_id = sm.metadata_id
                WHERE sm.entity_id = :entity_id
                AND s.last_updated_ts >= :cutoff
                AND s.last_updated_ts < :end_cutoff
                GROUP BY hour_bucket
                ORDER BY hour_bucket
            """)

            result = conn.execute(query, {
                "entity_id": entity_id,
                "cutoff": cutoff_ts,
                "end_cutoff": end_cutoff
            })

            # Create array with all hours (0 to hours-1), fill missing hours with 0
            hourly_counts = [0] * hours
            total = 0

            for row in result:
                # Ensure hour_bucket is an integer
                hour_bucket = int(row[0]) if row[0] is not None else -1
                count = row[1]

                # Validate bounds to prevent array index errors
                if 0 <= hour_bucket < hours:
                    hourly_counts[hour_bucket] = count
                    total += count
                else:
                    # Log unexpected hour buckets (shouldn't happen with proper query)
                    _LOGGER.warning(
                        "Unexpected hour_bucket %s for entity %s (hours=%s). Skipping.",
                        hour_bucket, entity_id, hours
                    )

            return {
                "hourly_counts": hourly_counts,
                "total_messages": total,
                "time_range_hours": hours
            }
