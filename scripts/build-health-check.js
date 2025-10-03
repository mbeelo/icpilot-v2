#!/usr/bin/env node

/**
 * Build Health Check Script
 * Validates build readiness and environment configuration
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET'
];

class BuildHealthChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        this.errors.push(message);
        console.error(`🔴 ${prefix} ${message}`);
        break;
      case 'warning':
        this.warnings.push(message);
        console.warn(`🟡 ${prefix} ${message}`);
        break;
      case 'info':
        this.info.push(message);
        console.log(`🔵 ${prefix} ${message}`);
        break;
      case 'success':
        console.log(`✅ ${prefix} ${message}`);
        break;
    }
  }

  checkFileExists(filePath, required = true) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    const exists = fs.existsSync(fullPath);

    if (!exists && required) {
      this.log('error', `Required file missing: ${filePath}`);
    } else if (!exists) {
      this.log('warning', `Optional file missing: ${filePath}`);
    } else {
      this.log('success', `File exists: ${filePath}`);
    }

    return exists;
  }

  checkEnvironmentVariables() {
    this.log('info', 'Checking environment variables...');

    // Load .env.local if it exists
    const envLocalPath = path.join(PROJECT_ROOT, '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const envContent = fs.readFileSync(envLocalPath, 'utf8');
      const envVars = {};

      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && !key.startsWith('#')) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      });

      REQUIRED_ENV_VARS.forEach(varName => {
        if (envVars[varName] || process.env[varName]) {
          this.log('success', `Environment variable set: ${varName}`);
        } else {
          this.log('error', `Missing required environment variable: ${varName}`);
        }
      });
    } else {
      this.log('error', 'No .env.local file found');
      REQUIRED_ENV_VARS.forEach(varName => {
        if (process.env[varName]) {
          this.log('success', `Environment variable set: ${varName}`);
        } else {
          this.log('error', `Missing required environment variable: ${varName}`);
        }
      });
    }
  }

  checkPackageJson() {
    this.log('info', 'Checking package.json configuration...');

    const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
    if (!this.checkFileExists('package.json')) return;

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check required scripts
    const requiredScripts = ['build', 'start', 'dev', 'lint'];
    requiredScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        this.log('success', `Script defined: ${script}`);
      } else {
        this.log('error', `Missing required script: ${script}`);
      }
    });

    // Check for Turbopack in build script
    if (packageJson.scripts?.build?.includes('--turbopack')) {
      this.log('success', 'Turbopack enabled for production builds');
    } else {
      this.log('warning', 'Consider enabling Turbopack for faster builds');
    }
  }

  checkTypeScriptConfig() {
    this.log('info', 'Checking TypeScript configuration...');

    if (!this.checkFileExists('tsconfig.json')) return;

    const tsconfigPath = path.join(PROJECT_ROOT, 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

    const recommendedOptions = {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      esModuleInterop: true,
    };

    Object.entries(recommendedOptions).forEach(([option, expectedValue]) => {
      if (tsconfig.compilerOptions && tsconfig.compilerOptions[option] === expectedValue) {
        this.log('success', `TypeScript option configured: ${option}`);
      } else {
        this.log('warning', `Consider setting TypeScript option: ${option} = ${expectedValue}`);
      }
    });
  }

  checkNextConfig() {
    this.log('info', 'Checking Next.js configuration...');

    if (!this.checkFileExists('next.config.ts', false) && !this.checkFileExists('next.config.js', false)) {
      this.log('warning', 'No next.config file found - using defaults');
      return;
    }

    // Basic check for next.config existence
    this.log('success', 'Next.js config file exists');
  }

  checkDependencies() {
    this.log('info', 'Checking dependencies for build optimizations...');

    try {
      const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Check for bundle analyzer
      if (packageJson.devDependencies && packageJson.devDependencies['@next/bundle-analyzer']) {
        this.log('success', 'Bundle analyzer available');
      } else {
        this.log('info', 'Consider adding @next/bundle-analyzer for bundle analysis');
      }

      // Check for husky
      if (packageJson.devDependencies && packageJson.devDependencies['husky']) {
        this.log('success', 'Husky installed for git hooks');
      } else {
        this.log('warning', 'Consider adding husky for pre-commit hooks');
      }

      // Check for lint-staged
      if (packageJson.devDependencies && packageJson.devDependencies['lint-staged']) {
        this.log('success', 'lint-staged installed');
      } else {
        this.log('warning', 'Consider adding lint-staged for pre-commit linting');
      }

    } catch (error) {
      this.log('error', `Failed to analyze dependencies: ${error.message}`);
    }
  }

  checkBuildOutput() {
    this.log('info', 'Checking for previous build artifacts...');

    const buildDirs = ['.next', 'out', 'dist'];
    buildDirs.forEach(dir => {
      const dirPath = path.join(PROJECT_ROOT, dir);
      if (fs.existsSync(dirPath)) {
        this.log('info', `Build directory exists: ${dir}`);
      }
    });
  }

  async testBuild() {
    this.log('info', 'Testing build process...');

    try {
      // Test TypeScript compilation
      execSync('npx tsc --noEmit', { cwd: PROJECT_ROOT, stdio: 'pipe' });
      this.log('success', 'TypeScript compilation successful');
    } catch (error) {
      this.log('error', 'TypeScript compilation failed');
      this.log('error', error.stdout?.toString() || error.message);
    }

    try {
      // Test ESLint
      execSync('npm run lint', { cwd: PROJECT_ROOT, stdio: 'pipe' });
      this.log('success', 'ESLint check passed');
    } catch (error) {
      this.log('warning', 'ESLint issues found (will not block build)');
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('BUILD HEALTH CHECK REPORT');
    console.log('='.repeat(60));

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successful checks: ${this.info.length}`);
    console.log(`   🟡 Warnings: ${this.warnings.length}`);
    console.log(`   🔴 Errors: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log(`\n🔴 Critical Issues (must fix before deployment):`);
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n🟡 Recommendations:`);
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    console.log(`\n🔧 Next Steps:`);
    if (this.errors.length > 0) {
      console.log(`   1. Fix all critical issues listed above`);
      console.log(`   2. Run this health check again`);
      console.log(`   3. Proceed with build optimization`);
    } else {
      console.log(`   1. Review and address warnings`);
      console.log(`   2. Run: npm run build`);
      console.log(`   3. Deploy with confidence!`);
    }

    console.log('='.repeat(60) + '\n');

    return this.errors.length === 0;
  }

  async run() {
    console.log('🚀 Starting Build Health Check...\n');

    this.checkFileExists('package.json');
    this.checkFileExists('tsconfig.json');
    this.checkNextConfig();
    this.checkEnvironmentVariables();
    this.checkPackageJson();
    this.checkTypeScriptConfig();
    this.checkDependencies();
    this.checkBuildOutput();
    await this.testBuild();

    const healthy = this.generateReport();
    process.exit(healthy ? 0 : 1);
  }
}

// Run the health check
const checker = new BuildHealthChecker();
checker.run().catch(error => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
});