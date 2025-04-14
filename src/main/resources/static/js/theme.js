function initTheme() {
    var $body = window._app.$body;

    if (localStorage.getItem('darkMode') === 'true') {
        $body.addClass('dark-mode');
        $('#darkToggle').html('<i class="fas fa-sun"></i> Light Mode');
    }

    $('#darkToggle').click(function () {
        var isDark = $body.toggleClass('dark-mode').hasClass('dark-mode');
        localStorage.setItem('darkMode', isDark);
        $('#darkToggle').html(
            isDark ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode'
        );
    });
}
