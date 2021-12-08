# bterm — :warning: This project is no longer maintained. :warning:

<p align="center">
  <img src="https://user-images.githubusercontent.com/1796022/29961176-01c586d6-8eff-11e7-8ea0-77128fc7ebd0.png" width="200">
</p>


[![AbstruseCI](https://ci.bleenco.io/badge/2)](https://ci.bleenco.io/repo/2)

## Overview
Fully customisable cross-platform terminal that works and feels the same way everywhere: MacOS, Linux and Windows.

## Download
To download visit
[http://bterm.bleenco.io](http://bterm.bleenco.io) and hit the right button to get your favourite OS installer.

On the first run `~/.bterm2.json` (on Linux and MacOS) or `C:\Users\user\.bterm.json` (on Windows) configuration file is created. It contains the attributes in json format that define the layout of the terminal, i.e. changing the attribute `settings > fonts` will immediately update the type of fonts.

## Settings and customization

The default theme is a combination of black and white visuals.
Settings are stored in `.bterm2.json` configuration file where you can hack your terminals' visual settings.


## Hacking on bterm
In order to run bterm locally in a development mode please use the following commands:

```sh
git clone https://github.com/bleenco/bterm.git
npm install
npm start
```

### Production build
To generate bterm production build and installation package, run the following commands:

```sh
npm run electron:[mac | linux | windows]
```

The executable installation package can be found in `app-builds` folder.

### LICENCE

MIT
