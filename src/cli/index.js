#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();
import inquirer from 'inquirer';
import chalk from 'chalk';
import fetch from 'node-fetch';
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
        { name: 'Test API endpoint with fake referrer', value: 'test' },
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
    case 'test':
      await testApiEndpoint();
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

/**
 * Test the API endpoint with a fake referrer
 */
async function testApiEndpoint() {
  console.log(chalk.blue.bold('\nTest API Endpoint'));
  
  // Get the server URL
  const { serverUrl } = await inquirer.prompt([
    {
      type: 'input',
      name: 'serverUrl',
      message: 'Enter the server URL:',
      default: 'http://localhost:' + (process.env.PORT || 3000)
    }
  ]);
  
  // Get the fake referrer
  const { referrer } = await inquirer.prompt([
    {
      type: 'input',
      name: 'referrer',
      message: 'Enter a fake referrer URL:',
      default: 'https://example.com'
    }
  ]);
  
  // Get test data
  const { testData } = await inquirer.prompt([
    {
      type: 'input',
      name: 'testData',
      message: 'Enter test data (JSON format):',
      default: '{"from":"no-reply@intrane.fr","to":"arancibiajav@gmail.com","subject":"Test POST endpoint (smtp-node-api)","body":"Hi this is a test {body}"}',
      validate: (input) => {
        try {
          JSON.parse(input);
          return true;
        } catch (e) {
          return 'Please enter valid JSON';
        }
      }
    }
  ]);
  
  try {
    console.log(chalk.yellow('\nSending request to:', `${serverUrl}/send-email`));
    console.log(chalk.yellow('With referrer:', referrer));
    console.log(chalk.yellow('With data:', testData));
    
    const response = await fetch(`${serverUrl}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': referrer
      },
      body: testData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(chalk.green('\nRequest successful!'));
      console.log(chalk.green('Response:', JSON.stringify(result, null, 2)));
    } else {
      console.log(chalk.red('\nRequest failed!'));
      console.log(chalk.red('Response:', JSON.stringify(result, null, 2)));
    }
  } catch (error) {
    console.log(chalk.red('\nError sending request:'));
    console.log(chalk.red(error.message));
  }
  
  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...'
    }
  ]);
}

// Start the CLI
console.debug('Starting SMTP API CLI');
mainMenu().catch(error => {
  console.error('Error in CLI:', error);
  process.exit(1);
});
