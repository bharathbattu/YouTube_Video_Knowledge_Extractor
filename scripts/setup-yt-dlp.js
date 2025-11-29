const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const BIN_DIR = path.join(__dirname, '..', 'bin');
const PLATFORM = process.platform;
const BIN_NAME = PLATFORM === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const BIN_PATH = path.join(BIN_DIR, BIN_NAME);

// Ensure bin directory exists
if (!fs.existsSync(BIN_DIR)) {
  fs.mkdirSync(BIN_DIR, { recursive: true });
}

function getDownloadUrl() {
  const baseUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download';
  switch (PLATFORM) {
    case 'win32':
      return `${baseUrl}/yt-dlp.exe`;
    case 'darwin':
      return `${baseUrl}/yt-dlp_macos`;
    default:
      // Use the standalone Linux binary which includes Python
      return `${baseUrl}/yt-dlp_linux`;
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    const request = https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, dest)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    request.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log(`Setting up yt-dlp for ${PLATFORM}...`);
  const url = getDownloadUrl();
  
  try {
    console.log(`Downloading from ${url}...`);
    await downloadFile(url, BIN_PATH);
    console.log('Download complete.');

    // Wait for file handle to be fully released to avoid "Text file busy" errors
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (PLATFORM !== 'win32') {
      console.log('Making binary executable...');
      fs.chmodSync(BIN_PATH, '755');
      // Wait after chmod to ensure metadata update settles
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`yt-dlp setup successful at ${BIN_PATH}`);
    
    // Verify it works with retry
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        const version = execSync(`"${BIN_PATH}" --version`).toString().trim();
        console.log(`yt-dlp version: ${version}`);
        break;
      } catch (e) {
        console.log(`Verification attempt ${attempts + 1} failed: ${e.message}`);
        attempts++;
        if (attempts === maxAttempts) {
          console.warn('Warning: Could not verify yt-dlp version (it might still work)');
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

main();
