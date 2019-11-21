// Modules to control application life and create native browser window
//jshint esversion:6
const { app, BrowserWindow, remote, Menu } = require('electron');
const path = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
const isMac = process.platform === 'darwin';



function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: isMac ? true : false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    show: true
  })
  mainWindow.autoHideMenuBar = false;
  mainWindow.maximize();
  mainWindow.show();


  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

// and load the menubar
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  // mainWindow.loadURL('http://tag.pythonanywhere.com/tag')
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.



app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})


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
]


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
