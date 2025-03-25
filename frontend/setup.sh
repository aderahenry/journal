#!/bin/bash

# Set up Yarn 4.6.0
corepack enable
yarn set version 4.6.0

# Install dependencies
yarn install

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
  cat > .gitignore << EOL
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Env file
*.env

# Yarn
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# enable zero-installs
!.yarn/cache
.pnp.*
EOL
fi

# Create .yarnrc.yml if it doesn't exist
if [ ! -f .yarnrc.yml ]; then
  cat > .yarnrc.yml << EOL
nodeLinker: pnp
enableGlobalCache: true
compressionLevel: 0
nmMode: hardlinks-local
pnpMode: strict
pnpFallbackMode: all
enableScripts: true
EOL
fi

echo "Setup complete! You can now run 'yarn dev' to start the development server." 