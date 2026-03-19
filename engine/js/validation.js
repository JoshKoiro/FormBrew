function validateLineItems() {
    const form = document.querySelector('form');
    const event = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    
    if(window.checkValidation(event) === false) {
        let missingFields = 0;
        let missingFieldsList = [];
        
        for (const group of window.formConfig.groups) {
            for (const field of group.categories) {
                if (field.required) {
                    let fieldValue = window.selections[`${window.getVariableName(field.category)}`];
                    if (fieldValue === undefined || fieldValue === '') {
                        missingFields++;
                        missingFieldsList.push('<br>- ' + field.category);
                    }
                }
                
                // Check dropdown options validation
                if (field.type === 'dropdown' && field.optional) {
                    const optionCheckbox = document.getElementById(`${window.getVariableName(field.category)}_option`);
                    if (optionCheckbox && optionCheckbox.checked) {
                        // If options are enabled, verify base selection exists
                        const baseSelection = window.selections[window.getVariableName(field.category)];
                        if (!baseSelection) {
                            missingFields++;
                            missingFieldsList.push('<br>- Base selection required for ' + field.category + ' when options are selected');
                        }
                    }
                }
            }
        }
        
        if (missingFields > 0) {
            let listFields = missingFieldsList.join('\n');
            window.buildNotification('missing_fields', missingFields + ' missing required field(s):<br>' + listFields, 'error');
            window.notify('missing_fields');
            return false;
        }
    }
    return true;
}

function checkSave() {
    if (!window.lastSave || !window.lastSave.data) {
        return false;
    }

    // Parse the last saved data
    const lastSaved = JSON.parse(window.lastSave.data);
    
    // Create current data in same format as saved data
    const currentData = {
        metadata: window.metadata || {},
        selections: window.selections
    };
    
    // Compare stringified versions
    return JSON.stringify(lastSaved) === JSON.stringify(currentData);
}

function unsavedWarning() {
    window.buildNotification('unsaved_changes', 'Unsaved changes', 'warning');
    window.notify('unsaved_changes');
}

window.validateLineItems = validateLineItems;
window.checkSave = checkSave;
window.unsavedWarning = unsavedWarning;