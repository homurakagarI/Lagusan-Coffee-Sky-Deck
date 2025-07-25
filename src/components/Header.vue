<template>
  <header class="header">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <div class="logo-frame">
            <img 
              src="\Lagusanlogo.jpg"
              alt="Lagusan Coffee Logo" 
              class="logo-image"
              @error="handleImageError"
            />
            <div class="logo-fallback">☕</div>
          </div>
          <h2>Lagusan Coffee Sky Deck</h2>
        </div>
        
        <!-- Mobile menu button -->
        <div class="nav-toggle" @click="toggleMenu">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>
        
        <!-- Navigation menu -->
        <ul class="nav-menu" :class="{ active: isMenuOpen }">
          <li class="nav-item">
            <a href="#home" class="nav-link" @click="closeMenuAndDashboard">Home</a>
          </li>
          <li class="nav-item">
            <a href="#about" class="nav-link" @click="closeMenuAndDashboard">About</a>
          </li>
          <li class="nav-item">
            <a href="#menu" class="nav-link" @click="closeMenuAndDashboard">Menu</a>
          </li>
          <li class="nav-item">
            <a href="#contact" class="nav-link" @click="closeMenuAndDashboard">Contact</a>
          </li>
          
          <!-- Unified Authentication Section -->
          <li class="nav-item">
            <button 
              v-if="customerAuthState.isLoading || authState.isLoading"
              class="auth-btn"
              disabled
            >
              Loading...
            </button>
            <button 
              v-else-if="!customerAuthState.isAuthenticated && !authState.isAuthenticated" 
              @click="showCustomerAuthModal = true; closeMenu()" 
              class="auth-btn"
            >
              Login / Register
            </button>
            <button 
              v-else-if="customerAuthState.needsEmailVerification && !allowBrowsingWithoutVerification && !authState.isAuthenticated"
              @click="closeMenu()" 
              class="auth-btn verification-needed"
            >
              Verify Email
            </button>
            <button 
              v-else-if="customerAuthState.isAuthenticated && (customerAuthState.isEmailVerified || allowBrowsingWithoutVerification)"
              @click="showUserDashboard = true; closeMenu()" 
              class="auth-btn logged-in"
              :class="{ 'limited-access': !customerAuthState.isEmailVerified }"
            >
              {{ customerAuthState.isEmailVerified ? 'Dashboard' : 'Dashboard (Limited)' }}
            </button>
            <button 
              v-else-if="authState.isAuthenticated"
              @click="showAdminDashboard = true; closeMenu()" 
              class="auth-btn logged-in admin" 
            >
              Admin Dashboard
            </button>
          </li>
        </ul>
      </div>
    </nav>
    
    <!-- Unified Auth Modal -->
    <CustomerAuth 
      v-if="showCustomerAuthModal"
      @close="showCustomerAuthModal = false"
      @success="onAuthSuccess"
    />
    
    <!-- Email Verification Modal -->
    <EmailVerification 
      v-if="customerAuthState.needsEmailVerification && !customerAuthState.isEmailVerified && !allowBrowsingWithoutVerification && !authState.isAuthenticated"
      @continueBrowsing="handleContinueBrowsing"
      @dismiss="handleDismissVerification"
    />
    
    <!-- User Dashboard -->
    <UserDashboard 
      v-if="showUserDashboard && customerAuthState.isAuthenticated && (customerAuthState.isEmailVerified || allowBrowsingWithoutVerification)"
      @close="handleUserDashboardClose"
    />
    
    <!-- Admin Dashboard Modal -->
    <AdminDashboard 
      v-if="showAdminDashboard && authState.isAuthenticated"
      @close="handleAdminDashboardClose"
    />
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../stores/auth'
import { useCustomerAuth } from '../stores/customer-auth'
import AdminDashboard from './AdminDashboard.vue'
import CustomerAuth from './CustomerAuth.vue'
import UserDashboard from './UserDashboard.vue'
import EmailVerification from './EmailVerification.vue'

const { authState } = useAuth()
const { customerAuthState } = useCustomerAuth()

const isMenuOpen = ref(false)
const showAdminDashboard = ref(false)
const showCustomerAuthModal = ref(false)
const showUserDashboard = ref(false)
const allowBrowsingWithoutVerification = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.style.display = 'none'
    const fallback = target.nextElementSibling as HTMLElement
    if (fallback) {
      fallback.style.display = 'flex'
    }
  }
}

const closeMenuAndDashboard = () => {
  isMenuOpen.value = false
  showAdminDashboard.value = false
  showUserDashboard.value = false
}

const onAuthSuccess = () => {
  showCustomerAuthModal.value = false
  
  // Check which type of user logged in and show appropriate dashboard
  setTimeout(() => {
    if (authState.isAuthenticated) {
      showAdminDashboard.value = true
    } else if (customerAuthState.isAuthenticated) {
      showUserDashboard.value = true
    }
  }, 100)
}

const handleUserDashboardClose = () => {
  console.log('Header: User dashboard close event received') // Debug log
  showUserDashboard.value = false
}

const handleContinueBrowsing = () => {
  allowBrowsingWithoutVerification.value = true
}

const handleDismissVerification = () => {
  allowBrowsingWithoutVerification.value = true
}

const handleAdminDashboardClose = () => {
  console.log('Header: Admin dashboard close event received') // Debug log
  showAdminDashboard.value = false
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(139, 69, 19, 0.95);
  backdrop-filter: blur(0.625rem);
  z-index: 1000;
  box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.1);
  min-height: 4.5rem;
}

.navbar {
  padding: 1rem 0;
  min-height: 3.5rem;
  display: flex;
  align-items: center;
}

.nav-container {
  max-width: 75rem;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-frame {
  position: relative;
  width: 3.75rem;  /* Increased from 3.125rem */
  height: 3.75rem;  /* Increased from 3.125rem */
  border-radius: 100%;
  background: linear-gradient(135deg, #D4AF37, #F4E9A1);
  padding: 0.1875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.3);
  border: 0.125rem solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  flex-shrink: 0;
}

.logo-frame:hover {
  transform: scale(1.1);
  box-shadow: 0 0.375rem 1rem rgba(0, 0, 0, 0.4);
  background: linear-gradient(135deg, #F4E9A1, #D4AF37);
}

.logo-image {
  width: 100%;
  height: 100%;
  border-radius: 400%;
  object-fit: cover;
  background: white;
}

.logo-fallback {
  display: none;
  font-size: 1.75rem;  /* Increased from 1.5rem */
  color: #8B4513;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
}

.nav-logo h2 {
  color: #fff;
  font-size: clamp(1.25rem, 2.8vw, 1.75rem);  /* Increased from 1.125rem, 2.5vw, 1.5rem */
  font-weight: bold;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: clamp(1rem, 3vw, 2rem);
  margin: 0;
  padding: 0;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #f4d03f;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -0.3125rem;
  left: 0;
  width: 0;
  height: 0.125rem;
  background-color: #f4d03f;
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  padding: 0.5rem;
  border: none;
  background: transparent;
}

.bar {
  width: 1.5625rem;
  height: 0.1875rem;
  background-color: #fff;
  margin: 0.1875rem 0;
  transition: 0.3s;
  border-radius: 0.09375rem;
}

/* Mobile styles */
@media (max-width: 48rem) {
  .header {
    min-height: 4rem;
  }
  
  .navbar {
    padding: 0.75rem 0;
    min-height: 3rem;
  }
  
  .nav-logo {
    gap: 0.75rem;
  }
  
  .logo-frame {
    width: 3rem;  /* Increased from 2.5rem */
    height: 3rem;  /* Increased from 2.5rem */
  }
  
  .logo-fallback {
    font-size: 1.4rem;  /* Increased from 1.2rem */
  }
  
  .nav-logo h2 {
    font-size: clamp(1rem, 4vw, 1.2rem);
  }
  
  .nav-menu {
    position: fixed;
    left: -100%;
    top: 4rem;
    flex-direction: column;
    background: rgba(139, 69, 19, 0.98);
    width: 100%;
    text-align: center;
    transition: 0.3s;
    padding: 2rem 0;
    gap: 1rem;
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.2);
  }

  .nav-menu.active {
    left: 0;
  }

  .nav-toggle {
    display: flex;
  }
  
  .nav-toggle.active .bar:nth-child(2) {
    opacity: 0;
  }

  .nav-toggle.active .bar:nth-child(1) {
    transform: translateY(0.5rem) rotate(45deg);
  }

  .nav-toggle.active .bar:nth-child(3) {
    transform: translateY(-0.5rem) rotate(-45deg);
  }
}

.auth-btn {
  background: #bd7d52;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;  /* Increased from 0.5rem 1rem */
  border-radius: 1.5rem;  /* Increased from 1.25rem */
  cursor: pointer;
  font-weight: 600;  /* Increased from 500 */
  transition: all 0.3s ease;
  font-size: clamp(0.9rem, 2.2vw, 1rem);  /* Increased from 0.8rem, 2vw, 0.9rem */
  white-space: nowrap;  
  min-width: fit-content;
}

.auth-btn:hover {
  background: #c47c4c;
  transform: translateY(-1px);
}

.auth-btn.logged-in {
  background: #17a2b8;
  color: white;
}

.auth-btn.logged-in.admin {
  background: #28a745;
  color: white;
}

.auth-btn.logged-in:hover {
  background: #138496;
}

.auth-btn.logged-in.admin:hover {
  background: #218838;
}

.auth-btn.verification-needed {
  background: #ffc107;
  color: #333;
  position: relative;
}

.auth-btn.verification-needed:hover {
  background: #e0a800;
}

.auth-btn.verification-needed::before {
  content: '⚠️';
  margin-right: 0.5rem;
}

.auth-btn.limited-access {
  background: #ffc107;
  color: #856404;
  border: 1px solid #ffc107;
}

.auth-btn.limited-access:hover {
  background: #e0a800;
  border-color: #e0a800;
}

.auth-btn.limited-access::before {
  content: '⚠️';
  margin-right: 0.5rem;
}

@media (max-width: 48rem) {
  .auth-btn {
    background: transparent;
    color: #fff;
    border: 0.15rem solid #6f42c1;  /* Slightly thicker border */
    padding: 0.85rem 1.75rem;  /* Increased from 0.7rem 1.5rem */
    width: 14rem;  /* Increased from 12.5rem */
    font-size: clamp(0.9rem, 3.2vw, 1.1rem);  /* Increased from 0.8rem, 3vw, 1rem */
  }
  
  .auth-btn:hover {
    background: #6f42c1;
    color: white;
  }
  
  .auth-btn.logged-in {
    border-color: #17a2b8;
    color: #17a2b8;
  }
  
  .auth-btn.logged-in.admin {
    border-color: #28a745;
    color: #28a745;
  }
  
  .auth-btn.logged-in:hover {
    background: #17a2b8;
    color: white;
  }
  
  .auth-btn.logged-in.admin:hover {
    background: #28a745;
    color: white;
  }
}
</style>
