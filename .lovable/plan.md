

## Update assetlinks.json with correct package name

Google Play Console is providing a new `assetlinks.json` snippet with the package name `app.pregnancytoolkits.android` instead of the current `com.pregnancytoolkits.app`.

### Changes needed

**File: `public/.well-known/assetlinks.json`**
- Update `package_name` from `com.pregnancytoolkits.app` to `app.pregnancytoolkits.android`
- Keep the same SHA-256 fingerprint (unchanged)

### Technical detail
The current file has:
```json
"package_name": "com.pregnancytoolkits.app"
```
Will be changed to:
```json
"package_name": "app.pregnancytoolkits.android"
```

This ensures Android App Links work correctly, allowing the TWA app to open links from the website domain.

