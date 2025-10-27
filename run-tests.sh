#!/bin/bash

# Script to run Python tests for Statistics Orphan Finder
# Activates virtual environment if not already activated

set -e  # Exit on error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"

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

# Run pytest with all tests
echo ""
echo "Running all Python tests..."
echo "─────────────────────────────────────────────────"

cd "$SCRIPT_DIR"
pytest "$@"

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✓ All tests passed!"
else
    echo "✗ Some tests failed (exit code: $TEST_EXIT_CODE)"
fi

exit $TEST_EXIT_CODE
