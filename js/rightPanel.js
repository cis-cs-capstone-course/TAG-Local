$('#consoleArrow').hide();
$('#rightArrow').hide();
var timer;
// mouse is hovered over right area
$('#rightContainer').on('mouseenter', function () {
    $('#rightArrow').fadeIn(100);
    var that = this;
    // mouse hovered over for 500ms
    timer = setTimeout(function () {
        $(that).css('right', 0);
        clearTimeout(timer);
        $('#rightArrow').addClass('noDisplay');
    }, 500);
}).on('mouseleave', function () {
    // mouse left right area
    $('#rightArrow').fadeOut(100);
    // reset timer
    clearTimeout(timer);
});

// click outside and hide right panel
$(document).on('click', function (e) {
    // check if clicked right outside of right panel (or child) but not delete button
    if (!$(e.target).is('#rightContainer') && !$('#rightContainer').has(e.target).length && !$('#delete-menu').has(e.target).length) {
        // hide
        $('#rightContainer').css('right', '-28%');
        $('#rightArrow').removeClass('noDisplay');
    }
});

// clicked annotation header // hide list of annotations for category
$('#anno-list').on('click', '.annoHeader', function () {
    $(this).next('ul').slideToggle(200);
    $(this).children('.dropArrow').toggleClass('upsideDown');
    
    // aesthetics 
    // is closed // open
    if ($(this).attr('value').charAt(0) === '-') {
        $(this).attr('value', $(this).attr('value', ).slice(1));
        $(this).css('background-color', '');
        $(this).css('color', 'white');
        $(this).children('.dropArrow').css('content', 'url("images/arrowDownWhite.png")');
    } 
    // is opened // close
    else {
        $(this).css('background-color', $(this).attr('value'));
        $(this).attr('value', '-' + $(this).attr('value'));
        $(this).css('color', 'black');
        $(this).children('.dropArrow').css('content', 'url("images/arrowDownBlack.png")');
    }
});

// right clicked annotation // bring up delete prompt
$('#anno-list').on('contextmenu', '.annotation', function (e) {
    event.preventDefault();
    delete_menu.append(
        $('<li/>', {
            class: 'delete-anno-list',
            html: '<b>Delete</b>',
            value: $(this).val()
        })
    ).show(100).
        css({
            top: e.pageY + 'px',
            left: e.pageX + 'px'
        });
})

// right clicked most recent annotation // bring up delete prompt
$('#recent').on('contextmenu', function(e) {
    event.preventDefault();
    delete_menu.append(
        $('<li/>', {
            class: 'delete-anno-list',
            html: '<b>Delete</b>',
            value: $(this).val()
        })
    ).show(100).
        css({
            top: e.pageY + 'px',
            left: e.pageX + 'px'
        });
});

var consoleShown = false;
$('#consoleContainer').on('click', function() {
    if (consoleShown) {
        $(this).css('height', ' 1vh');
        consoleShown = false; 
        $('#consoleArrow').toggleClass('upsideDown');
    } else {
        $(this).css('height', ' 10vh');
        consoleShown = true; 
        $('#consoleArrow').toggleClass('upsideDown');
    }
}).on('mouseenter', function () {
    $('#consoleArrow').fadeIn(100);
}).on('mouseleave', function () {
    $('#consoleArrow').fadeOut(100);
});

$('#console').on('update', function() {
    while ($(this).children().length > 100) {
        $(this).find('li:first').remove();
    }
});