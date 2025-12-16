"""Constants for the Statistics Orphan Finder integration."""

DOMAIN = "statistics_orphan_finder"

CONF_DB_URL = "db_url"
CONF_USERNAME = "username"
CONF_PASSWORD = "password"

# API versioning
API_VERSION = "1.0"  # Semantic versioning for API compatibility

# Error categories for actionable error messages
ERROR_CATEGORY_DB_CONNECTION = "DB_CONNECTION"
ERROR_CATEGORY_DB_PERMISSION = "DB_PERMISSION"
ERROR_CATEGORY_DB_TIMEOUT = "DB_TIMEOUT"
ERROR_CATEGORY_SESSION_EXPIRED = "SESSION_EXPIRED"
ERROR_CATEGORY_INVALID_INPUT = "INVALID_INPUT"
ERROR_CATEGORY_UNKNOWN = "UNKNOWN"

# User-friendly error messages by category
ERROR_MESSAGES = {
    ERROR_CATEGORY_DB_CONNECTION: (
        "Cannot connect to the database. Please check your database URL, "
        "credentials, and ensure the database server is running."
    ),
    ERROR_CATEGORY_DB_PERMISSION: (
        "Database permission denied. The database user needs SELECT permission "
        "on the Home Assistant recorder tables (states, statistics, etc.)."
    ),
    ERROR_CATEGORY_DB_TIMEOUT: (
        "Database connection timed out. The database server may be slow to respond "
        "or unreachable. Check network connectivity and server status."
    ),
    ERROR_CATEGORY_SESSION_EXPIRED: (
        "Your session has expired (sessions expire after 5 minutes of inactivity). "
        "Please refresh the page to start a new data loading session."
    ),
    ERROR_CATEGORY_INVALID_INPUT: (
        "Invalid input parameters provided. Please check your request and try again."
    ),
    ERROR_CATEGORY_UNKNOWN: (
        "An unexpected error occurred. Please check the Home Assistant logs for details."
    ),
}
