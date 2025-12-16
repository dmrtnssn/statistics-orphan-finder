"""Session management for progressive data loading."""
import asyncio
import logging
import time
import uuid
from collections import defaultdict
from typing import Any

_LOGGER = logging.getLogger(__name__)

# Session timeout in seconds (5 minutes)
SESSION_TIMEOUT = 300


class SessionManager:
    """Manages session lifecycle for progressive data loading.

    Provides temporal isolation for multi-step operations, preventing
    concurrent requests from interfering with each other. Sessions
    automatically expire after SESSION_TIMEOUT seconds of inactivity.

    Thread-safety: Each session has an asyncio.Lock to prevent race
    conditions when multiple requests try to access the same session.
    """

    def __init__(self) -> None:
        """Initialize session manager."""
        # Key: session_id (UUID), Value: {data: dict, timestamp: float}
        self._sessions: dict[str, dict[str, Any]] = {}
        # Key: session_id (UUID), Value: asyncio.Lock
        self._locks: dict[str, asyncio.Lock] = {}

    def get_lock(self, session_id: str) -> asyncio.Lock:
        """Get or create a lock for a session.

        Args:
            session_id: Session ID

        Returns:
            asyncio.Lock: Lock for this session
        """
        if session_id not in self._locks:
            self._locks[session_id] = asyncio.Lock()
        return self._locks[session_id]

    def create_session(self) -> str:
        """Create a new session and return its ID.

        Automatically cleans up stale sessions before creating new one.
        Initializes session with entity_map structure for step-by-step data accumulation.

        Returns:
            str: Session ID (UUID)
        """
        # Clean up stale sessions before creating new one
        self.cleanup_stale_sessions()

        # Generate new session ID
        session_id = str(uuid.uuid4())

        # Initialize session data with entity_map structure
        self._sessions[session_id] = {
            'data': {
                'entity_map': defaultdict(lambda: {
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
                    'metadata_id': None,
                })
            },
            'timestamp': time.time()
        }

        # Create lock for this session
        self._locks[session_id] = asyncio.Lock()

        _LOGGER.debug("Created new session %s", session_id[:8])
        return session_id

    def get_session_data(self, session_id: str) -> dict[str, Any]:
        """Retrieve session data by ID.

        Args:
            session_id: Session ID to retrieve

        Returns:
            dict: Session data dictionary containing 'entity_map'

        Raises:
            KeyError: If session ID does not exist
        """
        if session_id not in self._sessions:
            raise KeyError(f"Session {session_id[:8]} not found")

        return self._sessions[session_id]['data']

    def update_timestamp(self, session_id: str) -> None:
        """Update session timestamp to keep it alive.

        Args:
            session_id: Session ID to update

        Raises:
            KeyError: If session ID does not exist
        """
        if session_id not in self._sessions:
            raise KeyError(f"Session {session_id[:8]} not found")

        self._sessions[session_id]['timestamp'] = time.time()
        _LOGGER.debug("Updated timestamp for session %s", session_id[:8])

    def validate_session(self, session_id: str) -> bool:
        """Check if a session ID exists and is valid.

        Args:
            session_id: Session ID to validate

        Returns:
            bool: True if session exists, False otherwise
        """
        return session_id in self._sessions

    def delete_session(self, session_id: str) -> None:
        """Delete a session by ID.

        Args:
            session_id: Session ID to delete

        Raises:
            KeyError: If session ID does not exist
        """
        if session_id not in self._sessions:
            raise KeyError(f"Session {session_id[:8]} not found")

        del self._sessions[session_id]
        # Clean up lock for this session
        if session_id in self._locks:
            del self._locks[session_id]
        _LOGGER.debug("Deleted session %s", session_id[:8])

    def cleanup_stale_sessions(self) -> None:
        """Remove sessions older than SESSION_TIMEOUT.

        Automatically called before creating new sessions to prevent
        memory leaks from abandoned sessions.
        """
        current_time = time.time()
        stale_sessions = [
            session_id
            for session_id, session in self._sessions.items()
            if current_time - session['timestamp'] > SESSION_TIMEOUT
        ]

        for session_id in stale_sessions:
            age = int(current_time - self._sessions[session_id]['timestamp'])
            _LOGGER.info("Cleaning up stale session %s (age: %ds)", session_id[:8], age)
            del self._sessions[session_id]
            # Clean up lock for stale session
            if session_id in self._locks:
                del self._locks[session_id]

    def clear_all_sessions(self) -> None:
        """Clear all sessions (typically called during shutdown).

        Logs the number of sessions being cleared if any exist.
        """
        session_count = len(self._sessions)
        if session_count > 0:
            _LOGGER.info("Clearing %d session(s)", session_count)
        self._sessions.clear()
        self._locks.clear()
