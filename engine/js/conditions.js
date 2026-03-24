let originalFormConfig;

function initializeFormConfig() {
    originalFormConfig = JSON.parse(JSON.stringify(window.formConfig));
}

function resetFormToOriginalState() {
    const form = document.querySelector('form');
    originalFormConfig.groups.forEach(group => {
        group.categories.forEach(category => {
            const element = form.querySelector(`[name="${window.getVariableName(category.category)}"]`);
            if (element && element.tagName === 'SELECT') {
                let currentValue = element.value;
                
                // Remove all options except the currently selected one
                Array.from(element.options).forEach(option => {
                    element.removeChild(option);
                });

                // Add back original options
                category.options.forEach(option => {
                    const optionElement = document.createElement('option');
                        optionElement.value = option;
                        optionElement.textContent = option;
                        element.appendChild(optionElement);
                });

                // Enable the element
                element.disabled = false;
                element.value = currentValue;
            }
        });
    });
}

function applyConditions() {
    // Reset the form to its original state while preserving selections
    resetFormToOriginalState();

    const conditions = window.formConfig.conditions;
    const form = document.querySelector('form');

    conditions.forEach(condition => {
        let conditionMet = condition.if.every(ifCondition => {
            const element = form.querySelector(`[name="${window.getVariableName(ifCondition.category)}"]`);
            return element && ifCondition.values.includes(element.value);
        });

        if (conditionMet) {
            condition.then.forEach(thenAction => {
                if (thenAction.type === 'removes') {
                    const variableName = window.getVariableName(thenAction.category);
                    const targetElement = form.querySelector(`[name="${variableName}"]`);
                    if (targetElement) {
                        if (thenAction.applyToWholeCategory) {
                            // TODO: This field should be hidden from the user.
                            targetElement.disabled = true;
                            targetElement.value = '';
                        } else {
                            targetElement.value = window.selections[variableName];
                            Array.from(targetElement.options).forEach(option => {
                                if (thenAction.values.includes(option.value)) {
                                    targetElement.removeChild(option);
                                }
                            });
                        }
                    }
                }
            });
        }
    });

    // loop through all the elements of the web form, and if there are any SELECT elements that have only one option, then disable them.
    const elements = form.querySelectorAll('select');
    elements.forEach(element => {
        if (element.options.length === 1 && element.value !== '') {
            window.selections[window.getVariableName(element.name)] = element.value;
            element.disabled = true;
        }
    });
}

window.applyConditions = applyConditions;
window.initializeFormConfig = initializeFormConfig;