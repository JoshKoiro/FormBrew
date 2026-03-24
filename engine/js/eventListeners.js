function assignEventListeners() {
    window.addEventListener('DOMContentLoaded', () => {
        window.buildForm();
        window.createSidebar();
        console.log('Form loaded');
        window.createGlobalVariables();
        assignButtons();

        // Initialize all registered plugins
        window.initializePlugins();

        window.formatPhoneNumbers();
        window.initializeFormConfig();
        window.applyConditions();

        // check version
        if (window.checkVersion) {
            window.checkVersion();
        }

        // Event listener to check for unsaved changes
        window.addEventListener('beforeunload', (event) => {
            if (!window.checkSave()) {
                const message = 'You have unsaved changes. Are you sure you want to leave?';
                event.returnValue = message;
                return message;
            }
        });

        document.querySelector('form').addEventListener('change', () => {
            window.refreshGlobalVariables();
            window.updateDescriptions();
            window.showNotes();
            window.formatPhoneNumbers();
            window.applyConditions();
            window.refreshGlobalVariables();
            window.updateDescriptions();
        });
    });
}

function assignButtons() {
    const saveButton = document.getElementById('saveButton');
    const importButton = document.getElementById('importButton');
    const fileInput = document.getElementById('importFile');
    const themeToggleBtn = document.getElementById('themeToggle');

    if (fileInput) {
        fileInput.addEventListener('change', window.loadForm);
    }

    if (importButton && fileInput) {
        importButton.addEventListener('click', () => {
            fileInput.setAttribute('accept', '.checklist');
            fileInput.click();
        });
    }

    if (saveButton) {
        saveButton.addEventListener('click', window.saveForm);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', window.toggleTheme);
    }

    // Wire up optional product-provided buttons
    const sendEmailBtn = document.getElementById('sendEmail');
    if (sendEmailBtn && window.sendEmail) {
        sendEmailBtn.addEventListener('click', window.sendEmail);
    }

    console.log('Buttons assigned');
}

window.assignEventListeners = assignEventListeners;

// Apply saved theme immediately (before DOMContentLoaded) so there's no flash.
// productConfig must be loaded before this script for logo paths to work.
const savedTheme = localStorage.getItem('theme') || 'light';
window.setTheme(savedTheme);

assignEventListeners();