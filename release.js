// SET THIS TO TRUE IF USING GIT
const isGitEnabled = true;

const { execSync } = require('child_process');
const { readFileSync, writeFileSync, appendFileSync } = require('fs');
const path = require('path');
const readline = require('readline');

// Create a custom logger
const logFile = path.join(__dirname, 'release.log');
const logger = {
  log: (message) => {
    console.log(message);
    appendFileSync(logFile, `${message}\n`, 'utf8');
  },
  error: (message) => {
    console.error(message);
    appendFileSync(logFile, `ERROR: ${message}\n`, 'utf8');
  }
};

// Clear the log file at the start of each run
writeFileSync(logFile, '', 'utf8');

// Function to execute a shell command and output the result
function execCommand(command) {
  try {
    logger.log(`Executing: ${command}`);
    const output = execSync(command, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] });
    logger.log(output);
    return output;
  } catch (error) {
    logger.error(`Error executing command: ${command}`);
    if (error.stdout) logger.log(`Command stdout:\n${error.stdout}`);
    if (error.stderr) logger.error(`Command stderr:\n${error.stderr}`);
    process.exit(1);
  }
}

// Function to update the version in version.js and version.json
function updateVersionFile(versionType) {
  const filePath = path.join(__dirname, 'product/version.js');
  let fileContent = readFileSync(filePath, 'utf8');

  const majorVersionMatch = fileContent.match(/window\.majorVersion\s*=\s*(\d+);/);
  const minorVersionMatch = fileContent.match(/window\.minorVersion\s*=\s*(\d+);/);
  const patchVersionMatch = fileContent.match(/window\.patchVersion\s*=\s*(\d+);/);

  let majorVersion = parseInt(majorVersionMatch[1]);
  let minorVersion = parseInt(minorVersionMatch[1]);
  let patchVersion = parseInt(patchVersionMatch[1]);

  if (versionType === 'major') {
    majorVersion++;
    minorVersion = 0;
    patchVersion = 0;
  } else if (versionType === 'minor') {
    minorVersion++;
    patchVersion = 0;
  } else if (versionType === 'patch') {
    patchVersion++;
  } else {
    logger.error('Invalid version type.');
    process.exit(1);
  }

  const newVersion = `${majorVersion}.${minorVersion}.${patchVersion}`;

  // Update version.js content
  fileContent = fileContent.replace(/window\.majorVersion\s*=\s*\d+;/, `window.majorVersion = ${majorVersion};`)
                           .replace(/window\.minorVersion\s*=\s*\d+;/, `window.minorVersion = ${minorVersion};`)
                           .replace(/window\.patchVersion\s*=\s*\d+;/, `window.patchVersion = ${patchVersion};`)
                           .replace(/window\.version\s*=\s*.*;/, `window.version = "${newVersion}";`);
  writeFileSync(filePath, fileContent, 'utf8');
  logger.log(`Updated version.js to version ${newVersion}`);

  // Update version-check submodule before writing changes
  if(isGitEnabled) {
    execCommand('git -C version-check-2 pull origin main');
  }

  // Update version.json content in the version-check submodule
  const jsonFilePath = path.join(__dirname, '/version-check-2/formbrew.json');
  const jsonContent = JSON.stringify({
    latest_version: newVersion
  }, null, 2);
  writeFileSync(jsonFilePath, jsonContent, 'utf8');
  logger.log(`Updated version.json to version ${newVersion}`);

  return newVersion;
}

// Prompt user for the version type
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Wrap the question in a promise to log the user's input
function askQuestion(query) {
  return new Promise(resolve => {
    rl.question(query, (answer) => {
      logger.log(`User input: ${answer}`);
      resolve(answer);
    });
  });
}

// Main execution
(async () => {
  try {
    const versionType = await askQuestion('Is this a patch, minor, or major release? ');
    const validTypes = ['patch', 'minor', 'major'];
    if (!validTypes.includes(versionType)) {
      logger.error('Invalid version type. Please specify "patch", "minor", or "major".');
      process.exit(1);
    }

    // Update the version in the file and get the new version string
    const newVersion = updateVersionFile(versionType);

    // Merge dev into main, tag the commit, build the project, and copy the /dist folder
    if (isGitEnabled) {
      // Step 1: Checkout the dev branch and pull the latest changes
      execCommand('git checkout dev');
      execCommand('git -c core.verbose=true pull origin dev');

      // Step 3: Add and commit the updated version.json in the submodule
      execCommand('git -C version-check-2 add -v formbrew.json');
      execCommand(`git -C version-check-2 -c core.verbose=true commit -v -m "Update formbrew.json to v${newVersion}"`);
      execCommand('git -C version-check-2 -c core.verbose=true push -v origin main');

      // Step 4: Update the submodule reference in the parent repository
      execCommand('git add -v version-check-2');
      execCommand(`git -c core.verbose=true commit -v -m "Update submodule version-check-2 to latest commit"`);
      execCommand('git -c core.verbose=true push -v origin dev');

      // Step 5: Add and commit the updated version.js and version.json
      execCommand('git add -v product/version.js');
      execCommand(`git -c core.verbose=true commit -v -m "Update version to v${newVersion}"`);
      execCommand('git -c core.verbose=true push -v origin dev');

      // Step 6: Checkout the main branch and pull the latest changes
      execCommand('git checkout main');
      execCommand('git -c core.verbose=true pull -v origin main');

      // Step 7: Merge the dev branch into the main branch
      execCommand('git -c core.verbose=true merge -v dev');

      // Step 8: Tag the commit on the main branch
      execCommand(`git tag v${newVersion}`);
      execCommand('git -c core.verbose=true push -v origin main --tags');
      execCommand('git checkout dev');
    }

    logger.log(`Release ${newVersion} created successfully!`);
  } catch (error) {
    logger.error('Error during release process:', error);
  } finally {
    rl.close();
  }
})();