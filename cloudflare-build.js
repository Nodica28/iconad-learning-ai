// cloudflare-build.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Cloudflare build process...');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.NEXT_SHARP_PATH = './node_modules/sharp';

try {
  // Remove sharp from dependencies temporarily for the build
  console.log('Modifying package.json for Cloudflare build...');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Store original sharp version if it exists
  const originalSharpVersion = packageJson.dependencies.sharp;
  
  // Remove sharp from dependencies
  delete packageJson.dependencies.sharp;
  
  // Write the modified package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log('Running Next.js build...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('Running OpenNext Cloudflare build...');
  execSync('npx @opennextjs/cloudflare', { stdio: 'inherit' });
  
  // Restore original package.json
  console.log('Restoring package.json...');
  if (originalSharpVersion) {
    packageJson.dependencies.sharp = originalSharpVersion;
  }
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 