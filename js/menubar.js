

//jshint esversion:6
// const { remote } = require('electron');
const { app, Menu, MenuItem } = remote;
const isMac = process.platform === 'darwin';

// const menu = new Menu();
console.log("made menu");
// menu.append(new MenuItem({ label: 'MenuItem1', click() { console.log('item 1 clicked'); } }));
// menu.append(new MenuItem({ type: 'separator' }));
// menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }));
const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
  }] : []) ,
  //{ role: 'projectMenu' }
  {
    label: 'Project',
    submenu: [
      {label: 'New Project'},
      {label: 'Open Project'},
      {type: 'separator'},
      {label: 'Save Project'},
      {label: 'Save Project As'},
    ]
  },

  //{ role: 'documentMenu'}
  {
    label: 'Document',
    submenu:[
      { label: 'Import Document'},
      { type: 'separator'},
      { label: 'Export Current Document'},
      { label: 'Export All Documents',
        submenu: [
          {label: 'As Zip'},
          {label: 'As JSON'}
      ]}
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // {role: 'machineLearningMenu'}
  {
    label: 'Machine Learning',
    submenu: [
      { label: 'New Model'},
      { label: 'Load Model'},
      { type: 'separator'},
      { label: 'Train Current Document'},
      { label: 'Train All Documents'},
      { type: 'separator'},
      { label: 'Annotate Current Document'},
      { label: 'Annotate All Documents'},
    ]
  },
   // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
