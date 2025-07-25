import { reactive } from 'vue'
import { onAuthChange, loginAdmin, registerAdmin, logoutAdmin, getUserRole } from '../firebase/services'

// Auth state
export const authState = reactive({
  user: null as any,
  isLoading: true,
  isAuthenticated: false
})

// Initialize auth state listener
onAuthChange(async (user) => {
  authState.isLoading = true
  
  if (user) {
    // Check if user is admin
    const roleResult = await getUserRole(user.uid)
    if (roleResult.success && !roleResult.isCustomer && roleResult.role === 'admin') {
      // This is an admin user
      authState.user = user
      authState.isAuthenticated = true
      localStorage.setItem('isAdmin', 'true')
    } else {
      // This is not an admin user
      authState.user = null
      authState.isAuthenticated = false
      localStorage.removeItem('isAdmin')
    }
  } else {
    authState.user = null
    authState.isAuthenticated = false
    localStorage.removeItem('isAdmin')
  }
  
  authState.isLoading = false
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
