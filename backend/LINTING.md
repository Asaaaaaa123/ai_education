# Backend Linting and Code Quality

This document describes the linting setup and how to use it for the Python backend.

## Tools Installed

1. **Ruff** - Fast Python linter (replaces flake8, isort, etc.)
2. **Black** - Code formatter
3. **Mypy** - Static type checker

## Configuration Files

- `pyproject.toml` - Configuration for Black, Ruff, and Mypy
- `.ruff.toml` - Alternative Ruff configuration (for compatibility)

## Running Linting Checks

### Option 1: Using the batch script (Windows)
```bash
cd backend
lint.bat
```

### Option 2: Using the Python script
```bash
cd backend
python lint_check.py
```

### Option 3: Manual commands

#### Check with Ruff
```bash
cd backend
python -m ruff check .
```

#### Auto-fix with Ruff
```bash
python -m ruff check . --fix
```

#### Check formatting with Black
```bash
python -m black --check .
```

#### Auto-format with Black
```bash
python -m black .
```

#### Type checking with Mypy
```bash
python -m mypy . --ignore-missing-imports
```

## Pre-commit Setup (Optional)

To run linting automatically before commits, install pre-commit:

```bash
pip install pre-commit
pre-commit install
```

Create `.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff
        args: [--fix]
  - repo: https://github.com/psf/black
    rev: 23.0.0
    hooks:
      - id: black
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Install dependencies
  run: pip install ruff black mypy types-requests

- name: Run Ruff
  run: ruff check .

- name: Check formatting
  run: black --check .

- name: Type check
  run: mypy . --ignore-missing-imports
```

## Configuration Details

### Ruff Rules
- **E, W**: Pycodestyle errors and warnings
- **F**: Pyflakes
- **I**: Import sorting (isort)
- **B**: Flake8-bugbear
- **C4**: Flake8-comprehensions
- **UP**: Pyupgrade
- **ARG**: Unused arguments
- **SIM**: Simplifications

### Black Settings
- Line length: 100 characters
- Target Python versions: 3.8+

### Mypy Settings
- Python version: 3.8
- Ignores missing imports for external libraries (torch, transformers, etc.)
- Warns on return types and unused configs

## Common Issues and Fixes

### Import sorting
```bash
# Auto-fix import order
python -m ruff check . --select I --fix
```

### Unused imports
```bash
# Remove unused imports
python -m ruff check . --select F401 --fix
```

### Formatting issues
```bash
# Auto-format all files
python -m black .
```

## Excluded Files/Directories

The following are automatically excluded:
- `venv/` - Virtual environment
- `__pycache__/` - Python cache
- `.git/` - Git directory
- `*.pyc` - Compiled Python files
- `build/`, `dist/` - Build directories

## Best Practices

1. **Run linting before committing**: Use `lint.bat` or `lint_check.py`
2. **Auto-fix when possible**: Use `ruff check . --fix` and `black .`
3. **Fix type errors gradually**: Mypy can be strict; fix errors incrementally
4. **Keep configuration updated**: Update `pyproject.toml` as needed

## Troubleshooting

### Tools not found
```bash
pip install ruff black mypy types-requests
```

### Virtual environment issues
Make sure you're using the correct Python environment:
```bash
# Activate venv first (Windows)
.\venv\Scripts\activate

# Then run linting
python -m ruff check .
```

### Path issues with Chinese characters
If you encounter path encoding issues, use the Python script:
```bash
python lint_check.py
```


