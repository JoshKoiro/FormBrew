function buildForm(initialData = {}) {
    // load version from version.js
    const version = document.getElementById('version');
    version.innerHTML = 'v' + window.version;
    createForm(window.formConfig, initialData);
}

window.buildForm = buildForm;

function loadVersionjson() {
    // load version.json file

    const version = document.getElementById('version');
    version.innerHTML = window.version;
}

function formatPhoneNumbers() {
    console.log('formatPhoneNumbers called');
    // Set the placeholder for input fields
    var inputs = document.querySelectorAll('input[type="phone"]');
    inputs.forEach(function(input) {
        input.setAttribute('placeholder', '(___) ___-____');
    });

    // Add event listener for input fields with type="phone"
    var phoneInputs = document.querySelectorAll('input[type="phone"]');
    phoneInputs.forEach(function(phoneInput) {
        phoneInput.addEventListener('input', function() {
            var number = this.value.replace(/[^\d]/g, '');

            if (number.length == 7) {
                number = number.replace(/(\d{3})(\d{4})/, "$1-$2");
            } else if (number.length == 10) {
                number = number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
            }

            this.value = number;

            // Set maxLength attribute for all text inputs
            inputs.forEach(function(input) {
                input.setAttribute('maxLength', 10);
            });
        });
    });
}

window.formatPhoneNumbers = formatPhoneNumbers;

function createForm(config, initialData = {}) {
    const form = document.createElement('form');
    form.id = 'main-form';
    form.classList.add('needs-validation', 'form-floating');
    form.noValidate = true;

    // Main Loop through each group in the formConfig.js
    config.groups.forEach(group => {

        // Create the card header
        const cardHeader = createHeading(group.heading);
        const cardBody = createCardBody(group.heading);

        // Loop through each field in the group
        group.categories.forEach(field => {
            const row = document.createElement('div');
            row.classList.add('row', 'mb-2', 'justify-content-center', 'ml-lg-1', 'mr-lg-1');
            
            // Help button with adjusted classes
            let helpButton = createHelpButton(field);
            helpButton.classList.add('col-auto', 'px-2');
            row.appendChild(helpButton);
        
            // Create a form group to contain the field content (input, label and notes)
            const formGroup = document.createElement('div');
            formGroup.classList.add('col-auto', 'flex-grow-1');
            
            let floatingLabel = document.createElement('div');
            floatingLabel.classList.add('form-floating');
        
            let input;
        
            if (field.type === 'checkbox') {
                input = createInput(field, initialData[field.category] || false);
            } else {
                input = createInput(field, initialData[field.category] || '');
            }
        
            // Create the input and append it to the form group
            floatingLabel.appendChild(input);
        
            // Add notes button and field with adjusted classes
            let fieldNotes = createNotesField(field.category, initialData);
            fieldNotes.classList.add('col-auto', 'px-2');
        
            formGroup.appendChild(floatingLabel);
            row.appendChild(formGroup);
            row.appendChild(fieldNotes);
        
            cardBody.appendChild(row);
        });
        cardHeader.appendChild(cardBody);
        form.appendChild(cardHeader);
    });

    formContainer.innerHTML = '';
    formContainer.appendChild(form);

    // Enable popovers for help buttons
var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})

}

function createHeading(heading) {
    const card = document.createElement('div');
    card.classList.add('card', 'row' ,'m-5', 'shadow');
    const cardHeader = document.createElement('h5');
    cardHeader.classList.add('card-header');
    cardHeader.textContent = heading;
    cardHeader.id = `${window.getVariableName(heading)}`
    card.appendChild(cardHeader);
    return card;
}

function createCardBody(heading) {
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    return cardBody
}

function createNotesField(category, initialData) {
    const fieldNotes = document.createElement('div');
    fieldNotes.classList.add( 'row', 'align-items-start', 'align-self-start', 'col-lg-4','mb-3', 'mt-2');
    const notesButton = document.createElement('button');
    notesButton.classList.add('btn', 'note-button', 'btn-outline-dark', 'col-lg-6');
    notesButton.setAttribute('type', 'button');
    notesButton.setAttribute('data-bs-toggle', 'collapse', 'align-items-center');
    notesButton.setAttribute('data-bs-target', `#${window.getVariableName(category)}_notes_container`);
    notesButton.setAttribute('aria-expanded', 'false');
    notesButton.setAttribute('aria-controls', 'collapseNotes');
    // Added this to fix #78 allowing user to quickly tab between fields
    notesButton.setAttribute('tabindex', '-1');
    notesButton.textContent = 'Add Note';

    const notesContent = document.createElement('div');
    notesContent.classList.add('collapse');
    notesContent.setAttribute('id', `${window.getVariableName(category)}_notes_container`);

    const textAreaContainer = document.createElement('div');
    textAreaContainer.classList.add('col-12');
    const notesTextarea = document.createElement('textarea');
    notesTextarea.classList.add('form-control', 'row', 'mt-4');
    notesTextarea.name = `${window.getVariableName(category)}_notes`;
    notesTextarea.id = `${window.getVariableName(category)}_notes`;
    notesTextarea.value = initialData[`${window.getVariableName(category)}_notes`] || '';
    notesTextarea.placeholder = 'Notes';
    textAreaContainer.appendChild(notesTextarea);
    notesContent.appendChild(textAreaContainer);

    fieldNotes.appendChild(notesButton);
    fieldNotes.appendChild(notesContent);
    return fieldNotes;

}

function createLabel(text, required) {
    const label = document.createElement('label');
    label.textContent = text;
    // make label have for attribute of category
    const forName = window.getVariableName(text);
    label.for = forName;
    label.htmlFor = forName;
    // make label have placeholder
    // label.setAttribute('placeholder', text);
    if (required) {
        label.innerHTML += '<span style="color: red;">*</span>';
    }
    return label;
}

function createInput(field, value) {
    let mainContainer = document.createElement('div');
    mainContainer.classList.add('w-100');

    // Create top row container with flexbox
    const topRow = document.createElement('div');
    if(field.type === 'checkbox') {
        topRow.classList.add('d-flex', 'align-items-start', 'justify-content-between', 'w-100', 'gap-3', 'mt-2');
    } else {
        topRow.classList.add('d-flex', 'align-items-start', 'w-100', 'gap-3');
    }

    // Create wrapper for input
    const inputWrapper = document.createElement('div');
    inputWrapper.classList.add('flex-grow-1', 'form-floating');

    let input;

    // Special handling for checkbox type
    if (field.type === 'checkbox') {
        input = createCheckbox(field, value);
        if (field.optional) {
            // Add option checkbox after the main checkbox
            const optionCheckbox = createOptionCheckbox(field, 'checkbox');
            if (optionCheckbox) {
                optionCheckbox.classList.add('ml-4');
                topRow.appendChild(input);
                topRow.appendChild(optionCheckbox);
                mainContainer.appendChild(topRow);
                return mainContainer;
            }
        }
        topRow.appendChild(input);
        mainContainer.appendChild(topRow);
        return mainContainer;
    }

    // Handle other input types
    switch (field.type) {
        case 'text':
        case 'phone':
        case 'date':
        case 'number':
            input = document.createElement('input');
            input.type = field.type;
            input.name = window.getVariableName(field.category);
            input.id = window.getVariableName(field.category);
            input.value = value;
            input.required = field.required;
            input.classList.add('form-control');
            input.placeholder = field.category;
            break;
        case 'textarea':
            input = document.createElement('textarea');
            input.name = window.getVariableName(field.category);
            input.id = window.getVariableName(field.category);
            input.value = value;
            input.required = field.required;
            input.classList.add('form-control');
            input.style.height = '200px';
            input.placeholder = field.category;
            break;
        case 'dropdown':
            input = document.createElement('select');
            input.id = window.getVariableName(field.category);
            input.name = window.getVariableName(field.category);
            input.required = field.required;
            input.classList.add('form-control', 'form-select');
            input.setAttribute('aria-label', 'Floating label select example');
            const blankOption = document.createElement('option');
            blankOption.value = '';
            blankOption.textContent = '';
            blankOption.style.display = 'none';
            input.appendChild(blankOption);
            field.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                if (option === value) {
                    optionElement.selected = true;
                }
                input.appendChild(optionElement);
            });
            break;
    }

    // Create and append the label
    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.textContent = field.category;
    if (field.required) {
        label.innerHTML += '<span style="color: red;">*</span>';
    }

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(label);
    topRow.appendChild(inputWrapper);
    mainContainer.appendChild(topRow);

    // Add Option checkbox for optional fields
    if (field.optional) {
        const optionCheckbox = createOptionCheckbox(field);
        if (optionCheckbox) {
            optionCheckbox.classList.add('ms-4', 'mt-3');
            mainContainer.appendChild(optionCheckbox);
            
            // For dropdowns, handle the options list
            if (field.type === 'dropdown') {
                const optionsList = createOptionsList(field);
                optionsList.classList.add('d-none', 'mt-3', 'w-100');
                mainContainer.appendChild(optionsList);
                
                optionCheckbox.querySelector('input').addEventListener('change', (e) => {
                    const fieldName = window.getVariableName(field.category);
                    if (e.target.checked) {
                        window.selections[`${fieldName}_option`] = 'on';
                        optionsList.classList.remove('d-none');
                    } else {
                        optionsList.classList.add('d-none');
                        delete window.selections[`${fieldName}_option`];
                        optionsList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                            const optionValue = cb.value;
                            cb.checked = false;
                            delete window.selections[`${fieldName}_opt_${window.getVariableName(optionValue)}`];
                        });
                    }
                    window.refreshGlobalVariables();
                    window.updateDescriptions();
                });
            }
        }
    }

    return mainContainer;
}

function createCheckbox(field, value) {
    const container = document.createElement('div');
    container.classList.add('form-check');

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = window.getVariableName(field.category);
    input.id = window.getVariableName(field.category);
    input.checked = (value === 'on') ? true : false;
    input.classList.add('form-check-input');
    const label = document.createElement('label');
    label.classList.add('form-check-label');
    label.htmlFor = window.getVariableName(field.category);
    label.textContent = field.category;

    container.appendChild(input);
    container.appendChild(label);

    return container;
}

function createHelpButton(field) {
    const helpButton = document.createElement('button');
    const helpIcon = document.createElement('i');
    helpButton.classList.add('btn', 'help-btn','align-right', 'col-lg-1','pl-1', 'fs-4');
    helpButton.setAttribute('type', 'button');
    helpIcon.classList.add('material-symbols-outlined');
    helpIcon.textContent = 'contact_support';
    helpButton.setAttribute('type', 'button');
    helpButton.setAttribute('id', `${window.getVariableName(field.category)}_helpBtn`);
    // Added this to fix #78 allowing user to quickly tab between fields
    helpButton.setAttribute('tabindex', '-1');
    if(field.description !== '') {
        
        // make the field.description appear as a tooltip when the help button is hovered over
        helpButton.setAttribute('data-bs-toggle', 'popover');
        helpButton.setAttribute('title', field.category);
        helpButton.setAttribute('data-bs-content', field.description);
        helpButton.setAttribute('data-bs-placement', 'left');
        helpButton.setAttribute('data-bs-trigger', 'hover');
        helpButton.appendChild(helpIcon);

    }
    return helpButton;
}

function createOptionCheckbox(field, type = 'dropdown') {
    if (!field.optional) return null;
    
    const container = document.createElement('div');
    if (type === 'dropdown') {
        container.classList.add('form-check', 'ms-2');
    }
    if (type === 'checkbox') {
    container.classList.add('form-check');
    }
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = `${window.getVariableName(field.category)}_option`;
    input.id = `${window.getVariableName(field.category)}_option`;
    input.classList.add('form-check-input');
    
    const label = document.createElement('label');
    label.classList.add('form-check-label');
    label.htmlFor = `${window.getVariableName(field.category)}_option`;
    label.textContent = 'Option';
    
    container.appendChild(input);
    container.appendChild(label);
    
    return container;
}

function createOptionsList(field) {
    const container = document.createElement('div');
    container.classList.add('options-list', 'ps-4'); // Add padding-start
    container.id = `${window.getVariableName(field.category)}_options_list`;
    
    if (field.type === 'dropdown') {
        // Add a header for the options
        const header = document.createElement('div');
        header.classList.add('fw-bold', 'mb-2');
        header.textContent = 'Available Options:';
        container.appendChild(header);

        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('ms-2'); // Add margin-start to indent options

        field.options.forEach(option => {
            const optionContainer = document.createElement('div');
            optionContainer.classList.add('form-check', 'mb-2');
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            const optionFieldName = `${window.getVariableName(field.category)}_opt_${window.getVariableName(option)}`;
            input.name = optionFieldName;
            input.id = optionFieldName;
            input.value = option;
            input.classList.add('form-check-input');
            
            // Add change event listener for option checkboxes
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    window.selections[optionFieldName] = 'on';
                } else {
                    delete window.selections[optionFieldName];
                }
                // Update descriptions
                window.refreshGlobalVariables();
                window.updateDescriptions();
            });
            
            const label = document.createElement('label');
            label.classList.add('form-check-label');
            label.htmlFor = input.id;
            label.textContent = option;
            
            optionContainer.appendChild(input);
            optionContainer.appendChild(label);
            optionsContainer.appendChild(optionContainer);
        });

        container.appendChild(optionsContainer);
    }
    
    return container;
}
function checkValidation(event) {
    const form = event.target;
    if (validateForm(form) === false) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
    return true;
}

window.checkValidation = checkValidation;

function validateForm(form) {
    if(form.checkValidity() === false) {
        form.classList.add('was-validated');
        return false;
    }
    return true;
}

function handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    const form = event.target;
    if (validateForm() === false) {
        return;
    }

    const formData = new FormData(form);
    const dataObj = {};
    formData.forEach((value, key) => {
        dataObj[key] = value;
    });

    // Create global variables
    window.createGlobalVariables(dataObj);
    window.showNotes();

    
}

const exportButton = document.getElementById('exportButton');
exportButton.addEventListener('click', () => {
    const form = document.querySelector('form');

    // check validation of the form before exporting
    const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
        if(checkValidation(event) === false) {
            return;
        }

    if (form) {
        console.log('Export button clicked, triggering form submission');
        
        
        const formData = new FormData(form);
        const dataObj = {};
        formData.forEach((value, key) => {
            dataObj[key] = value;
            });

        // Call the function to generate PDF from pdfGenerator.js
        window.generatePDF(window.selections);
    }
});

const saveButton = document.getElementById('saveButton');
saveButton.addEventListener('click', window.saveForm);

const importButton = document.getElementById('importButton');
importButton.addEventListener('click', handleImport);

function handleImport() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);
        createForm(window.formConfig, data);
    };

    if (file) {
        reader.readAsText(file);
    }
}
