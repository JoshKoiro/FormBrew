function createSidebar() {
    console.log('executing sidebar creation...')
    const formConfig = window.formConfig;
    const sidebarContent = document.getElementById('sidebar-content');

    for (const group of formConfig.groups) {
        // create link
        const link = document.createElement('a');
        link.classList.add('list-group-item', 'list-group-item-action', 'ripple', 'pl-0', 'pt-2', 'pb-2');
        link.href = `#${window.getVariableName(group.heading)}`;
        
        // set icon if it exists
        const icon = document.createElement('i');
        if (group.icon) {
            icon.classList.add('material-symbols-outlined', 'align-center', 'm-auto', 'align-top', 'fs-4');
            icon.innerHTML = group.icon;
        }
        // create span
        const span = document.createElement('span');
        span.classList.add('align-middle', 'ml-2');
        span.textContent = ' ' + group.heading;
        // append items together
        link.appendChild(icon);
        link.appendChild(span);
        // append to sidebar
        sidebarContent.appendChild(link);
        
    }
}

window.createSidebar = createSidebar;