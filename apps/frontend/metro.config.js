const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const workspaceRoot = path.resolve(__dirname, "../..");
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo so Metro can resolve workspace packages
config.watchFolders = [workspaceRoot];

// Tell Metro where to resolve node_modules: app-level first, then monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Enable symlinks so workspace package symlinks are followed correctly
config.resolver.unstable_enableSymlinks = true;

// Force a single instance of Firebase packages to prevent "Component auth has
// not been registered yet" errors caused by duplicate module instances in the
// monorepo.  Metro may otherwise resolve the same package from two different
// node_modules directories, giving Firebase two separate component registries.
const firebasePackages = [
  "firebase",
  "@firebase/app",
  "@firebase/app-check",
  "@firebase/auth",
  "@firebase/firestore",
  "@firebase/functions",
  "@firebase/storage",
  "@firebase/installations",
  "@firebase/messaging",
  "@firebase/analytics",
  "@firebase/remote-config",
  "@firebase/performance",
];

// Resolve each package to whichever node_modules directory actually contains it
function resolvePackageDir(pkg) {
  try {
    return path.dirname(
      require.resolve(pkg + "/package.json", { paths: [projectRoot] })
    );
  } catch (appErr) {
    try {
      return path.dirname(
        require.resolve(pkg + "/package.json", { paths: [workspaceRoot] })
      );
    } catch (rootErr) {
      console.warn(`[metro] Could not resolve "${pkg}" from app or workspace root:`, rootErr.message);
      throw rootErr;
    }
  }
}

config.resolver.extraNodeModules = firebasePackages.reduce((acc, pkg) => {
  try {
    acc[pkg] = resolvePackageDir(pkg);
  } catch {
    // Package not installed; skip silently — it is expected that some optional
    // Firebase sub-packages (e.g. analytics, remote-config) may not be present.
  }
  return acc;
}, {});

module.exports = withNativeWind(config, { input: "./global.css" });
