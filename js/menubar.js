

//jshint esversion:6
const { remote } = require('electron');
var fs = require('fs');
const { app, Menu, MenuItem } = remote;

const isMac = process.platform === 'darwin';
var dialogOpen = false;
// const menu = new Menu();
// console.log("made menu");

const template = [
  // { role: 'appMenu' }
  {
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
      {
        label: 'Show Splash Screen',
        click: showSplash
      },
      { type: 'separator' },
      {
        label: 'Exit',
        click: openClosePrompt
      },
    ]
  },

  //{ role: 'documentMenu'}
  {
    label: 'Documents',
    submenu: [
      {
        label: 'Import Document',
        click: getDocInput
      },
      { type: 'separator' },
      { label: 'Export Current Document' ,
        click: exportAsJson },
      {
        label: 'Export All Documents (Zip)',
        click: exportAsZip
      }
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
      {
        label: 'Create Blank Model',
        click: createBlankML
      },
      {
        label: 'Load Existing Model',
        click: loadExistingML
      },
      { type: 'separator' },
      {
        label: 'Train Current Document',
        click: trainCurrentDocument
      },
      {
        label: 'Train All Documents',
        click: trainAllDocuments
      },
      { type: 'separator' },
      {
        label: 'Annotate Current Document',
        click: annotateCurrentDocument
      },
      {
        label: 'Annotate All Documents',
        click: annotateAllDocuments
      },
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'togglefullscreen' },
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : []),
      { type: 'separator' },
      {
        label: 'Exit',
        click: openClosePrompt
      },
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More'
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);


function openClosePrompt() {
  dialog.showMessageBox({
    buttons: ["Yes", "No", "Cancel"],
    message: "Do you really want to quit?"
  }).then(function (result) {
    if (result.response == 0)
      app.quit();
  });
}

function showSplash() {
  $('#splash').slideDown();
}
