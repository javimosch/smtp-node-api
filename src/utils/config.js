import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, '../../data/config.json');

/**
 * Read the configuration file
 * @returns {Object} The configuration object
 */
export function readConfig() {
  try {
    // Create config file if it doesn't exist
    if (!fs.existsSync(CONFIG_PATH)) {
      const defaultConfig = {
        whitelistEnabled: false,
        referrers: {}
      };
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
      console.debug('Created default config file');
      return defaultConfig;
    }

    const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
    console.debug('Config loaded successfully');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error reading config file:', error);
    return {
      whitelistEnabled: false,
      referrers: {}
    };
  }
}

/**
 * Write to the configuration file
 * @param {Object} config - The configuration object to write
 */
export function writeConfig(config) {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.debug('Created data directory');
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.debug('Config saved successfully');
    return true;
  } catch (error) {
    console.error('Error writing config file:', error);
    return false;
  }
}

/**
 * Add a referrer to the configuration
 * @param {string} referrer - The referrer URL to add
 * @param {boolean} whitelisted - Whether the referrer is whitelisted
 */
export function addReferrer(referrer, whitelisted = false) {
  const config = readConfig();
  
  // Only add if it doesn't exist
  if (config.referrers[referrer] === undefined) {
    config.referrers[referrer] = whitelisted;
    writeConfig(config);
    console.debug(`Added referrer: ${referrer}, whitelisted: ${whitelisted}`);
  }
  
  return config;
}

/**
 * Update the whitelist status of a referrer
 * @param {string} referrer - The referrer URL to update
 * @param {boolean} whitelisted - The new whitelist status
 */
export function updateReferrerStatus(referrer, whitelisted) {
  const config = readConfig();
  
  if (config.referrers[referrer] !== undefined) {
    config.referrers[referrer] = whitelisted;
    writeConfig(config);
    console.debug(`Updated referrer: ${referrer}, whitelisted: ${whitelisted}`);
  }
  
  return config;
}

/**
 * Set the whitelist protection status
 * @param {boolean} enabled - Whether whitelist protection is enabled
 */
export function setWhitelistEnabled(enabled) {
  const config = readConfig();
  config.whitelistEnabled = enabled;
  writeConfig(config);
  console.debug(`Whitelist protection ${enabled ? 'enabled' : 'disabled'}`);
  return config;
}

/**
 * Check if a referrer is whitelisted
 * @param {string} referrer - The referrer URL to check
 * @returns {boolean} Whether the referrer is allowed
 */
export function isReferrerAllowed(referrer) {
  const config = readConfig();
  
  // If whitelist is disabled, all referrers are allowed
  if (!config.whitelistEnabled) {
    return true;
  }
  
  // If referrer is not in the list or is explicitly set to false, it's not allowed
  return config.referrers[referrer] === true;
}
