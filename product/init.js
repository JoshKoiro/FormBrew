/**
 * Product Initialization
 * 
 * Applies product-specific branding and wires up product-specific
 * behaviors (help window, changelog window). Runs after all engine
 * and product scripts have loaded.
 * 
 * Reads from window.productConfig (set in product/config.js).
 */

(function () {
    const config = window.productConfig || {};

    // --- Branding ---
    const appTitle = document.getElementById('app-title');
    const appLogo = document.getElementById('app-logo');
    const versionEl = document.getElementById('version');

    // Set the product title
    if (appTitle && config.title) {
        appTitle.textContent = config.title;
        if (versionEl) {
            appTitle.appendChild(versionEl);
        }
    }

    // Set the page title
    if (config.pageTitle) {
        document.title = config.pageTitle;
    }

    // Set the logo — let setTheme pick the right light/dark variant
    if (appLogo && config.logo) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        appLogo.src = (savedTheme === 'dark' && config.logoDark) ? config.logoDark : config.logo;
    }

    // Apply the saved theme (ensures logo, icon, and data-bs-theme are all in sync)
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (window.setTheme) {
        window.setTheme(savedTheme);
    }

    // --- Help Window ---
    const helpLink = document.getElementById('helpPage');
    if (helpLink && config.help) {
        helpLink.addEventListener('click', async function (event) {
            event.preventDefault();
            const width = 1024;
            const height = 768;
            const currentRight = window.screenX + window.outerWidth;
            let left = currentRight;
            if (left + width > window.screen.availWidth) {
                left = currentRight - width;
            }
            const top = window.screenY;
            try {
                const response = await fetch(config.help.primaryUrl, { method: 'HEAD' });
                if (response.ok) {
                    window.open(config.help.primaryUrl, 'helpWindow',
                        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
                } else {
                    throw new Error('Primary URL not reachable');
                }
            } catch (error) {
                console.warn('Primary help URL failed, using fallback:', error);
                window.open(config.help.fallbackUrl, 'helpWindow',
                    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
            }
        });
    }

    // --- Changelog Window ---
    const changelogBtn = document.getElementById('changelogbtn');
    if (changelogBtn && config.changelog) {
        changelogBtn.addEventListener('click', async function (event) {
            event.preventDefault();
            const width = 1024;
            const height = 768;
            const currentRight = window.screenX + window.outerWidth;
            let left = currentRight;
            if (left + width > window.screen.availWidth) {
                left = currentRight - width;
            }
            const top = window.screenY;
            try {
                const response = await fetch(config.changelog.primaryUrl, { method: 'HEAD' });
                if (response.ok) {
                    window.open(config.changelog.primaryUrl, 'changelogWindow',
                        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
                } else {
                    throw new Error('Primary URL not reachable');
                }
            } catch (error) {
                console.warn('Primary changelog URL failed, using fallback:', error);
                window.open(config.changelog.fallbackUrl, 'changelogWindow',
                    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
            }
        });
    }
})();