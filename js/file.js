const { dialog } = require('electron').remote;

$('#trainNew').on('click', function () {
    // $('#directoryInput').click();
    dialog.showOpenDialog({
        title: "Select a folder",
        properties: ["openDirectory"]
    }).then((data) => {
        // folderPaths is an array that contains all the selected paths
        console.log(data.filePaths);
    });
});