function initEndpoints() {
    $('#urlForm').submit(handleFormSubmit);
    $('#endpointSearch').on('input', handleSearchInput);
    window.getMethodClass = getMethodClass;
}

function handleFormSubmit(e) {
    e.preventDefault();
    const baseUrl = $('#baseUrl').val().trim();
    if (!baseUrl) return;

    const $endpoints = window._app.$endpoints;
    $endpoints.html('<div class="text-center py-4">Fetching...</div>');

    fetchApiDocs(baseUrl)
        .done(data => {
            renderEndpoints(data);
            $('#endpointsFilter').removeClass('d-none');
        })
        .fail(() => {
            $endpoints.html('<div class="text-center py-4 text-muted">No endpoints found</div>');
            $('#errorMsg').removeClass('d-none').text('Failed to fetch endpoints. Please check the service up and running.');
            $('#endpointsFilter').addClass('d-none');
        });
}

function handleSearchInput() {
    const searchTerm = ($('#baseUrl').val().trim() + $(this).val()).toLowerCase();
    $('.endpoint-btn').each(function () {
        $(this).toggle($(this).text().toLowerCase().includes(searchTerm));
    });
}

function fetchApiDocs(baseUrl) {
    return $.getJSON(baseUrl + '/v3/api-docs');
}

function renderEndpoints(data) {
    const $endpoints = window._app.$endpoints;
    const paths = data.paths || {};
    $endpoints.empty();

    if (!Object.keys(paths).length) {
        $endpoints.html('<div class="text-center py-4 text-muted">No endpoints found</div>');
        return;
    }

    const grouped = groupEndpointsByTag(paths);
    Object.keys(grouped).sort().forEach(tag => {
        const section = renderTagSection(tag, grouped[tag]);
        $endpoints.append(section);
    });

    $('#errorMsg').addClass('d-none');
}

function groupEndpointsByTag(paths) {
    const grouped = {};
    $.each(paths, (path, methods) => {
        $.each(methods, (method, op) => {
            const tag = (op.tags && op.tags.length > 0) ? op.tags[0] : 'default';
            grouped[tag] = grouped[tag] || [];
            grouped[tag].push({ method, path, op });
        });
    });
    return grouped;
}

function renderTagSection(tag, endpoints) {
    const $section = $('<div class="mb-3 w-100"></div>');
    const $header = $(`
        <h5 class="text-primary mb-2 cursor-pointer" style="user-select: none;">
            <i class="fas fa-folder-open me-1"></i> ${tag}
            <span class="text-muted small">(${endpoints.length})</span>
        </h5>
    `);

    const $list = $('<div class="d-flex flex-row flex-wrap gap-2 ps-2"></div>');
    $header.click(() => $list.toggle());

    endpoints.forEach(({ method, path, op }) => {
        const $btn = $(`
            <button class="list-group-item endpoint-btn" title="${op.summary || 'No summary'}">
                <span class="badge ${getMethodClass(method)}">${method.toUpperCase()}</span> ${path}
            </button>
        `);

        $btn.click(() => {
            $('#url').val(path);
            $('#method').val(method.toUpperCase());
            window.toggleTab('endpoints');
            $('#requestForm').removeClass('d-none');
            renderParams(op);
        });

        $list.append($btn);
    });

    return $section.append($header).append($list);
}

function renderParams(op) {
    const $paramBox = $('#paramDetails').empty().removeClass('d-none');
    $paramBox.append(`<h6>Details</h6><p>${op.summary || 'No summary'}</p>`);

    if (op.parameters && op.parameters.length) {
        $paramBox.append('<p><strong>Parameters:</strong></p>');
        op.parameters.forEach(p => {
            $paramBox.append(`<div>${p.name} (${p.in}): ${p.description || 'No desc'}</div>`);
        });
    }
}

function getMethodClass(method) {
    const classes = {
        GET: 'bg-primary',
        POST: 'bg-success',
        PUT: 'bg-warning',
        DELETE: 'bg-danger',
        PATCH: 'bg-info'
    };
    return classes[method.toUpperCase()] || 'bg-secondary';
}
