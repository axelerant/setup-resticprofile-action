# Setup restic and resticprofile

[![GitHub Super-Linter](https://github.com/axelerant/setup-resticprofile-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/axelerant/setup-resticprofile-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/axelerant/setup-resticprofile-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/axelerant/setup-resticprofile-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

A GitHub Action that installs restic and resticprofile binaries on the runner.
This action downloads the specified versions of restic and resticprofile and
makes them available in the PATH for use in your workflows.

## Features

- Downloads and installs restic and resticprofile binaries
- Configurable versions for both tools
- Optional installation of restic (enabled by default)
- Cross-platform support (Linux, macOS, Windows)
- Fast execution with minimal dependencies

## Usage

Use this action in your workflow to set up restic and resticprofile before
running backup operations.

### Basic Usage

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4

  - name: Setup restic and resticprofile
    uses: axelerant/setup-resticprofile-action@v1
    with:
      restic-version: 'latest'
      resticprofile-version: 'latest'

  - name: Run restic backup
    run: restic version
```

### Advanced Usage

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4

  - name: Setup restic and resticprofile
    uses: axelerant/setup-resticprofile-action@v1
    id: setup
    with:
      install-restic: true
      restic-version: '0.16.4'
      resticprofile-version: '0.27.0'

  - name: Verify installation
    run: |
      echo "Restic installed: ${{ steps.setup.outputs.restic-installed }}"
      echo "Resticprofile installed: ${{ steps.setup.outputs.resticprofile-installed }}"
      restic version
      resticprofile --version

  - name: Run backup
    run: resticprofile backup
```

### Inputs

| Input                   | Description                         | Required | Default  |
| ----------------------- | ----------------------------------- | -------- | -------- |
| `install-restic`        | Whether to install restic           | No       | `true`   |
| `restic-version`        | Version of restic to install        | No       | `latest` |
| `resticprofile-version` | Version of resticprofile to install | No       | `latest` |

### Outputs

| Output                    | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `restic-installed`        | Whether restic was successfully installed        |
| `resticprofile-installed` | Whether resticprofile was successfully installed |

## Development

### Prerequisites

You'll need to have a reasonably modern version of [Node.js](https://nodejs.org)
handy (24.x or later should work!).

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

1. **Package the TypeScript for distribution**

   ```bash
   npm run bundle
   ```

1. **Run tests**

   ```bash
   npm test
   ```

1. **Format, lint, test, and build everything**

   ```bash
   npm run all
   ```

### Testing Locally

You can test the action locally using the
[`@github/local-action`](https://github.com/github/local-action) utility:

```bash
# Visual Studio Code Debugger
# Review and update .vscode/launch.json as needed

# Terminal/Command Prompt
npx @github/local-action . src/main.ts .env
```

You can provide a `.env` file to set environment variables for testing. See
[`.env.example`](./.env.example) for reference.

## Implementation

The action downloads the appropriate binaries for restic and resticprofile based
on the runner's operating system and architecture. The binaries are extracted to
`/usr/local/bin` (or the Windows equivalent) to make them available in the PATH.

The action supports:

- **Linux** (x86_64, aarch64)
- **macOS** (x86_64, arm64)
- **Windows** (x86_64)

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Add tests in `__tests__/` directory
4. Run `npm run all` to format, lint, test, and build
5. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## Versioning

This action follows semantic versioning. You can reference specific versions
using tags:

```yaml
uses: axelerant/setup-resticprofile-action@v1.0.0
```

For the latest version, you can use:

```yaml
uses: axelerant/setup-resticprofile-action@main
```

## Publishing New Releases

This project includes a helper script at [`script/release`](./script/release) to
streamline the release process. The script helps with:

1. Creating properly formatted release tags
1. Updating version numbers in package.json
1. Pushing releases to GitHub

Before releasing, make sure to:

1. Update the version in `package.json`
1. Run `npm run all` to ensure everything builds correctly
1. Test the action in a workflow
1. Run the release script: `./script/release`
