const { dialog } = require('electron').remote;
var app = require('electron').remote.app;
var path = require('path');
var PythonShell = require('python-shell');
var pyScript = path.join(app.getAppPath(), '..', 'py/hello.py');
var pyScriptLocal = './py/hello.py';

var modelPath = null;
var dialogOpen = false;

$('#trainCurrent').hide();
$('#trainName').hide();

$('#trainNew').on('click', function () {
    // $('#directoryInput').click();
    if (!dialogOpen) {
        console.log("Opening directory picker");
        dialogOpen = true;
        dialog.showOpenDialog({
            title: "Select a folder",
            properties: ["openDirectory"]
        }).then(function (data) {
            if (data.filePaths[0]) {
                console.log("Changing paths to: '" + data.filePaths[0] + "'")
                modelPath = data.filePaths[0].goodPath();
                $('#trainCurrent').show();
                $('#trainName').text(modelPath.truncStart(30, true)).show();
            }
            dialogOpen = false;
        });
    } else {
        console.log("Directory picker already open");
    }
});

$('#trainCurrent').on('click', function () {
    if (!modelPath) {
        alert("Please add a model path");
        return
    }
    // replace options
    var options = {
        args: ['my First Argument', 'My Second Argument', '--option=123']
    };
    // replace with annotate all
    // try app
    launchPy(pyScript, options).then(function (data) {
        pyReturn = data;
        alert('!')
        next()
    }).catch(function () {

    });
});

$('#annotateBtn').on('click', function () {
    if (!modelPath) {
        alert("Please add a model path");
        return
    }
    // replace options
    var options = {
        args: ['my First Argument', 'My Second Argument', '--option=123']
    };
    // replace with annotate all

    // try app
    let pyReturn
    launchPy(pyScript, options).then(function (data) {
        pyReturn = data;
        alert('!')
        next()
    }).catch(function () {
        launchPy(pyScriptLocal, options).then(function (data) {
            pyReturn = data;
            alert('!!')
            next();
        }).catch(function () {
            // still didn't work
            if (!pyReturn) {
                alert('Something went wrong');
                return -1;
            }
        });
    });

    next = function () {
        console.log(pyReturn);
    }
});

launchPy = function (file, options = null) {
    return new Promise(function (resolve, reject) {
        $(document.body).css('cursor', 'wait');
        console.log('Attempting to Lanuch "' + file + '"');
        var pyshell = new PythonShell.PythonShell(file, options);

        var returned = [];
        var toLog = [];
        var timer = Date.now()
        pyshell.on('message', function (message) {
            // received a message sent from the Python script (a simple "print" statement)
            console.log(message);
            toLog.push(message);
            returned.push(message);

            if (Date.now() - timer > 500) {
                do {
                    pushToConsole(toLog.shift(), 100);
                } while (toLog.length > 0);
                timer = Date.now();
            }
        });

        // end the input stream and allow the process to exit
        pyshell.end(function (err) {
            do {
                pushToConsole(toLog.shift(), 100);
            } while (toLog.length > 0);
            $(document.body).css('cursor', 'default');
            if (err) {
                console.log('Error: "' + err + '"');
                reject();
            } else {
                console.log('finished');
                resolve(returned);
            }
        });
    });
}

pushToConsole = function (string, limit = 0) {
    $('#console').append($('<li>').text(string))
    $('#console').scrollTop($('#console').prop('scrollHeight'));

    if (limit > 0) {
        while ($('#console').children().length - limit > 0) {
            $('#console').find(':first-child').remove();
        }
    }
}

String.prototype.goodPath = function () {
    return this.replace(/\\/g, "/");
}

String.prototype.truncStart = function (n, truncAfterWord = false) {
    if (this.length <= n) { return this; }
    let subString = this.substr(this.length - n, this.length);
    let truncString = "…" + (truncAfterWord ? subString.substr(subString.indexOf('/'), subString.length) : subString);
    return (truncString.length === 1 ? "…" + subString.substring(0, subString.length) : truncString);
};