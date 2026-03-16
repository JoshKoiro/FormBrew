const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const START_VERSION = 'v0.0.1'; // Change this to your desired starting version
// Set to null or empty string to include all versions

// Function to check if a version is greater than or equal to the start version
function isVersionIncluded(version) {
    if (!START_VERSION) return true;
    
    const parseVersion = (v) => {
        const cleaned = v.replace(/^v/, '');
        return cleaned.split('.').map(num => parseInt(num, 10));
    };

    const currentVer = parseVersion(version);
    const startVer = parseVersion(START_VERSION);

    for (let i = 0; i < Math.max(currentVer.length, startVer.length); i++) {
        const current = currentVer[i] || 0;
        const start = startVer[i] || 0;
        if (current < start) return true;
        if (current > start + 1) return false;
    }
    return true;
}

// Function to get all tags sorted by date (newest first)
function getAllTags() {
    const tags = execSync('git tag --sort=-creatordate').toString().trim().split('\n');

    // Ensure the tags are sorted correctly
    const startIndex = tags.indexOf(START_VERSION);
    // If START_VERSION exists, we start from the one before it
    if (startIndex === -1 || startIndex === tags.length - 1) {
        console.error("ERROR: Start version not found or no previous tag exists.");
        process.exit(1);
    }

    filteredTags = tags.slice(0, startIndex + 2);
    console.log(tags);
    console.log(filteredTags);

    // Start from the tag before START_VERSION and include all following tags
    console.log("Start from tag:", filteredTags[startIndex]);
    console.log("Include tags:", filteredTags);
    return filteredTags;
}

// Function to get tag date
function getTagDate(tag) {
    return execSync(`git log -1 --format=%ai ${tag}`).toString().trim().split(' ')[0];
}

// Function to get commits between two tags
function getCommitsBetweenTags(fromTag, toTag) {
    const command = `git log ${fromTag}..${toTag} --format=%B%n==COMMIT_BOUNDARY==`;
    const output = execSync(command).toString();
    
    return output
        .split('==COMMIT_BOUNDARY==')
        .map(commit => commit.trim())
        .filter(commit => commit)
        .map(commit => {
            const lines = commit.split('\n').filter(line => line.trim());
            if (lines.length <= 1) return null;
            return lines.slice(1).join('\n').trim();
        })
        .filter(commit => commit);
}

// Function to get the first commit or repository start point
function getFirstCommit() {
    try {
        return execSync('git rev-list --max-parents=0 HEAD').toString().trim();
    } catch (error) {
        console.error('Error getting first commit:', error);
        return null;
    }
}

// Function to generate changelog content with Bootstrap styling
function generateChangelogContent() {
    const tags = getAllTags();
    const firstCommit = getFirstCommit();

    let content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Changelog</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link href="changelog.css" rel="stylesheet">
</head>
<body>
    <div class="container my-4">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h1 class="mb-0">ChangeLog</h1>
                    </div>
                    <div class="card-body">\n\n`;

    // Handle commits for each tag
    for (let i = 0; i < tags.length -1; i++) {
        const currentTag = tags[i];
        const previousTag = tags[i + 1];
        const tagDate = getTagDate(currentTag);
        
        content += `<h2 class="version-header">${currentTag} <span class="version-date">(${tagDate})</span></h2>\n`;
        
        // Get commits between previous tag (or first commit) and current tag
        const commits = getCommitsBetweenTags(previousTag, currentTag);
        
        if (commits.length > 0) {
            content += '<ul class="changelog-list">\n';
            commits.forEach(commit => {
                content += `<li>${commit}</li>\n`;
            });
            content += '</ul>\n\n';
        }
    }

    content += `
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Check for saved theme preference or default to light
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-bs-theme', theme);
    </script>
</body>
</html>`;

    return content;
}

// CSS content
const cssContent = `/* Changelog Styles */
body {
    font-family: 'Libre Franklin', sans-serif !important;
    font-weight: 400;
}

.card {
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
    background-color: transparent;
    border-bottom: 1px solid var(--bs-border-color);
    padding: 1.5rem;
}

.card-body {
    padding: 1.5rem;
}

h1 {
    font-weight: 600;
    font-size: 1.75rem;
    color: var(--bs-heading-color);
    margin: 0;
}

.version-header {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--bs-heading-color);
    margin-top: 1.5rem;
    margin-bottom: 1rem;
}

.version-date {
    font-size: 1rem;
    color: var(--bs-secondary-color);
    font-weight: 400;
}

.changelog-list {
    list-style: none;
    padding-left: 1.5rem;
    margin-bottom: 2rem;
}

.changelog-list li {
    position: relative;
    padding-left: 1rem;
    margin-bottom: 0.75rem;
    line-height: 1.6;
}

.changelog-list li::before {
    content: "•";
    position: absolute;
    left: -1rem;
    color: var(--bs-primary);
}

/* Dark mode adjustments */
[data-bs-theme="dark"] .card {
    background-color: #1e1e1e;
    border-color: #333;
}

[data-bs-theme="dark"] .card-header {
    border-bottom-color: #444;
}

[data-bs-theme="dark"] .version-date {
    color: #adadad;
}`;

// Main function to generate or update changelog
function updateChangelog() {
    const changelogPath = path.join(process.cwd(), 'changelog.html');
    const cssPath = path.join(process.cwd(), 'changelog.css');
    
    try {
        // Write HTML file
        fs.writeFileSync(changelogPath, generateChangelogContent(), 'utf8');
        
        // Write CSS file
        fs.writeFileSync(cssPath, cssContent, 'utf8');
        
        console.log('Changelog and CSS have been generated successfully!');
    } catch (error) {
        console.error('Error writing files:', error);
        process.exit(1);
    }
}

// Execute the script
updateChangelog();