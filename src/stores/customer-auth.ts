import { reactive } from 'vue'
import { 
  onAuthChange, 
  loginCustomer, 
  registerCustomer, 
  logoutCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  updateProfileWithPhoto,
  getUserRole,
  resendVerificationEmail
} from '../firebase/services'

// Customer auth state
export const customerAuthState = reactive({
  user: null as any,
  customerProfile: null as any,
  isLoading: true,
  isAuthenticated: false,
  isEmailVerified: false,
  needsEmailVerification: false
})

// Initialize customer auth state listener
onAuthChange(async (user) => {
  customerAuthState.isLoading = true
  
  if (user) {
    // Check if user is customer
    const roleResult = await getUserRole(user.uid)
    if (roleResult.success && roleResult.isCustomer && roleResult.role === 'customer') {
      // Check email verification status
      if (!user.emailVerified) {
        // User is not verified - block access
        customerAuthState.user = user
        customerAuthState.isAuthenticated = false
        customerAuthState.isEmailVerified = false
        customerAuthState.needsEmailVerification = true
        customerAuthState.customerProfile = null
        localStorage.removeItem('isCustomer')
      } else {
        // User is verified - allow access
        customerAuthState.user = user
        customerAuthState.isAuthenticated = true
        customerAuthState.isEmailVerified = true
        customerAuthState.needsEmailVerification = false
        localStorage.setItem('isCustomer', 'true')
        
        // Load customer profile
        const profileResult = await getCustomerProfile(user.uid)
        if (profileResult.success) {
          customerAuthState.customerProfile = profileResult.customer
        }
      }
    } else {
      // This is not a customer user
      customerAuthState.user = null
      customerAuthState.isAuthenticated = false
      customerAuthState.isEmailVerified = false
      customerAuthState.needsEmailVerification = false
      customerAuthState.customerProfile = null
      localStorage.removeItem('isCustomer')
    }
  } else {
    customerAuthState.user = null
    customerAuthState.isAuthenticated = false
    customerAuthState.isEmailVerified = false
    customerAuthState.needsEmailVerification = false
    customerAuthState.customerProfile = null
    localStorage.removeItem('isCustomer')
  }
  
  customerAuthState.isLoading = false
})

// Customer auth actions
export const useCustomerAuth = () => {
  const login = async (email: string, password: string) => {
    const result = await loginCustomer(email, password)
    return result
  }

  const register = async (email: string, password: string, customerData: {
    fullName: string;
    phoneNumber?: string;
  }) => {
    const result = await registerCustomer(email, password, customerData)
    return result
  }

  const logout = async () => {
    const result = await logoutCustomer()
    if (result.success) {
      customerAuthState.user = null
      customerAuthState.customerProfile = null
      customerAuthState.isAuthenticated = false
    }
    return result
  }

  const updateProfile = async (profileData: {
    fullName?: string;
    phoneNumber?: string;
    profileImageFile?: File | null;
  }, progressCallback?: (progress: number) => void) => {
    if (!customerAuthState.user) {
      return { success: false, error: 'Not authenticated' }
    }
    
    let result;
    
    // If there's a profile image file to upload
    if (profileData.profileImageFile) {
      const { profileImageFile, ...otherProfileData } = profileData;
      result = await updateProfileWithPhoto(
        customerAuthState.user.uid, 
        otherProfileData, 
        profileImageFile, 
        progressCallback
      );
    } else {
      // Standard profile update without image
      const { profileImageFile, ...otherProfileData } = profileData;
      result = await updateCustomerProfile(customerAuthState.user.uid, otherProfileData);
    }
    
    if (result.success) {
      // Reload profile
      const profileResult = await getCustomerProfile(customerAuthState.user.uid)
      if (profileResult.success) {
        customerAuthState.customerProfile = profileResult.customer
      }
    }
    return result
  }

  const resendVerification = async () => {
    return await resendVerificationEmail()
  }

  const checkVerificationStatus = async () => {
    if (customerAuthState.user) {
      // Reload user to get latest email verification status
      await customerAuthState.user.reload()
      
      if (customerAuthState.user.emailVerified && !customerAuthState.isEmailVerified) {
        // Email was just verified, update state
        customerAuthState.isEmailVerified = true
        customerAuthState.isAuthenticated = true
        customerAuthState.needsEmailVerification = false
        localStorage.setItem('isCustomer', 'true')
        
        // Load customer profile
        const profileResult = await getCustomerProfile(customerAuthState.user.uid)
        if (profileResult.success) {
          customerAuthState.customerProfile = profileResult.customer
        }
        
        return { success: true, verified: true }
      }
      
      return { 
        success: true, 
        verified: customerAuthState.user.emailVerified 
      }
    }
    return { success: false, error: 'No user logged in' }
  }

  const refreshVerificationStatus = async () => {
    return await checkVerificationStatus()
  }

  return {
    customerAuthState,
    login,
    register,
    logout,
    updateProfile,
    resendVerification,
    checkVerificationStatus,
    refreshVerificationStatus
  }
}
