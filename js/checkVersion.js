function checkVersion() {
    // Get the current version from version.js
    const currentVersion = window.version;
    let latest_version = '';

    // Get the latest version from version.json at https://raw.githubusercontent.com/JoshKoiro/version-check/main/bsscfg-version.json
    const latestVersion = fetch('https://raw.githubusercontent.com/JoshKoiro/version-check/main/formbrew.json')
        .then(response => response.json())
        .then((data) => {
            latest_version = data.latest_version;
            window.latest_version = latest_version;

            // Compare the current version with the latest version
            if (currentVersion !== latest_version) {
                // Check if the current version is a greater number than the updated version. Do this by comparing the major, minor, and patch numbers
                const currentVersionArray = currentVersion.split('.');
                const latestVersionArray = latest_version.split('.');
                if(currentVersionArray[0] > latestVersionArray[0]) {
                    console.warn('latest version not updated or in process of updating');
                    return
                }
                if(currentVersionArray[0] === latestVersionArray[0] && currentVersionArray[1] > latestVersionArray[1]) {
                    console.warn('latest version not updated or in process of updating');
                    return
                }
                if(currentVersionArray[0] === latestVersionArray[0] && currentVersionArray[1] === latestVersionArray[1] && currentVersionArray[2] > latestVersionArray[2]) {
                    console.warn('latest version not updated or in process of updating');
                    return
                }

                window.buildNotification('new_version', `New version v${latest_version} is available!`, 'warning');
                window.notify('new_version');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

window.checkVersion = checkVersion;