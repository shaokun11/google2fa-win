const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CACHE = path.join(os.homedir(), 'AppData', 'Local', 'electron-builder', 'Cache', 'winCodeSign');

// Watch for new .7z files and extract them, skipping symlinks
let lastCount = 0;
const interval = setInterval(() => {
  try {
    const files = fs.readdirSync(CACHE).filter(f => f.endsWith('.7z'));
    for (const file of files) {
      const dir = path.join(CACHE, file.replace('.7z', ''));
      const marker = path.join(dir, '.extracted');
      if (!fs.existsSync(marker)) {
        const fullPath = path.join(CACHE, file);
        // Extract skipping symlinks
        try { execSync(`7za x -aoa -y -bd "${fullPath}" -o"${dir}"`, { stdio: 'pipe' }); } catch {}
        // Create dummy symlink files
        const darwinLib = path.join(dir, 'darwin', '10.12', 'lib');
        fs.mkdirSync(darwinLib, { recursive: true });
        fs.writeFileSync(path.join(darwinLib, 'libcrypto.dylib'), '');
        fs.writeFileSync(path.join(darwinLib, 'libssl.dylib'), '');
        fs.writeFileSync(marker, 'done');
      }
    }
  } catch {}
}, 500);

// Run the actual package command
const cmd = process.argv.slice(2).join(' ');
try {
  execSync(cmd, { stdio: 'inherit' });
} finally {
  clearInterval(interval);
}
