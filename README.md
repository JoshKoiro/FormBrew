<img src="./assets/logo.png">

# FormBrew

FormBrew ☕ is an open-source, client-side form engine for building product configurators. It renders dynamic forms from a JSON configuration, supports conditional field logic, save/load to file, PDF export, dark mode, and a plugin system for extending functionality.

FormBrew is designed to be **forked**. The engine handles form rendering, validation, persistence, and the UI framework. You bring the product-specific configuration, descriptions, export logic, and branding. The directory structure enforces a clean boundary between the two, so your product fork can pull engine updates from upstream without merge conflicts touching your product files.

## Quick Start

```bash
git clone https://github.com/YourOrg/formbrew.git
cd formbrew
```

Open `index.html` in a browser. You'll see a working example form demonstrating every supported field type, conditional logic, and optional/required field behavior. Save, load, PDF export, and theme toggle all work out of the box.

To compile everything into a single distributable HTML file:

```bash
npm run compile
```

The output lands in `dist/`.

## Creating a Product Line (Forking)

Every product configurator starts as a fork of this repo. The fork inherits the engine and replaces the example product files with real ones.

### 1. Fork and clone

Fork this repository on GitHub, then clone your fork:

```bash
git clone git@github.com:YourOrg/my-product-configurator.git
cd my-product-configurator
git remote add upstream git@github.com:YourOrg/formbrew.git
```

The `upstream` remote lets you pull engine updates later.

### 2. Replace the example product files

The directories you'll modify are `config/`, `plugins/`, `product/`, and `assets/`. Each is explained in the Project Structure section below. At a minimum, you need to:

- Replace `config/formConfig.js` with your product's form definition
- Replace `product/config.js` with your product's branding (title, logo paths, help URL)
- Replace `product/init.js` if you need custom initialization behavior
- Replace `product/version.js` with your product's version
- Replace `product/checkVersion.js` with your version-check endpoint (or leave the stub)
- Add your logo files to `assets/`
- Add product-specific plugins to `plugins/` (descriptions, export formats, etc.)
- Update `index.html` to include `<script>` tags for your plugins

### 3. Set up merge protection

Create a `.gitattributes` file so that pulling upstream engine updates doesn't overwrite your product files:

```
config/** merge=ours
plugins/** merge=ours
product/** merge=ours
assets/** merge=ours
help/** merge=ours
changelog/** merge=ours
index.html merge=ours
compile.js merge=ours
release.js merge=ours
```

Then enable the merge driver:

```bash
git config merge.ours.driver true
```

With this in place, `git merge upstream/main` will only bring in changes to `engine/` files. Your product-specific files are protected.

### 4. Set up version tracking (optional)

If you want end users to see "new version available" notifications, set up a version-check repository. See the Version Check Setup section below for full instructions.

### 5. Build and test

Open `index.html` in a browser and verify everything works. Then compile:

```bash
npm run compile
```

## Project Structure

```
formbrew/
├── engine/                  ← Shared engine (do not modify in forks)
│   ├── js/                  ← Core JavaScript modules
│   ├── css/                 ← Base stylesheet
│   └── plugins/             ← Engine-level plugin infrastructure
│       └── pluginLoader.js
│
├── config/                  ← Product-specific form definition
│   └── formConfig.js
│
├── plugins/                 ← Product-specific plugins
│   └── (your plugins here)
│
├── product/                 ← Product-specific scripts and branding config
│   ├── config.js            ← Branding, logo paths, URLs (loads before engine)
│   ├── version.js           ← Product version number
│   ├── checkVersion.js      ← Remote version check logic
│   └── init.js              ← Branding application, help/changelog wiring
│
├── assets/                  ← Product-specific images and static files
│   ├── logo.png
│   ├── logo-dark.png
│   └── favicon.png
│
├── version-check/           ← Git submodule for remote version tracking (optional)
│
├── index.html               ← Entry point (product-owned)
├── compile.js               ← Builds a single-file distributable
├── release.js               ← Automated release + versioning script
└── package.json
```

### What goes where

**`engine/`** — The shared form engine. Contains everything needed to render a form from a JSON config, handle save/load, PDF export, conditional field logic, validation, theme toggling, notifications, drag-and-drop import, and the plugin loader. You should never need to edit these files in a product fork. If you find a bug here, fix it upstream and pull the fix into your fork.

**`config/formConfig.js`** — The form definition for your product. This is a `window.formConfig` object that declares every form section, field, field type, options, required flags, and conditional rules. The engine reads this at startup and renders the entire form from it. See the Form Configuration section below for the schema.

**`plugins/`** — Product-specific plugins. Each plugin lives in its own subfolder and self-registers with the engine's plugin loader. Plugins can add sidebar buttons (UI plugins) or provide data/logic that other plugins depend on (headless plugins). See the Plugins section below.

**`product/config.js`** — Declares `window.productConfig` with branding values (title, logo paths, help URL, changelog URL). This file loads before engine scripts so the engine can read these values during initialization — for example, the theme toggle needs to know the logo paths to swap between light and dark variants on page load.

**`product/version.js`** — Sets `window.version` and the major/minor/patch components. Displayed in the sidebar below the logo. Updated automatically by the release script.

**`product/checkVersion.js`** — Checks a remote endpoint for the latest version and shows a notification if an update is available. The example is a stub; replace the URL with your own version-check endpoint after setting up the version-check repository.

**`product/init.js`** — Runs last, after all engine and product scripts have loaded. Applies branding to the DOM (sets the title, logo, page title), wires up the help and changelog window openers, and calls `setTheme` to ensure the correct logo variant is displayed. Each product fork writes its own version of this file.

**`assets/`** — Static files for your product: logos (light and dark variants), favicon, and any other images. The engine's theme toggle reads logo paths from `product/config.js`, not from the HTML, so you can name these files whatever you want as long as the config matches.

**`version-check/`** — A git submodule pointing to your version-check repository. This is optional — only needed if you want the app to notify users when a new version is available if they have copied the file in the /dist folder to another location. See the Version Check Setup section below.

**`index.html`** — The entry point. Defines the page skeleton (sidebar, form container, toast container, theme toggle button), then loads scripts in order: product config first, engine scripts, product scripts, and `product/init.js` last. Each product fork owns this file and controls which plugin scripts are included.

**`release.js`** — Automates the release process: bumps the version in `product/version.js`, updates the version-check submodule, commits, tags, and pushes. See the Releases section below.

## Form Configuration

The form is defined entirely in `config/formConfig.js` as a `window.formConfig` object. The engine reads this and dynamically renders the complete form.

### Schema

```js
window.formConfig = {
    groups: [
        {
            heading: "Section Name",       // displayed as the card header
            icon: "info",                  // Material Symbols icon name
            categories: [
                {
                    category: "Field Label",    // display name and basis for the variable name
                    type: "text",               // text | dropdown | checkbox | textarea | date | phone | number
                    required: true,             // shows red asterisk, enforced on export
                    optional: false,            // if true, shows an "Option" checkbox for line item exports
                    options: [],                // for dropdowns: array of option strings
                    description: "Help text"    // shown in popover on the help icon
                }
            ]
        }
    ],
    conditions: [
        {
            name: "Rule Name",
            if: [
                {
                    category: "Field Label",            // the field to check
                    values: ["Value A", "Value B"]      // condition is met if field matches any of these
                }
            ],
            then: [
                {
                    type: "removes",                    // currently the only action type
                    category: "Other Field Label",      // the field to modify
                    values: ["Option to Remove"],       // options to remove from the dropdown
                    applyToWholeCategory: false          // if true, disables the entire field
                }
            ]
        }
    ]
};
```

### Variable naming

The engine converts field labels to variable names by lowercasing and replacing spaces with underscores. "Product Color" becomes `product_color`. These variable names are used as form element `name` and `id` attributes, as keys in `window.selections`, and as the basis for notes fields (`product_color_notes`).

### Field types

- **text** — standard text input
- **phone** — text input with phone number formatting
- **date** — date picker
- **number** — numeric input
- **textarea** — multi-line text area (used for freeform notes, exceptions, etc.)
- **dropdown** — select element, populated from the `options` array
- **checkbox** — toggle checkbox

### The `optional` flag

When `optional` is `true` on a field, the engine renders an "Option" checkbox next to the field. This is a UI hint used by export plugins to separate base selections from optional add-ons. The engine itself doesn't treat optional fields differently — it's up to your plugins to check `window.selections['field_name_option']` and handle the distinction.

For dropdown fields marked as optional, checking the "Option" checkbox also reveals a list of all dropdown values as individual checkboxes. This lets users mark specific dropdown options as alternatives to configure separately.

### Conditions

Conditions dynamically modify dropdown fields based on the current value of other fields. They're evaluated on every form change.

When all of a condition's `if` criteria are met, each `then` action fires. The only action type currently supported is `removes`, which can either remove specific values from a dropdown's option list (`applyToWholeCategory: false`) or disable the target field entirely (`applyToWholeCategory: true`).

A condition's `if` array uses AND logic — all criteria must be met. Each individual criterion uses OR logic on its `values` array — any matching value satisfies that criterion.

After all conditions are evaluated, the engine auto-selects and disables any dropdown that has been reduced to a single remaining option.

### Notes fields

Every field automatically gets an "Add Note" button that reveals a text area. Notes are stored as `field_name_notes` in the saved file and are accessible to plugins via `window.selections`. No configuration is needed — this is built into the engine for all field types.

### Example

The included `config/formConfig.js` is a kitchen-sink example demonstrating every field type, required/optional flags, help text, and conditional logic. Use it as a reference when building your own form configuration.

## Plugins

Plugins extend the product configurator with custom functionality. Every plugin is a self-contained JavaScript file that self-registers with the engine's plugin loader.

### Plugin types

**UI Plugins** add a button to the sidebar and execute logic when clicked. Use these for export formats, report generators, or any action the user triggers manually.

**Headless Plugins** run initialization code but don't add a button. Use these for data providers, description builders, or any logic that other plugins depend on.

### Creating a UI plugin

Create a folder and file: `plugins/myExport/myExport.js`

```js
(function () {
    function execute() {
        // Validate the form
        if (!window.validateLineItems()) return;

        // Access form data
        window.createGlobalVariables();
        const selections = window.selections;

        // Your export/report logic here
        const newWindow = window.open('', '_blank');
        newWindow.document.write('<h1>My Export</h1>');
        newWindow.document.write('<pre>' + JSON.stringify(selections, null, 2) + '</pre>');
        newWindow.document.close();
    }

    window.registerPlugin({
        id: 'myExportButton',          // becomes the button's DOM id
        label: 'My Export',             // button display text
        btnClass: 'btn-outline-dark',   // any Bootstrap button class
        order: 10,                      // lower number = higher position in sidebar
        execute: execute
    });
})();
```

Then add a script tag in `index.html` in the product scripts section:

```html
<script src="./plugins/myExport/myExport.js"></script>
```

The plugin loader creates the sidebar button automatically and inserts it before the "Export to PDF" button. The `order` value controls positioning among plugins (lower numbers appear higher).

### Creating a headless plugin

Headless plugins provide data or functions that other plugins consume. They register without a `label` or `execute`, so no button is created.

```js
(function () {
    function computeDescriptions() {
        // Build data that other plugins will use
        window.myProductDescriptions = { /* ... */ };
    }

    window.registerPlugin({
        id: 'myDataProvider',
        order: 0,                       // low order = initializes first
        init: function () {
            // Expose the function globally so it can be called
            // from the form change handler or other plugins
            window.computeDescriptions = computeDescriptions;
        }
    });
})();
```

Headless plugins with low `order` values initialize before UI plugins, so the data they provide is available when UI plugins run.

### Plugin registration schema

```js
window.registerPlugin({
    id:       'string',     // required — unique identifier
    label:    'string',     // optional — button text (omit for headless plugins)
    btnClass: 'string',     // optional — Bootstrap class (default: 'btn-outline-dark')
    order:    number,        // optional — sort order (default: 100)
    execute:  function,      // optional — click handler (required if label is set)
    init:     function       // optional — called once during initialization
});
```

### Available globals for plugins

Plugins can access these engine-provided globals:

- `window.selections` — current form values, keyed by variable name
- `window.formConfig` — the form configuration object
- `window.getVariableName(label)` — converts "Field Label" to `field_label`
- `window.getDisplayName(varName)` — looks up the display label for a variable name
- `window.validateLineItems()` — validates required fields, returns false if invalid
- `window.createGlobalVariables()` — refreshes `window.selections` from the form
- `window.refreshGlobalVariables()` — refreshes selections from current form state
- `window.buildNotification(id, message, type)` — creates a toast notification (`type`: `'error'`, `'warning'`, `'success'`)
- `window.notify(id)` — shows a previously built notification

Plugins may also expose their own globals for other plugins to consume. For example, a descriptions plugin might set `window.itemDescriptions` and a corresponding update function, which an export plugin could then read. This inter-plugin communication is by convention — the engine doesn't enforce or mediate it.

## Versioning

Each product fork maintains its own version number in `product/version.js`. This is the version displayed to end users in the sidebar and is updated automatically by the release script.

The upstream `formbrew` repo uses git tags (`v0.1.0`, `v0.2.0`, etc.) to mark engine releases. When you merge upstream into your fork, you can check which engine tag you've incorporated by running:

```bash
git log --oneline upstream/main --tags
```

There's no requirement to display the engine version to end users. For developer debugging, `product/init.js` can log both versions to the console:

```js
console.log(`Product v${window.version} | Engine v${window.engineVersion}`);
```

## Version Check Setup

The version-check system lets your app notify users when a newer version is available. It works by hosting a small JSON file in a separate repository that contains the latest version number. The app fetches this file on load and compares it to its own version.

This is entirely optional. If you don't need update notifications, skip this section and leave `product/checkVersion.js` as the default stub.

### How it works

```
┌─────────────────────┐       fetch on load        ┌──────────────────────┐
│   Product Fork      │ ──────────────────────────► │  version-check repo  │
│                     │                             │                      │
│  product/version.js │  compare versions           │  myapp-version.json  │
│  v1.2.3             │ ◄───────────────────────    │  { "latest": "1.3.0"}│
│                     │                             │                      │
│  "New version       │                             │  (hosted on GitHub,  │
│   available!" toast │                             │   raw URL is public) │
└─────────────────────┘                             └──────────────────────┘
```

The version-check repository is a standalone git repo that holds one JSON file per product. Each product fork includes this repo as a git submodule so the release script can update the JSON file automatically during a release.

### Step 1: Create the version-check repository

If you don't already have a version-check repo, create one. If you're managing multiple product lines, they can all share a single version-check repo — each product gets its own JSON file.

```bash
mkdir version-check
cd version-check
git init
```

Create a version file for your product. Replace `my-product` with a short identifier for your product:

```bash
touch my-product-version.json
```

Add the initial content:

```json
{
  "latest_version": "0.0.0"
}
```

Commit and push:

```bash
git add my-product-version.json
git commit -m "Initial version file for my-product"
git remote add origin <your-version-check-repo-url>
git push -u origin main
```

### Step 2: Add the submodule to your product fork

Navigate to your product fork and add the version-check repo as a submodule:

```bash
cd my-product-configurator
git submodule add <your-version-check-repo-url> version-check
git commit -m "Add version-check submodule"
git push origin dev
```

After cloning the product repo in the future, initialize the submodule with:

```bash
git submodule update --init --recursive
```

### Step 3: Configure the release script

The release script automates version bumping, submodule updates, and git tagging. Open `release.js` and set the configuration variables at the top of the file:

```js
// ── Configuration ──────────────────────────────────────────────
// Name of the version-check submodule directory
const repoName = 'version-check';
// Name of your project's JSON file in the version-check repo (without -version.json)
const projectName = 'my-product';
// Path to version.js relative to the project root
const versionFilePath = 'product/version.js';
// Path to package.json (set to null if not using npm)
const packageLoc = './package.json';
// Enable/disable git commands (set false for dry-run testing)
const isGitEnabled = true;
// ───────────────────────────────────────────────────────────────
```

The key change from the base FormBrew release script is the `versionFilePath` — since the directory restructure moved `version.js` into the `product/` folder, this must point to `product/version.js`.

The release script performs the following steps when you run `npm run release`:

1. Prompts for release type (patch, minor, or major)
2. Bumps the version in `product/version.js`
3. Updates `version-check/my-product-version.json` with the new version
4. Commits and pushes the version-check submodule changes
5. Commits and pushes the product repo changes on `dev`
6. Merges `dev` into `main`, tags the release, and pushes

### Step 4: Configure the version check in your app

Update `product/checkVersion.js` to fetch from your version-check repo's raw URL:

```js
(function () {
    // Raw GitHub URL to your product's version file
    const VERSION_CHECK_URL = 
        'https://raw.githubusercontent.com/YourOrg/version-check/main/my-product-version.json';

    function checkVersion() {
        const currentVersion = window.version;

        fetch(VERSION_CHECK_URL)
            .then(response => response.json())
            .then((data) => {
                const latestVersion = data.latest_version;
                window.latest_version = latestVersion;

                if (currentVersion !== latestVersion) {
                    // Only notify if the remote version is actually newer
                    const current = currentVersion.split('.').map(Number);
                    const latest = latestVersion.split('.').map(Number);

                    for (let i = 0; i < 3; i++) {
                        if (current[i] > latest[i]) return;  // local is ahead (dev build)
                        if (current[i] < latest[i]) break;   // remote is ahead (update available)
                    }

                    window.buildNotification(
                        'new_version',
                        `New version v${latestVersion} is available!`,
                        'warning'
                    );
                    window.notify('new_version');
                }
            })
            .catch((error) => {
                console.error('Version check error:', error);
            });
    }

    window.checkVersion = checkVersion;
})();
```

Replace the URL with the raw GitHub URL for your version-check file. The format is:

```
https://raw.githubusercontent.com/<org>/<repo>/main/<project-name>-version.json
```

### Multiple products sharing one version-check repo

If you maintain several product forks, they can all share a single version-check repository. Each product gets its own JSON file:

```
version-check/
├── sterilizer-version.json      ← { "latest_version": "0.14.0" }
├── washer-version.json          ← { "latest_version": "1.2.0" }
└── dryer-version.json           ← { "latest_version": "0.3.1" }
```

Each product fork adds the same version-check repo as a submodule, but configures its `release.js` with a different `projectName` so it updates the correct JSON file. Each product's `checkVersion.js` fetches its own file by URL.

## Releases

The release process uses a feature-branch workflow. All development happens on `dev` (or feature branches merged into `dev`). The `main` branch is controlled entirely by the release script.

### Running a release

```bash
npm run release
```

The script will prompt you for the release type:

- **patch** — bug fixes, minor tweaks (0.14.0 → 0.14.1)
- **minor** — new features, non-breaking changes (0.14.1 → 0.15.0)
- **major** — breaking changes (0.15.0 → 1.0.0)

The script then automatically bumps the version, updates the version-check submodule, commits, merges `dev` into `main`, tags the release, and pushes everything.

After the release, compile the distributable:

```bash
npm run compile
```

### Important notes

- **Never manually edit the `main` branch** — it should only be updated by the release script
- **Never manually create git tags** — the release script handles tagging
- **Always run releases from the `dev` branch** — the script will checkout dev first, but you should start there
- **Commit all changes before releasing** — the script will fail if there are uncommitted changes on dev

## Pulling Upstream Updates

When the engine gets bug fixes or new features in the upstream `formbrew` repo, pull them into your product fork:

```bash
# Fetch the latest from upstream
git fetch upstream

# Merge upstream changes into your branch
git merge upstream/main
```

If you set up `.gitattributes` as described in the forking instructions, this merge will only apply changes to `engine/` files. Your product-specific files in `config/`, `plugins/`, `product/`, and `assets/` are protected by the `merge=ours` strategy.

### If you find an engine bug while working on your product

The preferred workflow is to fix it upstream first, then pull the fix into your fork:

```bash
# 1. Switch to the upstream repo and create a fix branch
cd ../formbrew
git checkout -b fix/describe-the-bug
# Make the fix in engine/ files
git commit -am "Fix: description of the bug"
git push origin fix/describe-the-bug
# Open a PR, review, merge to main

# 2. Pull the fix into your product fork
cd ../my-product-configurator
git fetch upstream
git merge upstream/main
git push origin main
```

If you need the fix immediately and can't wait for the upstream PR, fix it directly in your fork's `engine/` directory, then contribute it back to upstream by opening a PR from your fork to the upstream repo. Other product forks can then pull the same fix.

### Resolving merge conflicts

Conflicts are rare when the directory boundary is respected. They can occur if:

- You modified an engine file directly in your fork (avoid this — fix upstream instead)
- Upstream changed `index.html` in a way that conflicts with your fork's version (resolve manually, keeping your product-specific parts and incorporating the engine's structural changes)

If a conflict does happen, resolve it, test thoroughly, and commit the merge.

## Compiling

The compile script inlines all local CSS, JavaScript, and images into a single self-contained HTML file:

```bash
npm run compile
```

Output goes to `dist/` and optionally to the parent directory (configurable at the top of `compile.js`). The compiled file has no external dependencies on local files — all scripts are inlined as `<script>` blocks, all CSS as `<style>` blocks, and all local images as base64 data URIs. External CDN resources (Bootstrap, Material Icons, jsPDF) remain as external links.

## Engine Architecture

For contributors working on the engine itself, here's how the pieces fit together.

### Script loading order

The order matters. `index.html` loads scripts in this sequence:

1. **`product/config.js`** — declares `window.productConfig` (needed by theme toggle)
2. **Engine scripts** — form builder, save/load, validation, conditions, theme, notifications, sidebar, drag-drop, PDF generator, plugin loader, event listeners
3. **Product scripts** — version, formConfig, checkVersion, plugins
4. **`product/init.js`** — applies branding and wires up product-specific UI

Within the engine scripts, `eventListeners.js` must load last because it calls `assignEventListeners()` immediately, which registers the `DOMContentLoaded` handler. The plugin loader must load before `eventListeners.js` so that `window.registerPlugin` exists when plugin scripts execute.

### Initialization sequence (on DOMContentLoaded)

1. `buildForm()` — renders the form from `formConfig`
2. `createSidebar()` — builds sidebar navigation from form sections
3. `createGlobalVariables()` — initializes `window.selections`
4. `assignButtons()` — wires up save, import, theme toggle, and any optional buttons
5. `initializePlugins()` — runs `init()` for all plugins, creates sidebar buttons for UI plugins
6. `formatPhoneNumbers()` — sets up phone input formatting
7. `initializeFormConfig()` — snapshots the original config for condition resets
8. `applyConditions()` — evaluates conditional field rules
9. `checkVersion()` — checks for updates (if configured)

### Form change handler

On every form change, the engine runs this sequence:

1. `refreshGlobalVariables()` — syncs `window.selections` with current form state
2. `showNotes()` — expands note fields that have content
3. `formatPhoneNumbers()` — re-applies phone formatting
4. `applyConditions()` — re-evaluates conditional rules
5. Steps 1–2 repeat (ensures consistency after condition changes)

Note: product forks typically wire a descriptions plugin into this loop via `eventListeners.js`. The engine's change handler calls `window.updateDescriptions()` if it exists, but it's a no-op in the base engine — only product plugins define that function.