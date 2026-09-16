const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'stitch_screens');
const outputDir = path.join(__dirname, 'apps', 'web', 'src', 'components', 'stitch');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.html'));

function convertToReact(htmlStr, componentName) {
  // Extract body content
  let bodyMatch = htmlStr.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : htmlStr;

  // Replace class= with className=
  content = content.replace(/class=/g, 'className=');
  // Replace for= with htmlFor=
  content = content.replace(/for=/g, 'htmlFor=');
  
  // Replace HTML comments with JSX comments
  content = content.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

  // Self close void tags
  const voidTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'path', 'circle', 'rect'];
  voidTags.forEach(tag => {
    const regex = new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'gi');
    content = content.replace(regex, `<${tag}$1 />`);
  });
  
  // Style strings to objects - this is hard via regex, but we will wrap it in a placeholder or just leave it. 
  // Most stitch outputs use tailwind classes, not inline styles. But if there are, we should warn or try a basic replace.
  // We'll replace simple style="width: 100%" to style={{width: '100%'}} roughly or leave it to manual fix.
  // Actually, let's just do a basic one for style="x: y" if they exist
  content = content.replace(/style="([^"]+)"/g, (match, styles) => {
    const obj = styles.split(';').filter(Boolean).map(s => {
      const [key, value] = s.split(':');
      if (!key || !value) return '';
      const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      return `${camelKey}: '${value.trim().replace(/'/g, "\\'")}'`;
    }).filter(Boolean).join(', ');
    return `style={{ ${obj} }}`;
  });

  return `import React from 'react';

export function ${componentName}() {
  return (
    <>
      ${content}
    </>
  );
}
`;
}

files.forEach(file => {
  const filePath = path.join(inputDir, file);
  const htmlContent = fs.readFileSync(filePath, 'utf-8');
  
  // create component name
  const basename = path.basename(file, '.html');
  const componentName = basename.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  
  const reactCode = convertToReact(htmlContent, componentName);
  
  const outPath = path.join(outputDir, `${componentName}.tsx`);
  fs.writeFileSync(outPath, reactCode);
  console.log(`Converted ${file} to ${componentName}.tsx`);
});
