import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(process.argv[2] ?? process.cwd());
const appDir = path.join(projectRoot, 'app');
const buildGradlePath = path.join(appDir, 'build.gradle');
const manifestPath = path.join(appDir, 'src', 'main', 'AndroidManifest.xml');

function readRequired(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required file not found: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function writeIfChanged(filePath, nextContent) {
  const previous = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
  if (previous === nextContent) return false;

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, nextContent, 'utf8');
  return true;
}

function replaceSdkValue(content, patterns, replacementValue) {
  let nextContent = content;

  for (const pattern of patterns) {
    nextContent = nextContent.replace(pattern, `$1${replacementValue}`);
  }

  return nextContent;
}

function ensureDependency(content, dependencyLine) {
  if (content.includes(dependencyLine)) return content;

  return content.replace(/dependencies\s*\{/, `dependencies {\n    ${dependencyLine}`);
}

function discoverPackageName(manifestContent, buildGradleContent) {
  const manifestMatch = manifestContent.match(/package\s*=\s*"([^"]+)"/);
  if (manifestMatch?.[1]) return manifestMatch[1];

  const namespaceMatch = buildGradleContent.match(/namespace\s+["']([^"']+)["']/);
  if (namespaceMatch?.[1]) return namespaceMatch[1];

  const appIdMatch = buildGradleContent.match(/applicationId\s+["']([^"']+)["']/);
  if (appIdMatch?.[1]) return appIdMatch[1];

  return 'app.pregnancytoolkits.android';
}

function normalizeDelegationService(manifestContent, packageName) {
  const fqcn = `${packageName}.DelegationService`;
  const serviceBlock = `        <service\n            android:name="${fqcn}"\n            android:enabled="true"\n            android:exported="true">\n            <intent-filter>\n                <action android:name="android.support.customtabs.trusted.TRUSTED_WEB_ACTIVITY_SERVICE" />\n            </intent-filter>\n        </service>`;

  const servicePattern = /\s*<service[\s\S]*?android\.support\.customtabs\.trusted\.TRUSTED_WEB_ACTIVITY_SERVICE[\s\S]*?<\/service>/m;

  if (servicePattern.test(manifestContent)) {
    return manifestContent.replace(servicePattern, `\n${serviceBlock}`);
  }

  return manifestContent.replace(/<\/application>/, `${serviceBlock}\n    </application>`);
}

function buildDelegationServiceSource(packageName) {
  return `package ${packageName};

import com.google.androidbrowserhelper.playbilling.digitalgoods.DigitalGoodsRequestHandler;

public class DelegationService extends com.google.androidbrowserhelper.trusted.DelegationService {
    @Override
    public void onCreate() {
        super.onCreate();
        registerExtraCommandHandler(new DigitalGoodsRequestHandler(getApplicationContext()));
    }
}
`;
}

const buildGradle = readRequired(buildGradlePath);
const manifest = readRequired(manifestPath);
const packageName = discoverPackageName(manifest, buildGradle);
const packageDir = packageName.split('.').join(path.sep);
const delegationServicePath = path.join(appDir, 'src', 'main', 'java', packageDir, 'DelegationService.java');

let nextBuildGradle = buildGradle;
nextBuildGradle = replaceSdkValue(nextBuildGradle, [/((?:compileSdkVersion|compileSdk)\s+)\d+/g], '36');
nextBuildGradle = replaceSdkValue(nextBuildGradle, [/((?:targetSdkVersion|targetSdk)\s+)\d+/g], '35');
nextBuildGradle = replaceSdkValue(nextBuildGradle, [/((?:minSdkVersion|minSdk)\s+)\d+/g], '23');

if (!/com\.google\.androidbrowserhelper:androidbrowserhelper/.test(nextBuildGradle)) {
  nextBuildGradle = ensureDependency(nextBuildGradle, 'implementation "com.google.androidbrowserhelper:androidbrowserhelper:2.4.0"');
}

if (!/com\.google\.androidbrowserhelper:billing/.test(nextBuildGradle)) {
  nextBuildGradle = ensureDependency(nextBuildGradle, 'implementation "com.google.androidbrowserhelper:billing:1.0.0-alpha09"');
}

// Ensure BILLING permission is present
let nextManifest = manifest;
const billingPermission = '<uses-permission android:name="com.android.vending.BILLING" />';
if (!nextManifest.includes('com.android.vending.BILLING')) {
  nextManifest = nextManifest.replace(
    /<manifest\b[^>]*>/,
    `$&\n    ${billingPermission}`
  );
  console.log('[patch-twa-project] Added BILLING permission');
}

// Remove AD_ID permission (Play Console declaration = "No")
if (!nextManifest.includes('xmlns:tools=')) {
  nextManifest = nextManifest.replace(
    /<manifest\b([^>]*)>/,
    '<manifest$1\n    xmlns:tools="http://schemas.android.com/tools">'
  );
}
const adIdRemoval = '    <uses-permission android:name="com.google.android.gms.permission.AD_ID" tools:node="remove" />';
if (!nextManifest.includes('com.google.android.gms.permission.AD_ID')) {
  nextManifest = nextManifest.replace(
    /<manifest\b[^>]*>/,
    `$&\n${adIdRemoval}`
  );
  console.log('[patch-twa-project] Added AD_ID removal directive');
} else if (!nextManifest.includes('tools:node="remove"')) {
  nextManifest = nextManifest.replace(
    /\s*<uses-permission\s+android:name="com\.google\.android\.gms\.permission\.AD_ID"\s*\/>/,
    `\n${adIdRemoval}`
  );
  console.log('[patch-twa-project] Replaced AD_ID with removal directive');
}

nextManifest = normalizeDelegationService(nextManifest, packageName);
const delegationServiceSource = buildDelegationServiceSource(packageName);

const changedFiles = [];
if (writeIfChanged(buildGradlePath, nextBuildGradle)) changedFiles.push(path.relative(projectRoot, buildGradlePath));
if (writeIfChanged(manifestPath, nextManifest)) changedFiles.push(path.relative(projectRoot, manifestPath));
if (writeIfChanged(delegationServicePath, delegationServiceSource)) changedFiles.push(path.relative(projectRoot, delegationServicePath));

console.log('[patch-twa-project] packageName:', packageName);
console.log('[patch-twa-project] changed files:', changedFiles.length ? changedFiles.join(', ') : '(none)');
console.log('[patch-twa-project] final sdk settings snapshot:');
for (const line of nextBuildGradle.split('\n')) {
  if (/compileSdk|minSdk|targetSdk|androidbrowserhelper|:billing:/.test(line)) {
    console.log(line);
  }
}