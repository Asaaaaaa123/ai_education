#!/usr/bin/env python3
"""
Backend linting check script
Runs ruff, black check, and mypy on the backend codebase
"""

import subprocess
import sys
import os

def run_command(cmd, description):
    """Run a command and return success status"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=os.path.dirname(__file__))
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"Error running {description}: {e}", file=sys.stderr)
        return False

def main():
    """Run all linting checks"""
    print("Backend Linting Check")
    print("=" * 60)
    
    # Check if tools are installed
    tools_installed = True
    for tool in ['ruff', 'black', 'mypy']:
        result = subprocess.run(f"python -m {tool} --version", shell=True, capture_output=True)
        if result.returncode != 0:
            print(f"Warning: {tool} is not installed. Run: pip install {tool}")
            tools_installed = False
    
    if not tools_installed:
        print("\nPlease install missing tools first:")
        print("pip install ruff black mypy types-requests")
        return 1
    
    all_passed = True
    
    # Run ruff
    print("\n1. Running Ruff (linter)...")
    if not run_command("python -m ruff check .", "Ruff linting"):
        print("❌ Ruff found issues")
        all_passed = False
    else:
        print("✅ Ruff passed")
    
    # Run black check (format check)
    print("\n2. Running Black (format check)...")
    if not run_command("python -m black --check .", "Black format check"):
        print("❌ Black found formatting issues")
        print("   Run 'python -m black .' to auto-fix")
        all_passed = False
    else:
        print("✅ Black passed")
    
    # Run mypy (type checking) - optional, may have many errors
    print("\n3. Running Mypy (type checking)...")
    print("   (This may take a while and show many errors initially)")
    run_command("python -m mypy . --ignore-missing-imports", "Mypy type checking")
    # Don't fail on mypy errors initially
    
    if all_passed:
        print("\n" + "="*60)
        print("✅ All critical linting checks passed!")
        print("="*60)
        return 0
    else:
        print("\n" + "="*60)
        print("❌ Some linting checks failed. Please fix the issues above.")
        print("="*60)
        return 1

if __name__ == "__main__":
    sys.exit(main())


