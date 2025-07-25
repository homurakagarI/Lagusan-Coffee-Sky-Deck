<template>
  <div class="email-verification" :class="{ 'compact': isCompact }">
    <div class="verification-container">
      <!-- Compact Mode -->
      <div v-if="isCompact" class="compact-verification">
        <div class="compact-header">
          <div class="compact-icon">📧</div>
          <div class="compact-content">
            <h3>Email Verification Required</h3>
            <p>Please verify your email to access all features</p>
          </div>
          <div class="compact-actions">
            <button @click="toggleExpanded" class="expand-btn">Verify</button>
            <button @click="continueBrowsing" class="continue-btn">Continue Browsing</button>
            <button @click="dismissBanner" class="dismiss-btn">&times;</button>
          </div>
        </div>
      </div>
      
      <!-- Full Mode -->
      <div v-else class="full-verification">
        <div class="verification-header">
          <div class="verification-icon">📧</div>
          <h1>Email Verification Required</h1>
          <p class="subtitle">Please verify your email address to access your account</p>
        </div>
        
        <div class="verification-content">
          <div class="user-info">
            <div class="user-avatar">
              <span class="user-initials">{{ getInitials(customerAuthState.user?.email || 'U') }}</span>
            </div>
            <h2>Welcome to Lagusan Coffee!</h2>
            <p class="user-email">{{ customerAuthState.user?.email }}</p>
          </div>
          
          <div class="verification-message">
            <h3>📬 Check Your Email</h3>
            <p>
              We've sent a verification email to <strong>{{ customerAuthState.user?.email }}</strong>. 
              Please click the verification link in the email to activate your account.
            </p>
            
            <div class="verification-steps">
              <div class="step">
                <span class="step-number">1</span>
                <span class="step-text">Check your email inbox</span>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <span class="step-text">Look for an email from Lagusan Coffee</span>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <span class="step-text">Click the verification link</span>
              </div>
              <div class="step">
                <span class="step-number">4</span>
                <span class="step-text">Return here and refresh</span>
              </div>
            </div>
          </div>
          
          <div class="verification-actions">
            <button 
              @click="checkVerification" 
              :disabled="isChecking"
              class="primary-btn"
            >
              <span v-if="isChecking" class="loading-spinner"></span>
              <span v-else>✅</span>
              {{ isChecking ? 'Checking...' : 'I\'ve Verified My Email' }}
            </button>
            
            <button 
              @click="resendEmail" 
              :disabled="isResending || resendCooldown > 0"
              class="secondary-btn"
            >
              <span v-if="isResending" class="loading-spinner"></span>
              <span v-else>📧</span>
              {{ getResendButtonText() }}
            </button>
            
            <button @click="continueBrowsing" class="continue-browsing-btn">
              Continue Browsing (Limited Features)
            </button>
          </div>
          
          <div v-if="message" class="message" :class="messageType">
            {{ message }}
          </div>
          
          <div class="help-section">
            <h4>❓ Didn't receive the email?</h4>
            <ul class="help-list">
              <li>Check your spam/junk folder</li>
              <li>Make sure {{ customerAuthState.user?.email }} is correct</li>
              <li>Wait a few minutes for the email to arrive</li>
              <li>Click "Resend Email" if needed</li>
            </ul>
          </div>
          
          <div class="logout-section">
            <p>Wrong email address?</p>
            <button @click="handleLogout" class="text-btn">
              Sign out and try again
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCustomerAuth } from '../stores/customer-auth'

// Define emits for parent communication
const emit = defineEmits<{
  continueBrowsing: []
  dismiss: []
}>()

const { 
  customerAuthState, 
  refreshVerificationStatus, 
  resendVerification, 
  logout 
} = useCustomerAuth()

// Component state
const isCompact = ref(true) // Start in compact mode
const isDismissed = ref(false)

// New functions for compact mode
const toggleExpanded = () => {
  isCompact.value = !isCompact.value
}

const continueBrowsing = () => {
  emit('continueBrowsing')
}

const dismissBanner = () => {
  isDismissed.value = true
  emit('dismiss')
}

const isChecking = ref(false)
const isResending = ref(false)
const message = ref('')
const messageType = ref('')
const resendCooldown = ref(0)
const cooldownTimer = ref<number | null>(null)

const checkVerification = async () => {
  try {
    isChecking.value = true
    message.value = ''
    
    const result = await refreshVerificationStatus()
    
    if (result.success && result.verified) {
      message.value = 'Email verified successfully! Redirecting...'
      messageType.value = 'success'
      
      // Small delay to show success message
      setTimeout(() => {
        // The auth state listener will automatically update and redirect
      }, 1500)
    } else {
      message.value = 'Email not yet verified. Please check your email and click the verification link.'
      messageType.value = 'warning'
    }
  } catch (error) {
    console.error('Error checking verification:', error)
    message.value = 'Error checking verification status. Please try again.'
    messageType.value = 'error'
  } finally {
    isChecking.value = false
  }
}

const resendEmail = async () => {
  try {
    isResending.value = true
    message.value = ''
    
    const result = await resendVerification()
    
    if (result.success) {
      message.value = 'Verification email sent! Please check your inbox.'
      messageType.value = 'success'
      startResendCooldown()
    } else {
      message.value = (result as any).error || 'Failed to send verification email. Please try again.'
      messageType.value = 'error'
    }
  } catch (error) {
    console.error('Error resending email:', error)
    message.value = 'Error sending verification email. Please try again.'
    messageType.value = 'error'
  } finally {
    isResending.value = false
  }
}

const startResendCooldown = () => {
  resendCooldown.value = 60 // 60 seconds cooldown
  
  cooldownTimer.value = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer.value!)
      cooldownTimer.value = null
    }
  }, 1000)
}

const getResendButtonText = () => {
  if (isResending.value) return 'Sending...'
  if (resendCooldown.value > 0) return `Resend Email (${resendCooldown.value}s)`
  return 'Resend Email'
}

const getInitials = (email: string) => {
  const name = email.split('@')[0]
  return name.substring(0, 2).toUpperCase()
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

onMounted(() => {
  // Auto-check verification status every 10 seconds
  const autoCheckInterval = setInterval(() => {
    if (!isChecking.value) {
      refreshVerificationStatus()
    }
  }, 10000)
  
  // Clean up on unmount
  onUnmounted(() => {
    clearInterval(autoCheckInterval)
    if (cooldownTimer.value) {
      clearInterval(cooldownTimer.value)
    }
  })
})
</script>

<style scoped>
/* Compact Mode Styles */
.email-verification.compact {
  min-height: auto;
  background: none;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.email-verification.compact .verification-container {
  background: #fff3cd;
  border: 1px solid #f0ad4e;
  border-radius: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-width: none;
  width: 100%;
}

.compact-verification {
  padding: 0;
}

.compact-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  gap: 1rem;
}

.compact-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.compact-content {
  flex: 1;
}

.compact-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #856404;
}

.compact-content p {
  margin: 0;
  font-size: 0.875rem;
  color: #856404;
}

.compact-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.expand-btn, .continue-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn {
  background: #8B4513;
  color: white;
}

.expand-btn:hover {
  background: #A0522D;
}

.continue-btn {
  background: #6c757d;
  color: white;
}

.continue-btn:hover {
  background: #5a6268;
}

.dismiss-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #856404;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.dismiss-btn:hover {
  background: rgba(133, 100, 4, 0.1);
}

/* Full Mode Styles */
.email-verification {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.verification-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 600px;
  width: 100%;
  overflow: hidden;
}

.verification-header {
  background: linear-gradient(135deg, #8B4513, #A0522D);
  color: white;
  text-align: center;
  padding: 3rem 2rem;
}

.verification-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.verification-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.verification-content {
  padding: 2.5rem;
}

.user-info {
  text-align: center;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.user-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #8B4513, #A0522D);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
}

.user-initials {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.user-info h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.8rem;
}

.user-email {
  margin: 0;
  color: #8B4513;
  font-weight: 500;
  font-size: 1.1rem;
}

.verification-message {
  margin-bottom: 2rem;
}

.verification-message h3 {
  margin: 0 0 1rem 0;
  color: #8B4513;
  font-size: 1.3rem;
}

.verification-message p {
  margin: 0 0 1.5rem 0;
  color: #666;
  line-height: 1.6;
}

.verification-steps {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.step:last-child {
  margin-bottom: 0;
}

.step-number {
  width: 30px;
  height: 30px;
  background: #8B4513;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.step-text {
  color: #333;
  font-weight: 500;
}

.verification-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.primary-btn,
.secondary-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  text-decoration: none;
}

.primary-btn {
  background: linear-gradient(135deg, #8B4513, #A0522D);
  color: white;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.secondary-btn {
  background: #f8f9fa;
  color: #8B4513;
  border: 2px solid #e9ecef;
}

.secondary-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #8B4513;
}

.secondary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.continue-browsing-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  width: 100%;
}

.continue-browsing-btn:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 500;
}

.message.success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.message.error {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.message.warning {
  background: rgba(255, 193, 7, 0.1);
  color: #856404;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.help-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.help-section h4 {
  margin: 0 0 1rem 0;
  color: #8B4513;
  font-size: 1.1rem;
}

.help-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #666;
}

.help-list li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.logout-section {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.logout-section p {
  margin: 0 0 0.5rem 0;
  color: #666;
}

.text-btn {
  background: none;
  border: none;
  color: #8B4513;
  cursor: pointer;
  text-decoration: underline;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.text-btn:hover {
  color: #654321;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .email-verification {
    padding: 1rem;
  }
  
  .verification-header {
    padding: 2rem 1.5rem;
  }
  
  .verification-header h1 {
    font-size: 2rem;
  }
  
  .verification-content {
    padding: 2rem 1.5rem;
  }
  
  .verification-icon {
    font-size: 3rem;
  }
  
  .verification-steps {
    padding: 1rem;
  }
  
  .step {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .help-section,
  .verification-steps {
    margin: 1rem 0;
  }
}

@media (max-width: 480px) {
  .verification-header h1 {
    font-size: 1.75rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .user-info h2 {
    font-size: 1.5rem;
  }
  
  .verification-content {
    padding: 1.5rem 1rem;
  }
  
  .primary-btn,
  .secondary-btn {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }
}
</style>
