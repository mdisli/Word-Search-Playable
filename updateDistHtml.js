const fs = require('fs');
const path = require('path');

// Paths to the Phaser and bundled JavaScript files
const phaserJsFilePath = path.resolve(__dirname, 'node_modules/phaser/dist/phaser.min.js');
const bundleJsFilePath = path.resolve(__dirname, 'dist', 'bundle.js');
const newHtmlFilePath = path.resolve(__dirname, 'dist', 'index.html');

// Read the contents of the Phaser JavaScript file
const phaserJsContent = fs.readFileSync(phaserJsFilePath, 'utf8');

// Read the contents of the bundled JavaScript file
const bundleJsContent = fs.readFileSync(bundleJsFilePath, 'utf8');

// Construct the HTML content
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Word Search Colorful</title>
    <script>${phaserJsContent}</script>
</head>
<body>
    <script>${bundleJsContent}</script>
</body>
</html>
`;

// Write the HTML content to the new file
fs.writeFile(newHtmlFilePath, htmlContent, 'utf8', (err) => {
    if (err) {
        console.error('Error writing HTML file:', err);
        return;
    }
    console.log('New HTML file created successfully!');
});