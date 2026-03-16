<img src="./img/Header.jpg">

# FormBrew
Welcome to FormBrew! ☕, the JavaScript framework that brings the power of complex form creation directly to your local machine. No servers, no backend, just pure front-end simplicity. Designed to build product configurators, or other forms requiring complex logic trees.


## How to Add a New Plugin
### UI Plugin (with a sidebar button)
Create a folder: `/plugins/myNewPlugin/`
Create `/plugins/myNewPlugin/myNewPlugin.js`

```javascript
// Plugin with button in the sidebar

js(function () {
    function execute() {
        // Your plugin logic here
    }

    window.registerPlugin({
        id: 'myNewPluginButton',
        label: 'My New Feature',
        btnClass: 'btn-outline-dark',
        order: 30,
        execute: execute,
        init: function () { /* optional setup */ }
    });
})();
```
```javascript
// Headless Plugin (data/logic provider, no button)

js(function () {
    function myHelperFunction() { /* ... */ }

    window.registerPlugin({
        id: 'myDataProvider',
        order: 0,
        init: function () {
            window.myHelperFunction = myHelperFunction;
        }
    });
})();
```

Add a <script> tag in formBrew.html in the Plugin System section:

```html
html<script src="./plugins/myNewPlugin/myNewPlugin.js"></script>
```