const esbuild = require('esbuild');
const { copy } = require('esbuild-plugin-copy');
const path = require('path');
const fs = require('fs');

// Add a unique build ID to help track the build process
const BUILD_ID = Date.now().toString();
console.log(`Build ID: ${BUILD_ID}`);

// Check if we're in the packaging process or regular build
const isPackaging = process.env.PACKAGING === 'true';
console.log(`Build mode: ${isPackaging ? 'Packaging' : 'Regular build'}`);

// Create a debug marker file during the build to track the process
const debugMarkerPath = path.join(__dirname, '.build-marker');
fs.writeFileSync(debugMarkerPath, `Build started at ${new Date().toISOString()}\nBuild ID: ${BUILD_ID}\nPackaging: ${isPackaging}`);

// Log when scripts are being copied to help debug
const logCopyPlugin = {
  name: 'log-copy',
  setup(build) {
    build.onEnd(() => {
      console.log('🔄 Checking media files...');
      
      // Check filter scripts in particular
      const filterBuilderSrc = path.join(__dirname, 'media', 'js', 'common-filter-builder.js');
      if (fs.existsSync(filterBuilderSrc)) {
        console.log(`✅ Filter builder script found at: ${filterBuilderSrc}`);
        
        // Log file size and timestamp
        const stats = fs.statSync(filterBuilderSrc);
        console.log(`   Size: ${stats.size} bytes, Modified: ${stats.mtime.toISOString()}`);
        
        // Log first few lines for verification
        const content = fs.readFileSync(filterBuilderSrc, 'utf8');
        const firstLines = content.split('\n').slice(0, 5).join('\n');
        console.log(`   Content preview:\n${firstLines}...`);
      } else {
        console.error('❌ Filter builder script NOT found!');
      }
    });
  }
};

// Only include the copy plugin during regular builds to avoid duplication
const plugins = [logCopyPlugin];

if (!isPackaging) {
  plugins.push(
    copy({
      assets: [
        { from: ['./media/**/*'], to: './out/media' }
      ],
    })
  );
}

const buildOptions = {
  entryPoints: ['./src/extension.ts'],
  bundle: true,
  outfile: 'out/extension.js',
  external: ['vscode'], // Don't bundle vscode API
  format: 'cjs',
  platform: 'node',
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
  plugins: plugins,
};

// Build script
async function build() {
  try {
    console.log('🔨 Building extension with esbuild...');
    await esbuild.build(buildOptions);
    console.log('✅ Build completed successfully!');
  } catch (err) {
    console.error('❌ Build failed:', err);
    process.exit(1);
  }
}

// Watch script (for development)
async function watch() {
  try {
    console.log('👀 Watching for changes...');
    const ctx = await esbuild.context({
      ...buildOptions,
      sourcemap: true,
    });
    await ctx.watch();
    console.log('👀 esbuild is watching for changes');
  } catch (err) {
    console.error('❌ Watch failed:', err);
    process.exit(1);
  }
}

// Check if the script is called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const watchMode = args.includes('--watch');
  
  if (watchMode) {
    watch();
  } else {
    build();
  }
}

module.exports = { build, watch };
