const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'node_modules', 'hermes-compiler', 'hermesc');
const destDir = path.join(__dirname, '..', 'node_modules', 'react-native', 'sdks', 'hermesc');

if (fs.existsSync(srcDir)) {
  console.log('Fixing Hermes path...');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Recursive copy
  function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }
      fs.readdirSync(src).forEach((childItemName) => {
        copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
      });
    } else {
      fs.copyFileSync(src, dest);
      // Ensure executability on Linux for EAS
      if (process.platform !== 'win32') {
        try {
          fs.chmodSync(dest, 0o755);
        } catch (e) {
          console.warn(`Could not set permissions for ${dest}:`, e.message);
        }
      }
    }
  }

  try {
    copyRecursiveSync(srcDir, destDir);
    console.log('Successfully copied hermesc to legacy path.');
  } catch (err) {
    console.error('Failed to copy hermesc:', err);
  }
} else {
  console.warn('hermes-compiler not found at', srcDir);
}
