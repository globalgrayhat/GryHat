const fs = require('fs');
const path = require('path');

// Find all .env files
const envFiles = fs.readdirSync('.').filter(file => file.startsWith('.env'));

console.log('Found environment files:', envFiles);

envFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  const newLines = lines.map(line => {
    if (line.startsWith('REACT_APP_')) {
      return line.replace('REACT_APP_', 'VITE_');
    }
    return line;
  });
  
  // Create backup
  fs.writeFileSync(`${file}.backup`, content);
  
  // Write updated content
  fs.writeFileSync(file, newLines.join('\n'));
  
  console.log(`Updated ${file}`);
});

console.log('Environment variables migration complete!');
