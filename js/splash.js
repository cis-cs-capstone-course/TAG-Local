// check if startup
var startup = true;

// hide splash after 
setTimeout(function () {
    // hide and set up for clicking show splash
    $('#splash').slideUp(400, function() {
        startup = false;
        $(this).css('cursor', 'pointer');
    });
}, 1650);

// hide splash when clicked
$('#splash').on('click', function () {
    // check if startup
    // not startup, hide
    if (!startup) {
        $(this).slideUp(400);
    }
});