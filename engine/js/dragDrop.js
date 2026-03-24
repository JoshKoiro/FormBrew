// dragDrop.js

let dragCounter = 0;

function handleDragEnter(event) {
    event.preventDefault();
    dragCounter++;
    updateDragFeedback();
}

function handleDragLeave(event) {
    event.preventDefault();
    dragCounter--;
    updateDragFeedback();
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
}

function updateDragFeedback() {
    if (dragCounter > 0) {
        document.body.classList.add('dragover');
    } else {
        document.body.classList.remove('dragover');
    }
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    dragCounter = 0;
    updateDragFeedback();
    
    const file = event.dataTransfer.files[0];
    if (file) {
        if (file.name.endsWith('.checklist')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = JSON.parse(event.target.result);
                    window.processFileData(data);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    window.buildNotification('import_error', 'Error parsing file. Please ensure it\'s a valid .checklist file.', 'error');
                    window.notify('import_error');
                }
            };
            reader.onerror = function(event) {
                console.error('Error reading file:', event.target.error);
                window.buildNotification('import_error', 'Error reading file. Please try again.', 'error');
                window.notify('import_error');
            };
            reader.readAsText(file);
        } else {
            console.error('Invalid file type. Only .checklist files are allowed.');
            window.buildNotification('import_error', 'Invalid file type. Only .checklist files are allowed.', 'error');
            window.notify('import_error');
        }
    }
}

function initDragDrop() {
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
}

// Export the initialization function
window.initDragDrop = initDragDrop;

// Call initDragDrop immediately
initDragDrop();