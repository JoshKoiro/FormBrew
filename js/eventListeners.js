function assignEventListeners() {
    window.addEventListener('DOMContentLoaded', () => {
        window.buildForm();
        window.createSidebar();
        console.log('Form loaded');
        window.createGlobalVariables();
        assignButtons();

        // Initialize all registered plugins (runs init hooks and creates buttons)
        window.initializePlugins();

        window.formatPhoneNumbers();
        window.initializeFormConfig();
        window.applyConditions();

        // check version
        window.checkVersion();

        window.addEventListener('beforeunload', (event) => {
            if(!window.checkSave()) {
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
    const sendEmailBtn = document.getElementById('sendEmail');

    fileInput.addEventListener('change', window.loadForm);
    importButton.addEventListener('click', () => {
        fileInput.setAttribute('accept', '.checklist');
        fileInput.click();
    });
    saveButton.addEventListener('click', window.saveForm);
    console.log('Buttons assigned');
    sendEmailBtn.addEventListener('click', window.sendEmail);
    themeToggleBtn.addEventListener('click', window.toggleTheme);
}

window.assignEventListeners = assignEventListeners;

const savedTheme = localStorage.getItem('theme') || 'light';
window.setTheme(savedTheme);

assignEventListeners();