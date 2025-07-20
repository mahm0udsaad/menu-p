const fs = require('fs');
const path = require('path');

// Copy PDF worker files to public directory
const sourceDir = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build');
const targetDir = path.join(__dirname, '..', 'public', 'static', 'worker');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy PDF worker files
const filesToCopy = [
  'pdf.worker.min.js',
  'pdf.worker.min.js.map'
];

filesToCopy.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Copied ${file} to public/static/worker/`);
  } else {
    console.log(`⚠️  Warning: ${file} not found in ${sourceDir}`);
  }
});

console.log('📄 PDF worker files copied successfully!'); 