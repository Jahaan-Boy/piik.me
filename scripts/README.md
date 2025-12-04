# Admin Scripts

This directory contains utility scripts for administrative tasks.

## Set Verified Badges

The `set-verified-badges.js` script marks specific bio links as verified, showing them a premium blue checkmark badge on their bio page.

### Prerequisites

1. Install Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```

2. Download your Firebase service account key:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `firebase-admin-key.json` in the root directory
   - **Important:** Add `firebase-admin-key.json` to `.gitignore` to prevent committing credentials

### Default Behavior

By default, all bio links are created with `verified: false`. When a bio link is unverified:
- The profile displays an **"Under Review"** badge instead of the verified checkmark
- This indicates to visitors that the profile is pending verification

### Manual Verification

To manually verify a specific user:

1. Open Firestore Console
2. Navigate to `bioLinks` collection
3. Find the document for the user's bio link
4. Set the field: `verified` (boolean) = `true`
5. Save the document

The verified badge (blue checkmark) will appear immediately on their bio page.

### Automated Verification Script

Run the script from the root directory:

```bash
node scripts/set-verified-badges.js
```

The script can be customized to:
1. Query specific bio links based on criteria (creation date, user, etc.)
2. Set the `verified` field to `true` for selected links
3. Display progress and confirmation

### Security Notes

- Never commit the `firebase-admin-key.json` file to version control
- This script requires admin privileges and should only be run by project administrators
- The verified badge is permanent once set (unless manually changed in Firestore)
- All new bio links default to `verified: false` showing "Under Review"
