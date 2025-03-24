#!/bin/bash

# Remove existing node_modules and yarn.lock
rm -rf node_modules yarn.lock

# Set up Yarn 4.6.0
corepack enable
yarn set version 4.6.0

# Install dependencies
yarn install

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
  cat > .gitignore << EOL
# Dependencies
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# Testing
coverage

# Production
dist
build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
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