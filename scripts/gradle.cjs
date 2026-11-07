const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const sdk =
  process.env.ANDROID_HOME || path.join(os.homedir(), 'Library/Android/sdk');
const env = { ...process.env };
if (fs.existsSync(sdk)) env.ANDROID_HOME = sdk;
const result = spawnSync(
  process.platform === 'win32' ? 'gradlew.bat' : './gradlew',
  [...process.argv.slice(2), '--console=plain'],
  {
    cwd: path.join(__dirname, '../android'),
    env,
    stdio: 'inherit',
  },
);
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
