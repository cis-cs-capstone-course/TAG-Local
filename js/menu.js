const { remote } = require('electron');

var win = remote.getCurrentWindow();

// clicked logo // open menu
$('#logo').on('click', function (e) {
    delete_menu.css({
        top: ($(this).position().top + $(this).height() + 1),
        left: $(this).position().left,
        'min-width': $(this).width()
    });
    delete_menu.append('<h6 class="main">TAG</h6><hr style="margin: 0;">')
        .append('<li class="fullscreenToggle" style="font-weight: bold;">Toggle Fullscreen</li>')
        .append('<li class="minimize" style="font-weight: bold;">Minimize</li>')
        .append('<li class="help" style="font-weight: bold;">Help</li>')
        .append('<li class="exit" style="font-weight: bold;">Exit</li>')
        .toggle(100);
});

// clicked an item in list // do according to which was clicked
delete_menu.on('click', 'li', function () {
    if ($(this).hasClass('fullscreenToggle')) {
        if (win.isFullScreen()) {
            win.setFullScreen(false);
        } else {
            win.setFullScreen(true);
        }
    } else if ($(this).hasClass('minimize')) {
        win.minimize();
    } else if ($(this).hasClass('help')) {
        // replace with help screen
        console.log('replace with help screen')
    } else if ($(this).hasClass('exit')) {
        dialog.showMessageBox({
            buttons: ["Yes", "No", "Cancel"],
            message: "Do you really want to quit?"
        }).then(function (data) {
            if (data.response == 0)
                win.close();
        });
    }
});