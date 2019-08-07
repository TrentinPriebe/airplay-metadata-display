const ShairportReader = require('shairport-sync-reader');

// read from pipe
const pipeReader = new ShairportReader({
    path: '/tmp/shairport-sync-metadata'
});
// var pipeReader = new ShairportReader({
//     address: '226.0.0.1',
//     port: '5555'
// });
const remote = require("electron").remote;

// Use the 'prevent-display-sleep' mode
const powerSaveId = null;

let powerSaveTimer = null
const timeout = 1200000

function startPowerSaver() {
    if (powerSaveId && !remote.powerSaveBlocker.isStarted(powerSaveId)) {
        powerSaveId = remote.powerSaveBlocker.start('prevent-display-sleep')
    }
}

function stopPowerSaver() {
    if (powerSaveId && remote.powerSaveBlocker.isStarted(powerSaveId)) {
        remote.powerSaveBlocker.stop(powerSaveId)
    }
}

pipeReader.addListener('pbeg', event => {
    startPowerSaver();
});

pipeReader.addListener('pend', event => {
    stopPowerSaver();
});

pipeReader.addListener('meta', data => {
    document.getElementById('song').innerHTML = `<h1>${data.minm}</h1>`;
    document.getElementById('album').innerHTML = `<h3>${data.asal}</h3>`;
    document.getElementById('artist').innerHTML = `<h2>${data.asar}</h2>`;    
    if (powerSaveTimer) {
        clearTimeout(powerSaveTimer);
    }
    powerSaveTimer = setTimeout(() => {
        stopPowerSaver();
    }, timeout);
});

pipeReader.addListener('PICT', data => {
    let imgType = (data.toString('hex', 0, 2) == 'ffd8') ? 'jpeg' : 'png';
    var img = document.getElementById('album-art');
    img.src =
        `data:image/${imgType};base64, ${Buffer.from(data).toString('base64')}`;
});