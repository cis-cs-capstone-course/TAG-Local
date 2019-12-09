//jshint esversion: 6

// const { dialog } = require('electron').remote;
var path = require('path');
var PythonShell = require('python-shell');
// paths to apps // please add new scripts, thx
// var pyScript = path.join(__dirname, '/../py/hello.py');
// var pyScriptLocal = path.join(__dirname, '/py/hello.py');
let trainScript = path.join(__dirname, '..', 'py', 'train.py');
let trainScriptLocal = path.join(__dirname, 'py', 'train.py');
let annotateScript = path.join(__dirname, '..', 'py', 'annotate.py');
let annotateScriptLocal = path.join(__dirname, 'py', 'annotate.py');
let createScript = path.join(__dirname, '..', 'py', 'create.py');
let createScriptLocal = path.join(__dirname, 'py', 'create.py');

// hide things supposed to be hidden
$('#trainAll').hide();
$('#trainThis').hide();
$('#modelPath').hide();

// add new model path
$('#loadNew').on('click', loadExistingML);

function loadExistingML(){
  console.log("Opening directory picker");
  dialog.showOpenDialog(remote.getCurrentWindow(), {
      title: "Select a folder",
      properties: ["openDirectory"]
  }).then(function (data) {
            // on close get file path
      if (data.filePaths[0]) {
        console.log("Changing paths to: '" + data.filePaths[0] + "'");
        tagModel.currentModel = data.filePaths[0].goodPath();
        $('#trainAll').show();
        $('#trainThis').show();
        $('#modelPath').text(tagModel.currentModel.truncStart(30, true)).show();
      }
  });
}



function beginCreate(filePath){
  var options = {
      args: ['--model_path', filePath]
  };
  // try app
  let pyReturn;
  // try installer path
  launchPy(createScript, options).then(function (data) {
      pyReturn = data;
      alert('Creation Complete!');
      next();
  }).catch(function () {
      //try compiled path
      launchPy(createScriptLocal, options).then(function (data) {
          pyReturn = data;
          alert('Creation Complete (local script)!');
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
}


// try training
$('.trainButton').on('click', function () {
  if (this.id === "loadNew") {
    return;
  }
  if (this.id === "trainAll" || this.id === "trainThis") {
    if (this.id === "trainAll") {
      trainAllDocuments();
    }
    else {
      trainCurrentDocument();
    }
  }
});

//shared execution path for menu AND button  (all docs)
function trainAllDocuments(){
  console.log("Training all documents...");
  beginTraining(isAllDocuments = true);
}

//shared execution path for menu AND button (current doc)
function trainCurrentDocument(){
  console.log("Training current document...");
  beginTraining(isAllDocuments = false);
}

function beginTraining(isAllDocuments){
    if (tagModel.currentDoc == null) {
      console.log("No document uploaded, training aborted");
      alert("Please upload a document first!");
      return;
    }
    if (!tagModel.currentModel) {
      console.log("No model selected, training aborted");
      alert("Please select or create a model first!");
      return;
    }
    var options = {
        args: ['--raw_data', tagModel.jsonifyData(isAllDocuments), '--n_iter', 30, '--model', tagModel.currentModel]
    };
    // try app
    let pyReturn;
    // try installer path
    launchPy(trainScript, options).then(function (data) {
        pyReturn = data;
        alert('Training Complete!');
        //falling through ?
        next();
    }).catch(function () {
        //try compiled path
        launchPy(trainScriptLocal, options).then(function (data) {
            pyReturn = data;
            alert('Training Complete (local script)!');
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
}

$('.annButton').on('click', function () {
  if (this.id === "annAll") {
    annotateAllDocuments();
  }
  else if (this.id === "annThis"){
    annotateCurrentDocument();
  }
});

function annotateAllDocuments(){
  console.log("Annotating all documents...");
  beginAnnotating(isAllDocuments = true);
}

function annotateCurrentDocument(){
  console.log("Annotating current document...");
  beginAnnotating(isAllDocuments = false);
}


function beginAnnotating(isAllDocuments){
    if (!tagModel.currentModel) {
      console.log("No model selected, annotation aborted!");
      alert("Please add a model first!");
      return;
    }
    if (tagModel.currentDoc == null) {
      console.log("No document selected, annotation aborted!");
      alert("Please upload a document first!");
      return;
    }

  var options = {
      args: ['--model', tagModel.currentModel, '--raw_data', tagModel.jsonifyData(isAllDocuments)]
  };

  let pyReturn;
  launchPy(annotateScript, options).then(function (data) {
      pyReturn = data;
      displayAnnotations();
      alert('Successfully received ML annotations!');
      next();
  }).catch(function () {
      //try compiled path
      launchPy(annotateScriptLocal, options).then(function (data) {
          pyReturn = data;
          displayAnnotations();
          alert('Successfully received ML annotations (local script)!');
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
}

//TODO: Add button to create new model
$('.createModel').on('click', function () {
  //function created to create blank model below
    createBlankML();
  // open file picker
  // store path (var chosenPath) as argument
  // invoke create.py(chosenPath)

  // on fail
    // prompt with error
});


function createBlankML(){
  console.log("Opening save dialog");
  dialog.showSaveDialog(remote.getCurrentWindow(), {
      title: "Select a folder",
      properties: ["openDirectory"]
  }).then(function (data){
      if (data.filePath === undefined){
          console.log("You didn't select a path");
          return;
      }
      if (data.canceled == true) {
          console.log("You canceled the model creation");
          return;
        }
      beginCreate(data.filePath);
  });
}


// launches script
// get messages and add to console
// return on end

launchPy = function (file, options = null) {
    return new Promise(function (resolve, reject) {
        $(document.body).css('cursor', 'wait');
        console.log('Attempting to Launch "' + file + '"');
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

            // check for elapsed time, then update console
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

//Load annoations from ML
displayAnnotations = function() {
  const fs = require('fs');
  //read and parse json data from ml output file
  console.log("Preparing to read data from data.json");
  let rawContent = fs.readFileSync('data.json');
  let jsonContent = JSON.parse(rawContent);
  console.log("ML returned \n", jsonContent);
  //load json data
  let errors = loadJsonData(jsonContent, "", obliterate = true);
  if(errors.count > 0) {
    console.log('error displaying ml data: ', errors);
  }
};

// push to console
// limit is number of lines to keep in console
// 0 = unlimited
pushToConsole = function (string, limit = 0) {
    var console = $('#console');

    console.append($('<li>').text(string));
    console.scrollTop(console.prop('scrollHeight'));

    // over limit, remove excess lines
    if (limit > 0) {
        while (console.children().length - limit > 0) {
            console.find(':first-child').remove();
        }
    }
};

// standard path (forward slashes instead of backslashes)
String.prototype.goodPath = function () {
    return this.replace(/\\/g, "/");
};

// truncate from front of string
// truncate before word (searches for forward slash)
String.prototype.truncStart = function (n, truncBeforeWord = false) {
    if (this.length <= n) { return this; }
    let subString = this.substr(this.length - n, this.length);
    let truncString = "…" + (truncBeforeWord ? subString.substr(subString.indexOf('/'), subString.length) : subString);
    return (truncString.length === 1 ? "…" + subString.substring(0, subString.length) : truncString);
};
