"""Storage size estimation constants.

These constants are used for estimating database storage usage when
exact measurements are not available or practical to compute.

All sizes are in bytes unless otherwise specified.
"""

# Default average row sizes for database tables (in bytes)
# These values are used as fallbacks when actual measurements aren't available

# States table row sizes
DEFAULT_STATES_ROW_SIZE = 150
"""Default estimated size for a single row in the states table.
Based on typical entity_id length (~40 bytes), state string (~20 bytes),
attributes JSON (~50 bytes), and timestamps (~40 bytes)."""

STATES_META_ROW_SIZE = 100
"""Estimated size for a single row in the states_meta table.
Stores entity_id and metadata_id, typically ~100 bytes."""

# Statistics table row sizes
DEFAULT_STATISTICS_ROW_SIZE = 100
"""Default estimated size for a single row in statistics tables.
Includes metadata_id, timestamps, state value, and sum values (~100 bytes total)."""

STATISTICS_META_ROW_SIZE = 200
"""Estimated size for a single row in the statistics_meta table.
Stores source, statistic_id, unit_of_measurement, and has_mean/sum flags."""

# Compression factor for MySQL InnoDB
# InnoDB uses compression on TEXT/BLOB columns which typically achieves 0.85 compression ratio
MYSQL_COMPRESSION_FACTOR = 0.85
"""Compression factor for MySQL InnoDB compressed tables.
InnoDB's page compression typically achieves ~15% size reduction (0.85 ratio)."""
