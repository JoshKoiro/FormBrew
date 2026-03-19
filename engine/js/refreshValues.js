function getVariableName(category) {
    return category.toLowerCase().replace(/\s+/g, '_');
}

function getDisplayName(category) {
    const form = document.querySelector('form');
    let note = false;
    if (form) {
        const labels = form.querySelectorAll('label');
        // Check if the category ends in with _notes
        if (category.endsWith('_notes')) {
            // Remove the _notes from the category
            category = category.replace('_notes', '');
            note = true;
        }
        for (const label of labels) {
            if (label.htmlFor === getVariableName(category)) {
                // remove the astrisk from the display name
                label.textContent = label.textContent.replace(/\*/g, '');
                if (note) {
                    return label.textContent + ' (Notes)';
                } else {
                    return label.textContent
                }
            }
        }
        return category;
    }
}

function createGlobalVariables(data) {
    const selectionsNamespace = window.selections || {};
    const processedNames = {};

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            let variableName = getVariableName(key);
            if (processedNames[variableName]) {
                processedNames[variableName]++;
                variableName += `_${processedNames[variableName]}`;
            } else {
                processedNames[variableName] = 1;
            }

            if (data[key] === 'true') {
                selectionsNamespace[variableName] = 'on';
            } else {
                selectionsNamespace[variableName] = data[key];
            }

            // if any values that are in the window.selections object are not in the data object, remove them from the window.selections object
            Object.keys(window.selections).forEach((key) => {
                if (!data.hasOwnProperty(key)) {
                    delete window.selections[key];
                }
            })

        }
    }
    window.selections = selectionsNamespace;
    if (data) {
        console.log('Updated Global Variables - available at window.selections & window.itemDescriptions');
    } else {
        console.log('Created Global Variables - available at window.selections & window.itemDescriptions');
    }
}

function refreshGlobalVariables() {
    const form = document.querySelector('form');
    if (form) {
        const formData = new FormData(form);
        const dataObj = {};
        let formLength = form.length;
        
        for(let i = 0; i < formLength; i++) {
            // Handle regular form inputs
            if(form[i].type === 'checkbox' && form[i].checked) {
                dataObj[form[i].name] = 'on';
            } else if(form[i].type === 'checkbox' && !form[i].checked) {
                delete dataObj[form[i].name];
            } else {
                dataObj[form[i].name] = form[i].value;
            }

            // Handle option checkboxes for dropdowns
            if(form[i].name.includes('_opt_') && form[i].checked) {
                dataObj[form[i].name] = 'on';
            }
        }
        
        createGlobalVariables(dataObj);
    }
}

function showNotes() {
    // loop through all the elements of the web form. If the element has an id that ends in _notes and there are
    // notes in the text area inside it, then add the class 'show' to the element if it doesn't already have it.
    const form = document.querySelector('form');
    if (form) {
        const elements = form.querySelectorAll('[id$="_notes_container"]');
        elements.forEach(element => {
            const notesTextarea = element.querySelector('textarea');
            if (notesTextarea) {
                if (notesTextarea.value) {
                    element.classList.add('show');

                }
            }
        });
        // loop through all the elements in the form and find the buttons that have a data-bs-target ottribute that ends
        // with _notes. remove the class collapsed from the element and set teh aria-expanded attribute to true
        const buttons = form.querySelectorAll('[data-bs-target$="_notes_container"]');
        buttons.forEach(button => {
            const target = button.getAttribute('data-bs-target');
            const content = document.querySelector(target);
            if (content) {
                content.classList.remove('collapsed');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    }
}

window.createGlobalVariables = createGlobalVariables;
window.refreshGlobalVariables = refreshGlobalVariables;
window.getVariableName = getVariableName;
window.showNotes = showNotes;
window.getDisplayName = getDisplayName;
