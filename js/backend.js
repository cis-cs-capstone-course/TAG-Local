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
        }).then((data) => {
            if (data.filePaths[0]) {
                console.log("Changing paths to: '" + data.filePaths[0] + "'")
                modelPath = data.filePaths[0];
                $('#trainCurrent').show();
                $('#trainName').text(modelPath.truncStart(20, true)).show();
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
    let pyReturn = launchPy(pyScript, options).then(function () {
        // try local
        if (!pyReturn) {
            pyReturn = launchPy(pyScriptLocal, options);
        }
    }).then(function () {
        // still didn't work
        if (!pyReturn) {
            alert('Something went wrong');
            return -1;
        }
        // do something with data
        alert("!");
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
        var pyshell = new PythonShell.PythonShell(file, options);

        var returned = [];
        pyshell.on('message', function (message) {
            // received a message sent from the Python script (a simple "print" statement)
            pushToConsole(message);
            returned.push(message);
        });

        // end the input stream and allow the process to exit
        pyshell.end(function (err) {
            $(document.body).css('cursor', 'default');
            if (err) {
                console.log('Error: "' + err + '"');
                reject();
            }
            console.log('finished');
            resolve(returned);
        });
    });
}

pushToConsole = function (string, limit = 0) {
    $('#console').append($('<li>').text(string))
    $('#console').scrollTop($('#console').prop('scrollHeight'));

    if (limit > 0) {
        while ($('#console').children().length > limit) {
            $('#console').find('li').remove();
        }
    }
}

String.prototype.truncStart = function (n, truncAfterWord = false) {
    if (this.length <= n) { return this; }
    let subString = this.substr(this.length - n, this.length);
    let truncString = "…" + (truncAfterWord ? subString.substr(0, subString.indexOf('/')) : subString);
    return (truncString.length === 1 ? "…" + subString.substring(0, subString.length) : truncString);
};