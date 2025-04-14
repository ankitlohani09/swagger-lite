function initRequestHandlers() {
    const app = window._app;

    $('#requestSender').submit(function (e) {
        e.preventDefault();

        const url = $('#baseUrl').val().trim() + $('#url').val().trim();
        const method = $('#method').val();
        const body = $('#body').val().trim();

        app.$responseOutput.html('<div class="text-center py-4">Sending...</div>');
        app.$responseMeta.addClass('d-none');

        const start = Date.now();

        $.ajax({
            url: url,
            type: method,
            data: body,
            contentType: 'application/json',
            success: function (data, _, xhr) {
                const time = Date.now() - start;
                app.$responseMeta.removeClass('d-none').html('Status: ' + xhr.status + ' | Time: ' + time + 'ms');
                app.$responseOutput.text(JSON.stringify(data, null, 2));

                app.history.unshift({id: Date.now(), method, url, response: data});
                if (app.history.length > 50) app.history.pop();
                localStorage.setItem('requestHistory', JSON.stringify(app.history));
            },
            error: function (xhr) {
                app.$responseMeta.removeClass('d-none').html('Status: ' + (xhr.status || 'Error') + ' | Time: ' + (Date.now() - start) + 'ms');
                app.$responseOutput.text(xhr.responseText || 'Failed');
            }
        });
    });

    $('#copyResponse').click(function () {
        navigator.clipboard.writeText(app.$responseOutput.text()).then(function () {
            $('#copyResponse').text('Copied!');
            setTimeout(function () {
                $('#copyResponse').text('Copy');
            }, 2000);
        });
    });

    $('#clearResponse').click(function () {
        app.$responseOutput.text('No response yet');
        app.$responseMeta.addClass('d-none');
    });

    $('#saveAsFavorite').click(function (e) {
        e.preventDefault();
        const url = $('#url').val().trim();
        if (!url) return alert('URL daal do bhai!');

        app.favorites.unshift({
            id: Date.now(),
            method: $('#method').val(),
            url: url,
            body: $('#body').val().trim()
        });

        localStorage.setItem('favorites', JSON.stringify(app.favorites));
        alert('Favorite mein save ho gaya!');
        renderFavorites();
    });

    $('#clearHistory').click(function () {
        if (confirm('History clear karna hai?')) {
            app.history = [];
            localStorage.setItem('requestHistory', '[]');
            renderHistory();
        }
    });

    $('#clearFavorites').click(function () {
        if (confirm('Favorites clear karna hai?')) {
            app.favorites = [];
            localStorage.setItem('favorites', '[]');
            renderFavorites();
        }
    });
}

// Render History
function renderHistory() {
    var $list = $('#historyList').empty();
    var history = window._app.history;

    if (!history.length) {
        $list.html('<div class="text-center py-4 text-muted">Kuch history nahi hai</div>');
        return;
    }

    $.each(history, function (_, item) {
        var $item = $('<div class="list-group-item">' +
            '<span class="badge ' + getMethodClass(item.method) + '">' + item.method + '</span> ' +
            item.url +
            '<button class="btn btn-sm btn-outline-primary float-end replay">Replay</button>' +
            '</div>');

        $item.find('.replay').click(function () {
            $('#url').val(item.url);
            $('#method').val(item.method);
            window.toggleTab('endpoints');
            $('#requestForm').removeClass('d-none');
        });

        $list.append($item);
    });
}

// Render Favorites
function renderFavorites() {
    var $list = $('#favoritesList').empty();
    var favorites = window._app.favorites;

    if (!favorites.length) {
        $list.html('<div class="text-center py-4 text-muted">Koi favorite nahi hai</div>');
        return;
    }

    $.each(favorites, function (_, item) {
        var $item = $('<div class="list-group-item">' +
            '<span class="badge ' + getMethodClass(item.method) + '">' + item.method + '</span> ' +
            item.url +
            '<button class="btn btn-sm btn-outline-primary float-end load">Load</button>' +
            '<button class="btn btn-sm btn-outline-danger float-end me-2 delete">Delete</button>' +
            '</div>');

        $item.find('.load').click(function () {
            $('#url').val(item.url);
            $('#method').val(item.method);
            $('#body').val(item.body || '');
            window.toggleTab('endpoints');
            $('#requestForm').removeClass('d-none');
        });

        $item.find('.delete').click(function () {
            window._app.favorites = favorites.filter(function (f) {
                return f.id !== item.id;
            });
            localStorage.setItem('favorites', JSON.stringify(window._app.favorites));
            renderFavorites();
        });

        $list.append($item);
    });
}

// Make them globally accessible
window.renderHistory = renderHistory;
window.renderFavorites = renderFavorites;

