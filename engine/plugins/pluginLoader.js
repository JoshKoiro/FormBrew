/**
 * Plugin Loader
 * 
 * Provides a registry for plugins to self-register. Each plugin calls
 * window.registerPlugin() with a plugin definition object. On
 * DOMContentLoaded, the event listener code calls window.initializePlugins()
 * which runs init hooks (for all plugins) and creates buttons (for UI plugins).
 * 
 * Plugin Definition Schema:
 * {
 *   id:       string   - unique identifier (used as button element id for UI plugins)
 *   label:    string   - (optional) button display text — omit for headless/data plugins
 *   btnClass: string   - (optional) Bootstrap button class (e.g. 'btn-outline-dark')
 *   order:    number   - (optional) sort order — lower = initialized first / higher in sidebar
 *   execute:  function - (optional) called when button is clicked — required if label is set
 *   init:     function - (optional) called once during initializePlugins()
 * }
 * 
 * Two plugin types:
 *   - UI Plugin:       has label + execute → gets a sidebar button
 *   - Headless Plugin: no label            → runs init() only, no button created
 */

(function () {
    const pluginRegistry = [];

    /**
     * Register a plugin. Called by each plugin script at load time.
     */
    function registerPlugin(pluginDef) {
        if (!pluginDef.id) {
            console.error('Plugin registration failed — missing required "id":', pluginDef);
            return;
        }
        // If a label is provided, execute is required
        if (pluginDef.label && !pluginDef.execute) {
            console.error('Plugin registration failed — UI plugins require "execute":', pluginDef);
            return;
        }
        pluginRegistry.push(pluginDef);
        console.log(`Plugin registered: ${pluginDef.id}`);
    }

    /**
     * Initialize all registered plugins. Called once after the form is built
     * and core buttons are assigned.
     * 
     * For each plugin:
     *   1. Calls init() if provided (all plugin types)
     *   2. For UI plugins (those with a label): creates a <li> with a <button>
     *      in the sidebar and attaches the execute() click handler
     */
    function initializePlugins() {
        // Get the sidebar button list (needed for UI plugins)
        const sidebarButtonList = document.querySelector('#sidebar-buttons .navbar-nav');

        // Find the insertion reference point — insert plugin buttons before
        // the "Export to PDF" button so they appear in the same area as before
        let referenceNode = null;
        if (sidebarButtonList) {
            const exportPdfButton = document.getElementById('exportButton');
            if (exportPdfButton) {
                referenceNode = exportPdfButton.closest('li');
            }
        }

        // Sort plugins by order (lower first), then by registration order
        const sorted = [...pluginRegistry].sort((a, b) => {
            const orderA = typeof a.order === 'number' ? a.order : 100;
            const orderB = typeof b.order === 'number' ? b.order : 100;
            return orderA - orderB;
        });

        sorted.forEach(plugin => {
            // 1. Run init() for ALL plugin types (headless and UI)
            if (typeof plugin.init === 'function') {
                plugin.init();
            }

            // 2. Create sidebar button only for UI plugins (those with a label)
            if (plugin.label && sidebarButtonList) {
                const li = document.createElement('li');
                li.className = 'nav-item p-1';
                li.setAttribute('data-plugin-id', plugin.id);

                const btn = document.createElement('button');
                btn.id = plugin.id;
                btn.className = `btn ${plugin.btnClass || 'btn-outline-dark'} g-2`;
                btn.textContent = plugin.label;

                btn.addEventListener('click', function () {
                    plugin.execute();
                });

                li.appendChild(btn);

                if (referenceNode) {
                    sidebarButtonList.insertBefore(li, referenceNode);
                } else {
                    sidebarButtonList.appendChild(li);
                }
            }

            console.log(`Plugin initialized: ${plugin.id}${plugin.label ? ' (UI)' : ' (headless)'}`);
        });
    }

    // Expose to global scope
    window.registerPlugin = registerPlugin;
    window.initializePlugins = initializePlugins;
})();