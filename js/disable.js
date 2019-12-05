// prevent ctrl + shift + i
$(window).keydown(function (e) {
    if (e.ctrlKey && e.shiftKey && e.which === 73) {
        e.preventDefault();
    }
});