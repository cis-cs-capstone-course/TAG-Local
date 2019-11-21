const { remote } = require('electron');

var win = remote.getCurrentWindow();

$('#logo').on('click', function (e) {
    delete_menu.css({
        top: ($(this).position().top + $(this).height() + 1),
        left: $(this).position().left,
        'min-width': $(this).width()
    });
    delete_menu.append('<h6 class="main">TAG</h6><hr style="margin: 0;">')
        .append('<li class="fullscreenToggle" style="font-weight: bold;">Toggle Fullscreen</li>')
        .append('<li class="minimize" style="font-weight: bold;">Minimize</li>')
        .append('<li class="exit" style="font-weight: bold;">Exit</li>')
    delete_menu.toggle(100);
});

delete_menu.on('click', 'li', function () {
    if ($(this).hasClass('fullscreenToggle')) {
        if (win.isFullScreen()) {
            win.setFullScreen(false);
        } else {
            win.setFullScreen(true);
        }
    } else if ($(this).hasClass('minimize')) {
        win.minimize();
    } else if ($(this).hasClass('exit')) {
        dialog.showMessageBox({buttons: ["Yes","No","Cancel"],
        message: "Do you really want to quit?"}).then((data) => {
            if (data.response == 0)
                win.close();
        });
    }
});