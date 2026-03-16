const fs = require('fs');
const path = require('path');

// Helper function to read files
const readFile = (filePath) => {
    return fs.readFileSync(filePath, 'utf8');
};

// Helper function to convert image to base64
const imageToBase64 = (filePath) => {
    const image = fs.readFileSync(filePath);
    return `data:image/${path.extname(filePath).slice(1)};base64,${image.toString('base64')}`;
};

// Helper function to process CSS file
const processCSS = (filePath) => {
    return `<style>\n${readFile(filePath)}\n</style>`;
};

// Helper function to process JS file
const processJS = (filePath) => {
    return `<script>\n${readFile(filePath)}\n</script>`;
};

// Process HTML content line by line
const processHTML = (htmlFilePath) => {
    const htmlLines = readFile(htmlFilePath).split('\n');
    let processedHTML = [];

    htmlLines.forEach((line) => {
        let processedLine = line;

        // Check for external link or script tags
        if (/href=["']https?:\/\//.test(line) || /src=["']https?:\/\//.test(line)) {
            console.log(`External link/script found: ${line}`);
            processedHTML.push(line);
        } else {
            // Process local CSS links
            if (/<link[^>]*href=["']([^"']*\.css)["'][^>]*>/.test(line)) {
                const match = line.match(/<link[^>]*href=["']([^"']*\.css)["'][^>]*>/);
                const cssFilePath = path.join(__dirname, match[1]);
                processedLine = processCSS(cssFilePath);
            }

            // Process local JS scripts
            if (/<script[^>]*src=["']([^"']*\.js)["'][^>]*><\/script>/.test(line)) {
                const match = line.match(/<script[^>]*src=["']([^"']*\.js)["'][^>]*><\/script>/);
                const jsFilePath = path.join(__dirname, match[1]);
                processedLine = processJS(jsFilePath);
            }

            // Process local image files
            if (/src=["']([^"']*\.(png|jpe?g|gif|svg))["']/.test(line)) {
                const url = line.match(/src=["']([^"']*\.(png|jpe?g|gif|svg))["']/);
                if (url[1].startsWith('./')) {
                    const newURL = "./beta-star-sterilizer-configurator" + url[1].substring(1);
                    processedLine = processedLine.replace(url[1], newURL);
                } else {
                    const imageFilePath = path.join(__dirname, match[1]);
                }
            }


            processedHTML.push(processedLine);
        }
    });

    return processedHTML.join('\n');
};

// Main function
const compile = () => {
    const htmlFilePath = path.join(__dirname, 'formBrew.html');
    const processedHTMLContent = processHTML(htmlFilePath);

    // Ensure the /dist directory exists
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
    }

    // Delete any current files contained in the /dist directory
    fs.readdirSync(distDir).forEach((file) => {
        // Only delete the 'online' compiled file
        if(file === 'sterilizer-configurator.html') {
        fs.unlinkSync(path.join(distDir, file));
        }
    });

    // Write the combined HTML content to the /dist folder
    const outputFilePath = path.join(distDir, 'sterilizer-configurator.html');
    fs.writeFileSync(outputFilePath, processedHTMLContent, 'utf8');
    console.log('Compiled HTML file created in /dist/sterilizer-configurator.html');

    // Write the combined HTML content to the parent directory
    const parentDir = path.join(__dirname, '..');
    const parentOutputFilePath = path.join(parentDir, 'sterilizer-configurator.html');
    fs.writeFileSync(parentOutputFilePath, processedHTMLContent, 'utf8');
    console.log('Compiled HTML file created in parent directory');
};

// Run the compile function
compile();
