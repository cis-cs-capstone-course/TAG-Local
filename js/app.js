//jshint esversion:6
// const { dialog } = require('electron');
// dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });

/* ---------- page setup ---------- */
var tagModel = new TagModel();
var textArea = $('#doc-view');
var highlightArea = $('#highlightArea');
var label_list = $('#label-list');
var hiddenAnno_list = [];
var delete_menu = $('#delete-menu');
var doc_list = $('#doc-list');
var deleteList = [];
var mostRecentIndex = -1;
var path = require('path');
const { dialog } = require('electron').remote;


// --------------events-------------- //

// clicked anywhere
$(document).on("mousedown", function (e) {
  // If the clicked element is not the menu
  if ($(e.target).parents("#delete-menu").length === 0) {
    // Hide it
    delete_menu.hide(100)
      .text('');
  }
});

// download zip
$('#dlZip').on('click', exportAsZip);

// download json
$('#dlJson').on('click', exportAsJson);

// check a or d button pressed
var aKeyPressed = false;
var dKeyPressed = false;
// key pressed
$(window).keydown(function (e) {
  if (e.which === 65) {
    aKeyPressed = true;
  } else if (e.which === 68) {
    dKeyPressed = true;
  }
})
  // key released
  .keyup(function (e) {
    if (e.which === 65) {
      aKeyPressed = false;
    } else if (e.which === 68) {
      dKeyPressed = false;
    }
  });

// on mouse release, highlight selected text
textArea.on('mouseup', function (e) {
  // left click release
  if (e.which === 1) {
    // check for label
    if (tagModel.currentCategory === null) {
      alert('Error: Please create a label!');
      return;
    }
    // check for document
    if (tagModel.currentDoc === null) {
      alert('Error: Please add a document!');
      return;
    }

    // there is a label and document
    // get text selected
    let range = {};
    if (textArea[0].selectionStart < textArea[0].selectionEnd) {
      // selected text
      range = {
        startPosition: textArea[0].selectionStart,
        endPosition: textArea[0].selectionEnd
      };


      var hasExistingAnnotation = tagModel.currentDoc.getIndicesByRange(range, tagModel.currentCategory).length > 0;

      // a key
      if (aKeyPressed) {
        mostRecentIndex = tagModel.addAnnotation(range, tagModel.currentCategory);
        renderHighlights();
        clearSelection();
      }
      else if (dKeyPressed) {
        if (hasExistingAnnotation) {
          tagModel.removeAnnotationByRange(range);
          mostRecentIndex = -1;
          renderHighlights();
          clearSelection();
        }
      } else {
        if (hasExistingAnnotation) {
          delete_menu.css({
          top: e.pageY,
          left: e.pageX,
          'min-width': ''
        });
        delete_menu.append('<h6>Which?</h6><hr style="margin: 0;">')
          .append('<li class="add-anno" value="' + range.startPosition + ' ' + range.endPosition + '" style="background-color: #b7e8c7; font-weight: bold;">Add</li>')
          .append('<li class="delete-anno-part" value="' + range.startPosition + ' ' + range.endPosition + '" style="background-color: #ef778c; font-weight: bold;">Delete</li>')
          .show(100);
        }
        else {
          mostRecentIndex = tagModel.addAnnotation(range, tagModel.currentCategory);
          renderHighlights();
          clearSelection();
        }
      }
    }
  }
});

// on right click, show annotations at position to delete
textArea.on('contextmenu', function (e) {
  // check for document
  if (tagModel.currentDoc === null) {
    return;
  }
  // check if annotations exist
  let position = textArea[0].selectionStart;
  deleteList = tagModel.currentDoc.getAnnotationsAtPos(position);
  // annotations don't exist
  // do nothing
  if (deleteList.length === 0) {
    return;
  }

  // annotations exist
  // show delete menu
  delete_menu.append(
    $('<h6/>', {
      html: 'Delete Annotation:'
    })
  ).append(
    $('<hr/>', {
      style: 'margin: 0;'
    })
  );
  for (let i = 0; i < deleteList.length; i++) {
    delete_menu.append(
      $('<li/>', {
        class: 'delete-anno',
        value: 'delete_anno_' + i,
        style: 'background-color:' + tagModel.getColor(deleteList[i].label),
        html: '<b>' + deleteList[i].label.trunc(10) + ': </b>'
      }).append(
        deleteList[i].content.trunc(20).escapeHtml()
      )
    ).show(100).
      css({
        top: e.pageY + 'px',
        left: e.pageX + 'px',
        'min-width': ''
      });
  }
});

// create new label
$('#add-label').on('click', function () {
  var newLabel = makeRandName();
  console.log("CSS: Creating new category: [" + newLabel + "]");
  let label = addLabel(newLabel);
  let labelname = label.children(".label-name");
  labelname[0].contentEditable = true;
  labelname.focus().selectText();
});

//change the document's label context
label_list.on('mouseup', '.label', function () {
  //change label selection
  tagModel.currentCategory = this.getAttribute('value');
  $('.label').attr('id', '');                   //remove label-selected from all
  $(this).attr('id', 'label-selected');         //add label-selected to clicked
});

// on label right click
label_list.on('contextmenu', function (e) {
  delete_menu.append(
    $('<li/>', {
      class: 'delete-label',
      html: '<b>Delete</b>'
    })
  ).show(100).
    css({
      top: e.pageY,
      left: e.pageX,
      'min-width': ''
    });
});

//edit label name
label_list.on('dblclick', '.label', function () {
  //enble editing
  $(this).children('.label-name')[0].contentEditable = true;
  //open textbox
  $(this).children('.label-name').focus().selectText();
});

// user pressed enter on label name change
label_list.on('keypress', '.label-name', function (e) {
  if (e.which === 13) {
    $(this).blur();
  }
});

//stopped editing label name
label_list.on('blur', '.label-name', function () {
  //disable editing
  this.contentEditable = false;

  //fix whitespace and create new label name with no spaces (class names can't have spaces)
  let newName = $(this).text().trim().replace(/\s+/g, "_").replace(/<|>|&/g, '');
  $(this).text(newName);
  console.log("Attempting to change label name from " + tagModel.currentCategory + " to " + newName);

  //check if the name is the same as previous
  if (newName === tagModel.currentCategory) {
    console.log('Aborting: Category is the same name as before');
    return;
  }

  //check for valid label name
  if ((tagModel.categoryIndex(newName) >= 0) || newName === '') {
    console.log('Aborting: Invalid label name: "' + newName + '"');
    $(this).text(tagModel.currentCategory);
    return;
  }

  // update styling for category
  $('#' + tagModel.currentCategory + '-style').remove();
  $('head').append(
    $('<style/>', {
      id: newName + '-style',
      html: '.hwt-content .label_' + newName + ' {background-color:' + tagModel.getColor(tagModel.currentCategory) + ';}'
    })
  );

  // update category name in list
  $('#label-selected').attr('value', newName);

  tagModel.renameCategory(newName);
  renderHighlights();
});

//invoke colorpicker on icon click
label_list.on('click', '.colorChange', function () {
  console.log('dropperClicked!');
  $('#colorChangePicker').click();   //invoke color picker
});

//change label color
$('#colorChangePicker').on('change', function () {
  console.log('colorPicked: ' + this.value);

  //update colors on page
  $('#label-selected').css('background-color', this.value);
  $('#' + tagModel.currentCategory + '-style').html(
    '.hwt-content .label_' + tagModel.currentCategory + ' {background-color: ' + this.value + ';}'
  );
  tagModel.changeColor(this.value);
  this.value = "black";
  renderHighlights();
});

// add document button
$('#add-document').on('click', function () {
  getDocInput();
});

// change document
doc_list.on('mouseup', '.doc-name', function (e) {
  // get document selected
  tagModel.setCurrentDoc(this.getAttribute('value'));
  $('#doc-selected').attr('id', '');
  $(this).attr('id', 'doc-selected');
  // change text
  textArea.text(tagModel.currentDoc.text.escapeHtml());

  mostRecentIndex = -1;
  renderHighlights();
  resize();
  $(window).scrollTop(0);
});

// right click document list
doc_list.on('contextmenu', function (e) {
  delete_menu.append(
    $('<li/>', {
      class: 'delete-doc',
      html: '<b>Delete</b>',
    })
  ).show(100).
    css({
      top: e.pageY,
      left: e.pageX,
      'min-width': ''
    });
});

// clicked annotation // go to highlight position
$('.annotation').on('click', function () {
  let annoNum = $(this).attr('value');
  jumpToAnno(annoNum);
});

// annotation list // clicked annotation // go to highlight position
$('#anno-list').on('click', 'li', function () {
  let annoNum = $(this).attr('value');
  jumpToAnno(annoNum);
});

// clicked delete
delete_menu.on('click', 'li', function () {
  delete_menu.hide(100);
  // add annotation
  if ($(this).hasClass('add-anno')) {
    // parse values to delete
    let value = $(this).attr('value').split(' ');
    var range = {
      startPosition: parseInt(value[0]),
      endPosition: parseInt(value[1])
    };
    mostRecentIndex = tagModel.addAnnotation(range, tagModel.currentCategory);
    console.log("Highlighted: " + range.startPosition + "-" + range.endPosition);
  }
  // delete partial highlight
  else if ($(this).hasClass('delete-anno-part')) {
    let value = $(this).attr('value').split(' ');
    var range = {
      startPosition: parseInt(value[0]),
      endPosition: parseInt(value[1])
    };
    if (tagModel.currentDoc.getIndicesByRange(range, tagModel.currentCategory).length > 0) {
      tagModel.removeAnnotationByRange(range);
    }
    mostRecentIndex = -1;
  }
  // delete full highlight
  else if ($(this).hasClass('delete-anno')) {
    let deleteIndex = parseInt($(this).attr('value').replace('delete_anno_', ''));
    tagModel.removeAnnotation(deleteList[deleteIndex]);
    mostRecentIndex = -1;
  }
  // delete label
  else if ($(this).hasClass('delete-label')) {
    //remove category
    tagModel.deleteCategory();
    console.log('Category Deleted');
    resize();
    // change label selected visually
    $('#label-selected').remove();
    if (tagModel.currentDoc != null) {
      $('.label[value="' + tagModel.currentCategory + '"]').attr('id', 'label-selected');
    }
    mostRecentIndex = -1;
  }
  // delete document
  else if ($(this).hasClass('delete-doc')) {
    // remove document
    tagModel.deleteDoc(tagModel.currentDoc.title);
    console.log('Document Deleted');
    // update text
    if (tagModel.currentDoc != null) {
      textArea.text(tagModel.currentDoc.text.escapeHtml());
    } else {
      textArea.text('');
    }
    resize();
    // change doc selected visually
    $('#doc-selected').remove();
    if (tagModel.currentDoc != null) {
      $('.doc-name[value="' + tagModel.currentDoc.title + '"]').attr('id', 'doc-selected');
    }
    mostRecentIndex = -1;
  }
  // delete annotation by list
  else if ($(this).hasClass('delete-anno-list')) {
    let value = $(this).attr('value');
    tagModel.removeAnnotationByIndex(value);
    mostRecentIndex = -1;
  }
  renderHighlights();
  clearSelection();
});

// update size when window is resized
$(window).on('resize', function () {
  let scrollPercent = $(window).scrollTop() / $(document).height();
  resize();
  $(window).scrollTop(scrollPercent * $(document).height());
});

// ----- functions ----- //

// export zip function
function exportAsZip() {
  console.log("Zip export requested...");
  // no files found
  if (tagModel.openDocs.length === 0) {
    alert('Error: No data to export!');
    return;
  }
  let zip = tagModel.getAsZip();
  dialog.showSaveDialog(remote.getCurrentWindow())
    .then(result => {
      let savePath = result.filePath;
      if (path.extname(savePath) != '.zip') {
        savePath += '.zip';
      }
      zip
        .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(savePath))
        .on('finish', function () {
          console.log("Created zip file: ", savePath);
        });
    });
}

// export json function


function exportAsJson() {

  if (tagModel.openDocs.length === 0) {
    alert('Error: No data to download!');
    return;
  }

  dialog.showSaveDialog(remote.getCurrentWindow())
    .then((result) => {
      let savePath = result.filePath;
      if (savePath == null){
        console.log("No savepath: exiting");
        return;
      }
      if (path.extname(savePath) != '.json') {
        savePath += '.json';
      }
      fs.writeFile(savePath, tagModel.jsonifyData(isAllDocs=false), (err) => {
        if (err) {
          alert("An error ocurred creating the file " + err.message);
        }
        console.log("Saved file: ", savePath);
      });
    });
}

// add document
function getDocInput() {
  dialog.showOpenDialog(remote.getCurrentWindow(), {
    title: "Select a folder",
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Docs', extensions: ['txt', 'json', 'zip'] }]
  }).then(function (data) {
    loadFiles(data.filePaths);
  });
}


function loadFiles(filePaths) {
  console.log("LoadFiles called with : ", filePaths);
  let invalidFiles = "";
  filePaths.forEach((file) => {
    let name = path.basename(file);
    let extension = path.extname(file);
    let content = fs.readFileSync(file, 'utf8');
    if (extension == '.zip') {
      console.log("Found a zip file");
      handleZipFiles(file);
    } else if (extension == '.json') {
      console.log(content);
      loadJsonData(JSON.parse(content));
    } else if (extension == '.txt') {
      if(!loadTextData(name, content)){
        invalidFiles += "Already added " + name + "\n";
      }
    }
  });
  if (invalidFiles != "") {
    alert(invalidFiles);
  }
}


function loadTextData(name, content){
  let doc = new Doc(name, content.replace(/\n/g, ' '));
  if (!addDoc(doc)) {
    console.log("Already added ", doc.title);
    return false;
  }
  return true;
}


function handleZipFiles(file){
  fs.readFile(file, function(err, data) {
    if (!err) {
      var zip = new JSZip();
      zip.loadAsync(data).then(function(contents) {
        let zippedFiles = Object.keys(contents.files);
        const os = require('os');
        fs.mkdtemp(path.join(os.tmpdir(), 'tag-'), (err, folder) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log("Created temp directory: ", folder);
          extractZipFiles(zip, zippedFiles, folder);
        });
      });
    }
  });
}

// extract the actual zip files
function extractZipFiles(zip, zippedFiles, folder){
  let unzippedFiles = [];
  let ignoredFiles = [];
  zippedFiles.forEach(function(filename) {
    if (filename.match(/^__MACOSX/g) !== null) {
      console.log("Ignored __MACOSX compression file: '" + filename + "'");
      ignoredFiles.push(filename);
    }
    else {
      zip.file(filename).async('nodebuffer').then(function(content) {
        var dest = path.join(folder, filename);
        fs.writeFileSync(dest, content);
        console.log("Extracted file: ", dest);
        unzippedFiles.push(dest);
        if(unzippedFiles.length + ignoredFiles.length == zippedFiles.length) {
          console.log("All files unzipped");
          loadFiles(unzippedFiles);
          removeTempFiles(unzippedFiles, folder);
        }
      });
    }
  });
}

//remove unzipped files in tempdirectory (From Zip Upload)
function removeTempFiles(unzippedFiles, folder){
  unzippedFiles.forEach((file) => {
    try {
      fs.unlinkSync(file);
      console.log("Deleted file: ", file);
    //file removed
    } catch(err) {
      console.log("Unable to delete file: ", file);
      console.error(err);
    }
  });
  try {
    fs.rmdirSync(folder);
    console.log("Deleted temp directory: ", folder);
  }catch(err){
    console.log("Unable to remove directory, ", folder);
    console.log(err);
  }
}

//add new document
function addDoc(doc) {
  // try to add document
  if (!tagModel.addDoc(doc)) {
    return false;
  }
  // added document
  // set current document to new document
  tagModel.setCurrentDoc(doc.title.escapeHtml());
  textArea.text(tagModel.currentDoc.text.escapeHtml());
  $('#doc-selected').attr('id', '');
  doc_list.append(
    $('<h6/>', {
      id: 'doc-selected',
      class: 'doc-name hoverWhite',
      value: doc.title.escapeHtml(),
      html: doc.title.escapeHtml()
    })
  );
  doc_list.scrollTop(doc_list.prop('scrollHeight'));

  resize();
  mostRecentIndex = -1;
  renderHighlights();
  return true;
}

//add new label
function addLabel(name, color = null) {
  // check if name already belongs
  if (tagModel.categoryIndex(name) !== -1) {
    alert('Failed to add label "' + name + '": label already exists!');
    return null;
  }

  // does not already belong
  // check for specific color
  if (color === null) {
    color = makeRandColor();
  }
  tagModel.addCategory(name, color);

  // add highlight rule to page
  $('head').append(
    $('<style/>', {
      id: name + '-style',
      class: 'highlight-style',
      html: '.hwt-content .label_' + name + ' {background-color: ' + color + ';}'
    })
  );

  // select new category
  tagModel.currentCategory = name;
  $('#label-selected').attr('id', '');

  // add category to page
  var newLabel = $('<div/>', {
    class: 'hoverWhite label',
    id: 'label-selected',
    value: name,
    style: "background-color: " + color
  }).append(
    $('<img/>', {
      class: 'colorChange',
      src: 'images/dropper.png',
    })
  ).append(
    $('<div/>', {
      class: 'label-name'
    }).text(name)
  );

  label_list.append(newLabel);

  // go to new label's postion
  label_list.scrollTop(label_list.prop('scrollHeight'));

  // first color => make current category the color
  tagModel.currentCategory = name;
  $('.label[value=' + name + ']').attr('id', 'label-selected');

  return newLabel;
}

//update height on window resize and keep scroll position
function resize() {
  $('.highlight').offset(textArea.offset());
  textArea.height('auto');
  textArea.height(textArea.prop('scrollHeight') + 1);
  $('.highlight').css('height', textArea.height);
}

// generate random name
function makeRandName() {
  return parseInt(Math.random() * Math.pow(10, 14)).toString(36);
}

// generate random color
function makeRandColor() {
  return "#000000".replace(/0/g, function () {
    return (~~(Math.random() * 10) + 6).toString(16);
  });
}

// import json data
function loadJsonData(data, filename = "", obliterate = false) {
  if (obliterate) {
    console.log('Displaying new data');

    $.each(data, function () {
      tagModel.deleteDoc(this.title);
      $('.doc-name[value="' + this.title + '"]').remove();
    });
  }

  // for invalid files
  let invalidFiles = [];

  // add remove annotation from annotation list
  try {
    // json array
    $.each(data, function () {
      addJsonElement(this);
    });
  } catch (err) {
    // caught an error
    if (err instanceof TypeError) {
      // single json file
      try {
        addJsonElement(data);
      } catch (innerErr) {
        console.log("Not valid JSON input");
      }
    }
    // we shouldn't be here
    else {
      console.log('SNAFU');
    }
  }

  function addJsonElement(doc) {
    // check if file belongs
    if (tagModel.docIndex(doc.title) > -1) {
      invalidFiles.push("File already uploaded for: '" + doc.title + "'\n");
      return;
    }
    // create and add doc
    var newDoc = new Doc(doc.title, doc.text.replace(/\n/g, ' '));
    addDoc(newDoc);
    tagModel.currentDoc = newDoc;
    doc.annotations.forEach(function (annotation) {
      if (tagModel.categoryIndex(annotation.label) === -1) {
        addLabel(annotation.label);
      }
      tagModel.addAnnotation(annotation.range, annotation.label);
    });
  }

  // update everything
  textArea.text(tagModel.currentDoc.text.escapeHtml());
  renderHighlights();
  resize();
  $(window).scrollTop(0);

  // return errors
  if (invalidFiles.length > 0) {
    let warning = filename + ":\n";
    invalidFiles.forEach(function (string) {
      warning += string;
    });
    return warning;
  }
  return '';
}

// make all highlights and annotation list
function renderHighlights() {
  // clear old annotation list
  $('#anno-list').empty();
  // clear old highlights
  $('.hwt-backdrop').remove();
  // no document // do nothing // (=== doesn't seem to work here)
  if (tagModel.currentDoc == null) {
    return;
  }
  // get all annnotations by label
  let labelSortedAnnos = tagModel.currentDoc.getAnnotationsByLabel();
  let text = tagModel.currentDoc.text.escapeHtml();
  // calculate offset for height
  let offset = 0;
  if (labelSortedAnnos.length > 1) {
    offset = 4.6 / (labelSortedAnnos.length - 1);
  }
  // inital padding height
  let padding = 0;
  // do each category
  for (let category of labelSortedAnnos) {
    // annotations list
    if (category.length === 0) {
      continue;
    }

    var annoHeader = $('<h2/>', {
      html: category[0][0].label + '<img class="dropArrow upsideDown" src="images/arrowDownWhite.png">',
      class: 'annoHeader hoverWhite',
      value: tagModel.getColor(category[0][0].label)
    });
    $('#anno-list').append(annoHeader).append(
      $('<ul/>', {
        class: 'anno-group',
        value: category[0][0].label
      })
    );
    if (hiddenAnno_list.indexOf(category[0][0].label) !== -1) {
      annoHeader.click();
    }
    // create highlight area
    var highlights = $('<div/>', {
      class: "hwt-highlights hwt-content"
    });
    // keep tack of index of text
    let lastIndex = 0;
    let newText = '';
    // do each annotation for current category
    for (let anno of category) {
      // add annotation to label
      $('.anno-group[value="' + anno[0].label + '"]').append(
        $('<li/>', {
          class: 'annotation hoverWhite',
          style: 'background-color: ' + tagModel.getColor(anno[0].label),
          value: anno[1]
        }).text(anno[0].content.trunc(20, true).escapeHtml())
      );

      // Add text before highlight then the highlight itself
      newText += text.substring(lastIndex, anno[0].range.startPosition);
      newText += '<mark class="highlight label_' + anno[0].label + '" value="' + anno[1] + '" style="padding: ' + padding + 'px 0;">' + text.substring(anno[0].range.startPosition, anno[0].range.endPosition) + '</mark>';
      lastIndex = anno[0].range.endPosition;
    }
    //update padding size
    padding += offset;
    // add trailing text
    if (lastIndex !== text.length) {
      newText += text.substring(lastIndex, text.length);
    }
    highlights.html(newText);
    // push as first child // important for order
    highlightArea.prepend(
      $('<div/>', {
        class: 'hwt-backdrop'
      }).append(highlights)
    );
  }
  // update most recent
  if (mostRecentIndex !== -1) {
    $('#recent').text(tagModel.currentDoc.annotations[mostRecentIndex].content.trunc(20, true).escapeHtml()).css('background-color', tagModel.getColor(tagModel.currentDoc.annotations[mostRecentIndex].label)).attr('value', mostRecentIndex);
    $('#recentArea').css('display', 'block');
  }
  // hide it otherwise
  else {
    $('#recentArea').css('display', 'none');
  }
}

// clears selected text
function clearSelection() {
  var selection = window.getSelection ? window.getSelection() : document.selection ? document.selection : null;
  if (selection) selection.empty ? selection.empty() : selection.removeAllRanges();
}

// scroll to position of annotation
function jumpToAnno(num) {
  $(window).scrollTop($('.highlight[value="' + num + '"]').offset().top);
}

// pass as safe text
String.prototype.escapeHtml = function () {
  return this.replace(/<|>/g, "_");
};

// truncate string and add ellipsis
// truncAfterWord will only truncate on spaces
// returns entire word, up to n characters, if string contains no spaces
String.prototype.trunc = function (n, truncAfterWord = false) {
  if (this.length <= n) { return this; }
  let subString = this.substr(0, n - 1);
  let truncString = (truncAfterWord ? subString.substr(0, subString.lastIndexOf(' ')) : subString) + "…";
  return (truncString.length === 1 ? subString.substring(0, subString.length - 1) + "…" : truncString);
};

// select all text in element
$.fn.selectText = function () {
  var doc = document;
  var element = this[0];
  if (doc.body.createTextRange) {
    var range = document.body.createTextRange();
    range.moveToElementText(element);
    range.select();
  } else if (window.getSelection) {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};
