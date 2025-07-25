import { reactive } from 'vue'
import { 
  onAuthChange, 
  loginCustomer, 
  registerCustomer, 
  logoutCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  updateProfileWithPhoto,
  getUserRole
} from '../firebase/services'

// Customer auth state
export const customerAuthState = reactive({
  user: null as any,
  customerProfile: null as any,
  isLoading: true,
  isAuthenticated: false
})

// Initialize customer auth state listener
onAuthChange(async (user) => {
  customerAuthState.isLoading = true
  
  if (user) {
    // Check if user is customer
    const roleResult = await getUserRole(user.uid)
    if (roleResult.success && roleResult.isCustomer && roleResult.role === 'customer') {
      // This is a customer user
      customerAuthState.user = user
      customerAuthState.isAuthenticated = true
      localStorage.setItem('isCustomer', 'true')
      
      // Load customer profile
      const profileResult = await getCustomerProfile(user.uid)
      if (profileResult.success) {
        customerAuthState.customerProfile = profileResult.customer
      }
    } else {
      // This is not a customer user
      customerAuthState.user = null
      customerAuthState.isAuthenticated = false
      customerAuthState.customerProfile = null
      localStorage.removeItem('isCustomer')
    }
  } else {
    customerAuthState.user = null
    customerAuthState.isAuthenticated = false
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

  return {
    customerAuthState,
    login,
    register,
    logout,
    updateProfile
  }
}
