"""Tests for SessionManager service."""
import time
from collections import defaultdict
from unittest.mock import patch

import pytest

from custom_components.statistics_orphan_finder.services.session_manager import (
    SessionManager,
    SESSION_TIMEOUT,
)


class TestSessionManager:
    """Test SessionManager functionality."""

    def test_create_session(self):
        """Test creating a new session returns a UUID."""
        manager = SessionManager()
        session_id = manager.create_session()

        assert session_id is not None
        assert isinstance(session_id, str)
        assert len(session_id) == 36  # UUID format: 8-4-4-4-12 = 36 chars

    def test_create_session_initializes_data(self):
        """Test session is initialized with correct data structure."""
        manager = SessionManager()
        session_id = manager.create_session()

        data = manager.get_session_data(session_id)
        assert 'entity_map' in data
        assert isinstance(data['entity_map'], defaultdict)

        # Test defaultdict creates correct structure
        test_entity = data['entity_map']['sensor.test']
        assert test_entity['in_states_meta'] is False
        assert test_entity['in_states'] is False
        assert test_entity['in_statistics_meta'] is False
        assert test_entity['in_statistics_short_term'] is False
        assert test_entity['in_statistics_long_term'] is False
        assert test_entity['states_count'] == 0
        assert test_entity['stats_short_count'] == 0
        assert test_entity['stats_long_count'] == 0
        assert test_entity['last_state_update'] is None
        assert test_entity['last_stats_update'] is None
        assert test_entity['metadata_id'] is None

    def test_get_session_data(self):
        """Test retrieving session data."""
        manager = SessionManager()
        session_id = manager.create_session()

        data = manager.get_session_data(session_id)
        assert data is not None
        assert 'entity_map' in data

    def test_get_session_data_not_found(self):
        """Test get_session_data raises KeyError for invalid session."""
        manager = SessionManager()

        with pytest.raises(KeyError):
            manager.get_session_data("invalid-session-id")

    def test_update_timestamp(self):
        """Test updating session timestamp."""
        manager = SessionManager()
        session_id = manager.create_session()

        # Get initial timestamp
        initial_timestamp = manager._sessions[session_id]['timestamp']

        # Wait a bit and update
        time.sleep(0.01)
        manager.update_timestamp(session_id)

        # Verify timestamp was updated
        new_timestamp = manager._sessions[session_id]['timestamp']
        assert new_timestamp > initial_timestamp

    def test_update_timestamp_not_found(self):
        """Test update_timestamp raises KeyError for invalid session."""
        manager = SessionManager()

        with pytest.raises(KeyError):
            manager.update_timestamp("invalid-session-id")

    def test_validate_session_exists(self):
        """Test validate_session returns True for existing session."""
        manager = SessionManager()
        session_id = manager.create_session()

        assert manager.validate_session(session_id) is True

    def test_validate_session_not_exists(self):
        """Test validate_session returns False for non-existent session."""
        manager = SessionManager()

        assert manager.validate_session("invalid-session-id") is False

    def test_delete_session(self):
        """Test deleting a session."""
        manager = SessionManager()
        session_id = manager.create_session()

        # Verify session exists
        assert manager.validate_session(session_id) is True

        # Delete session
        manager.delete_session(session_id)

        # Verify session is gone
        assert manager.validate_session(session_id) is False

    def test_delete_session_not_found(self):
        """Test delete_session raises KeyError for invalid session."""
        manager = SessionManager()

        with pytest.raises(KeyError):
            manager.delete_session("invalid-session-id")

    def test_cleanup_stale_sessions(self):
        """Test cleanup removes stale sessions."""
        manager = SessionManager()
        session_id = manager.create_session()

        # Manually set timestamp to be stale (older than SESSION_TIMEOUT)
        manager._sessions[session_id]['timestamp'] = time.time() - SESSION_TIMEOUT - 10

        # Run cleanup
        manager.cleanup_stale_sessions()

        # Verify stale session was removed
        assert manager.validate_session(session_id) is False

    def test_cleanup_stale_sessions_keeps_active(self):
        """Test cleanup keeps active sessions."""
        manager = SessionManager()
        session_id = manager.create_session()

        # Run cleanup immediately (session is fresh)
        manager.cleanup_stale_sessions()

        # Verify session still exists
        assert manager.validate_session(session_id) is True

    def test_clear_all_sessions(self):
        """Test clearing all sessions."""
        manager = SessionManager()

        # Create multiple sessions
        session1 = manager.create_session()
        session2 = manager.create_session()
        session3 = manager.create_session()

        # Verify all exist
        assert manager.validate_session(session1) is True
        assert manager.validate_session(session2) is True
        assert manager.validate_session(session3) is True

        # Clear all
        manager.clear_all_sessions()

        # Verify all gone
        assert manager.validate_session(session1) is False
        assert manager.validate_session(session2) is False
        assert manager.validate_session(session3) is False

    def test_create_session_cleans_up_stale(self):
        """Test create_session automatically cleans up stale sessions."""
        manager = SessionManager()

        # Create initial session and make it stale
        old_session = manager.create_session()
        manager._sessions[old_session]['timestamp'] = time.time() - SESSION_TIMEOUT - 10

        # Create new session (should trigger cleanup)
        new_session = manager.create_session()

        # Verify old session was cleaned up
        assert manager.validate_session(old_session) is False
        # Verify new session exists
        assert manager.validate_session(new_session) is True

    def test_session_isolation(self):
        """Test multiple sessions are isolated from each other."""
        manager = SessionManager()

        # Create two sessions
        session1 = manager.create_session()
        session2 = manager.create_session()

        # Modify data in session1
        data1 = manager.get_session_data(session1)
        data1['entity_map']['sensor.test1']['states_count'] = 100

        # Verify session2 data is unaffected
        data2 = manager.get_session_data(session2)
        assert data2['entity_map']['sensor.test1']['states_count'] == 0

    def test_session_data_persistence(self):
        """Test session data persists across multiple accesses."""
        manager = SessionManager()
        session_id = manager.create_session()

        # Modify data
        data = manager.get_session_data(session_id)
        data['entity_map']['sensor.test']['states_count'] = 42

        # Retrieve again and verify persistence
        data_again = manager.get_session_data(session_id)
        assert data_again['entity_map']['sensor.test']['states_count'] == 42

    def test_cleanup_stale_sessions_with_multiple_sessions(self):
        """Test cleanup correctly handles mix of stale and active sessions."""
        manager = SessionManager()

        # Create sessions with different ages
        active_session = manager.create_session()
        stale_session1 = manager.create_session()
        stale_session2 = manager.create_session()

        # Make two sessions stale
        manager._sessions[stale_session1]['timestamp'] = time.time() - SESSION_TIMEOUT - 10
        manager._sessions[stale_session2]['timestamp'] = time.time() - SESSION_TIMEOUT - 20

        # Run cleanup
        manager.cleanup_stale_sessions()

        # Verify stale sessions removed, active session kept
        assert manager.validate_session(active_session) is True
        assert manager.validate_session(stale_session1) is False
        assert manager.validate_session(stale_session2) is False
