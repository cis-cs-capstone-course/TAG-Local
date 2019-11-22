//jshint esversion: 6

const { dialog } = require('electron').remote;
var path = require('path');
var PythonShell = require('python-shell');
// paths to apps // please add new scripts, thx
// var pyScript = path.join(__dirname, '/../py/hello.py');
// var pyScriptLocal = path.join(__dirname, '/py/hello.py');
let trainScript = path.join(__dirname, '..', 'py', 'train.py');
let trainScriptLocal = path.join(__dirname, 'py', 'train.py');
let annotateScript = path.join(__dirname, '..', 'py', 'annotate.py');
let annotateScriptLocal = path.join(__dirname, 'py', 'annotate.py');

// modePath
var modelName = 'untitledModel';
var modelPath = null;
// file path picker is open
var dialogOpen = false;

// hide things supposed to be hidden
$('#trainCurrent').hide();
$('#trainName').hide();

// add new model path
$('#trainNew').on('click', function () {
    // check file path is open
    if (!dialogOpen) {
        // is not open // open
        console.log("Opening directory picker");
        dialogOpen = true;
        dialog.showOpenDialog({
            title: "Select a folder",
            properties: ["openDirectory"]
        }).then(function (data) {
            // on close get file path
            if (data.filePaths[0]) {
                console.log("Changing paths to: '" + data.filePaths[0] + "'");
                modelPath = path.join(data.filePaths[0].goodPath(), modelName);
                $('#trainCurrent').show();
                $('#trainName').text(modelPath.truncStart(30, true)).show();
            }
            dialogOpen = false;
        });
    } else {
        console.log("Directory picker already open");
    }
});

// try training
$('#trainCurrent').on('click', function () {
    // no path
    if (!modelPath) {
        alert("Please add a model path");
        return;
    }
    // TODO: replace options
    var options = {
        args: ['--model_output_dir', modelPath, '--data_path', tagModel.exportAsString(), '--iterations', 30]
    };
    // try app
    // TODO: replace with annotate all
    let pyReturn;
    // try installer path
    launchPy(trainScript, options).then(function (data) {
        pyReturn = data;
        alert('!');
        next();
    }).catch(function () {
        //try compiled path
        launchPy(trainScriptLocal, options).then(function (data) {
            pyReturn = data;
            alert('!!!');
            next();
        }).catch(function () {
            // still didn't work
            if (!pyReturn) {
                alert('Something went wrong');
                return -1;
            }
        });
    });
});

$('#annotateBtn').on('click', function () {
    if (!modelPath) {
        alert("Please add a model path");
        return;
    }
    // replace options
    var options = {
        args: ['--model_path', modelPath, '--data_path', tagModel.exportAsString()]
    };
    // try app
    // TODO: replace with annotate all
    let pyReturn;
    launchPy(annotateScript, options).then(function (data) {
        pyReturn = data;
        alert('!');
        next();
    }).catch(function () {
        //try compiled path
        launchPy(annotateScriptLocal, options).then(function (data) {
            pyReturn = data;
            alert('!!!');
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
    };
});

// launches script // get messages and add to console // return on end
launchPy = function (file, options = null) {
    return new Promise(function (resolve, reject) {
        $(document.body).css('cursor', 'wait');
        console.log('Attempting to Lanuch "' + file + '"');
        var pyshell = new PythonShell.PythonShell(file, options);

        var returned = [];      // returned values
        var toLog = [];         // queue of messages to push
        var timer = Date.now(); // timer to check when to update // updates in waves
        var waitTime = 500;     // how long to wait before sending to console
        pyshell.on('message', function (message) {
            // received a message sent from the Python script (a simple "print" statement)
            console.log(message);
            toLog.push(message);
            returned.push(message);

            // check for elasped time, then update console
            if (Date.now() - timer > waitTime) {
                do {
                    pushToConsole(toLog.shift(), 100);
                } while (toLog.length > 0);
                timer = Date.now();
            }
        });

        // end the input stream and allow the process to exit
        pyshell.end(function (err) {
            $(document.body).css('cursor', 'default');
            // push the rest of messages to console
            do {
                pushToConsole(toLog.shift(), 100);
            } while (toLog.length > 0);
            // errored out
            if (err) {
                console.log('Error: "' + err + '"');
                reject();
            } else {
                console.log('Finished: "' + file + '"');
                resolve(returned);
            }
        });
    });
};

// push to console // limit is number of lines to keep in console // 0 = unlimited
pushToConsole = function (string, limit = 0) {
    $('#console').append($('<li>').text(string));
    $('#console').scrollTop($('#console').prop('scrollHeight'));

    // over limit, remove excess lines
    if (limit > 0) {
        while ($('#console').children().length - limit > 0) {
            $('#console').find(':first-child').remove();
        }
    }
};

// standard path (forward slashes instead of backslashes)
String.prototype.goodPath = function () {
    return this.replace(/\\/g, "/");
};

// truncate from front of string // truncate before word (searches for forward slash)
String.prototype.truncStart = function (n, truncBeforeWord = false) {
    if (this.length <= n) { return this; }
    let subString = this.substr(this.length - n, this.length);
    let truncString = "…" + (truncBeforeWord ? subString.substr(subString.indexOf('/'), subString.length) : subString);
    return (truncString.length === 1 ? "…" + subString.substring(0, subString.length) : truncString);
};
