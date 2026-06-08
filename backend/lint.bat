@echo off
REM Backend linting script for Windows
echo Backend Linting Check
echo =====================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    exit /b 1
)

REM Run linting checks
echo.
echo 1. Running Ruff (linter)...
python -m ruff check .
if errorlevel 1 (
    echo Ruff found issues
) else (
    echo Ruff passed
)

echo.
echo 2. Running Black (format check)...
python -m black --check .
if errorlevel 1 (
    echo Black found formatting issues
    echo Run 'python -m black .' to auto-fix
) else (
    echo Black passed
)

echo.
echo 3. Running Mypy (type checking)...
python -m mypy . --ignore-missing-imports
echo Mypy check completed (warnings may be present)

echo.
echo =====================
echo Linting check complete
echo =====================


