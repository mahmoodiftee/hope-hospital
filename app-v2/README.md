EAS Update is wired in. JS/UI changes can go out without a new APK after one rebuild (this adds the native expo-updates module).

What was added

expo-updates (~55.0.28)
runtimeVersion + update URL in app.json
Channels on development / preview / production in eas.json
On launch, production builds check, download, and reload if an update exists
One-time: new APK
```
cd app-v2
eas build -p android --profile production
```
Install that APK. Older APKs cannot receive OTA updates.

Later JS changes (no reinstall)
```
cd app-v2
eas update --channel production --environment production --message "tagline and doctor UI"
Or: npm run update:production -- --message "your note"
```
Open the app on Wi‑Fi; it should pick up the bundle and restart.

Still needs a new APK when you change native code, SDK, plugins, permissions, or bump version in app.json (runtimeVersion follows appVersion 1.0.1).