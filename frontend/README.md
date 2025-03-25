# Journal App Frontend

This is the frontend for the Journal App, built with React, TypeScript, Redux Toolkit, and Material UI.

## Prerequisites

- Node.js 18.x or later
- Yarn 4.x (the setup script will install this for you)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/aderahenry/journal.git
cd journal/frontend
```

### 2. Run the Setup Script

The project includes a setup script that configures Yarn Plug'n'Play (PnP) and installs dependencies:

```bash
chmod +x setup.sh
./setup.sh
```

### 3. Set Up VS Code (if using VS Code)

To get proper TypeScript IntelliSense support with Yarn PnP in VS Code:

```bash
yarn dlx @yarnpkg/sdks vscode
```

When you open a TypeScript file, VS Code will ask you to select the TypeScript version:

1. A notification will appear suggesting to "Use Workspace Version"
2. Click "Accept"

If you don't see the notification, you can manually select the TypeScript version:

- Press `Shift + Command + P` (Mac) or `Shift + Ctrl + P` (Windows/Linux)
- Type "TypeScript: Select TypeScript Version"
- Select "Use Workspace Version"

### 4. Start the Development Server

```bash
yarn dev
```

This will start the development server at `http://localhost:5173`.

## About Yarn Plug'n'Play (PnP)

This project uses Yarn Plug'n'Play instead of the traditional node_modules. Here's why:

- **Faster Installation**: PnP eliminates the node_modules folder, making installations much faster
- **Guaranteed Dependencies**: Ensures all developers use exactly the same dependency versions
- **Strict Mode**: Prevents accidental reliance on unlisted dependencies
- **Better Caching**: More efficient caching for CI/CD pipelines
- **Zero-Installs**: The `.yarn/cache` is committed to the repository, so team members can start working immediately without running `yarn install`

## Scripts

- `yarn dev` - Start the development server
- `yarn build` - Build the production version
- `yarn preview` - Preview the production build locally
- `yarn lint` - Lint the codebase
- `yarn test` - Run tests
- `yarn test:ui` - Run tests with UI
- `yarn test:coverage` - Generate test coverage report
- `yarn cypress:open` - Open Cypress for E2E testing
- `yarn cypress:run` - Run Cypress tests headlessly
- `yarn test:e2e` - Run E2E tests with the server running

## Project Structure

- `/src` - Source code
  - `/components` - Reusable UI components
  - `/pages` - Full pages of the application
  - `/store` - Redux store configuration
    - `/slices` - Redux slices for state management
  - `/hooks` - Custom React hooks
  - `/utils` - Utility functions
  - `/assets` - Static assets
  - `/types` - TypeScript type definitions

## Troubleshooting

### TypeScript Errors in VS Code

If you see TypeScript errors in VS Code:

1. Make sure you've run `yarn dlx @yarnpkg/sdks vscode`
2. Select the workspace TypeScript version (`Shift + Command + P` → "TypeScript: Select TypeScript Version" → "Use Workspace Version")
3. Restart VS Code if necessary

### Dependency Issues

If you encounter dependency-related issues:

1. Update your Yarn version: `yarn set version latest`
2. Clear the Yarn cache: `yarn cache clean`
3. Run the setup script again: `./setup.sh`

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run tests: `yarn test`
4. Push your branch: `git push origin feature/your-feature-name`
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
