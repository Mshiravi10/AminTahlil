const fs = require('fs');
const path = require('path');

try {
  const reactScriptsPath = path.resolve('./node_modules/.bin/react-scripts');
  console.log('Checking if react-scripts exists at:', reactScriptsPath);
  console.log('File exists:', fs.existsSync(reactScriptsPath));
  
  const nodeModulesPath = path.resolve('./node_modules');
  console.log('node_modules exists:', fs.existsSync(nodeModulesPath));
  
  const reactScriptsDir = path.resolve('./node_modules/react-scripts');
  console.log('react-scripts dir exists:', fs.existsSync(reactScriptsDir));
} catch (error) {
  console.error('Error:', error);
}
