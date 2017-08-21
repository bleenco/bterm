let electron = require('electron');
let { Menu, dialog, ipcMain, app } = electron;

let template = [
  {
    label: app.getName(),
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'pasteandmatchstyle'},
      {role: 'delete'},
      {role: 'selectall'}
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'togglefullscreen'},
      {type: 'separator'},
      {role: 'toggledevtools'},
      {type: 'separator'},
      {role: 'resetzoom'},
      {role: 'zoomin'},
      {role: 'zoomout'},
      {type: 'separator'},
      { label: 'Tab Left', accelerator: 'CommandOrControl+Shift+Left', selector: 'Left' },
      { label: 'Tab Right', accelerator: 'CommandOrControl+Shift+Right', selector: 'Right' },
      { label: 'Search', accelerator: 'CommandOrControl+F', selector: 'Search' }
    ]
  },
  {
    role: 'window',
    submenu: [
      {role: 'minimize'},
      {role: 'close'}
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('http://bterm.bleenco.io') }
      }
    ]
  }
];

export default function() {
  let menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);

  return menu;
}
