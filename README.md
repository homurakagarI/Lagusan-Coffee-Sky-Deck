# Lagusan Coffee Sky Deck

A modern, responsive coffee shop website built with Vue.js, TypeScript, and Firebase.

## Features

- 🌟 Modern responsive design optimized for mobile and desktop
- ☕ Interactive menu with filtering by category
- 📝 Contact form with Firebase integration
- 🔥 Real-time data storage with Firebase Firestore
- 📱 Mobile-first responsive design
- ⚡ Fast performance with Vite

## Tech Stack

- **Frontend**: Vue.js 3 + TypeScript
- **Build Tool**: Vite
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Styling**: Custom CSS with CSS Variables
- **Hosting**: Firebase Hosting (ready for deployment)

## Firebase Integration

The project is integrated with Firebase for:

- **Contact Form Submissions**: Forms are stored in Firestore
- **Order Management**: Future order system ready
- **Newsletter Subscriptions**: Email collection system
- **Analytics**: Firebase Analytics for user insights

### Firebase Setup

Your Firebase configuration is stored in:
- `src/firebase/config.ts` - Firebase initialization
- `src/firebase/services.ts` - Firebase service functions
- `.env` - Environment variables (secure configuration)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Firebase Services Available

- `submitContactForm()` - Submit contact form data
- `submitOrder()` - Submit orders (ready for implementation)
- `getMenuItems()` - Fetch menu from Firebase (optional)
- `subscribeNewsletter()` - Newsletter subscription

## Project Structure

```
src/
├── components/          # Vue components
│   ├── Header.vue      # Navigation header
│   ├── Hero.vue        # Hero section
│   ├── About.vue       # About section
│   ├── Menu.vue        # Menu section
│   ├── Contact.vue     # Contact form
│   └── Footer.vue      # Footer
├── firebase/           # Firebase configuration
│   ├── config.ts       # Firebase setup
│   └── services.ts     # Firebase services
├── App.vue            # Main app component
├── main.ts           # App entry point
└── style.css         # Global styles
```

## Mobile Compatibility

The website is fully responsive and optimized for:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## Features Included

- ✅ Responsive navigation with mobile hamburger menu
- ✅ Hero section with call-to-action buttons
- ✅ About section with features
- ✅ Interactive menu with category filtering
- ✅ Contact form with Firebase integration
- ✅ Footer with business information
- ✅ Smooth scrolling navigation
- ✅ Modern UI/UX design

## Next Steps

You can now:
1. Customize the menu items and content
2. Add more Firebase features (authentication, etc.)
3. Deploy to Firebase Hosting
4. Add more interactive features
5. Implement online ordering system

The website is ready to run and fully functional with Firebase integration!
