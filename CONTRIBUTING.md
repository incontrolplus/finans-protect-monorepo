# Contributing to OpenBalancer

Thank you for your interest in contributing to OpenBalancer! We welcome contributions from everyone, whether it's reporting bugs, improving documentation, submitting feature requests, or writing code.

---

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

---

## How to Contribute

### Reporting Bugs

If you discover a bug, please check existing issues before opening a new one to see if it has already been reported.

To report a new bug:
1. Navigate to the [GitHub Issues](https://github.com/incontrolplus/openbalancer/issues) page.
2. Open a new issue using the bug report template if available.
3. Provide a clear and descriptive title.
4. Include detailed steps to reproduce the issue, expected vs. actual behavior, and relevant logs or environment details (OS, Python version, OpenBalancer configuration).

### Suggesting Features & Enhancements

We welcome suggestions for new features and improvements:
1. Check [GitHub Issues](https://github.com/incontrolplus/openbalancer/issues) to ensure the feature hasn't been proposed or discussed already.
2. Open an issue describing the proposed feature, the problem it solves, and potential implementation approaches or API designs.

---

## Development Setup

### Prerequisites
- Python 3.10 or higher
- Git

### Setting Up a Local Environment

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/openbalancer.git
   cd openbalancer
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install OpenBalancer in editable mode:**
   ```bash
   pip install -e .
   ```

4. **Run the test suite:**
   ```bash
   python3 -m unittest discover -s tests
   ```
   Ensure all tests pass before making any changes.

---

## Pull Request Process

1. **Create a topic branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes:**
   - Keep commits focused and atomic.
   - Write clear, descriptive commit messages following the Conventional Commits format (e.g., `feat: ...`, `fix: ...`, `docs: ...`).
   - Add unit tests covering new features or bug fixes.

3. **Verify tests and code style:**
   - Run the test suite: `python3 -m unittest discover -s tests`
   - Ensure your code conforms to the code style guidelines.

4. **Submit your Pull Request:**
   - Push your branch to your fork: `git push origin feature/your-feature-name`
   - Open a PR against the `main` branch of the upstream repository.
   - Fill out the PR description with the context, changes made, and links to any related issues.

---

## Code Style & Standards

- **PEP 8**: Follow standard Python style guidelines (PEP 8) for code formatting and readability.
- **Type Hints**: Use type annotations where appropriate.
- **Documentation**: Provide docstrings for public classes, functions, and modules. Keep inline comments clear and meaningful.
- **Async Best Practices**: Ensure all asynchronous operations avoid blocking the main event loop.

---

## License

By contributing to OpenBalancer, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
