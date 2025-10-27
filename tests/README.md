# Test Suite for Statistics Orphan Finder

This directory contains the comprehensive test suite for the Statistics Orphan Finder custom integration backend.

## Quick Start

```bash
# Install test dependencies
pip install -r requirements_test.txt

# Run all tests
pytest

# Run with coverage
pytest --cov

# Run specific test file
pytest tests/services/test_database_service.py
```

## Test Organization

```
tests/
├── conftest.py                    # Shared fixtures (database, mocks, etc.)
├── test_coordinator.py            # StatisticsOrphanCoordinator tests
├── services/                      # Service module tests
│   ├── test_database_service.py   # DatabaseService tests
│   ├── test_entity_analyzer.py    # EntityAnalyzer tests
│   ├── test_storage_calculator.py # StorageCalculator tests
│   └── test_sql_generator.py      # SqlGenerator tests
└── fixtures/                      # Additional fixtures
```

## Test Categories

### Unit Tests
Fast, isolated tests of individual functions/classes:
```bash
pytest -m unit
```

### Integration Tests
Tests with database interactions:
```bash
pytest -m integration
```

### Coordinator Tests
Tests for the 8-step progressive loading workflow:
```bash
pytest tests/test_coordinator.py
```

## Key Fixtures

All fixtures are defined in `conftest.py`:

- **`mock_config_entry`**: Mock Home Assistant config entry with SQLite database URL
- **`sqlite_engine`**: Empty in-memory SQLite database with HA schema
- **`populated_sqlite_engine`**: SQLite database populated with test data
- **`mock_hass`**: Mock Home Assistant instance with async_add_executor_job
- **`mock_entity_registry`**: Mock entity registry with test entities
- **`mock_device_registry`**: Mock device registry
- **`mock_state`**: Mock state object with typical sensor attributes

## Coverage

View coverage report:
```bash
pytest --cov=custom_components.statistics_orphan_finder --cov-report=html
open htmlcov/index.html
```

Target coverage: **85%+** overall, **90%+** for service modules

## Common Test Patterns

### Testing Async Methods
```python
@pytest.mark.asyncio
async def test_async_method(self, mock_hass):
    coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)
    result = await coordinator.async_execute_overview_step(0)
    assert result["status"] == "initialized"
```

### Testing Database Queries
```python
def test_query(self, populated_sqlite_engine):
    service = DatabaseService(mock_hass, mock_config_entry)
    service._engine = populated_sqlite_engine

    result = service._fetch_database_size()
    assert result["states"] > 0
```

### Mocking Service Methods
```python
def test_delegation(self, mock_hass, mock_config_entry):
    coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)

    with patch.object(coordinator.storage_calculator, "calculate_entity_storage") as mock_calc:
        mock_calc.return_value = 5000
        result = coordinator._calculate_entity_storage("sensor.test", "States", True, False)
        assert result == 5000
```

## Writing New Tests

1. **Choose the right test file** based on the component you're testing
2. **Use existing fixtures** from `conftest.py`
3. **Follow naming conventions**: `test_method_behavior`
4. **Write descriptive docstrings**: Explain what the test validates
5. **Use Arrange-Act-Assert** pattern for clarity

Example:
```python
class TestNewFeature:
    """Test new feature functionality."""

    def test_feature_returns_expected_value(self, mock_hass, mock_config_entry):
        """Test feature returns correct value for valid input."""
        # Arrange
        service = MyService(mock_hass, mock_config_entry)

        # Act
        result = service.new_method("input")

        # Assert
        assert result == "expected"
```

## Troubleshooting

### Tests hanging
- Check `pytest-asyncio` is installed
- Verify `asyncio_mode = auto` in `pytest.ini`

### Import errors
- Run pytest from repository root
- Ensure `PYTHONPATH` includes project directory

### Database errors
- Use fresh fixtures (`populated_sqlite_engine`) per test
- Don't modify shared fixture data

## Running Tests in CI

GitHub Actions example:
```yaml
- name: Run tests
  run: |
    pip install -r requirements_test.txt
    pytest --cov --cov-report=xml
```

## Full Documentation

See [docs/TESTING_GUIDE.md](../docs/TESTING_GUIDE.md) for:
- Detailed testing patterns
- Parametrized test examples
- Advanced mocking techniques
- Coverage analysis
- CI/CD integration

## Test Data

The `populated_sqlite_engine` fixture includes:

**states_meta**:
- `sensor.temperature` (metadata_id=1)
- `sensor.humidity` (metadata_id=2)
- `sensor.deleted_entity` (metadata_id=3)
- `switch.test_switch` (metadata_id=4)

**statistics_meta**:
- `sensor.temperature` (id=1)
- `sensor.humidity` (id=2)
- `sensor.deleted_stats` (id=3)

Use this data in tests to verify queries and calculations.

## Questions?

- Review test examples in each `test_*.py` file
- Check `conftest.py` for available fixtures
- See [TESTING_GUIDE.md](../docs/TESTING_GUIDE.md) for patterns
- Look at existing tests for similar functionality
