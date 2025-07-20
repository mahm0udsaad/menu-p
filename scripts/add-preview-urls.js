const fs = require('fs');
const path = require('path');

// Read the metadata file
const metadataPath = path.join(process.cwd(), 'data', 'pdf-templates-metadata.json');
const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
const metadata = JSON.parse(metadataContent);

// Add previewImageUrl to all templates
Object.keys(metadata.templates).forEach(templateId => {
  const template = metadata.templates[templateId];
  if (!template.previewImageUrl) {
    template.previewImageUrl = `/previews/${templateId}-preview.png`;
    console.log(`Added previewImageUrl for template: ${templateId}`);
  }
});

// Write the updated metadata back to the file
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

console.log('Successfully updated all templates with previewImageUrl fields');
console.log('Total templates processed:', Object.keys(metadata.templates).length); 