"""Tests for RegistryAdapter service."""
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, Mock, patch

import pytest

from custom_components.statistics_orphan_finder.services.registry_adapter import (
    RegistryAdapter,
)


class TestRegistryAdapter:
    """Test RegistryAdapter functionality."""

    def test_init_stores_hass(self, mock_hass):
        """Test RegistryAdapter stores hass instance."""
        adapter = RegistryAdapter(mock_hass)
        assert adapter.hass == mock_hass

    def test_get_entity_state_returns_state(self, mock_hass):
        """Test _get_entity_state returns state from hass."""
        mock_state = Mock()
        mock_hass.states.get.return_value = mock_state

        adapter = RegistryAdapter(mock_hass)
        result = adapter._get_entity_state("sensor.test")

        mock_hass.states.get.assert_called_once_with("sensor.test")
        assert result == mock_state

    def test_get_entity_state_returns_none_when_not_found(self, mock_hass):
        """Test _get_entity_state returns None for missing entity."""
        mock_hass.states.get.return_value = None

        adapter = RegistryAdapter(mock_hass)
        result = adapter._get_entity_state("sensor.missing")

        assert result is None

    def test_determine_registry_status_enabled(self):
        """Test _determine_registry_status returns Enabled for active entities."""
        adapter = RegistryAdapter(Mock())
        registry_entry = Mock(disabled=False)

        result = adapter._determine_registry_status(registry_entry)
        assert result == "Enabled"

    def test_determine_registry_status_disabled(self):
        """Test _determine_registry_status returns Disabled for disabled entities."""
        adapter = RegistryAdapter(Mock())
        registry_entry = Mock(disabled=True)

        result = adapter._determine_registry_status(registry_entry)
        assert result == "Disabled"

    def test_determine_registry_status_not_in_registry(self):
        """Test _determine_registry_status returns Not in Registry for None."""
        adapter = RegistryAdapter(Mock())

        result = adapter._determine_registry_status(None)
        assert result == "Not in Registry"

    def test_determine_state_status_available(self):
        """Test _determine_state_status returns Available for normal states."""
        adapter = RegistryAdapter(Mock())
        state = Mock(state="on")

        result = adapter._determine_state_status(state)
        assert result == "Available"

    def test_determine_state_status_unavailable(self):
        """Test _determine_state_status returns Unavailable for unavailable state."""
        adapter = RegistryAdapter(Mock())
        state = Mock(state="unavailable")

        result = adapter._determine_state_status(state)
        assert result == "Unavailable"

    def test_determine_state_status_unknown(self):
        """Test _determine_state_status returns Unavailable for unknown state."""
        adapter = RegistryAdapter(Mock())
        state = Mock(state="unknown")

        result = adapter._determine_state_status(state)
        assert result == "Unavailable"

    def test_determine_state_status_not_present(self):
        """Test _determine_state_status returns Not Present for None."""
        adapter = RegistryAdapter(Mock())

        result = adapter._determine_state_status(None)
        assert result == "Not Present"

    def test_get_device_info_with_device(self):
        """Test _get_device_info returns device name and status."""
        adapter = RegistryAdapter(Mock())
        device_registry = Mock()
        device_entry = Mock()
        device_entry.name = "Test Device"
        device_entry.disabled = True
        device_registry.async_get.return_value = device_entry

        registry_entry = Mock(device_id="device_123")

        name, disabled = adapter._get_device_info(registry_entry, device_registry)

        assert name == "Test Device"
        assert disabled is True
        device_registry.async_get.assert_called_once_with("device_123")

    def test_get_device_info_without_device(self):
        """Test _get_device_info returns None when no device."""
        adapter = RegistryAdapter(Mock())
        device_registry = Mock()

        registry_entry = Mock(device_id=None)

        name, disabled = adapter._get_device_info(registry_entry, device_registry)

        assert name is None
        assert disabled is False

    def test_get_device_info_device_not_found(self):
        """Test _get_device_info handles missing device gracefully."""
        adapter = RegistryAdapter(Mock())
        device_registry = Mock()
        device_registry.async_get.return_value = None

        registry_entry = Mock(device_id="missing_device")

        name, disabled = adapter._get_device_info(registry_entry, device_registry)

        assert name is None
        assert disabled is False

    def test_get_config_entry_info_with_entry(self):
        """Test _get_config_entry_info returns entry state and title."""
        adapter = RegistryAdapter(Mock())
        config_entry = Mock()
        config_entry.state = Mock()
        config_entry.state.name = "LOADED"
        config_entry.title = "Test Integration"
        config_entries_map = {"entry_123": config_entry}

        registry_entry = Mock(config_entry_id="entry_123")

        state, title = adapter._get_config_entry_info(registry_entry, config_entries_map)

        assert state == "LOADED"
        assert title == "Test Integration"

    def test_get_config_entry_info_without_entry(self):
        """Test _get_config_entry_info returns None when no config entry."""
        adapter = RegistryAdapter(Mock())
        config_entries_map = {}

        registry_entry = Mock(config_entry_id=None)

        state, title = adapter._get_config_entry_info(registry_entry, config_entries_map)

        assert state is None
        assert title is None

    def test_get_config_entry_info_entry_not_found(self):
        """Test _get_config_entry_info handles missing entry gracefully."""
        adapter = RegistryAdapter(Mock())
        config_entries_map = {}

        registry_entry = Mock(config_entry_id="missing_entry")

        state, title = adapter._get_config_entry_info(registry_entry, config_entries_map)

        assert state is None
        assert title is None

    def test_calculate_unavailable_duration_unavailable(self):
        """Test _calculate_unavailable_duration for unavailable entity."""
        adapter = RegistryAdapter(Mock())
        now = datetime.now(timezone.utc)
        past = now - timedelta(hours=2)
        state = Mock(state="unavailable", last_changed=past)

        duration = adapter._calculate_unavailable_duration(state)

        # Should be around 2 hours (7200 seconds), allow some tolerance
        assert 7190 <= duration <= 7210

    def test_calculate_unavailable_duration_unknown(self):
        """Test _calculate_unavailable_duration for unknown entity."""
        adapter = RegistryAdapter(Mock())
        now = datetime.now(timezone.utc)
        past = now - timedelta(minutes=30)
        state = Mock(state="unknown", last_changed=past)

        duration = adapter._calculate_unavailable_duration(state)

        # Should be around 30 minutes (1800 seconds)
        assert 1790 <= duration <= 1810

    def test_calculate_unavailable_duration_available(self):
        """Test _calculate_unavailable_duration returns None for available entity."""
        adapter = RegistryAdapter(Mock())
        state = Mock(state="on")

        duration = adapter._calculate_unavailable_duration(state)

        assert duration is None

    def test_calculate_unavailable_duration_no_state(self):
        """Test _calculate_unavailable_duration returns None when no state."""
        adapter = RegistryAdapter(Mock())

        duration = adapter._calculate_unavailable_duration(None)

        assert duration is None

    def test_determine_statistics_eligibility_has_stats(self):
        """Test _determine_statistics_eligibility returns None when has statistics."""
        adapter = RegistryAdapter(Mock())
        info = {'in_statistics_meta': True}

        result = adapter._determine_statistics_eligibility("sensor.test", None, None, info)

        assert result is None

    def test_determine_statistics_eligibility_no_stats(self):
        """Test _determine_statistics_eligibility calls EntityAnalyzer."""
        adapter = RegistryAdapter(Mock())
        info = {'in_statistics_meta': False}

        with patch('custom_components.statistics_orphan_finder.services.registry_adapter.EntityAnalyzer') as mock_analyzer:
            mock_analyzer.determine_statistics_eligibility.return_value = "Not numeric"

            result = adapter._determine_statistics_eligibility(
                "sensor.test", Mock(), Mock(), info
            )

            assert result == "Not numeric"
            mock_analyzer.determine_statistics_eligibility.assert_called_once()

    def test_determine_statistics_eligibility_exception(self):
        """Test _determine_statistics_eligibility handles exceptions."""
        adapter = RegistryAdapter(Mock())
        info = {'in_statistics_meta': False}

        with patch('custom_components.statistics_orphan_finder.services.registry_adapter.EntityAnalyzer') as mock_analyzer:
            mock_analyzer.determine_statistics_eligibility.side_effect = Exception("Test error")

            result = adapter._determine_statistics_eligibility(
                "sensor.test", Mock(), Mock(), info
            )

            assert result == "Unable to determine eligibility"

    def test_determine_entity_origin_both(self):
        """Test _determine_entity_origin returns Both for both tables."""
        adapter = RegistryAdapter(Mock())
        info = {
            'in_statistics_meta': True,
            'in_statistics_long_term': True,
            'in_statistics_short_term': True
        }

        result = adapter._determine_entity_origin(info)
        assert result == "Both"

    def test_determine_entity_origin_long_term(self):
        """Test _determine_entity_origin returns Long-term."""
        adapter = RegistryAdapter(Mock())
        info = {
            'in_statistics_meta': True,
            'in_statistics_long_term': True,
            'in_statistics_short_term': False
        }

        result = adapter._determine_entity_origin(info)
        assert result == "Long-term"

    def test_determine_entity_origin_short_term(self):
        """Test _determine_entity_origin returns Short-term."""
        adapter = RegistryAdapter(Mock())
        info = {
            'in_statistics_meta': True,
            'in_statistics_long_term': False,
            'in_statistics_short_term': True
        }

        result = adapter._determine_entity_origin(info)
        assert result == "Short-term"

    def test_determine_entity_origin_no_stats(self):
        """Test _determine_entity_origin returns None when not in statistics."""
        adapter = RegistryAdapter(Mock())
        info = {'in_statistics_meta': False}

        result = adapter._determine_entity_origin(info)
        assert result is None

    def test_get_config_entries_map(self, mock_hass):
        """Test _get_config_entries_map creates lookup dictionary."""
        entry1 = Mock(entry_id="entry_1")
        entry2 = Mock(entry_id="entry_2")
        mock_hass.config_entries.async_entries.return_value = [entry1, entry2]

        adapter = RegistryAdapter(mock_hass)
        result = adapter._get_config_entries_map()

        assert len(result) == 2
        assert result["entry_1"] == entry1
        assert result["entry_2"] == entry2

    def test_enrich_entities_returns_list(self, mock_hass):
        """Test enrich_entities returns list of enriched entities."""
        # Setup mocks
        mock_hass.config_entries.async_entries.return_value = []

        with patch('custom_components.statistics_orphan_finder.services.registry_adapter.er') as mock_er, \
             patch('custom_components.statistics_orphan_finder.services.registry_adapter.dr') as mock_dr:
            # Setup registry mocks
            mock_entity_registry = Mock()
            mock_entity_registry.async_get.return_value = None
            mock_er.async_get.return_value = mock_entity_registry

            mock_device_registry = Mock()
            mock_dr.async_get.return_value = mock_device_registry

            adapter = RegistryAdapter(mock_hass)

            entity_map = {
                'sensor.test': {
                    'in_states_meta': True,
                    'in_states': True,
                    'in_statistics_meta': False,
                    'in_statistics_short_term': False,
                    'in_statistics_long_term': False,
                    'states_count': 100,
                    'stats_short_count': 0,
                    'stats_long_count': 0,
                    'last_state_update': None,
                    'last_stats_update': None,
                }
            }

            result = adapter.enrich_entities(entity_map)

            assert isinstance(result, list)
            assert len(result) == 1
            assert result[0]['entity_id'] == 'sensor.test'

    def test_enrich_entities_empty_map(self, mock_hass):
        """Test enrich_entities handles empty entity_map."""
        # Setup mocks
        mock_hass.config_entries.async_entries.return_value = []

        with patch('custom_components.statistics_orphan_finder.services.registry_adapter.er') as mock_er, \
             patch('custom_components.statistics_orphan_finder.services.registry_adapter.dr') as mock_dr:
            mock_entity_registry = Mock()
            mock_er.async_get.return_value = mock_entity_registry

            mock_device_registry = Mock()
            mock_dr.async_get.return_value = mock_device_registry

            adapter = RegistryAdapter(mock_hass)

            result = adapter.enrich_entities({})

            assert isinstance(result, list)
            assert len(result) == 0
