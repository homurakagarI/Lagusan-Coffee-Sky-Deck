import { reactive } from 'vue'
import { onAuthChange, loginAdmin, registerAdmin, logoutAdmin, getUserRole, initializeAdminProfile } from '../firebase/services'
import { auth } from '../firebase/config'

// Auth state
export const authState = reactive({
  user: null as any,
  isLoading: true,
  isAuthenticated: false
})

// Initialize auth state listener
onAuthChange(async (user) => {
  authState.isLoading = true
  console.log('🔐 Auth state changed. User:', user?.email || 'None');
  
  if (user) {
    console.log('🔐 User authenticated:', user.email, 'UID:', user.uid);
    
    // Check if user is admin
    const roleResult = await getUserRole(user.uid)
    console.log('🔐 Role check result:', roleResult);
    
    if (roleResult.success && !roleResult.isCustomer && roleResult.role === 'admin') {
      // This is an admin user
      authState.user = user
      authState.isAuthenticated = true
      localStorage.setItem('isAdmin', 'true')
      console.log('✅ Admin authenticated successfully');
      
      // Initialize admin profile if this is the main admin
      if (user.email === 'admin@lagusan.com') {
        console.log('🔧 Main admin detected, initializing profile...');
        
        // Wait longer and check auth state multiple times
        setTimeout(async () => {
          try {
            console.log('🔧 Starting admin profile initialization...');
            
            // Double-check that auth.currentUser is available
            let retries = 0;
            const maxRetries = 10;
            
            while (!auth.currentUser && retries < maxRetries) {
              console.log(`🔧 Waiting for auth.currentUser (attempt ${retries + 1}/${maxRetries})...`);
              await new Promise(resolve => setTimeout(resolve, 200));
              retries++;
            }
            
            if (!auth.currentUser) {
              console.error('❌ Auth state still not ready after retries');
              return;
            }
            
            const initResult = await initializeAdminProfile(user.email)
            console.log('🔧 Admin profile initialization:', initResult.success ? 'Success' : 'Failed', initResult.message || initResult.error)
            if (!initResult.success) {
              console.error('🔧 Admin profile initialization error details:', initResult.error)
            }
          } catch (error) {
            console.error('⚠️ Error initializing admin profile:', error)
          }
        }, 2000); // Wait 2 seconds to ensure auth state is stable
      }
    } else {
      console.log('❌ User is not an admin');
      // This is not an admin user
      authState.user = null
      authState.isAuthenticated = false
      localStorage.removeItem('isAdmin')
    }
  } else {
    console.log('🔐 No user authenticated');
    authState.user = null
    authState.isAuthenticated = false
    localStorage.removeItem('isAdmin')
  }
  
  authState.isLoading = false
  console.log('🔐 Auth state update complete. Authenticated:', authState.isAuthenticated);
})

// Auth actions
export const useAuth = () => {
  const login = async (email: string, password: string) => {
    const result = await loginAdmin(email, password)
    return result
  }

  const register = async (email: string, password: string) => {
    const result = await registerAdmin(email, password)
    return result
  }

  const logout = async () => {
    const result = await logoutAdmin()
    if (result.success) {
      authState.user = null
      authState.isAuthenticated = false
    }
    return result
  }

  return {
    authState,
    login,
    register,
    logout
  }
}
