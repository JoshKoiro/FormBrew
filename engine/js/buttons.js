function assignButtons() {
    const saveButton = document.getElementById('saveButton');
    const importButton = document.getElementById('importButton');

    saveButton.addEventListener('click', window.saveForm);
    importButton.addEventListener('click', window.loadForm);
    console.log('Buttons assigned');
}

window.assignButtons = assignButtons;