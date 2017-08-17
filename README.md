# bterm

[![AbstruseCI](https://abstruse.bleenco.io/badge/2)](https://abstruse.bleenco.io/repo/2)

## Overview
Fully customisable cross-platform terminal that works and feels the same way everywhere: MacOS, Linux and Windows.

<p align="center">
  <img src="https://user-images.githubusercontent.com/1796022/28711498-0a70122a-7388-11e7-8ae4-c43b5cbf517a.png">
</p>

## Download
To download visit
[http://bterm.bleenco.io](http://bterm.bleenco.io) and hit the right button to get your favourite OS installer.

On the first run `~/.bterm.json` (on Linux and MacOS) or `C:\Users\user\.bterm.json` (on Windows) configuration file is created. It contains the attributes in json format that define the layout of the terminal, i.e. changing the attribute `settings > fonts` will immediately update the type of fonts.

## Settings and customization
The default theme is a combination of black and white visuals. However, **bterm** is completely customizable, here's how to do it with very few clicks:

1. Click the settings icon in bottom right corner.
2. Choose the theme of your choice from the list in a first tab.
3. Select your favourite font in a second tab.
4. Select the hot key for opening urls when clicking inside of a **bterm** in a third tab.

The selected settings will automatically appear in `.bterm.json` configuration file where you can hack your terminals' visual settings further.

## Features
In short, you can use bterm just like any other terminal. However, we augment the standard shell functionality with useful features for developers and researchers:
* **Information on current directory**  
  Your current directory path is being displayed at all times in a bottom bar.
* **Name of the git branch**  
  When working on your git repository, the name of your branch appears next to your shell input.
* **Opening links with the click**  
  Using hotkey + click for opening links from a console, i.e. `ctrl + click`.
* **Generate links to files on drag and drop**  
Drag the file into the bterm window and link to the file will automatically be pasted to your shell input.


## Hacking on bterm
In order to run bterm locally in a development mode please use the following commands:

```sh
git clone https://github.com/bleenco/bterm.git
npm install
npm start # wait for build to finish
npm run electron
```

### Production build
To generate bterm production build and installation package, run the following commands: 

```sh
npm run app
```
The executable installation package can be found in `dist` folder.

### LICENCE

MIT

