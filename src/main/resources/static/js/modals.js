function initModals() {
    var startupModal = new bootstrap.Modal('#startupModal');
    var helpModal = new bootstrap.Modal('#helpModal');

    if (localStorage.getItem('hideStartupModal') !== 'true') {
        startupModal.show();
    }

    $('#helpBtn').click(function () {
        helpModal.show();
    });

    $('.modal-footer .btn-secondary').click(function () {
        localStorage.setItem('hideStartupModal', 'true');
    });
}
