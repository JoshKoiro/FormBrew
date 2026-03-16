const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Helper function to read files
const readFile = (filePath) => {
    return fs.readFileSync(filePath, 'utf8');
};

// Helper function to convert image to base64
const imageToBase64 = (filePath) => {
    const image = fs.readFileSync(filePath);
    return `data:image/${path.extname(filePath).slice(1)};base64,${image.toString('base64')}`;
};

// Helper function to fetch external resources
const fetchExternalResource = (url) => {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        client.get(url, (resp) => {
            let data = '';
            
            resp.on('data', (chunk) => {
                data += chunk;
            });
            
            resp.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            console.error(`Error fetching ${url}:`, err.message);
            reject(err);
        });
    });
};

// Helper function to process CSS file
const processCSS = async (source, isExternal = false) => {
    try {
        const content = isExternal ? 
            await fetchExternalResource(source) : 
            readFile(source);
        return `<style>\n${content}\n</style>`;
    } catch (error) {
        console.error(`Error processing CSS from ${source}:`, error);
        return ''; // Return empty string on error
    }
};

// Helper function to process JS file
const processJS = async (source, isExternal = false) => {
    try {
        const content = isExternal ? 
            await fetchExternalResource(source) : 
            readFile(source);
        return `<script>\n${content}\n</script>`;
    } catch (error) {
        console.error(`Error processing JavaScript from ${source}:`, error);
        return ''; // Return empty string on error
    }
};

// Helper function to process external images
const processExternalImage = async (url) => {
    try {
        const imageBuffer = await new Promise((resolve, reject) => {
            const client = url.startsWith('https') ? https : http;
            client.get(url, (resp) => {
                const chunks = [];
                resp.on('data', chunk => chunks.push(chunk));
                resp.on('end', () => resolve(Buffer.concat(chunks)));
            }).on('error', reject);
        });

        const ext = path.extname(url).slice(1);
        return `data:image/${ext};base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
        console.error(`Error processing external image ${url}:`, error);
        return url; // Fall back to original URL on error
    }
};

// Process HTML content line by line
const processHTML = async (htmlFilePath) => {
    const htmlLines = readFile(htmlFilePath).split('\n');
    let processedHTML = [];

    for (const line of htmlLines) {
        let processedLine = line;

        try {
            // Process external CSS links
            if (/<link[^>]*href=["'](https?:\/\/[^"']*\.css)["'][^>]*>/.test(line)) {
                const match = line.match(/<link[^>]*href=["'](https?:\/\/[^"']*\.css)["'][^>]*>/);
                processedLine = await processCSS(match[1], true);
            }
            // Process local CSS links
            else if (/<link[^>]*href=["']([^"']*\.css)["'][^>]*>/.test(line)) {
                const match = line.match(/<link[^>]*href=["']([^"']*\.css)["'][^>]*>/);
                const cssFilePath = path.join(__dirname, match[1]);
                processedLine = await processCSS(cssFilePath);
            }

            // Process external JS scripts
            if (/<script[^>]*src=["'](https?:\/\/[^"']*)["'][^>]*><\/script>/.test(line)) {
                const match = line.match(/<script[^>]*src=["'](https?:\/\/[^"']*)["'][^>]*><\/script>/);
                processedLine = await processJS(match[1], true);
            }
            // Process local JS scripts
            else if (/<script[^>]*src=["']([^"']*\.js)["'][^>]*><\/script>/.test(line)) {
                const match = line.match(/<script[^>]*src=["']([^"']*\.js)["'][^>]*><\/script>/);
                const jsFilePath = path.join(__dirname, match[1]);
                processedLine = await processJS(jsFilePath);
            }

            // Process external images
            if (/src=["'](https?:\/\/[^"']*\.(png|jpe?g|gif|svg))["']/.test(line)) {
                const match = line.match(/src=["'](https?:\/\/[^"']*\.(png|jpe?g|gif|svg))["']/);
                const base64Image = await processExternalImage(match[1]);
                processedLine = processedLine.replace(match[1], base64Image);
            }
            // Process local images
            else if (/src=["']([^"']*\.(png|jpe?g|gif|svg))["']/.test(line)) {
                const match = line.match(/src=["']([^"']*\.(png|jpe?g|gif|svg))["']/);
                if (match[1].startsWith('./')) {
                    const newURL = "./beta-star-sterilizer-configurator" + match[1].substring(1);
                    processedLine = processedLine.replace(match[1], newURL);
                }
            }
        } catch (error) {
            console.error(`Error processing line: ${line}`, error);
        }

        processedHTML.push(processedLine);
    }

    return processedHTML.join('\n');
};

// Main function
const compile = async () => {
    try {
        const htmlFilePath = path.join(__dirname, 'formBrew.html');
        const processedHTMLContent = await processHTML(htmlFilePath);

        // Ensure the /dist directory exists
        const distDir = path.join(__dirname, 'dist');
        if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir);
        }

        // Delete any current files contained in the /dist directory
        fs.readdirSync(distDir).forEach((file) => {
            // check if the file has the same name
            if (file === 'sterilizer-configurator-offline.html') {
            fs.unlinkSync(path.join(distDir, file));
            }
        });

        // Write the combined HTML content to the /dist folder
        const outputFilePath = path.join(distDir, 'sterilizer-configurator-offline.html');
        fs.writeFileSync(outputFilePath, processedHTMLContent, 'utf8');
        console.log('Compiled HTML file created in /dist/sterilizer-configurator-offline.html');

        // Write the combined HTML content to the parent directory
        const parentDir = path.join(__dirname, '..');
        const parentOutputFilePath = path.join(parentDir, 'sterilizer-configurator-offline.html');
        fs.writeFileSync(parentOutputFilePath, processedHTMLContent, 'utf8');
        console.log('Compiled HTML file created in parent directory');
    } catch (error) {
        console.error('Compilation failed:', error);
    }
};

// Run the compile function
compile();