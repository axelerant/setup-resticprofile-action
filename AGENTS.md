# AGENTS.md

This is a GitHub Action that installs restic and resticprofile on the runner. It
does this by downloading the binaries and placing it in the /usr/local/bin.

## Practices

- **Type Safety**: Leverage TypeScript's type system to catch errors at compile
  time. Always type function parameters, return values, and variables.
- **Input Validation**: Validate all inputs received from
  `@actions/core.getInput` before using them. Provide clear error messages for
  invalid or missing inputs.
- **Error Handling**: Use `try/catch` blocks around your main logic. On error,
  call `core.setFailed(error.message)` to properly signal failure to GitHub
  Actions.
- **Minimal Dependencies**: Keep dependencies to a minimum to reduce attack
  surface and speed up action execution.
- **Use ESM**: Prefer ECMAScript modules (`"type": "module"` in `package.json`)
  for modern compatibility and better tooling support.
- **Testing**: Write unit tests for your action logic. Mock GitHub Actions
  toolkit modules (like `@actions/core`) to avoid side effects. Tests are
  written in `/__tests__` and fixtures in `/__fixtures`.
- **Logging**: Use `core.info`, `core.warning`, and `core.error` for logging.
  Avoid `console.log` to ensure logs are properly formatted in the Actions UI.
- **Output Management**: Set outputs using `core.setOutput` and document them in
  your `action.yml`.
- **Security**: Never log secrets or sensitive data. Use the `secrets` context
  for sensitive inputs and avoid echoing them.
- **Documentation**: Clearly document inputs, outputs, and usage in your
  `README.md` and `action.yml`.
- **Consistent Formatting**: Use a formatter like Prettier and a linter like
  ESLint to maintain code quality and consistency.
- **CI Checks**: Set up workflows to run linting, tests, and type checks on
  every pull request.
- **Version Pinning**: Pin action and dependency versions to avoid unexpected
  breaking changes.
- **Distribution**: Use a bundler (like Rollup) to produce a single JavaScript
  file for distribution, and commit the built file to your repository.
- **Avoid Long-Running Processes**: Keep actions fast and efficient. Clean up
  any temporary files or processes you start.
