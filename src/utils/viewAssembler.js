const fs = require('fs');
const path = require('path');

/**
 * Assembles modular HTML components into the unified public/index.html document
 */
function assembleIndexHtml() {
  const publicDir = path.join(__dirname, '../../public');
  const templatePath = path.join(publicDir, 'index.template.html');

  if (!fs.existsSync(templatePath)) {
    const indexPath = path.join(publicDir, 'index.html');
    return fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
  }

  let template = fs.readFileSync(templatePath, 'utf8');

  // Replace each component include directive: <!-- @include 'components/...' -->
  template = template.replace(/<!--\s*@include\s*['"]([^'"]+)['"]\s*-->/g, (match, relPath) => {
    const componentPath = path.join(publicDir, relPath);
    if (fs.existsSync(componentPath)) {
      return fs.readFileSync(componentPath, 'utf8');
    }
    console.warn(`[ViewAssembler] Component not found: ${componentPath}`);
    return `<!-- Component not found: ${relPath} -->`;
  });

  // Write assembled output to public/index.html so static file serving is always synchronized
  const outputPath = path.join(publicDir, 'index.html');
  fs.writeFileSync(outputPath, template, 'utf8');

  return template;
}

if (require.main === module) {
  assembleIndexHtml();
  console.log('✔ Successfully assembled public/index.html from components!');
}

module.exports = {
  assembleIndexHtml
};

