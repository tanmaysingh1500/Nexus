#!/usr/bin/env node
/**
 * Database migration script with environment detection
 * Auto-migrates for local/staging, requires confirmation for production
 */

const { execSync } = require('child_process');
const readline = require('readline');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function print(text, color = '') {
  console.log(color + text + colors.reset);
}

// Get environment from NODE_ENV or command line argument
const environment = process.argv[2] || process.env.NODE_ENV || 'development';
const envMap = {
  'development': 'local',
  'local': 'local',
  'staging': 'staging',
  'production': 'production',
  'prod': 'production'
};

const normalizedEnv = envMap[environment.toLowerCase()] || 'local';

// Determine which env file to use
const envFile = normalizedEnv === 'local' ? '.env.local' : `.env.${normalizedEnv}`;

print(`\n🚀 Database Migration Tool`, colors.bright + colors.blue);
print(`==========================`);
print(`Environment: ${colors.cyan}${normalizedEnv}${colors.reset}`);
print(`Using: ${colors.cyan}${envFile}${colors.reset}\n`);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to run migrations
async function runMigrations() {
  try {
    // For production, require confirmation
    if (normalizedEnv === 'production') {
      print(`⚠️  WARNING: You are about to run migrations on PRODUCTION!`, colors.yellow);
      print(`This will modify the production database.`, colors.yellow);
      
      const answer = await new Promise(resolve => {
        rl.question(`\nType "YES" to continue, or anything else to cancel: `, resolve);
      });
      
      if (answer !== 'YES') {
        print(`\n❌ Migration cancelled.`, colors.red);
        rl.close();
        process.exit(0);
      }
      
      print(`\n✅ Proceeding with production migration...`, colors.green);
    }
    
    // Load the appropriate env file
    const envPath = path.join(__dirname, '..', envFile);
    print(`Loading environment from: ${envPath}`);
    
    // Check if env file exists
    const fs = require('fs');
    if (!fs.existsSync(envPath)) {
      throw new Error(`Environment file not found: ${envFile}`);
    }
    
    // Load environment variables
    const envContent = fs.readFileSync(envPath, 'utf8');
    const rawPostgresUrl = envContent.match(/POSTGRES_URL=(.+)/)?.[1];
    const postgresUrl = rawPostgresUrl?.trim().replace(/^['"]|['"]$/g, '');
    
    if (!postgresUrl) {
      throw new Error(`POSTGRES_URL not found in ${envFile}`);
    }
    
    // Show which database we're migrating
    const dbHost = postgresUrl.match(/@([^\/]+)\//)?.[1] || 'unknown';
    print(`\n📊 Database: ${colors.cyan}${dbHost}${colors.reset}`);
    
    // Run migrations in a cross-platform way (Windows shell doesn't support VAR=value cmd syntax)
    print(`\n🔄 Running migrations...`);

    execSync('npm run drizzle:migrate', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        POSTGRES_URL: postgresUrl,
        DATABASE_URL: postgresUrl,
      },
    });
    
    print(`\n✅ Migrations completed successfully!`, colors.green);
    
    // Show next steps
    if (normalizedEnv === 'local') {
      print(`\n💡 You can now run: ${colors.cyan}npm run dev${colors.reset}`);
    } else if (normalizedEnv === 'staging') {
      print(`\n💡 Staging database is ready for testing`);
    } else {
      print(`\n💡 Production database has been updated`);
    }
    
  } catch (error) {
    print(`\n❌ Migration failed: ${error.message}`, colors.red);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Show current migration status
async function showStatus() {
  print(`📋 Migration Status Check`, colors.bright);
  print(`------------------------`);
  
  const environments = ['local', 'staging', 'production'];
  
  for (const env of environments) {
    const envFile = env === 'local' ? '.env.local' : `.env.${env}`;
    const envPath = path.join(__dirname, '..', envFile);
    
    try {
      const fs = require('fs');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const postgresUrl = envContent.match(/POSTGRES_URL=(.+)/)?.[1];
        
        if (postgresUrl) {
          const dbHost = postgresUrl.match(/@([^\/]+)\//)?.[1] || 'unknown';
          print(`✅ ${env.toUpperCase()}: ${dbHost}`, colors.green);
        } else {
          print(`⚠️  ${env.toUpperCase()}: No POSTGRES_URL found`, colors.yellow);
        }
      } else {
        print(`❌ ${env.toUpperCase()}: ${envFile} not found`, colors.red);
      }
    } catch (error) {
      print(`❌ ${env.toUpperCase()}: Error reading config`, colors.red);
    }
  }
}

// Main execution
(async () => {
  // If called with --status, show status
  if (process.argv.includes('--status')) {
    await showStatus();
    process.exit(0);
  }
  
  // Otherwise run migrations
  await runMigrations();
})();