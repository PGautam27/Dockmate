// Utility for logging
const log = {
    info: (msg) => console.log(`[INFO] ${msg}`),
    error: (msg) => console.error(`[ERROR] ${msg}`),
    success: (msg) => console.log(`[SUCCESS] ${msg}`),
  };

module.exports = { log };