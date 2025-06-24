#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import { readConfig, updateReferrerStatus, setWhitelistEnabled } from '../utils/config.js';

/**
 * Display the CLI header
 */
function displayHeader() {
  console.log(chalk.blue.bold('\n================================='));
  console.log(chalk.blue.bold('  SMTP API Referrer Whitelist CLI'));
  console.log(chalk.blue.bold('=================================\n'));
}

/**
 * Display the current whitelist status
 */
function displayStatus() {
  const config = readConfig();
  const whitelistStatus = config.whitelistEnabled 
    ? chalk.green('ENABLED') 
    : chalk.yellow('DISABLED');
  
  console.log(`Whitelist Protection: ${whitelistStatus}`);
  console.log(`Total Referrers: ${Object.keys(config.referrers).length}`);
  console.log(`Whitelisted Referrers: ${Object.values(config.referrers).filter(Boolean).length}\n`);
}

/**
 * Main menu options
 */
async function mainMenu() {
  displayHeader();
  displayStatus();
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'List all referrers', value: 'list' },
        { name: 'Manage whitelist', value: 'manage' },
        { name: 'Toggle whitelist protection', value: 'toggle' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);
  
  switch (action) {
    case 'list':
      await listReferrers();
      break;
    case 'manage':
      await manageWhitelist();
      break;
    case 'toggle':
      await toggleWhitelistProtection();
      break;
    case 'exit':
      console.log(chalk.blue('Goodbye!'));
      process.exit(0);
  }
  
  // Return to main menu
  await mainMenu();
}

/**
 * List all referrers
 */
async function listReferrers() {
  const config = readConfig();
  const referrers = Object.keys(config.referrers);
  
  console.log(chalk.blue.bold('\nReferrer List:'));
  
  if (referrers.length === 0) {
    console.log(chalk.yellow('No referrers found. The API has not received any requests yet.'));
  } else {
    referrers.forEach(referrer => {
      const status = config.referrers[referrer] 
        ? chalk.green('✓ Whitelisted') 
        : chalk.red('✗ Not whitelisted');
      console.log(`${referrer} - ${status}`);
    });
  }
  
  console.log(''); // Empty line for spacing
  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...'
    }
  ]);
}

/**
 * Manage the whitelist
 */
async function manageWhitelist() {
  const config = readConfig();
  const referrers = Object.keys(config.referrers);
  
  if (referrers.length === 0) {
    console.log(chalk.yellow('\nNo referrers found. The API has not received any requests yet.'));
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...'
      }
    ]);
    return;
  }
  
  const { selectedReferrers } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedReferrers',
      message: 'Select referrers to whitelist:',
      choices: referrers.map(referrer => ({
        name: referrer,
        value: referrer,
        checked: config.referrers[referrer]
      }))
    }
  ]);
  
  // Update whitelist status for each referrer
  referrers.forEach(referrer => {
    const whitelisted = selectedReferrers.includes(referrer);
    if (config.referrers[referrer] !== whitelisted) {
      updateReferrerStatus(referrer, whitelisted);
    }
  });
  
  console.log(chalk.green('\nWhitelist updated successfully!'));
}

/**
 * Toggle whitelist protection
 */
async function toggleWhitelistProtection() {
  const config = readConfig();
  const currentStatus = config.whitelistEnabled;
  
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Whitelist protection is currently ${currentStatus ? 'ENABLED' : 'DISABLED'}. Do you want to ${currentStatus ? 'disable' : 'enable'} it?`,
      default: false
    }
  ]);
  
  if (confirm) {
    setWhitelistEnabled(!currentStatus);
    console.log(chalk.green(`\nWhitelist protection ${!currentStatus ? 'enabled' : 'disabled'} successfully!`));
  }
}

// Start the CLI
console.debug('Starting SMTP API CLI');
mainMenu().catch(error => {
  console.error('Error in CLI:', error);
  process.exit(1);
});
