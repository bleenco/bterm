#!/usr/bin/env bash

if [ "$(uname -s)" == "Linux" ]; then
  sudo apt-get install libfontconfig-dev icnsutils graphicsmagick -y
  npm install 7zip-bin-linux --no-save
fi 
