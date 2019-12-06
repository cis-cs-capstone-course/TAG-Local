

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
  //{ role: 'projectMenu' }
  {
    label: 'Project',
    submenu: [
      { label: 'New Project' },
      { label: 'Open Project' },
      { type: 'separator' },
      {
        label: 'Save Project',
        click: saveProject
      },
      {
        label: 'Save Project As',
        click: saveProjectAs
      },
    ]
  },

  //{ role: 'documentMenu'}
  {
    label: 'Document',
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

function saveProjectAs() {
  dialog.showSaveDialog(remote.getCurrentWindow()).then(result => {
    console.log("Showing save as dialog");
    if (result.filePath === undefined) {
      console.log("You didn't save the file");
      return;
    }
    if (result.canceled == true) {
      console.log("You canceled the save");
      return;
    }
    var filePath = result.filePath;
    if (path.extname(filePath) != '.tagProj') {
      filePath += '.tagProj';
    }
    tagModel.projectPath = filePath;
    saveProject();
  });
}

function saveProject() {
  let filePath = tagModel.projectPath;
  if (filePath == null) {
    console.log("No save path detected, calling saveProjectAs");
    saveProjectAs();
    return;
  }
  console.log("saving file @ ", filePath);

  fs.writeFile(filePath, JSON.stringify(tagModel), (err) => {
    if (err) {
      alert("An error ocurred creating the file " + err.message);
    }
    alert("The file has been succesfully saved");
  });
}

function openClosePrompt() {
  dialog.showMessageBox({
    buttons: ["Yes", "No", "Cancel"],
    message: "Do you really want to quit?"
  }).then(function (result) {
    if (result.response == 0)
      remote.getCurrentWindow().close();
  });
}

function showSplash() {
  $('#splash').slideDown();
}
