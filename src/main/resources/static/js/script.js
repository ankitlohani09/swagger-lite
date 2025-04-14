$(function () {
    // Cache DOM elements
    const $body = $('body');
    const $endpoints = $('#endpoints');
    const $responseOutput = $('#responseOutput');
    const $responseMeta = $('#responseMeta');
    let history = JSON.parse(localStorage.getItem('requestHistory') || '[]');
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    // Dark Mode
    if (localStorage.getItem('darkMode') === 'true') {
        $body.addClass('dark-mode');
        $('#darkToggle').html('<i class="fas fa-sun"></i> Light Mode');
    }
    $('#darkToggle').click(() => {
        const isDark = $body.toggleClass('dark-mode').hasClass('dark-mode');
        localStorage.setItem('darkMode', isDark);
        $('#darkToggle').html(
            isDark ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode'
        );
    });

    // Modals
    const startupModal = new bootstrap.Modal('#startupModal');
    const helpModal = new bootstrap.Modal('#helpModal');
    if (localStorage.getItem('hideStartupModal') !== 'true') startupModal.show();
    $('#helpBtn').click(() => helpModal.show());
    $('.modal-footer .btn-secondary').click(() => {
        localStorage.setItem('hideStartupModal', 'true');
    });

    // Tabs
    function toggleTab(tab) {
        $('.nav-link').removeClass('active');
        $(`#${tab}Tab`).addClass('active');
        $('.content-section').addClass('d-none');
        $(`#${tab}Section`).removeClass('d-none');
        $('#currentSection').text(tab.charAt(0).toUpperCase() + tab.slice(1));
        if (tab === 'history') renderHistory();
        if (tab === 'favorites') renderFavorites();
    }

    $('#endpointsTab').click(() => toggleTab('endpoints'));
    $('#historyTab').click(() => toggleTab('history'));
    $('#favoritesTab').click(() => toggleTab('favorites'));
    $('#backToEndpoints').click((e) => {
        e.preventDefault();
        toggleTab('endpoints');
    });

    // Fetch Endpoints
    $('#urlForm').submit((e) => {
        e.preventDefault();
        const baseUrl = $('#baseUrl').val().trim();
        if (!baseUrl) return;

        $endpoints.html('<div class="text-center py-4">Fetching...</div>');
        $.getJSON(`${baseUrl}/v3/api-docs`)
            .done((data) => {
                renderEndpoints(data);
                $('#endpointsFilter').removeClass('d-none');
            })
            .fail(() => {
                $endpoints.html('<div class="text-center py-4 text-muted">No endpoints found</div>');
                $('#errorMsg').removeClass('d-none').text('Failed to fetch endpoints. Please make sure your service is up and running.');
                $('#endpointsFilter').addClass('d-none');
            });
    });

    // Filter Endpoints
    $('#endpoint kalkiSearch').on('input', function () {
        const searchTerm = ($('#baseUrl').val().trim() + $(this).val()).toLowerCase();
        $('.endpoint-btn').each(function () {
            $(this).toggle($(this).text().toLowerCase().includes(searchTerm));
        });
    });

    // Render Endpoints
    function renderEndpoints(data) {
        $endpoints.empty();
        const paths = data.paths || {};
        if (!Object.keys(paths).length) {
            $endpoints.html('<div class="text-center py-4 text-muted">No endpoints found</div>');
            return;
        }

        const $list = $('<div class="d-flex flex-row flex-wrap gap-2"></div>');
        for (const path in paths) {
            Object.keys(paths[path]).forEach((method) => {
                const op = paths[path][method];
                const $btn = $(`
          <button class="list-group-item endpoint-btn">
            <span class="badge ${getMethodClass(method)}">${method.toUpperCase()}</span>
            ${path}
          </button>
        `);
                $btn.click(() => {
                    $('#url').val(path);
                    $('#method').val(method.toUpperCase());
                    toggleTab('endpoints');
                    $('#requestForm').removeClass('d-none');
                    renderParams(op);
                });
                $list.append($btn);
            });
        }
        $endpoints.append($list);
        $('#errorMsg').addClass('d-none');
    }

    // Render Parameters
    function renderParams(op) {
        const $paramBox = $('#paramDetails').empty().removeClass('d-none');
        $paramBox.append(`<h6>Details</h6><p>${op.summary || 'No summary'}</p>`);
        if (op.parameters?.length) {
            $paramBox.append('<p><strong>Parameters:</strong></p>');
            op.parameters.forEach((p) => {
                $paramBox.append(`<div>${p.name} (${p.in}): ${p.description || 'No desc'}</div>`);
            });
        }
    }

    // Send Request
    $('#requestSender').submit((e) => {
        e.preventDefault();
        const url = $('#baseUrl').val().trim() + $('#url').val().trim();
        const method = $('#method').val();
        const body = $('#body').val().trim();

        $responseOutput.html('<div class="text-center py-4">Sending...</div>');
        $responseMeta.addClass('d-none');

        const start = Date.now();
        $.ajax({
            url,
            type: method,
            data: body,
            contentType: 'application/json',
            success: (data, _, xhr) => {
                const time = Date.now() - start;
                $responseMeta
                    .removeClass('d-none')
                    .html(`Status: ${xhr.status} | Time: ${time}ms`);
                $responseOutput.text(JSON.stringify(data, null, 2));
                history.unshift({id: Date.now(), method, url, response: data});
                if (history.length > 50) history.pop();
                localStorage.setItem('requestHistory', JSON.stringify(history));
            },
            error: (xhr) => {
                $responseMeta
                    .removeClass('d-none')
                    .html(`Status: ${xhr.status || 'Error'} | Time: ${Date.now() - start}ms`);
                $responseOutput.text(xhr.responseText || 'Failed');
            },
        });
    });

    // Copy/Clear Response
    $('#copyResponse').click(() => {
        navigator.clipboard.writeText($responseOutput.text()).then(() => {
            $('#copyResponse').text('Copied!');
            setTimeout(() => $('#copyResponse').text('Copy'), 2000);
        });
    });
    $('#clearResponse').click(() => {
        $responseOutput.text('No response yet');
        $responseMeta.addClass('d-none');
    });

    // Save Favorite
    $('#saveAsFavorite').click((e) => {
        e.preventDefault();
        const url = $('#url').val().trim();
        if (!url) return alert('URL daal do bhai!');
        favorites.unshift({
            id: Date.now(),
            method: $('#method').val(),
            url,
            body: $('#body').val().trim(),
        });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Favorite mein save ho gaya!');
        renderFavorites();
    });

    // History
    function renderHistory() {
        const $list = $('#historyList').empty();
        if (!history.length) {
            $list.html('<div class="text-center py-4 text-muted">Kuch history nahi hai</div>');
            return;
        }
        history.forEach((item) => {
            const $item = $(`
        <div class="list-group-item">
          <span class="badge ${getMethodClass(item.method)}">${item.method}</span>
          ${item.url}
          <button class="btn btn-sm btn-outline-primary float-end replay">Replay</button>
        </div>
      `);
            $item.find('.replay').click(() => {
                $('#url').val(item.url);
                $('#method').val(item.method);
                toggleTab('endpoints');
                $('#requestForm').removeClass('d-none');
            });
            $list.append($item);
        });
    }
    $('#clearHistory').click(() => {
        if (confirm('History clear karna hai?')) {
            history = [];
            localStorage.setItem('requestHistory', JSON.stringify(history));
            renderHistory();
        }
    });

    // Favorites
    function renderFavorites() {
        const $list = $('#favoritesList').empty();
        if (!favorites.length) {
            $list.html('<div class="text-center py-4 text-muted">Koi favorite nahi hai</div>');
            return;
        }
        favorites.forEach((item) => {
            const $item = $(`
        <div class="list-group-item">
          <span class="badge ${getMethodClass(item.method)}">${item.method}</span>
          ${item.url}
          <button class="btn btn-sm btn-outline-primary float-end load">Load</button>
          <button class="btn btn-sm btn-outline-danger float-end me-2 delete">Delete</button>
        </div>
      `);
            $item.find('.load').click(() => {
                $('#url').val(item.url);
                $('#method').val(item.method);
                $('#body').val(item.body || '');
                toggleTab('endpoints');
                $('#requestForm').removeClass('d-none');
            });
            $item.find('.delete').click(() => {
                favorites = favorites.filter((f) => f.id !== item.id);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                renderFavorites();
            });
            $list.append($item);
        });
    }
    $('#clearFavorites').click(() => {
        if (confirm('Favorites clear karna hai?')) {
            favorites = [];
            localStorage.setItem('favorites', JSON.stringify(favorites));
            renderFavorites();
        }
    });

    // Utils
    function getMethodClass(method) {
        return {
            GET: 'bg-primary',
            POST: 'bg-success',
            PUT: 'bg-warning',
            DELETE: 'bg-danger',
            PATCH: 'bg-info',
        }[method.toUpperCase()] || 'bg-secondary';
    }
});