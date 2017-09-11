#!/bin/sh

if [ -z "$GH_TOKEN" ]; then
  echo "You must set the GH_TOKEN environment variable."
  exit 1
fi

# This will build, package and upload the app to GitHub.
npm run build:prod && ./node_modules/.bin/build --config electron-builder.json --mac --publish always
