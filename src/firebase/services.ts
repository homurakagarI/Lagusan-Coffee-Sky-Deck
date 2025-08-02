import { 
  collection, 
  addDoc, 
  getDocs, 
  query,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { 
  ref as storageRef, 
  deleteObject
} from 'firebase/storage';
// If you need the User type elsewhere, use:
// import type { User } from 'firebase/auth';
import { db, auth, storage } from './config';

// Diagnostic function to test Firebase connectivity
export const testFirebaseConnection = async () => {
  try {
    console.log('🔍 Testing Firebase connection...');
    
    // Test Firestore connection
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, {
      timestamp: new Date(),
      test: 'connection'
    });
    
    console.log('✅ Firestore connection successful');
    
    // Test Auth connection
    const currentUser = auth.currentUser;
    console.log('🔐 Auth current user:', currentUser?.email || 'Not logged in');
    
    return { 
      success: true, 
      firestore: true, 
      auth: !!currentUser,
      message: 'Firebase connection test completed' 
    };
  } catch (error: any) {
    console.error('❌ Firebase connection test failed:', error);
    return { 
      success: false, 
      error: error.message || error,
      code: error.code 
    };
  }
};

// Manual admin profile creation (for troubleshooting)
export const manuallyCreateAdminProfile = async () => {
  try {
    console.log('🔧 Manual admin profile creation started...');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ No user logged in. Please log in first.');
      return { success: false, error: 'No user logged in' };
    }
    
    if (currentUser.email !== 'admin@lagusan.com') {
      console.error('❌ Only admin@lagusan.com can create admin profile');
      return { success: false, error: 'Not authorized' };
    }
    
    console.log('🔧 Creating admin profile for:', currentUser.email);
    
    const profileData = {
      email: currentUser.email,
      role: 'admin',
      isMainAdmin: true,
      emailVerified: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      loginCount: 1,
      isActive: true,
      permissions: {
        customerManagement: true,
        menuManagement: true,
        contentManagement: true,
        orderManagement: true,
        systemSettings: true
      },
      manuallyCreated: true,
      manualCreationDate: new Date()
    };
    
    // Force create/overwrite the admin profile
    await setDoc(doc(db, 'admin_profiles', currentUser.uid), profileData, { merge: false });
    
    console.log('✅ Admin profile created manually');
    return { success: true, message: 'Admin profile created manually', profile: profileData };
    
  } catch (error: any) {
    console.error('❌ Error in manual admin profile creation:', error);
    return { success: false, error: error.message || error };
  }
};

// Verify admin account status
export const verifyAdminAccount = async () => {
  try {
    console.log('🔍 === ADMIN ACCOUNT VERIFICATION ===');
    
    const currentUser = auth.currentUser;
    console.log('👤 Current User:', currentUser?.email || 'Not logged in');
    console.log('🆔 User UID:', currentUser?.uid || 'N/A');
    console.log('📧 Email Verified (Firebase):', currentUser?.emailVerified || false);
    
    if (!currentUser) {
      return { 
        success: false, 
        error: 'No user logged in',
        status: 'not_logged_in'
      };
    }
    
    // Check if this is the admin email
    const isAdminEmail = currentUser.email === 'admin@lagusan.com';
    console.log('🔐 Is Admin Email:', isAdminEmail);
    
    if (!isAdminEmail) {
      return {
        success: false,
        error: 'Current user is not admin@lagusan.com',
        status: 'wrong_email',
        currentEmail: currentUser.email
      };
    }
    
    // Check admin profile in Firestore
    console.log('📄 Checking admin profile in Firestore...');
    const adminProfile = await getAdminProfile(currentUser.uid);
    console.log('📄 Admin Profile Exists:', adminProfile.success);
    
    if (adminProfile.success) {
      console.log('📄 Admin Profile Data:', adminProfile.admin);
    }
    
    // Check user role
    console.log('🔍 Checking user role...');
    const roleCheck = await getUserRole(currentUser.uid);
    console.log('🔍 Role Check Result:', roleCheck);
    
    // Summary
    const verification = {
      isLoggedIn: !!currentUser,
      email: currentUser.email,
      uid: currentUser.uid,
      emailVerifiedInFirebase: currentUser.emailVerified,
      isAdminEmail: isAdminEmail,
      hasAdminProfile: adminProfile.success,
      adminProfileData: adminProfile.admin || null,
      roleCheckResult: roleCheck,
      isFullyVerified: isAdminEmail && adminProfile.success && roleCheck.success && roleCheck.role === 'admin'
    };
    
    console.log('✅ VERIFICATION SUMMARY:', verification);
    
    return {
      success: true,
      verification: verification,
      status: verification.isFullyVerified ? 'fully_verified' : 'needs_setup'
    };
    
  } catch (error: any) {
    console.error('❌ Error verifying admin account:', error);
    return { 
      success: false, 
      error: error.message || error,
      status: 'error'
    };
  }
};

// Emergency admin verification bypass
export const emergencyAdminBypass = async () => {
  try {
    console.log('🚨 === EMERGENCY ADMIN BYPASS ===');
    
    const currentUser = auth.currentUser;
    console.log('👤 Current User:', currentUser?.email || 'Not logged in');
    
    if (!currentUser) {
      return { 
        success: false, 
        error: 'Please log in first (with any email address that is admin@lagusan.com)',
        action: 'Login required'
      };
    }
    
    if (currentUser.email !== 'admin@lagusan.com') {
      return {
        success: false,
        error: `Current email is ${currentUser.email}, but needs to be admin@lagusan.com`,
        action: 'Use correct admin email'
      };
    }
    
    console.log('🚨 Force creating admin profile...');
    
    // Force create admin profile
    const adminProfileData = {
      email: 'admin@lagusan.com',
      role: 'admin',
      isMainAdmin: true,
      emailVerified: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      loginCount: 1,
      isActive: true,
      permissions: {
        customerManagement: true,
        menuManagement: true,
        contentManagement: true,
        orderManagement: true,
        systemSettings: true
      },
      emergencyBypass: true,
      emergencyBypassDate: new Date()
    };
    
    // Force overwrite
    await setDoc(doc(db, 'admin_profiles', currentUser.uid), adminProfileData);
    console.log('✅ Admin profile force created');
    
    // Verify it worked
    const verification = await verifyAdminAccount();
    console.log('🔍 Emergency verification result:', verification);
    
    return {
      success: true,
      message: 'Emergency admin bypass completed!',
      adminProfile: adminProfileData,
      verification: verification,
      nextSteps: [
        'Your admin account is now verified',
        'Try accessing Customer Management',
        'Admin functions should now work'
      ]
    };
    
  } catch (error: any) {
    console.error('❌ Emergency bypass failed:', error);
    return {
      success: false,
      error: error.message || error,
      action: 'Try logging in again'
    };
  }
};

// Complete admin verification and setup guide
export const completeAdminVerificationGuide = () => {
  console.log(`
🔧 === COMPLETE ADMIN VERIFICATION GUIDE ===

📍 WHERE TO VERIFY YOUR ADMIN ACCOUNT:

1. 🌐 ADMIN LOGIN PAGE:
   - Go to: http://localhost:5175/admin
   - OR click "Admin Login" link in website footer
   - Login with: admin@lagusan.com

2. 🖥️ BROWSER CONSOLE (Current Method):
   - Press F12 → Console tab
   - Run verification commands below

3. 🔥 FIREBASE CONSOLE:
   - Go to: https://console.firebase.google.com
   - Select your project: lagusan-cofee-sky-deck
   - Check Authentication → Users tab

📋 VERIFICATION COMMANDS (Run in browser console):

▶️ Check Current Status:
   verifyAdminAccount()

▶️ Quick Setup (If needed):
   quickAdminSetup()

▶️ Force Verification:
   forceAdminVerification()

▶️ Manual Profile Creation:
   manuallyCreateAdminProfile()

🔍 TROUBLESHOOTING STEPS:

1. First, log in through ADMIN login page (not customer login)
2. Then run: verifyAdminAccount()
3. If issues found, run: quickAdminSetup()
4. Verify success with: verifyAdminAccount()

📞 NEED HELP? Check console logs for detailed information.
  `);
  
  return {
    adminLoginUrl: 'http://localhost:5175/admin',
    firebaseConsoleUrl: 'https://console.firebase.google.com',
    projectId: 'lagusan-cofee-sky-deck',
    adminEmail: 'admin@lagusan.com',
    commands: [
      'verifyAdminAccount()',
      'quickAdminSetup()',
      'forceAdminVerification()',
      'manuallyCreateAdminProfile()'
    ]
  };
};

// Simple admin verification (call this manually after login)
export const quickAdminSetup = async () => {
  try {
    console.log('⚡ === QUICK ADMIN SETUP ===');
    
    // Wait for auth to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentUser = auth.currentUser;
    console.log('👤 Current User:', currentUser?.email);
    
    if (!currentUser) {
      throw new Error('Please log in first');
    }
    
    if (currentUser.email !== 'admin@lagusan.com') {
      throw new Error('Please log in with admin@lagusan.com');
    }
    
    // Force create admin profile
    console.log('🔧 Creating admin profile...');
    const profileData = {
      email: currentUser.email,
      role: 'admin',
      isMainAdmin: true,
      emailVerified: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      loginCount: 1,
      isActive: true,
      permissions: {
        customerManagement: true,
        menuManagement: true,
        contentManagement: true,
        orderManagement: true,
        systemSettings: true
      },
      quickSetup: true,
      quickSetupDate: new Date()
    };
    
    await setDoc(doc(db, 'admin_profiles', currentUser.uid), profileData);
    console.log('✅ Admin profile created successfully!');
    
    // Verify it worked
    const verification = await verifyAdminAccount();
    console.log('🔍 Verification result:', verification);
    
    return {
      success: true,
      message: 'Admin setup completed successfully!',
      profile: profileData,
      verification: verification
    };
    
  } catch (error: any) {
    console.error('❌ Quick admin setup failed:', error);
    return {
      success: false,
      error: error.message || error
    };
  }
};

// Force admin verification
export const forceAdminVerification = async () => {
  try {
    console.log('🔧 === FORCE ADMIN VERIFICATION ===');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    if (currentUser.email !== 'admin@lagusan.com') {
      throw new Error('Current user is not admin@lagusan.com');
    }
    
    console.log('🔧 Force verifying admin account...');
    
    // Step 1: Create/update admin profile
    const profileResult = await manuallyCreateAdminProfile();
    console.log('🔧 Profile creation result:', profileResult);
    
    // Step 2: Verify the account status
    const verificationResult = await verifyAdminAccount();
    console.log('🔧 Verification result:', verificationResult);
    
    return {
      success: true,
      message: 'Admin account force verified',
      profileResult: profileResult,
      verificationResult: verificationResult
    };
    
  } catch (error: any) {
    console.error('❌ Error in force verification:', error);
    return {
      success: false,
      error: error.message || error
    };
  }
};

// Enhanced connection status check
export const checkFirebaseStatus = () => {
  console.log('📊 Firebase Status Check:');
  console.log('🔐 Auth instance:', !!auth);
  console.log('💾 Firestore instance:', !!db);
  console.log('📁 Storage instance:', !!storage);
  console.log('👤 Current user:', auth.currentUser?.email || 'None');
  console.log('🌐 Network status:', navigator.onLine ? 'Online' : 'Offline');
};

// Contact form submission
export const submitContactForm = async (formData: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, 'contact_submissions'), {
      ...formData,
      timestamp: Timestamp.now(),
      status: 'new'
    });
    console.log('Contact form submitted with ID: ', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting contact form: ', error);
    return { success: false, error: error };
  }
};

// Order submission
export const submitOrder = async (orderData: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
}) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      timestamp: Timestamp.now(),
      status: 'pending'
    });
    console.log('Order submitted with ID: ', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting order: ', error);
    return { success: false, error: error };
  }
};

// Get menu items (if you want to store them in Firebase)
export const getMenuItems = async () => {
  try {
    console.log('🔍 FETCHING MENU ITEMS FROM FIRESTORE...')
    // Use simple query without composite index requirement
    const querySnapshot = await getDocs(collection(db, 'menu_items'));
    const items: any[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort items locally instead of using composite index
    items.sort((a, b) => {
      // Sort by category first, then by name
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
    
    console.log('✅ Successfully fetched', items.length, 'menu items:', items)
    return { success: true, items };
  } catch (error) {
    console.error('❌ Error getting menu items:', error);
    return { success: false, error: error };
  }
};

// Newsletter subscription
export const subscribeNewsletter = async (email: string) => {
  try {
    const docRef = await addDoc(collection(db, 'newsletter_subscriptions'), {
      email,
      timestamp: Timestamp.now(),
      status: 'active'
    });
    console.log('Newsletter subscription with ID: ', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error subscribing to newsletter: ', error);
    return { success: false, error: error };
  }
};

// Authentication functions
export const loginAdmin = async (email: string, password: string) => {
  try {
    console.log('🔐 Attempting admin login for:', email);
    
    // Validate inputs
    if (!email || !password) {
      return { 
        success: false, 
        error: 'Email and password are required.',
        validationError: true 
      };
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('🔐 Admin login successful for user:', user.uid);
    
    // Admin account admin@lagusan.com doesn't need email verification
    if (email === 'admin@lagusan.com') {
      console.log('✅ Main admin account logged in successfully (email verification bypassed)');
      
      // Ensure admin is marked as verified and update login info
      try {
        await setDoc(doc(db, 'admin_profiles', user.uid), {
          email: email,
          role: 'admin',
          isMainAdmin: true,
          emailVerified: true,
          lastLoginAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }, { merge: true });
        
        // Get current login count and increment
        const adminDoc = await getDoc(doc(db, 'admin_profiles', user.uid));
        const currentLoginCount = adminDoc.exists() ? (adminDoc.data().loginCount || 0) : 0;
        
        await updateDoc(doc(db, 'admin_profiles', user.uid), {
          loginCount: currentLoginCount + 1
        });
        
        console.log('✅ Admin profile updated with login info');
      } catch (error) {
        console.error('⚠️ Error updating admin profile:', error);
        // Don't fail login if profile update fails
      }
      
      return { success: true, user: user };
    }
    
    // For other potential admin accounts, check email verification
    if (!user.emailVerified) {
      await signOut(auth);
      return { 
        success: false, 
        error: 'Please verify your email address before logging in as admin.',
        needsVerification: true 
      };
    }
    
    console.log('✅ Admin login completed successfully');
    return { success: true, user: user };
  } catch (error: any) {
    console.error('❌ Error logging in admin:', error);
    
    // Provide user-friendly error messages
    let userMessage = 'An error occurred during admin login. Please try again.';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          userMessage = 'Invalid admin credentials. Please check your email and password.';
          break;
        case 'auth/invalid-email':
          userMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          userMessage = 'This admin account has been disabled.';
          break;
        case 'auth/too-many-requests':
          userMessage = 'Too many failed login attempts. Please wait a few minutes and try again.';
          break;
        case 'auth/network-request-failed':
          userMessage = 'Network error. Please check your internet connection and try again.';
          break;
        default:
          userMessage = `Admin login failed: ${error.message}`;
          break;
      }
    }
    
    return { 
      success: false, 
      error: userMessage,
      errorCode: error.code,
      originalError: error 
    };
  }
};

export const registerAdmin = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Admin account admin@lagusan.com doesn't need email verification
    if (email !== 'admin@lagusan.com') {
      // Send email verification for other admin accounts
      await sendEmailVerification(user);
      return { 
        success: true, 
        user: user,
        message: 'Admin registration successful! Please check your email to verify your account before logging in.'
      };
    }
    
    console.log('✅ Main admin account registered successfully (email verification bypassed)');
    
    // For the main admin account, we'll create an admin profile document
    try {
      await setDoc(doc(db, 'admin_profiles', user.uid), {
        email: email,
        role: 'admin',
        isMainAdmin: true,
        emailVerified: true,
        createdAt: new Date(),
        lastLoginAt: null,
        loginCount: 0
      });
      console.log('✅ Admin profile created in Firestore');
    } catch (error) {
      console.log('⚠️ Error creating admin profile:', error);
    }
    
    return { success: true, user: user };
  } catch (error) {
    console.error('Error registering: ', error);
    return { success: false, error: error };
  }
};

// Function to ensure admin account is marked as verified
export const ensureAdminVerified = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }
    
    if (currentUser.email === 'admin@lagusan.com') {
      console.log('🔧 Ensuring admin account verification status...');
      
      // Update admin profile in Firestore
      try {
        await setDoc(doc(db, 'admin_profiles', currentUser.uid), {
          email: currentUser.email,
          role: 'admin',
          isMainAdmin: true,
          emailVerified: true,
          lastLoginAt: new Date(),
          loginCount: 1,
          updatedAt: new Date()
        }, { merge: true });
        
        console.log('✅ Admin profile updated - marked as verified');
      } catch (error) {
        console.log('⚠️ Error updating admin profile:', error);
      }
      
      return { success: true, message: 'Admin account verification ensured' };
    }
    
    return { success: false, error: 'Not the main admin account' };
  } catch (error) {
    console.error('Error ensuring admin verification:', error);
    return { success: false, error: error };
  }
};

// Get admin profile information
export const getAdminProfile = async (userId: string) => {
  try {
    const adminDoc = await getDoc(doc(db, 'admin_profiles', userId));
    if (adminDoc.exists()) {
      return { success: true, admin: adminDoc.data() };
    } else {
      return { success: false, error: 'Admin profile not found' };
    }
  } catch (error) {
    console.error('Error getting admin profile: ', error);
    return { success: false, error: error };
  }
};

// Initialize admin profile for existing admin account
export const initializeAdminProfile = async (email: string = 'admin@lagusan.com') => {
  try {
    console.log('🔧 Starting admin profile initialization for:', email);
    
    // Wait for auth to be ready if needed
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!auth.currentUser && attempts < maxAttempts) {
      console.log(`🔧 Waiting for auth (attempt ${attempts + 1}/${maxAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    const currentUser = auth.currentUser;
    console.log('🔧 Current user after waiting:', currentUser?.email, 'UID:', currentUser?.uid);
    
    if (!currentUser) {
      console.log('❌ No user logged in after waiting');
      return { success: false, error: 'Admin not logged in - auth state not ready' };
    }
    
    if (currentUser.email !== email) {
      console.log('❌ Email mismatch:', currentUser.email, 'vs', email);
      return { success: false, error: 'Email mismatch - not the admin account' };
    }
    
    console.log('🔧 Checking existing admin profile...');
    
    // Check if profile already exists
    const existingProfile = await getAdminProfile(currentUser.uid);
    console.log('🔧 Existing profile check result:', existingProfile.success);
    
    if (!existingProfile.success) {
      console.log('🔧 Creating new admin profile...');
      // Create new admin profile
      const profileData = {
        email: email,
        role: 'admin',
        isMainAdmin: true,
        emailVerified: true,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        loginCount: 1,
        isActive: true,
        permissions: {
          customerManagement: true,
          menuManagement: true,
          contentManagement: true,
          orderManagement: true,
          systemSettings: true
        }
      };
      
      await setDoc(doc(db, 'admin_profiles', currentUser.uid), profileData);
      
      console.log('✅ Admin profile created successfully');
      return { success: true, message: 'Admin profile created', profile: profileData };
    } else {
      console.log('🔧 Updating existing admin profile...');
      // Update existing profile to ensure verification
      const updateData = {
        emailVerified: true,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        loginCount: (existingProfile.admin?.loginCount || 0) + 1
      };
      
      await updateDoc(doc(db, 'admin_profiles', currentUser.uid), updateData);
      
      console.log('✅ Admin profile updated successfully');
      return { success: true, message: 'Admin profile updated', profile: { ...existingProfile.admin, ...updateData } };
    }
  } catch (error: any) {
    console.error('❌ Error initializing admin profile:', error);
    console.error('❌ Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message || error };
  }
};

// Utility function to manually verify admin account (can be called from console)
export const manuallyVerifyAdmin = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ No user is currently logged in');
      return { success: false, error: 'No user logged in' };
    }
    
    if (currentUser.email !== 'admin@lagusan.com') {
      console.error('❌ Current user is not the main admin account');
      return { success: false, error: 'Not the main admin account' };
    }
    
    console.log('🔧 Manually verifying admin account...');
    
    // Force create/update admin profile
    await setDoc(doc(db, 'admin_profiles', currentUser.uid), {
      email: 'admin@lagusan.com',
      role: 'admin',
      isMainAdmin: true,
      emailVerified: true,
      manuallyVerified: true,
      verifiedAt: new Date(),
      createdAt: new Date(),
      lastLoginAt: new Date(),
      loginCount: 1,
      isActive: true,
      permissions: {
        customerManagement: true,
        menuManagement: true,
        contentManagement: true,
        orderManagement: true,
        systemSettings: true
      }
    });
    
    console.log('✅ Admin account manually verified and profile created/updated');
    console.log('📊 Admin account status:');
    console.log('  - Email:', currentUser.email);
    console.log('  - UID:', currentUser.uid);
    console.log('  - Firebase Auth Verified:', currentUser.emailVerified);
    console.log('  - Firestore Profile Verified: ✅ YES');
    console.log('  - Manual Verification: ✅ YES');
    
    return { 
      success: true, 
      message: 'Admin account manually verified',
      data: {
        email: currentUser.email,
        uid: currentUser.uid,
        firebaseVerified: currentUser.emailVerified,
        firestoreVerified: true,
        manuallyVerified: true
      }
    };
  } catch (error) {
    console.error('❌ Error manually verifying admin:', error);
    return { success: false, error: error };
  }
};

// Make the function globally available for console use
if (typeof window !== 'undefined') {
  (window as any).manuallyVerifyAdmin = manuallyVerifyAdmin;
}

export const logoutAdmin = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error logging out: ', error);
    return { success: false, error: error };
  }
};

export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get user role to determine if they're admin or customer
export const getUserRole = async (userId: string, retryCount = 0): Promise<{success: boolean, role?: string, isCustomer?: boolean, error?: any}> => {
  try {
    console.log('🔍 Getting user role for:', userId);
    
    // Get current user to check email
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId && currentUser.email === 'admin@lagusan.com') {
      console.log('🔍 Detected admin@lagusan.com - returning admin role');
      return { success: true, role: 'admin', isCustomer: false };
    }
    
    // Check if they exist in admin_profiles collection first
    const adminDoc = await getDoc(doc(db, 'admin_profiles', userId));
    if (adminDoc.exists()) {
      const adminData = adminDoc.data();
      console.log('🔍 Found admin profile:', adminData);
      return { success: true, role: adminData.role || 'admin', isCustomer: false };
    }
    
    // Then check if they exist in customers collection
    const customerDoc = await getDoc(doc(db, 'customers', userId));
    
    if (customerDoc.exists()) {
      const customerData = customerDoc.data();
      console.log('🔍 Found customer profile:', customerData);
      return { success: true, role: customerData.role || 'customer', isCustomer: true };
    }
    
    // If no documents found and this is the first attempt, 
    // wait a bit and retry in case it's a race condition during registration
    if (retryCount < 2) {
      console.log('🔍 No profile found, retrying...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await getUserRole(userId, retryCount + 1);
    }
    
    // If not found after retries, check if email suggests admin
    if (currentUser && currentUser.email === 'admin@lagusan.com') {
      console.log('🔍 No profile but email is admin - assuming admin role');
      return { success: true, role: 'admin', isCustomer: false };
    }
    
    // Default to customer if nothing else matches
    console.log('🔍 No profile found after retries - defaulting to customer');
    return { success: true, role: 'customer', isCustomer: true };
  } catch (error) {
    console.error('Error getting user role: ', error);
    return { success: false, error: error };
  }
};

// Customer Authentication functions
export const loginCustomer = async (email: string, password: string) => {
  try {
    console.log('🔐 Attempting customer login for:', email);
    
    // Validate inputs
    if (!email || !password) {
      return { 
        success: false, 
        error: 'Email and password are required.',
        validationError: true 
      };
    }
    
    if (!email.includes('@')) {
      return { 
        success: false, 
        error: 'Please enter a valid email address.',
        validationError: true 
      };
    }
    
    if (password.length < 6) {
      return { 
        success: false, 
        error: 'Password must be at least 6 characters long.',
        validationError: true 
      };
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('🔐 Login successful for user:', user.uid);
    
    // Special handling for admin@lagusan.com - bypass email verification
    if (email === 'admin@lagusan.com') {
      console.log('🔐 Admin account detected in customer login - bypassing email verification');
      
      // Create/update admin profile immediately
      try {
        await setDoc(doc(db, 'admin_profiles', user.uid), {
          email: email,
          role: 'admin',
          isMainAdmin: true,
          emailVerified: true,
          lastLoginAt: new Date(),
          loginCount: 1,
          isActive: true,
          permissions: {
            customerManagement: true,
            menuManagement: true,
            contentManagement: true,
            orderManagement: true,
            systemSettings: true
          },
          createdViaCustomerLogin: true,
          createdAt: new Date()
        }, { merge: true });
        
        console.log('✅ Admin profile created/updated successfully');
      } catch (error) {
        console.error('⚠️ Error creating admin profile:', error);
      }
      
      return { 
        success: true, 
        user: user,
        isAdmin: true,
        message: 'Admin logged in successfully (email verification bypassed)'
      };
    }
    
    // Check if email is verified for regular customers
    if (!user.emailVerified) {
      // Sign out the user since email is not verified
      await signOut(auth);
      return { 
        success: false, 
        error: 'Please verify your email address before logging in. Check your email for a verification link.',
        needsVerification: true 
      };
    }
    
    // Check and update verification status in Firestore for regular customers
    const customerDoc = await getDoc(doc(db, 'customers', user.uid));
    if (customerDoc.exists()) {
      const customerData = customerDoc.data();
      
      // Check if account is active (admin can deactivate accounts)
      if (customerData.isActive === false) {
        await signOut(auth);
        return { 
          success: false, 
          error: 'Your account has been deactivated by an administrator. Please contact customer support for assistance.',
          accountDeactivated: true 
        };
      }
      
      if (!customerData.emailVerified) {
        await updateDoc(doc(db, 'customers', user.uid), {
          emailVerified: true,
          isActive: true
        });
      }
      
      // Update last login time
      await updateDoc(doc(db, 'customers', user.uid), {
        lastLoginAt: new Date(),
        loginCount: (customerData.loginCount || 0) + 1
      });
    }
    
    console.log('✅ Customer login completed successfully');
    return { success: true, user: user };
  } catch (error: any) {
    console.error('❌ Error logging in customer: ', error);
    
    // Provide user-friendly error messages
    let userMessage = 'An error occurred during login. Please try again.';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          userMessage = 'Invalid email or password. Please check your credentials and try again.';
          break;
        case 'auth/invalid-email':
          userMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          userMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          userMessage = 'Too many failed login attempts. Please wait a few minutes and try again.';
          break;
        case 'auth/network-request-failed':
          userMessage = 'Network error. Please check your internet connection and try again.';
          break;
        default:
          userMessage = `Login failed: ${error.message}`;
          break;
      }
    }
    
    return { 
      success: false, 
      error: userMessage,
      errorCode: error.code,
      originalError: error 
    };
  }
};

export const registerCustomer = async (email: string, password: string, customerData: {
  fullName: string;
  phoneNumber?: string;
}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Save customer profile data to Firestore with emailVerified status
    const customerDoc = {
      fullName: customerData.fullName,
      email: email,
      phoneNumber: customerData.phoneNumber || '',
      createdAt: new Date(),
      isActive: false, // Account inactive until email is verified
      emailVerified: false,
      role: 'customer'
    };
    
    await setDoc(doc(db, 'customers', user.uid), customerDoc);
    
    // Small delay to ensure Firestore write is committed before auth state changes
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { 
      success: true, 
      user: user,
      message: 'Registration successful! Please check your email to verify your account before logging in.'
    };
  } catch (error) {
    console.error('Error registering customer: ', error);
    return { success: false, error: error };
  }
};

export const logoutCustomer = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error logging out customer: ', error);
    return { success: false, error: error };
  }
};

// Email verification functions
export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
      return { 
        success: true, 
        message: 'Verification email sent! Please check your email.' 
      };
    } else if (user && user.emailVerified) {
      return { 
        success: false, 
        error: 'Email is already verified.' 
      };
    } else {
      return { 
        success: false, 
        error: 'No user is currently logged in.' 
      };
    }
  } catch (error) {
    console.error('Error sending verification email: ', error);
    return { success: false, error: error };
  }
};

export const checkEmailVerificationStatus = async (userId: string) => {
  try {
    const user = auth.currentUser;
    if (user) {
      // Reload user to get latest verification status
      await user.reload();
      
      if (user.emailVerified) {
        // Update Firestore to reflect verification
        await updateDoc(doc(db, 'customers', userId), {
          emailVerified: true,
          isActive: true
        });
        
        return { success: true, verified: true };
      } else {
        return { success: true, verified: false };
      }
    }
    return { success: false, error: 'No user found' };
  } catch (error) {
    console.error('Error checking verification status: ', error);
    return { success: false, error: error };
  }
};

export const getCustomerProfile = async (userId: string) => {
  try {
    const customerDoc = await getDoc(doc(db, 'customers', userId));
    if (customerDoc.exists()) {
      return { success: true, customer: customerDoc.data() };
    } else {
      return { success: false, error: 'Customer profile not found' };
    }
  } catch (error) {
    console.error('Error getting customer profile: ', error);
    return { success: false, error: error };
  }
};

export const updateCustomerProfile = async (userId: string, profileData: {
  fullName?: string;
  phoneNumber?: string;
  photoURL?: string;
}) => {
  try {
    await updateDoc(doc(db, 'customers', userId), {
      ...profileData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating customer profile: ', error);
    return { success: false, error: error };
  }
};

// Update customer account status (for admin use)
export const updateCustomerStatus = async (userId: string, isActive: boolean, reason?: string) => {
  try {
    await updateDoc(doc(db, 'customers', userId), {
      isActive: isActive,
      statusUpdatedAt: new Date(),
      statusUpdatedBy: 'admin',
      statusReason: reason || '',
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating customer status: ', error);
    return { success: false, error: error };
  }
};

// Get all customers (for admin use)
export const getAllCustomers = async () => {
  try {
    console.log('🔍 Fetching all customers from Firestore...');
    const customersQuery = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(customersQuery);
    
    const customers: any[] = [];
    snapshot.docs.forEach(doc => {
      customers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Found ${customers.length} customers in Firestore`);
    return { success: true, customers };
  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    return { success: false, error: error };
  }
};

// Delete customer account and all related data (for admin use)
// Note: This only deletes Firestore data. Firebase Auth users cannot be deleted from client-side code
// and would require Firebase Admin SDK on a server. The user will still exist in Firebase Auth
// but won't be able to access the app without their Firestore customer data.
export const deleteCustomerAccount = async (userId: string, reason?: string) => {
  try {
    console.log('🗑️ Starting customer account deletion for:', userId);
    
    // First, get customer info for logging
    const customerDoc = await getDoc(doc(db, 'customers', userId));
    if (!customerDoc.exists()) {
      console.log('❌ Customer not found in Firestore:', userId);
      return { success: false, error: 'Customer not found' };
    }
    
    const customerData = customerDoc.data();
    console.log('🗑️ Deleting account for:', customerData.email);
    
    // Delete customer preferences
    try {
      await deleteDoc(doc(db, 'customer_preferences', userId));
      console.log('✅ Deleted customer preferences');
    } catch (error) {
      console.log('ℹ️ No customer preferences to delete or error:', error);
    }
    
    // Cancel/delete all customer pre-orders
    try {
      const preOrdersQuery = query(collection(db, 'preorders'));
      const preOrdersSnapshot = await getDocs(preOrdersQuery);
      
      let deletedOrders = 0;
      const deletePromises: Promise<void>[] = [];
      
      preOrdersSnapshot.forEach((orderDoc) => {
        const orderData = orderDoc.data();
        if (orderData.customerId === userId) {
          deletePromises.push(deleteDoc(doc(db, 'preorders', orderDoc.id)));
          deletedOrders++;
        }
      });
      
      await Promise.all(deletePromises);
      console.log(`✅ Deleted ${deletedOrders} pre-orders`);
    } catch (error) {
      console.log('ℹ️ Error deleting pre-orders:', error);
    }
    
    // Log the deletion action
    try {
      await addDoc(collection(db, 'admin_actions'), {
        action: 'delete_customer_account',
        targetUserId: userId,
        targetUserEmail: customerData.email,
        targetUserName: customerData.fullName || 'Unknown',
        reason: reason || 'No reason provided',
        performedBy: 'admin',
        timestamp: new Date(),
        customerData: {
          email: customerData.email,
          fullName: customerData.fullName,
          phoneNumber: customerData.phoneNumber,
          joinDate: customerData.createdAt,
          lastLogin: customerData.lastLoginAt,
          loginCount: customerData.loginCount
        }
      });
      console.log('✅ Logged deletion action');
    } catch (error) {
      console.log('⚠️ Error logging deletion action:', error);
    }
    
    // Finally, delete the customer document
    await deleteDoc(doc(db, 'customers', userId));
    console.log('✅ Deleted customer document from Firestore');
    
    // Note: We cannot delete Firebase Auth users from client-side code
    // The Firebase Auth user will remain, but without Firestore data they won't be able to access the app
    // To fully delete Firebase Auth users, you would need to use Firebase Admin SDK on a server
    
    console.log('🎉 Customer account deletion completed successfully');
    return { 
      success: true, 
      message: `Customer account deleted successfully. Email: ${customerData.email}`,
      deletedData: {
        email: customerData.email,
        fullName: customerData.fullName,
        joinDate: customerData.createdAt
      }
    };
  } catch (error) {
    console.error('❌ Error deleting customer account: ', error);
    return { success: false, error: error };
  }
};

// Upload profile image to Firestore as base64
export const uploadProfileImage = async (
  file: File, 
  progressCallback?: (progress: number) => void
) => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          if (progressCallback) progressCallback(50);
          
          const base64String = e.target?.result as string;
          
          if (progressCallback) progressCallback(100);
          
          // Return the base64 string as the "downloadURL"
          resolve({ success: true, downloadURL: base64String });
        } catch (error) {
          console.error('Error processing image:', error);
          reject({ success: false, error });
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        reject({ success: false, error });
      };
      
      if (progressCallback) progressCallback(25);
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error in upload function:', error);
    return { success: false, error };
  }
};

// Update profile with photo URL
export const updateProfileWithPhoto = async (
  userId: string, 
  profileData: {
    fullName?: string;
    phoneNumber?: string;
  },
  file?: File | null,
  progressCallback?: (progress: number) => void
) => {
  try {
    let photoURL;
    
    // If there's a file to upload
    if (file) {
      const uploadResult = await uploadProfileImage(file, progressCallback) as { success: boolean, downloadURL?: string };
      if (uploadResult.success && uploadResult.downloadURL) {
        photoURL = uploadResult.downloadURL;
      } else {
        return { success: false, error: 'Failed to upload profile image' };
      }
    }
    
    // Update profile with photo URL if available
    await updateDoc(doc(db, 'customers', userId), {
      ...profileData,
      ...(photoURL && { photoURL }),
      updatedAt: new Date()
    });
    
    return { success: true, photoURL };
  } catch (error) {
    console.error('Error updating profile with photo:', error);
    return { success: false, error };
  }
};

// Delete profile image from Firebase Storage
export const deleteProfileImage = async (userId: string, fileName: string) => {
  try {
    const fileRef = storageRef(storage, `profile_images/${userId}/${fileName}`);
    await deleteObject(fileRef);
    
    // Update user profile to remove the photo URL
    await updateDoc(doc(db, 'customers', userId), {
      photoURL: null,
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting profile image:', error);
    return { success: false, error };
  }
};

// Customer Preferences functions
export const getCustomerPreferences = async (userId: string) => {
  try {
    const preferencesDoc = await getDoc(doc(db, 'customer_preferences', userId));
    if (preferencesDoc.exists()) {
      return { success: true, preferences: preferencesDoc.data() };
    } else {
      // Return default preferences if none exist
      const defaultPreferences = {
        emailNotifications: true,
        smsNotifications: true,
        promotionalEmails: false,
        defaultPickupTime: '',
        savePaymentMethod: false
      };
      return { success: true, preferences: defaultPreferences };
    }
  } catch (error) {
    console.error('Error getting customer preferences: ', error);
    return { success: false, error: error };
  }
};

export const updateCustomerPreferences = async (userId: string, preferences: {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  promotionalEmails?: boolean;
  defaultPickupTime?: string;
  savePaymentMethod?: boolean;
}) => {
  try {
    await setDoc(doc(db, 'customer_preferences', userId), {
      ...preferences,
      updatedAt: new Date()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating customer preferences: ', error);
    return { success: false, error: error };
  }
};

// Pre-Order functions
export const createPreOrder = async (customerId: string, orderData: {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
  }>;
  totalAmount: number;
  pickupDate: string;
  pickupTime: string;
  specialInstructions?: string;
}) => {
  try {
    // Get customer profile to include customer info
    const customerResult = await getCustomerProfile(customerId);
    const customerInfo = customerResult.success ? customerResult.customer : null;
    
    const orderNumber = `PRE-${Date.now()}`;
    
    const docRef = await addDoc(collection(db, 'preorders'), {
      customerId,
      customerName: customerInfo?.fullName || 'Unknown',
      customerEmail: customerInfo?.email || 'Unknown',
      customerPhone: customerInfo?.phoneNumber || '',
      ...orderData,
      orderNumber,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return { success: true, id: docRef.id, orderNumber };
  } catch (error) {
    console.error('Error creating pre-order: ', error);
    return { success: false, error: error };
  }
};

export const getCustomerPreOrders = async (customerId: string) => {
  try {
    const q = query(
      collection(db, 'preorders'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.customerId === customerId) {
        orders.push({ id: doc.id, ...data });
      }
    });
    
    return { success: true, orders };
  } catch (error) {
    console.error('Error getting customer pre-orders: ', error);
    return { success: false, error: error };
  }
};

export const updatePreOrderStatus = async (orderId: string, status: string) => {
  try {
    await updateDoc(doc(db, 'preorders', orderId), {
      status,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating pre-order status: ', error);
    return { success: false, error: error };
  }
};

export const cancelPreOrder = async (orderId: string) => {
  try {
    await updateDoc(doc(db, 'preorders', orderId), {
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error cancelling pre-order: ', error);
    return { success: false, error: error };
  }
};

export const getAllPreOrders = async () => {
  try {
    const q = query(
      collection(db, 'preorders'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders: any[] = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, orders };
  } catch (error) {
    console.error('Error getting all pre-orders: ', error);
    return { success: false, error: error };
  }
};

// Content Management functions
export const addNewsUpdate = async (newsData: {
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  category: string;
  featured: boolean;
  status?: string;
}) => {
  try {
    // Check published news count if trying to publish
    const requestedStatus = newsData.status || 'draft';
    if (requestedStatus === 'published') {
      const publishedCount = await getPublishedNewsCount();
      if (publishedCount >= 7) {
        return { 
          success: false, 
          error: 'Maximum of 7 published news posts allowed. Please archive some posts first or save as draft.' 
        };
      }
    }
    
    console.log('🔥 ADDING NEWS UPDATE:', newsData)
    const docRef = await addDoc(collection(db, 'news_updates'), {
      ...newsData,
      timestamp: Timestamp.now(),
      status: requestedStatus,
      views: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('✅ News update added with ID:', docRef.id)
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Error adding news update:', error);
    return { success: false, error: error };
  }
};

export const getPublishedNewsCount = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'news_updates'));
    let count = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'published') {
        count++;
      }
    });
    return count;
  } catch (error) {
    console.error('Error getting published news count:', error);
    return 0;
  }
};

export const getNewsUpdates = async (statusFilter?: string) => {
  try {
    console.log('🔍 FETCHING NEWS UPDATES with filter:', statusFilter)
    const querySnapshot = await getDocs(collection(db, 'news_updates'));
    const news: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!statusFilter || data.status === statusFilter) {
        news.push({ id: doc.id, ...data });
      }
    });
    
    // Sort by timestamp (newest first)
    news.sort((a, b) => {
      const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
      const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
      return bTime.getTime() - aTime.getTime();
    });
    
    console.log(`✅ Found ${news.length} news updates`)
    return { success: true, news };
  } catch (error) {
    console.error('❌ Error getting news updates:', error);
    return { success: false, error: error };
  }
};

export const updateNewsUpdate = async (id: string, updateData: any) => {
  try {
    // Check published limit if changing status to published
    if (updateData.status === 'published') {
      const currentDoc = await getDocs(query(collection(db, 'news_updates')));
      let currentStatus = '';
      currentDoc.forEach((doc) => {
        if (doc.id === id) {
          currentStatus = doc.data().status;
        }
      });
      
      // Only check limit if changing from non-published to published
      if (currentStatus !== 'published') {
        const publishedCount = await getPublishedNewsCount();
        if (publishedCount >= 7) {
          return { 
            success: false, 
            error: 'Maximum of 7 published news posts allowed. Please archive some posts first.' 
          };
        }
      }
    }
    
    console.log('🔄 UPDATING NEWS UPDATE:', id, updateData)
    const docRef = doc(db, 'news_updates', id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });
    console.log('✅ News update updated successfully')
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating news:', error);
    return { success: false, error: error };
  }
};

export const updateNewsStatus = async (id: string, status: string) => {
  try {
    return await updateNewsUpdate(id, { status });
  } catch (error) {
    console.error('Error updating news status:', error);
    return { success: false, error: error };
  }
};

export const archiveOldestPublishedNews = async () => {
  try {
    console.log('📦 ARCHIVING OLDEST PUBLISHED NEWS...')
    const result = await getNewsUpdates('published');
    if (result.success && result.news && result.news.length > 0) {
      // Sort by timestamp to get oldest first
      const sortedNews = result.news.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
        const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
        return aTime.getTime() - bTime.getTime();
      });
      
      const oldestNews = sortedNews[0];
      const archiveResult = await updateNewsStatus(oldestNews.id, 'archived');
      
      if (archiveResult.success) {
        console.log('✅ Archived oldest news:', oldestNews.title)
        return { success: true, archivedId: oldestNews.id, archivedTitle: oldestNews.title };
      } else {
        return { success: false, error: archiveResult.error };
      }
    } else {
      return { success: false, error: 'No published news found to archive' };
    }
  } catch (error) {
    console.error('❌ Error archiving oldest news:', error);
    return { success: false, error: error };
  }
};

export const deleteNewsUpdate = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'news_updates', id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting news: ', error);
    return { success: false, error: error };
  }
};

// File upload functions - Compress and store images as base64 in Firestore
const compressImage = async (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with compression
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    
    img.onerror = reject;
    
    // Create object URL for the image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
  });
};

export const uploadFile = async (file: File, folder: string = 'uploads') => {
  try {
    console.log('📷 Compressing and converting image for Firestore storage...')
    
    // Compress the image to reduce size
    let base64Data: string;
    let compressionAttempts = 0;
    const maxAttempts = 3;
    const qualityLevels = [0.8, 0.6, 0.4];
    const maxWidths = [800, 600, 400];
    
    do {
      const quality = qualityLevels[compressionAttempts] || 0.4;
      const maxWidth = maxWidths[compressionAttempts] || 400;
      
      console.log(`🔄 Compression attempt ${compressionAttempts + 1}: quality=${quality}, maxWidth=${maxWidth}`);
      
      base64Data = await compressImage(file, maxWidth, quality);
      
      // Check if the compressed data is under Firestore's limit (~1MB)
      const sizeInBytes = base64Data.length * 0.75; // Base64 is ~33% larger than binary
      console.log(`📊 Compressed image size: ${Math.round(sizeInBytes / 1024)}KB`);
      
      if (sizeInBytes < 900000) { // 900KB to be safe
        break;
      }
      
      compressionAttempts++;
    } while (compressionAttempts < maxAttempts);
    
    // Final size check
    const finalSizeInBytes = base64Data.length * 0.75;
    if (finalSizeInBytes >= 900000) {
      return { 
        success: false, 
        error: 'Image too large even after compression. Please use a smaller image or reduce quality.' 
      };
    }
    
    // Store image metadata in Firestore
    const imageDoc = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      base64Data: base64Data,
      folder: folder,
      uploadedAt: Timestamp.now(),
      compressed: compressionAttempts > 0,
      compressionLevel: compressionAttempts
    };
    
    const docRef = await addDoc(collection(db, 'uploaded_images'), imageDoc);
    console.log('✅ Image stored in Firestore with ID:', docRef.id)
    
    // Return the base64 data URL as the "url" for immediate use
    return { success: true, url: base64Data, id: docRef.id };
  } catch (error) {
    console.error('❌ Error storing image in Firestore:', error);
    return { success: false, error: error };
  }
};

export const deleteFile = async (fileUrl: string) => {
  try {
    // If it's a Firestore document ID, delete from Firestore
    // If it's a base64 URL, we don't need to delete anything
    if (fileUrl.startsWith('data:')) {
      console.log('Base64 image, no deletion needed')
      return { success: true };
    }
    
    // If we have a document ID, delete from Firestore
    // For now, we'll just return success since we're not tracking individual image docs
    console.log('File deletion requested for:', fileUrl)
    return { success: true };
  } catch (error) {
    console.error('Error deleting file: ', error);
    return { success: false, error: error };
  }
};

// Get contact submissions
export const getContactSubmissions = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'contact_submissions'), orderBy('timestamp', 'desc'))
    );
    const contacts: any[] = [];
    querySnapshot.forEach((doc) => {
      contacts.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, contacts };
  } catch (error) {
    console.error('Error getting contact submissions: ', error);
    return { success: false, error: error };
  }
};

// Contact management functions
export const getContactInfo = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'contact_info'));
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { success: true, contactInfo: { id: doc.id, ...doc.data() } };
    }
    return { success: true, contactInfo: null };
  } catch (error) {
    console.error('Error getting contact info: ', error);
    return { success: false, error: error };
  }
};

export const updateContactInfo = async (contactInfo: any) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'contact_info'));
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'contact_info', querySnapshot.docs[0].id);
      await updateDoc(docRef, contactInfo);
    } else {
      await addDoc(collection(db, 'contact_info'), contactInfo);
    }
    return { success: true };
  } catch (error) {
    console.error('Error updating contact info: ', error);
    return { success: false, error: error };
  }
};

// Menu management functions
export const addMenuItem = async (menuItem: any) => {
  try {
    console.log('🔥 ADDING MENU ITEM TO FIRESTORE:', menuItem)
    const docRef = await addDoc(collection(db, 'menu_items'), {
      ...menuItem,
      createdAt: Timestamp.now()
    });
    console.log('✅ Menu item added successfully with ID:', docRef.id)
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Error adding menu item:', error);
    return { success: false, error: error };
  }
};

export const updateMenuItem = async (id: string, menuItem: any) => {
  try {
    const docRef = doc(db, 'menu_items', id);
    await updateDoc(docRef, {
      ...menuItem,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating menu item: ', error);
    return { success: false, error: error };
  }
};

export const deleteMenuItemFromDB = async (id: string) => {
  try {
    const docRef = doc(db, 'menu_items', id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting menu item: ', error);
    return { success: false, error: error };
  }
};

// Content management functions
export const getContent = async (section: string) => {
  try {
    console.log(`🔍 FETCHING CONTENT FOR SECTION: ${section}`)
    const querySnapshot = await getDocs(collection(db, 'site_content'));
    
    let sectionContent = null;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.section === section) {
        sectionContent = { id: doc.id, ...data };
      }
    });
    
    if (sectionContent) {
      console.log(`✅ Found content for ${section}:`, sectionContent)
      return { success: true, content: sectionContent };
    } else {
      console.log(`📝 No content found for ${section}, returning default`)
      return { success: true, content: null };
    }
  } catch (error) {
    console.error(`❌ Error getting content for ${section}:`, error);
    return { success: false, error: error };
  }
};

export const saveContent = async (section: string, contentData: any) => {
  try {
    console.log(`💾 SAVING CONTENT FOR SECTION: ${section}`, contentData)
    
    // Check if content already exists for this section
    const existingContent: any = await getContent(section);
    
    const dataToSave = {
      section,
      ...contentData,
      updatedAt: Timestamp.now()
    };
    
    if (existingContent.success && existingContent.content && existingContent.content.id) {
      // Update existing content
      const docRef = doc(db, 'site_content', existingContent.content.id);
      await updateDoc(docRef, dataToSave);
      console.log(`✅ Updated content for ${section} with ID: ${existingContent.content.id}`)
      return { success: true, id: existingContent.content.id };
    } else {
      // Create new content
      const docRef = await addDoc(collection(db, 'site_content'), {
        ...dataToSave,
        createdAt: Timestamp.now()
      });
      console.log(`✅ Created new content for ${section} with ID: ${docRef.id}`)
      return { success: true, id: docRef.id };
    }
  } catch (error) {
    console.error(`❌ Error saving content for ${section}:`, error);
    return { success: false, error: error };
  }
};

export const getAllContent = async () => {
  try {
    console.log('🔍 FETCHING ALL SITE CONTENT...')
    const querySnapshot = await getDocs(collection(db, 'site_content'));
    const content: any[] = [];
    querySnapshot.forEach((doc) => {
      content.push({ id: doc.id, ...doc.data() });
    });
    console.log('✅ Successfully fetched', content.length, 'content sections:', content)
    return { success: true, content };
  } catch (error) {
    console.error('❌ Error getting all content:', error);
    return { success: false, error: error };
  }
};
