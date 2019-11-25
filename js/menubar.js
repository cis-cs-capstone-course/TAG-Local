

//jshint esversion:6
// const { remote } = require('electron');
var fs = require('fs');
const { dialog, app, Menu, MenuItem } = remote;

const isMac = process.platform === 'darwin';
var dialogOpen = false;
// const menu = new Menu();
// console.log("made menu");

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
      {label: 'Save Project',
      click: showSaveDialog
      },
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

function showSaveDialog(){
  console.log("Showing save dialog");
  dialog.showSaveDialog().then(result => {
      if (result.filePath === undefined){
          console.log("You didn't save the file");
          return;
      }
      if (result.canceled == true) {
        console.log("You canceled the save");
        return;
      }

      filePath = result.filePath  + '.tagProj';
      console.log("saving file @ ", filePath);
    // fileName is a string that contains the path and filename created in the save file dialog.
    //TODO: validate filePath has tagProj extension, if not, add.
      fs.writeFile(filePath, JSON.stringify(tagModel), (err) => {
          if(err){
              alert("An error ocurred creating the file "+ err.message)
            }

          alert("The file has been succesfully saved");
      });
  });
}
