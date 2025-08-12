# Mobile Companion Android APK: Build & Distribution Guide

This guide explains how to generate a standalone Android APK for the Fleet & Field Ops mobile companion app (Expo/React Native), and how to install and use it independently of the web platform.

## 1) Prerequisites

- Node.js LTS and npm installed
- Expo account and CLI
- Android SDK tools (optional for local Gradle build)
- Access to your API server over the internet or LAN

Recommended installs:

- npm i -g eas-cli
- npm i -g expo-cli (optional)
- Android Platform Tools (adb) for sideloading: https://developer.android.com/tools/adb

## 2) Project locations

- Mobile app root: `mobile/`
- API base (local): http://localhost:3001 (change as needed)
- In-app config file: `mobile/src/config/index.ts`

## 3) Configure app metadata (package name, version)

Edit `mobile/app.json` and set:

- expo.name: Human-readable app name
- expo.slug: App slug
- expo.android.package: Unique Android package name, e.g. `com.yourorg.asphalt`
- expo.version: Semver string for the app
- expo.android.versionCode: Increment for each release (integer)

Example:

```
{
  "expo": {
    "name": "Fleet & Field Ops Companion",
    "slug": "fleet-field-ops-companion",
    "version": "1.0.0",
    "android": {
      "package": "com.yourorg.fleetfieldops",
      "versionCode": 1
    }
  }
}
```

## 4) Set the default API base (optional)

You can keep the app configurable (Settings screen) or set a default in code:

- Edit `mobile/src/config/index.ts`
- Update `API_BASE_URL` to your environment (e.g., `https://api.your-domain.com`)

The API base can still be changed in-app under Settings.

## 5) Build with EAS (recommended)

EAS cloud builds are the fastest way to get a signed, installable APK.

1. Authenticate and initialize (run inside `mobile/`):
   - npm i
   - eas login
   - eas init

2. Configure EAS build profiles:
   - npx eas-cli@latest build:configure
   - This creates `eas.json`. Add an APK profile, e.g. `preview`:

```
{
  "cli": { "version": ">= 3.12.0" },
  "build": {
    "preview": {
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "gradleCommand": ":app:bundleRelease" }
    }
  }
}
```

3. Trigger the build (APK):
   - eas build -p android --profile preview
   - When prompted for signing, choose "Let EAS generate a keystore" if you do not have one
   - Wait for the build to complete; EAS will provide a download URL for the APK

4. Download and archive:
   - Save the APK and the keystore (if generated). Back up the keystore and its credentials securely.

## 6) Install the APK on a device

Option A: Direct install on device

- Transfer the APK via email, cloud, or USB
- Enable "Install unknown apps" on the device
- Tap the APK to install

Option B: ADB sideload (recommended for testing)

- Enable Developer Options and USB debugging on the device
- Connect via USB and verify: `adb devices`
- Install: `adb install path/to/app.apk`

## 7) Configure the app after install

- Open the app
- Go to Settings and set the API Base URL to your server
  - Example: `https://api.your-domain.com` or `http://YOUR_LAN_IP:3001`
- Save and test endpoints (e.g., load scans)

Notes:

- Ensure your server is reachable from the device network
- If you front the API with a reverse proxy, verify CORS if you use any web views inside the app

## 8) Alternative: Local Gradle build (no EAS)

This uses a "prebuild" to generate native Android project files and builds APK locally.

1. Prebuild native projects (from `mobile/`):

- npx expo prebuild

2. Build release APK (from `mobile/android/`):

- ./gradlew assembleRelease
- Output: `mobile/android/app/build/outputs/apk/release/app-release.apk`

3. Signing:

- For production installs, set up release signing in `android/app/build.gradle` and provide `keystore.properties`
- For quick testing, debug signing works but users may see warnings

## 9) Updating the app

- Bump `versionCode` in `app.json` for Android before each release
- Re-run EAS build (or Gradle) and distribute the new APK
- Keep keystore safe; you need the same keystore to update the app on user devices

## 10) Troubleshooting

- Build fails on EAS: run `eas diagnostics`, update Expo SDK, or check `eas.json`
- APK installs but crashes: check device logs with `adb logcat`, ensure API base is valid
- Network issues: verify device can reach your API URL; if local, use your machine’s LAN IP (not localhost)
- SSL issues: ensure valid certificates on HTTPS endpoints

## 11) CI/CD tips (optional)

- Add a GitHub Action that triggers `eas build --non-interactive -p android --profile preview` on tags
- Store EAS tokens and keystore secrets in your secrets manager

---

If you want, I can add a ready-made `eas.json`, adjust `app.json`, and a GitHub Action to automate building preview APKs on pushes or tags.
