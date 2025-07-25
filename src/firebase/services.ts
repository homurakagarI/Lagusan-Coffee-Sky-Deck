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
  onAuthStateChanged
} from 'firebase/auth';
import { 
  ref as storageRef, 
  deleteObject
} from 'firebase/storage';
// If you need the User type elsewhere, use:
// import type { User } from 'firebase/auth';
import { db, auth, storage } from './config';

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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error logging in: ', error);
    return { success: false, error: error };
  }
};

export const registerAdmin = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error registering: ', error);
    return { success: false, error: error };
  }
};

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
export const getUserRole = async (userId: string) => {
  try {
    // First check if they exist in customers collection
    const customerDoc = await getDoc(doc(db, 'customers', userId));
    if (customerDoc.exists()) {
      const customerData = customerDoc.data();
      return { success: true, role: customerData.role || 'customer', isCustomer: true };
    }
    
    // If not a customer, assume they're an admin
    // (You could also create an admins collection for more security)
    return { success: true, role: 'admin', isCustomer: false };
  } catch (error) {
    console.error('Error getting user role: ', error);
    return { success: false, error: error };
  }
};

// Customer Authentication functions
export const loginCustomer = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error logging in customer: ', error);
    return { success: false, error: error };
  }
};

export const registerCustomer = async (email: string, password: string, customerData: {
  fullName: string;
  phoneNumber?: string;
}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save customer profile data to Firestore
    await setDoc(doc(db, 'customers', user.uid), {
      fullName: customerData.fullName,
      email: email,
      phoneNumber: customerData.phoneNumber || '',
      createdAt: new Date(),
      isActive: true,
      role: 'customer'
    });
    
    return { success: true, user: user };
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
