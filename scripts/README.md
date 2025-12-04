# Admin Scripts

This directory contains utility scripts for administrative tasks.

## Set Verified Badges

The `set-verified-badges.js` script marks the first 100 active bio links as verified, showing them a premium blue checkmark badge on their bio page.

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

### Usage

Run the script from the root directory:

```bash
node scripts/set-verified-badges.js
```

The script will:
1. Query all active bio links ordered by creation date (oldest first)
2. Select the first 100
3. Set the `verified` field to `true` for each one
4. Display progress and confirmation

### Security Notes

- Never commit the `firebase-admin-key.json` file to version control
- This script requires admin privileges and should only be run by project administrators
- The verified badge is permanent once set (unless manually removed from Firestore)

### Manual Verification

To manually verify a specific user:

1. Open Firestore Console
2. Navigate to `bioLinks` collection
3. Find the document for the user's bio link
4. Add a field: `verified` (boolean) = `true`
5. Save the document

The verified badge will appear immediately on their bio page.
