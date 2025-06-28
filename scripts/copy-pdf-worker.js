const fs = require('fs');
const path = require('path');

// Source and destination paths
const sourceFile = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const destDir = path.join(__dirname, '..', 'public', 'static', 'worker');
const destFile = path.join(destDir, 'pdf.worker.min.js');

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy the worker file
try {
  fs.copyFileSync(sourceFile, destFile);
  console.log('PDF.js worker copied successfully!');
  console.log(`From: ${sourceFile}`);
  console.log(`To: ${destFile}`);
} catch (error) {
  console.error('Error copying PDF.js worker:', error.message);
  process.exit(1);
} 