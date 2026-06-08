# Lefthook Pre-commit Hook Setup

This project uses [Lefthook](https://github.com/evilmartians/lefthook) to manage Git hooks. The pre-commit hook ensures that:

1. ✅ **Frontend builds successfully** (`npm run build`)
2. ✅ **Backend setup is verified** (Python and dependencies check)
3. ✅ **Frontend Docker image builds successfully**
4. ✅ **Backend Docker image builds successfully**

## Installation

### 1. Install Lefthook

First, install lefthook and project dependencies:

```bash
npm install
```

This will:
- Install lefthook as a dev dependency
- Automatically run `lefthook install` (via the `prepare` script)

### 2. Manual Installation (if needed)

If the automatic installation didn't work, run:

```bash
npx lefthook install
```

## How It Works

The pre-commit hook runs automatically before each commit. If any step fails, the commit will be aborted with an error message.

### Hook Steps

1. **Build Frontend**
   - Checks for `package.json`
   - Installs dependencies if `node_modules` is missing
   - Runs `npm run build`

2. **Verify Backend**
   - Checks for `requirements.txt`
   - Verifies Python is installed
   - Checks if key dependencies are available

3. **Build Frontend Docker Image**
   - Builds the frontend Docker image
   - Cleans up the test image after successful build

4. **Build Backend Docker Image**
   - Builds the backend Docker image
   - Cleans up the test image after successful build

## Requirements

Make sure you have the following installed:

- **Node.js** (>=16.0.0) and **npm** (>=8.0.0) - for frontend build
- **Python** (3.8+) - for backend verification
- **Docker** - for building Docker images

## Usage

### Normal Usage

Just commit as usual. The hook will run automatically:

```bash
git add .
git commit -m "Your commit message"
```

### Testing the Hook

You can test the hook manually:

```bash
npm run pre-commit
```

Or directly with lefthook:

```bash
npx lefthook run pre-commit
```

### Bypassing the Hook (Not Recommended)

If you need to bypass the hook for a specific commit (e.g., for a WIP commit), use:

```bash
git commit --no-verify
```

**Warning:** Only bypass the hook when absolutely necessary, as it ensures code quality.

## Configuration

The hook configuration is in `lefthook.yml`. You can modify it to:

- Add more checks
- Change the order of execution
- Enable parallel execution (currently sequential)
- Add more hooks (pre-push, commit-msg, etc.)

## Troubleshooting

### Hook not running

1. Make sure lefthook is installed:
   ```bash
   npx lefthook install
   ```

2. Check if the hook file exists:
   ```bash
   ls .git/hooks/pre-commit
   ```

### Build failures

- **Frontend build fails**: Check that all dependencies are installed and the code compiles
- **Backend verification fails**: Ensure Python is installed and in PATH
- **Docker build fails**: Make sure Docker is running and Dockerfiles are correct

### Performance

- The hook may take a few minutes to run (especially Docker builds)
- Docker images are automatically cleaned up after successful builds
- Consider using `--no-verify` for quick WIP commits during development

### Windows-specific issues

- Make sure you're using Git Bash or WSL for the best compatibility
- If using PowerShell, you may need to configure lefthook differently

## Updating Lefthook

To update lefthook to the latest version:

```bash
npm install lefthook@latest
npx lefthook install
```

## Additional Hooks

You can add more hooks by editing `lefthook.yml`. Common hooks include:

- `pre-push` - Run tests before pushing
- `commit-msg` - Validate commit messages
- `post-commit` - Run after commit (e.g., notifications)

Example:

```yaml
pre-push:
  commands:
    run-tests:
      run: npm test
```

## Support

For more information about Lefthook, visit:
- [Lefthook Documentation](https://github.com/evilmartians/lefthook)
- [Lefthook Examples](https://github.com/evilmartians/lefthook/tree/master/docs)

