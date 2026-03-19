function buildNotification(name, message, type) {
    let notification = document.createElement('div');
    notification.classList.add('toast', 'align-items-center', 'border-0', 'top-0', 'end-0', 'm-4');
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.setAttribute('aria-atomic', 'true');
    notification.name = window.getVariableName(name);
    notification.id = window.getVariableName(name);

    // Set default icon symbol
    let iconSymbol = 'circle';

    if (type === 'error') {
        notification.classList.add('bg-danger', 'text-light');
        iconSymbol = 'report';
    }

    if (type === 'success') {
        notification.classList.add('bg-success', 'text-light');
        iconSymbol = 'check_circle';
    }

    if (type === 'warning') {
        notification.classList.add('bg-dark', 'text-warning');
        iconSymbol = 'warning';
    }

    if (type === 'info') {
        notification.classList.add('bg-info', 'text-light');
        iconSymbol = 'info';
    }

    if (type === 'primary') {
        notification.classList.add('bg-primary', 'text-light');
    }

    if (type === undefined || type === null) {
        notification.classList.add('bg-dark', 'text-light');
    }

    const toast = document.createElement('div');
    toast.classList.add('d-flex');

    const toastBody = document.createElement('div');
    toastBody.classList.add('toast-body', 'd-flex');

    // Add icon to notification
    const icon = document.createElement('i');
    icon.classList.add('material-symbols-outlined', 'align-center', 'm-auto', 'align-top', 'fs-2');
    icon.innerHTML = iconSymbol;
    toastBody.appendChild(icon);

    // Add message to notification in a span
    const span = document.createElement('span');
    span.classList.add('m-3', 'align-middle', 'fs-6');
    span.innerHTML = message;
    toastBody.appendChild(span);

    const closeBtn = document.createElement('button');
    closeBtn.classList.add('btn-close', 'btn-close-white', 'me-2', 'm-auto');
    closeBtn.setAttribute('data-bs-dismiss', 'toast');
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', function (event) {
        event.preventDefault();  // Prevent the default action
    });

    toast.appendChild(toastBody);
    toast.appendChild(closeBtn);
    notification.appendChild(toast);

    document.getElementById('toastContainer').appendChild(notification);

    // Insert notification before the main-form id object
    // document.getElementById('main-form').insertBefore(notification, document.getElementById('main-form').firstChild);

    return notification.id;
}

function notify(name) {
    const notification = document.getElementById(name);
    if (notification) {
        const bootstrapNotification = bootstrap.Toast.getOrCreateInstance(notification);
        bootstrapNotification.show();
    }
}

window.buildNotification = buildNotification;
window.notify = notify;