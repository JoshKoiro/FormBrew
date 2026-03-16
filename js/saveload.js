function saveForm() {
    console.log('saveForm running')

    // Create the new file structure with metadata
    const fileData = {
        metadata: window.metadata || {},  // Use existing metadata or empty object
        selections: window.selections  // Current selections go into selections object
    };

    // check if there is a timeCreated key in the metadata object
    if (!window.metadata.timeCreated) {
        // if there is, add the current date and time to the metadata object
        fileData.metadata.timeCreated = new Date();
    } else {
        fileData.metadata.lastEdited = new Date();
    }

    // sum up the editing time
    let editingEnd = new Date();
    let editingStart = new Date(window.editingStart);
    let sessionDuration = editingEnd - editingStart;
    if(fileData.metadata.editingTime) {
        fileData.metadata.editingTime += sessionDuration;
    } else {
        fileData.metadata.editingTime = sessionDuration;
    }


    const jsonData = JSON.stringify(fileData, null, 2);
    window.lastSave = {
        data: jsonData,
        date: new Date()
    };
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const quoteNumber = window.selections.quote_number;
    a.href = url;
    a.download = quoteNumber + '.checklist';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // generate the pdf automatically after saving
    window.generatePDF(window.selections, true);
}

function processFileData(data) {
    // Handle both old and new format
    // If data has a selections property, use that, otherwise use the whole data object
    const selections = data.selections || data;
    
    // Store metadata in window.metadata if it exists, otherwise initialize empty object
    window.metadata = data.metadata || {};
    
    console.log('Loaded selections:', selections);
    console.log('Loaded metadata:', window.metadata);
    
    populateForm(selections);
    window.refreshGlobalVariables();
    window.updateDescriptions();
    window.showNotes();
    window.formatPhoneNumbers();
    window.applyConditions();
    // Repeat these functions after applying the condition to fix error with variables not refreshing
    window.refreshGlobalVariables();
    window.updateDescriptions();
    window.lastSave = {
        data: JSON.stringify({
            metadata: window.metadata,
            selections: window.selections
        }, null, 2),
        date: new Date()
    };
}

function loadForm(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const data = JSON.parse(event.target.result);
            processFileData(data);
        };
        reader.readAsText(file);
    }
}

function populateForm(data) {
    const notLoaded = []; // Initialize an empty array to store keys without matching form fields

    // Clear all form fields
    const form = document.querySelector('form');
    form.reset();
    
    // Process options first to ensure they're visible
    Object.keys(data).forEach(key => {
        if (key.endsWith('_option') && data[key] === 'on') {
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                element.checked = true;
                // Show options list
                const optionsList = document.getElementById(`${key.replace('_option', '')}_options_list`);
                if (optionsList) {
                    optionsList.classList.remove('d-none');
                }
            }
        }
    });

    // Now process all form fields including individual options
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = (data[key] === 'on') ? true : false;
                } else {
                    element.value = data[key];
                }
            } else {
                notLoaded.push({"key": key, "value": data[key]}); // If no matching form field is found, add the key to the notLoaded array
            }
        }
    }

    console.log('not loaded fields: ', notLoaded);
    let message = '';
    if(notLoaded.length > 1) {
        message = notLoaded.filter(field => field.key != '').map(field => {
            return field.key + ': ' + field.value + '\n';
        }).join('');
        console.log('message' + message);
        window.buildNotification(`"keys_not_found"`, "fields in checklist not found in form: \n" + message, 'warning');
        window.notify(`"keys_not_found"`);      
    } else {
        window.buildNotification('import_checklist', 'Checklist successfully imported', 'success');
        window.notify('import_checklist');
    }
}

// Initialize window.metadata if it doesn't exist
if (!window.metadata) {
    window.metadata = {};
}

// start the editing timer
window.editingStart = new Date();

window.loadForm = loadForm;
window.saveForm = saveForm;
window.processFileData = processFileData;