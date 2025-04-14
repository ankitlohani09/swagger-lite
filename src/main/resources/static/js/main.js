$(function () {
    // Cache commonly used DOM elements
    window._app = {
        $body: $('body'),
        $endpoints: $('#endpoints'),
        $responseOutput: $('#responseOutput'),
        $responseMeta: $('#responseMeta'),
        history: JSON.parse(localStorage.getItem('requestHistory') || '[]'),
        favorites: JSON.parse(localStorage.getItem('favorites') || '[]')
    };

    // Initialize modules
    initTheme();
    initModals();
    initTabs();
    initEndpoints();
    initRequestHandlers();
});
