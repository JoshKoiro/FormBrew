const fs = require('fs');
const path = require('path');

// ── Configuration ──────────────────────────────────────────────────
const SOURCE_HTML = 'index.html';
const OUTPUT_FILENAME = 'configurator.html';
const DIST_DIR = path.join(__dirname, 'dist');
const ALSO_COPY_TO_PARENT = true;
// ───────────────────────────────────────────────────────────────────

// Helper: read a file as UTF-8
function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

// Helper: convert a local image to a base64 data URI
function imageToBase64(filePath) {
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mime = (ext === 'svg') ? 'image/svg+xml' : `image/${ext}`;
    const data = fs.readFileSync(filePath);
    return `data:${mime};base64,${data.toString('base64')}`;
}

// Helper: inline a local CSS file as a <style> block
function inlineCSS(filePath) {
    console.log(`  Inlining CSS: ${filePath}`);
    return `<style>\n${readFile(filePath)}\n</style>`;
}

// Helper: inline a local JS file as a <script> block
function inlineJS(filePath) {
    console.log(`  Inlining JS:  ${filePath}`);
    return `<script>\n${readFile(filePath)}\n</script>`;
}

// Process the HTML file line by line
function processHTML(htmlFilePath) {
    const htmlDir = path.dirname(htmlFilePath);
    const lines = readFile(htmlFilePath).split('\n');
    const output = [];

    for (const line of lines) {
        let processedLine = line;

        // ── Local CSS: <link href="./engine/css/style.css" ...> ──
        const localCSSMatch = line.match(/<link[^>]*href=["'](?!https?:\/\/)([^"']*\.css)["'][^>]*>/);
        if (localCSSMatch) {
            const cssPath = path.join(htmlDir, localCSSMatch[1]);
            if (fs.existsSync(cssPath)) {
                processedLine = inlineCSS(cssPath);
                output.push(processedLine);
                continue;
            } else {
                console.warn(`  WARNING: CSS file not found: ${cssPath}`);
            }
        }

        // ── Local JS: <script src="./engine/js/buildform.js"></script> ──
        const localJSMatch = line.match(/<script[^>]*src=["'](?!https?:\/\/)([^"']*)["'][^>]*><\/script>/);
        if (localJSMatch) {
            const jsPath = path.join(htmlDir, localJSMatch[1]);
            if (fs.existsSync(jsPath)) {
                processedLine = inlineJS(jsPath);
                output.push(processedLine);
                continue;
            } else {
                console.warn(`  WARNING: JS file not found: ${jsPath}`);
            }
        }

        // ── Local images: src="./assets/logo.png" ──
        // Convert to base64 for full self-containment
        const localImgMatch = processedLine.match(/src=["'](?!https?:\/\/|data:)([^"']*\.(png|jpe?g|gif|svg))["']/);
        if (localImgMatch) {
            const imgPath = path.join(htmlDir, localImgMatch[1]);
            if (fs.existsSync(imgPath)) {
                const base64 = imageToBase64(imgPath);
                processedLine = processedLine.replace(localImgMatch[1], base64);
                console.log(`  Inlining IMG: ${localImgMatch[1]}`);
            } else {
                console.warn(`  WARNING: Image not found: ${imgPath}`);
            }
        }

        // ── Also handle images in productConfig (logo paths in JS) ──
        // Look for patterns like: logo: "./assets/logo.png"
        const configImgMatches = processedLine.matchAll(/["'](\.\/(assets|img)\/[^"']*\.(png|jpe?g|gif|svg))["']/g);
        for (const match of configImgMatches) {
            const imgPath = path.join(htmlDir, match[1]);
            if (fs.existsSync(imgPath)) {
                const base64 = imageToBase64(imgPath);
                processedLine = processedLine.replace(match[1], base64);
                console.log(`  Inlining config IMG: ${match[1]}`);
            }
        }

        output.push(processedLine);
    }

    return output.join('\n');
}

// ── Main ───────────────────────────────────────────────────────────
function compile() {
    console.log('Starting compilation...');
    console.log(`Source: ${SOURCE_HTML}`);

    const htmlFilePath = path.join(__dirname, SOURCE_HTML);
    if (!fs.existsSync(htmlFilePath)) {
        console.error(`ERROR: Source file not found: ${htmlFilePath}`);
        process.exit(1);
    }

    const compiled = processHTML(htmlFilePath);

    // Ensure dist/ exists
    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true });
    }

    // Remove old compiled file if it exists
    const distOutput = path.join(DIST_DIR, OUTPUT_FILENAME);
    if (fs.existsSync(distOutput)) {
        fs.unlinkSync(distOutput);
    }

    // Write to dist/
    fs.writeFileSync(distOutput, compiled, 'utf8');
    console.log(`\nCompiled: ${distOutput}`);

    // Optionally copy to parent directory
    if (ALSO_COPY_TO_PARENT) {
        const parentOutput = path.join(__dirname, '..', OUTPUT_FILENAME);
        fs.writeFileSync(parentOutput, compiled, 'utf8');
        console.log(`Copied:   ${parentOutput}`);
    }

    console.log('Done.');
}

compile();