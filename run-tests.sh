#!/bin/bash

# Script to run Python tests for Statistics Orphan Finder
# Activates virtual environment if not already activated

set -e  # Exit on error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"

# Parse arguments
COVERAGE=false
HELP=false
PYTEST_ARGS=()

for arg in "$@"; do
    case $arg in
        --coverage|-c)
            COVERAGE=true
            shift
            ;;
        --help|-h)
            HELP=true
            shift
            ;;
        *)
            PYTEST_ARGS+=("$arg")
            ;;
    esac
done

# Show help
if [ "$HELP" = true ]; then
    echo "Usage: ./run-tests.sh [OPTIONS] [PYTEST_ARGS]"
    echo ""
    echo "Options:"
    echo "  -c, --coverage    Run tests with coverage report (HTML + terminal)"
    echo "  -h, --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./run-tests.sh                          # Run all tests"
    echo "  ./run-tests.sh --coverage               # Run with coverage report"
    echo "  ./run-tests.sh -v                       # Run with verbose output"
    echo "  ./run-tests.sh tests/test_config_flow.py  # Run specific test file"
    echo "  ./run-tests.sh --coverage -v            # Coverage + verbose"
    echo ""
    echo "Coverage report will be generated in htmlcov/index.html"
    exit 0
fi

# Check if we're already in a virtual environment
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Virtual environment not activated. Activating..."

    # Check if venv exists
    if [ ! -d "$VENV_DIR" ]; then
        echo "Error: Virtual environment not found at $VENV_DIR"
        echo "Please create it first with: python3 -m venv venv"
        exit 1
    fi

    # Activate virtual environment
    source "$VENV_DIR/bin/activate"
    echo "✓ Virtual environment activated"
else
    echo "✓ Virtual environment already activated: $VIRTUAL_ENV"
fi

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo "Error: pytest not found. Installing test dependencies..."
    pip install -r "$SCRIPT_DIR/requirements_test.txt"
fi

# Build pytest command
cd "$SCRIPT_DIR"
PYTEST_CMD="pytest"

if [ "$COVERAGE" = true ]; then
    PYTEST_CMD="$PYTEST_CMD --cov=custom_components/statistics_orphan_finder --cov-report=html --cov-report=term"
fi

# Add any additional arguments
if [ ${#PYTEST_ARGS[@]} -gt 0 ]; then
    PYTEST_CMD="$PYTEST_CMD ${PYTEST_ARGS[*]}"
fi

# Run pytest
echo ""
if [ "$COVERAGE" = true ]; then
    echo "Running all Python tests with coverage..."
else
    echo "Running all Python tests..."
fi
echo "─────────────────────────────────────────────────"

eval $PYTEST_CMD

# Capture exit code
TEST_EXIT_CODE=$?

# Show results
echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✓ All tests passed!"
    if [ "$COVERAGE" = true ]; then
        echo ""
        echo "Coverage report generated:"
        echo "  - HTML: htmlcov/index.html"
        echo "  - JSON: coverage.json"
    fi
else
    echo "✗ Some tests failed (exit code: $TEST_EXIT_CODE)"
fi

exit $TEST_EXIT_CODE
