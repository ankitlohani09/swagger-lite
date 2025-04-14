function initTabs() {
    $('#endpointsTab').click(function () {
        toggleTab('endpoints');
    });

    $('#historyTab').click(function () {
        toggleTab('history');
    });

    $('#favoritesTab').click(function () {
        toggleTab('favorites');
    });

    $('#backToEndpoints').click(function (e) {
        e.preventDefault();
        toggleTab('endpoints');
    });

    window.toggleTab = function (tab) {
        $('.nav-link').removeClass('active');
        $('#' + tab + 'Tab').addClass('active');
        $('.content-section').addClass('d-none');
        $('#' + tab + 'Section').removeClass('d-none');
        $('#currentSection').text(tab.charAt(0).toUpperCase() + tab.slice(1));

        if (tab === 'history') renderHistory();
        if (tab === 'favorites') renderFavorites();
    };
}
