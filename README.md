# bterm

[![CircleCI](https://circleci.com/gh/bleenco/bterm/tree/master.svg?style=svg)](https://circleci.com/gh/bleenco/bterm/tree/master)
[![AppVeyor](https://ci.appveyor.com/api/projects/status/0dknthm6g9gq1nw2/branch/master?svg=true)](https://ci.appveyor.com/project/jkuri/bterm-l4yld/branch/master)


## Overview
Fully customisable cross-platform terminal.
Runs everywhere. MacOS, Linux or Windows.

## Download
To download visit
[http://bterm.bleenco.io](http://bterm.bleenco.io) click the right installer depending on
operating system you use.

On initial run `~/.bterm.json` configuration file is created. If you need fix your font for example,
check this file and update your configuration to fit your needs.

## Configuration
When installation is successfully completed and you first run bterm you end up with black and white window.
But as mentioned **bterm** is completely customizable.

1. Click the settings icon  bottom right corner.
2. Click the first tab and you can choose the color theme that you like from the list
3. On second tab you can select font that you prefer.
4. On third select the hot key to open urls inside **bterm**

When you selected  your  settings open .bterm.json file for further configuration.

### bterm settings preview
<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1796022/26737218/7c9bf714-47c9-11e7-8f9e-6a0217c1fb11.png">
</p>

On Linux or MacOS  the .bterm.json is located in `~/.bterm.json`.
On Windows you can find it inside `C:\Users\user\.bterm.json`.

Inside **.bterm.json**, you can easily change font size, font color and other colors using standard
html color codes.

## bterm window preview
<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1796022/26737214/7ad80b70-47c9-11e7-899e-aaeae266d77e.png">
</p>

As you can see from the picture above bterm is pretty straight forward termial at
first sight. Top bar is reserved for tabs.
Than is the main shell window.
Bottom bar gives the user some very useful information about present working directory.
If this directory is also git repository  you can find the branch name in botom right corner.
And at the end is the settings button which opens the right settings menu.


## Usage
In short you can use bterm just like you are used to use your old terminal.
**Bterm** offers some nice features:
* On bottom bar you can at all times see which directory are you in.
* If you are inside the directory which is git repository you can see the name of the branch
you are in  on the bottom bar.
* if bterm recognizes git and compatible shell (like bash or zsh) it shows  currently active branch too .

### bterm for development:
Inside of bterm you can use all development tools that you need for your work:
* git - version control
* text editors (vim, nano ...)
* package managers like (npm, python-pip ...)
* ssh for remote access

And all the others.
**Important** of course you need to install all tools mentioned above properly. All windows user
 we already know the process about adding dev tools to system path and adjusting
 the settings.

### Keyboard shortcuts
Shortcuts in **bterm** are similar as you already know them for instance
<code>ctrl + t </code> for new tab or <code>ctrl + n </code> for new window.

### Copy and Paste
* To copy select text first then right-click on it and select Copy
* To paste right click and select Paste.

### Clicking links in bterm
For opening links from bterm you simply used the hotkey that you can choose inside
settings + click. for example <code>ctrl + click </code>.


## Hacking on bterm

```sh
git clone https://github.com/bleenco/bterm.git
npm install
npm start
```

### To make a production build run

```sh
npm run dist
```

### Preview

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1796022/24828975/69b690f4-1c69-11e7-9ba2-814a5742e86b.png">
</p>

### LICENCE

MIT

