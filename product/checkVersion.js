/**
 * Version Check (Product-Specific)
 *
 * Checks a remote endpoint for the latest version of this product line.
 */

(function () {
    const VERSION_CHECK_URL = 'https://raw.githubusercontent.com/JoshKoiro/version-check/main/formbrew.json';

    function checkVersion() {
        const currentVersion = window.version;
        let latest_version = '';

        fetch(VERSION_CHECK_URL)
            .then(response => response.json())
            .then((data) => {
                latest_version = data.latest_version;
                window.latest_version = latest_version;

                if (currentVersion !== latest_version) {
                    const currentParts = currentVersion.split('.');
                    const latestParts = latest_version.split('.');
                    if (currentParts[0] > latestParts[0]) { return; }
                    if (currentParts[0] === latestParts[0] && currentParts[1] > latestParts[1]) { return; }
                    if (currentParts[0] === latestParts[0] && currentParts[1] === latestParts[1] && currentParts[2] > latestParts[2]) { return; }

                    window.buildNotification('new_version', `New version v${latest_version} is available!`, 'warning');
                    window.notify('new_version');
                }
            })
            .catch((error) => {
                console.error('Version check error:', error);
            });
    }

    window.checkVersion = checkVersion;
})();