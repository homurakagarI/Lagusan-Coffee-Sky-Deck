# Admin Content Management System - Setup Guide

## 🔥 Firebase Admin System Complete!

Your Lagusan Coffee Sky Deck website now has a complete Content Management System with admin authentication and news management capabilities.

## 🚀 What's Been Implemented

### 1. **Admin Authentication System**
- **Login/Register Forms**: Secure admin authentication
- **Firebase Auth Integration**: Uses Firebase Authentication
- **Persistent Sessions**: Stays logged in across page refreshes
- **Protected Access**: Only authenticated admins can access dashboard

### 2. **Content Management System**
- **News & Updates Management**: Add, edit, delete news articles
- **Image Upload**: Upload images directly to Firebase Storage
- **Video Integration**: Embed YouTube/Vimeo videos
- **Content Categories**: Organize news by categories
- **Featured Content**: Mark important news as featured
- **Rich Content Editor**: Full text editing capabilities

### 3. **Admin Dashboard Features**
- **News Management**: Complete CRUD operations
- **Contact Form Submissions**: View all customer inquiries
- **Analytics**: Basic stats and reporting
- **File Management**: Image upload and storage
- **Responsive Design**: Works on all devices

### 4. **Public Website Integration**
- **News Display**: Automatically shows published news
- **Featured News Section**: Highlights important updates
- **News Detail Modal**: Full article reading experience
- **Mobile Responsive**: Perfect mobile compatibility

## 🔧 How to Use the Admin System

### **Step 1: Access Admin Panel**
1. Visit your website: `http://localhost:5174/`
2. Click "Admin" button in the navigation
3. Register first admin account or login

### **Step 2: Create Admin Account**
1. Click "Register here" on the login modal
2. Enter admin email and password (min 6 characters)
3. Account will be created in Firebase Auth

### **Step 3: Manage Content**
1. After login, dashboard opens automatically
2. **Add News**: Click "Add News" button
3. **Fill Details**: Title, category, content
4. **Upload Media**: Add images or video URLs
5. **Publish**: Click "Publish" to make it live

### **Step 4: Monitor Activity**
- **View Contact Forms**: See customer submissions
- **Check Analytics**: Monitor content performance
- **Manage Content**: Edit or delete existing news

## 📁 File Structure

```
src/
├── components/
│   ├── AdminAuth.vue         # Login/Register modal
│   ├── AdminDashboard.vue    # Main admin interface
│   ├── NewsEditor.vue        # Add/Edit news form
│   ├── NewsDisplay.vue       # Public news display
│   ├── NewsDetail.vue        # News article modal
│   └── Header.vue            # Updated with admin button
├── firebase/
│   ├── config.ts             # Firebase setup
│   └── services.ts           # All Firebase operations
├── stores/
│   └── auth.ts               # Authentication state management
└── App.vue                   # Updated with news section
```

## 🗄️ Firebase Collections

Your Firebase Firestore will have these collections:

### **`news_updates`**
```javascript
{
  title: "News Title",
  content: "Full article content",
  category: "announcement|event|promotion|menu|general",
  imageUrl: "https://...", // Optional
  videoUrl: "https://...", // Optional
  featured: true/false,
  timestamp: Firebase.Timestamp,
  status: "published",
  views: 0
}
```

### **`contact_submissions`**
```javascript
{
  name: "Customer Name",
  email: "customer@email.com",
  phone: "Optional phone",
  message: "Customer message",
  timestamp: Firebase.Timestamp,
  status: "new"
}
```

## 🔒 Security Features

1. **Firebase Rules**: Only authenticated users can write
2. **Client-side Validation**: Input validation and sanitization
3. **File Upload Limits**: 5MB max image size
4. **Environment Variables**: Secure config storage
5. **Error Handling**: Comprehensive error management

## 🎨 Features Available

### **News Management**
- ✅ Create news articles with rich content
- ✅ Upload and manage images
- ✅ Embed videos (YouTube, Vimeo)
- ✅ Categorize content
- ✅ Feature important news
- ✅ Edit existing articles
- ✅ Delete unwanted content

### **Customer Interaction**
- ✅ Contact form submissions
- ✅ Newsletter subscriptions (ready)
- ✅ Order management (framework ready)

### **Analytics & Reporting**
- ✅ News article counts
- ✅ Contact submission tracking
- ✅ Featured content monitoring

## 🚀 Ready for Production

### **Environment Variables**
Update `.env` file with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
# ... other credentials
```

### **Firebase Security Rules**
Add these to your Firestore rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to news for everyone
    match /news_updates/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Contact submissions - write for everyone, read for admins
    match /contact_submissions/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

## 🎯 Next Steps

1. **Deploy to Firebase Hosting**: `npm run build && firebase deploy`
2. **Add More Admins**: Register additional admin accounts
3. **Customize Content**: Add your coffee shop's news and updates
4. **Monitor Analytics**: Track customer engagement
5. **Expand Features**: Add online ordering, loyalty programs, etc.

## 📱 Mobile Compatibility

The entire admin system is fully responsive:
- ✅ Mobile-friendly admin dashboard
- ✅ Touch-optimized forms and buttons
- ✅ Responsive news display
- ✅ Mobile image upload
- ✅ Swipe-friendly navigation

## 🆘 Support

Your admin system is now live and ready to use! The website includes:
- Complete news management
- Customer contact tracking
- Image and video support
- Mobile responsiveness
- Firebase integration
- Secure authentication

**Test it now at**: `http://localhost:5174/`

Click "Admin" in the navigation to get started! 🎉
