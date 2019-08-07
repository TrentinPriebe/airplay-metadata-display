const {
  app,
  BrowserWindow,
  powerSaveBlocker,
  ipcMain
} = require('electron')
const path = require('path')
const url = require('url')

const AutoLaunch = require('auto-launch')

const AirPlayMetadataLaucher = new AutoLaunch({
  name: 'AirPlayMetadata-app'
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let isQuitting = false
let powerSaveId = null

function createWindow() {

  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    // set the background color to black
    backgroundColor: "#111",
    // Don't show the window until it's ready, this prevents any white flickering
    show: false
  });

  mainWindow.setFullScreen(true);

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  AirPlayMetadataLaucher.enable();

  AirPlayMetadataLaucher.isEnabled()
    .then(function (isEnabled) {
      if (isEnabled) {
        return;
      }
      AirPlayMetadataLaucher.enable();
    })
    .catch(function (err) {
      // handle error
    });

  mainWindow.on('close', e => {
    if (!isQuitting) {
      e.preventDefault()

      if (process.platform === 'darwin') {
        app.hide()
      } else {
        mainWindow.hide()
      }
    }
  })

  return mainWindow


}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  createWindow();

  /*ipcMain.on('stream-play', (event, arg) => {
    if (powerSaveId && !powerSaveBlocker.isStarted(powerSaveId)) {
      powerSaveId = powerSaveBlocker.start('prevent-display-sleep')
    }
  })

  ipcMain.on('stream-stop', (event, arg) => {
    if (powerSaveId && powerSaveBlocker.isStarted(powerSaveId)) {
      powerSaveBlocker.stop(powerSaveId)
    }
  })*/
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})


/*app.on('will-quit', () => {
  if (powerSaveId && powerSaveBlocker.isStarted(powerSaveId)) {
    powerSaveBlocker.stop(powerSaveId)
  }
});*/