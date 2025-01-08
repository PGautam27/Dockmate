const fs = require('fs').promises;
const path = require('path');
const {log} = require('../utils/logger');

//BACKUP
// Backup Directory
const backupDir = path.resolve('.dockmate/backups');

// Ensure Backup Directory Exists
async function ensureBackupDir() {
  try {
    await fs.mkdir(backupDir, { recursive: true });
    return true;
  } catch (err) {
    log.error(`Failed to create backup directory:  err.message`);
    return false;
  }
}

// Check Directory Exists
async function backupDirExists(dirPath) {
  try {
    await fs.access(backupDir, 'rw');
    return true;
  } catch {
    return false;
  }
}

// Backup Existing Dockerfile
async function backupDockerfile() {
  const dockerfilePath = path.resolve('Dockerfile');
  if (await fileExists(dockerfilePath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `Dockerfile-${timestamp}.bak`);
    await fs.copyFile(dockerfilePath, backupPath);
    log.info(`Backup saved: ${backupPath}`);
  }
}

// Check if File Exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// UNDO
  // Restore a Specific or Latest Backup
async function undoBackup(backupFileName = null) {
    const backups = await fs.readdir(backupDir);
    if (backups.length === 0) {
      log.info('No backups available to undo.');
      return;
    }
  
    let backupToRestore;
    if (backupFileName) {
      // Validate provided backup file
      if (backups.includes(backupFileName)) {
        backupToRestore = backupFileName;
      } else {
        log.error(`Backup file "${backupFileName}" not found.`);
        return;
      }
    } else {
      // Default to the latest backup
      backupToRestore = backups.sort().pop(); // Latest based on timestamp
    }
  
    const backupPath = path.join(backupDir, backupToRestore);
    const dockerfilePath = path.resolve('Dockerfile');
  
    // Restore the Backup
    await fs.copyFile(backupPath, dockerfilePath);
    log.info(`Restored backup: ${backupPath}`);
  }
  

  
  // DELETE / RESET
  
  // Delete All Backups
  async function deleteAllBackups() {
    const backups = await fs.readdir(backupDir);
    if (backups.length === 0) {
      log.info('No backups to delete.');
      return;
    }
  
    for (const backup of backups) {
      const backupPath = path.join(backupDir, backup);
      await fs.unlink(backupPath);
      log.info(`Deleted backup: ${backupPath}`);
    }
  }
  
  module.exports = {
    ensureBackupDir,
    backupDockerfile,
    undoBackup,
    deleteAllBackups,
    backupDirExists
  }