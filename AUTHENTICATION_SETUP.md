# Firebase Authentication Setup Guide

## Required Steps in Firebase Console

### 1. Enable Authentication
1. Go to https://console.firebase.google.com/
2. Select your project: `lagusan-cofee-sky-deck`
3. Click on "Authentication" in the left sidebar
4. Click "Get started" if not already enabled

### 2. Configure Sign-in Methods
1. Go to the "Sign-in method" tab
2. Click on "Email/Password"
3. Enable the first option (Email/Password)
4. Click "Save"

### 3. Create Admin User (Optional)
You can either:
- **Option A**: Let the app create the first admin user through registration
- **Option B**: Manually create a user in the Firebase Console:
  1. Go to the "Users" tab
  2. Click "Add user"
  3. Enter email and password for your admin account

### 4. Set Security Rules for Firestore
1. Go to "Firestore Database" in the left sidebar
2. Click on the "Rules" tab
3. Replace the existing rules with the content from `firestore.rules` file in your project, or copy this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to public collections for everyone
    match /news/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /menu/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /contact_info/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow anyone to submit contact forms and orders
    match /contact_submissions/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    
    match /orders/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    
    // All other collections require authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click "Publish"

### 5. Enable Required Services
Make sure these services are enabled in your Firebase project:
- ✅ Authentication (Email/Password)
- ✅ Firestore Database
- ✅ Storage
- ✅ Analytics (optional)

## Testing the Connection
1. Start your development server: `npm run dev`
2. Open the website
3. Click the "Admin" button in the header
4. Try to log in with your admin credentials

If you see any errors, check the browser console for specific error messages.
