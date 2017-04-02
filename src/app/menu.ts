let electron = require('electron');
let { Menu, dialog } = electron;

let template = [
  {
  label: 'SpeedTerm',
  submenu: [
    { label: 'About SpeedTerm', click() {
      dialog.showMessageBox({
        title: 'SpeedTerm',
        message: 'Terminal on amphetamines',
        detail: 'Author: Jan Kuri <jkuri88@gmail.com>',
        buttons: []
      });
    }},
    { role: 'quit' }
  ]},
  {
  role: 'window',
  submenu: [
    { role: 'minimize' },
    { role: 'close' }
  ]},
  {
  label: 'Edit',
  submenu: [
    { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
    { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
    { type: 'separator' },
    { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
    { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
    { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
    { type: 'separator' },
    { label: 'Tab Left', accelerator: 'CommandOrControl+Shift+Left', selector: 'Left' },
    { label: 'Tab Right', accelerator: 'CommandOrControl+Shift+Right', selector: 'Right' }
  ]},
  {
  label: 'View',
  submenu: [
    {
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click (item, focusedWindow) {
        if (focusedWindow) focusedWindow.reload()
      }
    },
    {
      label: 'Toggle Developer Tools',
      accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
      click (item, focusedWindow) {
        if (focusedWindow) focusedWindow.webContents.toggleDevTools()
      }
    }
  ]}
];

export default function() {
  let menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
}
