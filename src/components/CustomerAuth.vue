<template>
  <div class="auth-overlay" @click="closeModal">
    <div class="auth-modal" @click.stop>
      <div class="auth-header">
        <h2>{{ isLogin ? 'Login' : 'Register' }}</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <!-- Registration Prompt Banner -->
      <div v-if="showRegisterMessage" class="register-prompt">
        <div class="prompt-icon">🛒</div>
        <div class="prompt-content">
          <p><strong>Ready to order?</strong></p>
          <p>{{ isLogin ? 'Login to your account or create a new one to add items to your cart.' : 'Create your account to start ordering from our menu!' }}</p>
        </div>
      </div>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <!-- Full Name field for registration -->
        <div v-if="!isLogin" class="form-group">
          <label for="fullName">Full Name</label>
          <input
            id="fullName"
            v-model="form.fullName"
            type="text"
            required
            class="form-input"
            placeholder="Enter your full name"
          >
        </div>

        <!-- Phone Number field for registration -->
        <div v-if="!isLogin" class="form-group">
          <label for="phoneNumber">Phone Number (Optional)</label>
          <input
            id="phoneNumber"
            v-model="form.phoneNumber"
            type="tel"
            class="form-input"
            placeholder="Enter your phone number"
          >
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="form-input"
            placeholder="Enter your email"
          >
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="form-input"
            placeholder="Enter your password"
            minlength="6"
          >
        </div>
        
        <div v-if="!isLogin" class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            class="form-input"
            placeholder="Confirm your password"
            minlength="6"
          >
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <!-- Registration Success with Email Verification -->
        <div v-if="success && !isLogin && !needsVerification" class="verification-success">
          <div class="success-animation">
            <div class="check-circle">
              <div class="check-mark">✓</div>
            </div>
          </div>
          
          <div class="success-content">
            <h3>🎉 Registration Successful!</h3>
            <div class="success-steps">
              <div class="step completed">
                <div class="step-icon">📝</div>
                <div class="step-text">
                  <h4>Account Created</h4>
                  <p>Your account has been successfully created</p>
                </div>
              </div>
              
              <div class="step-connector"></div>
              
              <div class="step active">
                <div class="step-icon">📧</div>
                <div class="step-text">
                  <h4>Verify Your Email</h4>
                  <p>Check your email and click the verification link</p>
                </div>
              </div>
              
              <div class="step-connector"></div>
              
              <div class="step pending">
                <div class="step-icon">🚀</div>
                <div class="step-text">
                  <h4>Start Ordering</h4>
                  <p>Access our full menu and place orders</p>
                </div>
              </div>
            </div>
            
            <div class="email-notice">
              <div class="email-icon">📬</div>
              <div class="email-text">
                <p><strong>We sent a verification email to:</strong></p>
                <p class="email-address">{{ form.email }}</p>
                <p class="email-instruction">Click the link in the email to activate your account</p>
              </div>
            </div>
            
            <div class="success-actions">
              <button 
                type="button" 
                @click="closeModal"
                class="continue-btn"
              >
                Got it! I'll check my email
              </button>
            </div>
          </div>
        </div>
        
        <!-- Regular Success Message for Login -->
        <div v-else-if="success && isLogin" class="success-message">
          {{ success }}
        </div>
        
        <!-- Email Verification Section -->
        <div v-if="needsVerification" class="verification-section">
          <div class="verification-header">
            <div class="email-shield">
              <div class="shield-icon">�️</div>
              <div class="verification-pulse"></div>
            </div>
            <h3>Email Verification Required</h3>
            <p class="verification-subtitle">
              Protect your account and unlock all features
            </p>
          </div>

          <div class="verification-body">
            <div class="security-features">
              <div class="feature">
                <div class="feature-icon">🔒</div>
                <div class="feature-text">
                  <h4>Secure Account</h4>
                  <p>Verification keeps your account safe</p>
                </div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">🍕</div>
                <div class="feature-text">
                  <h4>Place Orders</h4>
                  <p>Access our full menu and ordering system</p>
                </div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">⭐</div>
                <div class="feature-text">
                  <h4>VIP Benefits</h4>
                  <p>Earn rewards and special discounts</p>
                </div>
              </div>
            </div>

            <div class="verification-status">
              <div class="status-card">
                <div class="status-header">
                  <div class="email-icon">📧</div>
                  <div class="status-info">
                    <h4>Check Your Email</h4>
                    <p class="user-email">{{ verificationEmail }}</p>
                  </div>
                </div>
                
                <div class="status-body">
                  <p>We sent a verification link to your email address. Click the link to activate your account.</p>
                  
                  <div class="verification-help">
                    <details class="help-dropdown">
                      <summary>Don't see the email? 📮</summary>
                      <div class="help-content">
                        <ul>
                          <li>Check your spam/junk folder</li>
                          <li>Make sure the email address is correct</li>
                          <li>Wait a few minutes for delivery</li>
                          <li>Try resending the verification email</li>
                        </ul>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </div>

            <div class="verification-actions">
              <button 
                type="button" 
                @click="handleResendVerification" 
                :disabled="isSubmitting"
                class="resend-btn"
              >
                <span v-if="isSubmitting" class="loading-spinner"></span>
                <span v-else>📤</span>
                {{ isSubmitting ? 'Sending...' : 'Resend Verification Email' }}
              </button>
              
              <button 
                type="button" 
                @click="needsVerification = false; error = ''" 
                class="back-btn"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
        
        <button v-if="!needsVerification" type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Processing...' : (isLogin ? 'Login' : 'Register') }}
        </button>
        
        <div v-if="!needsVerification" class="auth-switch">
          <p v-if="isLogin">
            Don't have an account? 
            <button type="button" @click="isLogin = false" class="switch-btn">
              Register here
            </button>
          </p>
          <p v-else>
            Already have an account? 
            <button type="button" @click="isLogin = true" class="switch-btn">
              Login here
            </button>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useCustomerAuth } from '../stores/customer-auth'

interface Props {
  showRegisterFirst?: boolean
  showRegisterMessage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showRegisterFirst: false,
  showRegisterMessage: false
})

const emit = defineEmits(['close', 'success'])

// Only use customer auth store for customer authentication
const { register, login, resendVerification } = useCustomerAuth()

const isLogin = ref(true)
const isSubmitting = ref(false)
const error = ref('')
const success = ref('')
const needsVerification = ref(false)
const verificationEmail = ref('')

onMounted(() => {
  if (props.showRegisterFirst) {
    isLogin.value = false
  }
})

const form = reactive({
  fullName: '',
  phoneNumber: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const closeModal = () => {
  emit('close')
}

const handleSubmit = async () => {
  error.value = ''
  success.value = ''
  needsVerification.value = false
  
  if (!isLogin.value && form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }
  
  if (!isLogin.value && !form.fullName.trim()) {
    error.value = 'Full name is required'
    return
  }
  
  isSubmitting.value = true
  
  try {
    let result: any
    if (isLogin.value) {
      // Customer login only
      result = await login(form.email, form.password)
      
      if (!result.success && result.needsVerification) {
        needsVerification.value = true
        verificationEmail.value = form.email
        error.value = result.error
        return
      }
    } else {
      // Registration for customers
      result = await register(form.email, form.password, {
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim()
      })
      
      if (result.success) {
        success.value = result.message || 'Registration successful! Please check your email to verify your account.'
        // Don't automatically close modal, let user see the verification message
        return
      }
    }
    
    if (result.success) {
      success.value = isLogin.value ? 'Login successful!' : 'Registration successful!'
      setTimeout(() => {
        emit('success')
        closeModal()
      }, 1500)
    } else {
      error.value = getErrorMessage(result.error || result)
    }
  } catch (err: any) {
    error.value = getErrorMessage(err)
  } finally {
    isSubmitting.value = false
  }
}

const handleResendVerification = async () => {
  try {
    isSubmitting.value = true
    const result = await resendVerification()
    
    if (result.success) {
      success.value = result.message || 'Verification email sent!'
      error.value = ''
    } else {
      error.value = getErrorMessage(result.error)
      success.value = ''
    }
  } catch (err: any) {
    error.value = getErrorMessage(err)
  } finally {
    isSubmitting.value = false
  }
}

const getErrorMessage = (error: any) => {
  if (!error?.code) {
    // Check for custom error messages
    if (error?.accountDeactivated) {
      return 'Your account has been deactivated by an administrator. Please contact customer support for assistance.'
    }
    return error?.message || 'An error occurred'
  }
  
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters'
    case 'auth/invalid-email':
      return 'Invalid email address'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later'
    default:
      return error.message || 'An error occurred'
  }
}
</script>

<style scoped>
.auth-overlay {
  position: fixed;
  top: 0;
  left: 0;  /* Changed from left: 30% to cover the entire screen */
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(53, 52, 52, 0.9), rgba(51, 50, 49, 0.9));
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(0px);
  padding: 1rem;
  box-sizing: border-box;
  min-height: 100vh;
  min-height: 100dvh;
  animation: overlayFadeIn 0.3s ease-out;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.auth-modal {
  background: white;
  padding: 0;
  border-radius: 30px;
  width: 100%;
  max-width: 600px;
  max-height: min(95vh, 95dvh);
  overflow: hidden;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  margin: auto;
  display: flex;
  flex-direction: column;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-50px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Media query to ensure centering on all screen sizes */
@media (max-height: 700px) {
  .auth-overlay {
    align-items: center;
    overflow-y: auto;
    padding: 2rem 1rem;
  }
  
  .auth-modal {
    margin: auto;
  }
}

.auth-header {
  background: linear-gradient(135deg, #8B4513, #A0522D);
  color: white;
  padding: 2rem 2rem 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.auth-header::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(135deg, #8B4513, #A0522D);
  border-radius: 0 0 20px 20px;
}

.auth-header h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.auth-form {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #8B4513;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.form-input {
  padding: 1.25rem 1rem;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafafa;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #8B4513;
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
  background: white;
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: #999;
  transition: color 0.3s ease;
}

.form-input:focus::placeholder {
  color: #bbb;
}

.error-message {
  background: linear-gradient(135deg, #fee, #fdd);
  color: #c33;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #fcc;
  font-size: 0.95rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(204, 51, 51, 0.1);
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.success-message {
  background: linear-gradient(135deg, #efe, #dfd);
  color: #3c3;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #cfc;
  font-size: 0.95rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(51, 204, 51, 0.1);
}

.submit-btn {
  background: linear-gradient(135deg, #8B4513, #A0522D);
  color: white;
  border: none;
  padding: 1.25rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 14px rgba(139, 69, 19, 0.3);
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #A0522D, #8B4513);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4);
}

.submit-btn:hover:not(:disabled)::before {
  left: 100%;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.auth-switch {
  text-align: center;
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.auth-switch p {
  color: #6c757d;
  margin: 0;
  font-size: 0.95rem;
}

.switch-btn {
  background: none;
  border: none;
  color: #8B4513;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  font-size: inherit;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.switch-btn:hover {
  color: #A0522D;
  background: rgba(139, 69, 19, 0.1);
  text-decoration: underline;
}

/* Mobile styles */
@media (max-width: 48rem) {
  .auth-overlay {
    padding: 0.5rem;
    align-items: center;
    justify-content: center;
  }
  
  .auth-modal {
    width: 100%;
    max-width: calc(100vw - 1rem);
    border-radius: 16px;
    max-height: calc(100vh - 1rem);
    max-height: calc(100dvh - 1rem);
    margin: auto;
  }
  
  .auth-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  .auth-header h2 {
    font-size: 1.5rem;
  }
  
  .auth-form {
    padding: 1.5rem;
  }
  
  .form-input {
    padding: 1rem;
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .submit-btn {
    padding: 1rem 1.5rem;
    font-size: 0.95rem;
  }
  
  .auth-switch {
    margin-top: 1rem;
    padding: 0.75rem;
  }
}

/* Register Prompt Banner Styles */
.register-prompt {
  background: linear-gradient(135deg, #fff8e1, #f3e5ab);
  padding: 1.5rem 2rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 3px solid #8B4513;
  position: relative;
}

.register-prompt::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #8B4513, #D4AF37, #8B4513);
}

.prompt-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

.prompt-content {
  flex: 1;
}

.prompt-content p {
  margin: 0;
  color: #5d4e37;
  line-height: 1.5;
}

.prompt-content p:first-child {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.prompt-content p:last-child {
  font-size: 0.9rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .register-prompt {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .prompt-icon {
    font-size: 1.5rem;
  }
}

/* Email Verification Section */
.verification-section {
  background: #f8f9fa;
  border: 0.125rem solid #D4AF37;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  margin: 1rem 0;
}

.verification-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.verification-section h3 {
  color: #8B4513;
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
}

.verification-section p {
  color: #666;
  margin: 0.5rem 0;
  line-height: 1.5;
}

.verification-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.resend-btn, .back-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 10rem;
}

.resend-btn {
  background: #D4AF37;
  color: white;
}

.resend-btn:hover:not(:disabled) {
  background: #B8941F;
  transform: translateY(-0.125rem);
}

.resend-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.back-btn {
  background: #6c757d;
  color: white;
}

.back-btn:hover {
  background: #5a6268;
  transform: translateY(-0.125rem);
}

/* Enhanced Success Screen Styles */
.verification-success {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 1rem;
  border: 1px solid #0891b2;
  margin: 1rem 0;
}

.success-animation {
  margin-bottom: 1.5rem;
}

.check-circle {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  animation: successPulse 2s ease-in-out infinite;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
}

.check-mark {
  color: white;
  font-size: 1.75rem;
  font-weight: bold;
  animation: checkMarkAppear 0.6s ease-in-out;
}

@keyframes successPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 0.625rem rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

@keyframes checkMarkAppear {
  0% {
    transform: scale(0) rotate(45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(45deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.success-content h3 {
  color: #065f46;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.success-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 2rem 0;
  text-align: left;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.step.completed {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 1px solid #10b981;
}

.step.active {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.step.pending {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  opacity: 0.7;
}

.step-icon {
  font-size: 1.5rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-text h4 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 1rem;
}

.step-text p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.step-connector {
  width: 2px;
  height: 1rem;
  background: #e5e7eb;
  margin-left: 2.5rem;
}

.email-notice {
  display: flex;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  margin: 2rem 0;
  text-align: left;
}

.email-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.email-text p {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.email-address {
  font-family: 'Courier New', monospace;
  background: #f3f4f6;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 600;
  color: #1f2937;
}

.email-instruction {
  color: #6b7280;
  font-size: 0.875rem;
}

.continue-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Enhanced Verification Required Styles */
.verification-header {
  text-align: center;
  margin-bottom: 2rem;
}

.email-shield {
  position: relative;
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
}

.shield-icon {
  font-size: 3rem;
  position: relative;
  z-index: 2;
}

.verification-pulse {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
  animation: shieldPulse 2s ease-in-out infinite;
}

@keyframes shieldPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
}

.verification-subtitle {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
  font-size: 0.975rem;
}

.verification-body {
  text-align: left;
}

.security-features {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.feature:hover {
  transform: translateX(0.25rem);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.feature-text h4 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 0.975rem;
}

.feature-text p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.verification-status {
  margin-bottom: 2rem;
}

.status-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-bottom: 1px solid #f59e0b;
}

.email-icon {
  font-size: 1.5rem;
}

.status-info h4 {
  margin: 0 0 0.25rem 0;
  color: #92400e;
  font-size: 1rem;
}

.user-email {
  margin: 0;
  font-family: 'Courier New', monospace;
  color: #b45309;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-body {
  padding: 1rem;
}

.status-body > p {
  color: #374151;
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.verification-help {
  margin-top: 1rem;
}

.help-dropdown {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.help-dropdown summary {
  padding: 0.75rem;
  background: #f9fafb;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.help-dropdown summary::-webkit-details-marker {
  display: none;
}

.help-dropdown summary::before {
  content: '▶';
  font-size: 0.75rem;
  color: #6b7280;
  transition: transform 0.2s ease;
}

.help-dropdown[open] summary::before {
  transform: rotate(90deg);
}

.help-content {
  padding: 1rem;
  background: white;
}

.help-content ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #6b7280;
}

.help-content li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.verification-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.resend-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.resend-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.resend-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.back-btn {
  background: #f8fafc;
  color: #374151;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #f1f5f9;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

@media (max-width: 48rem) {
  .verification-success {
    padding: 1.5rem;
  }
  
  .success-steps {
    gap: 0.75rem;
  }
  
  .step {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .step-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }
  
  .email-notice {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .security-features {
    gap: 0.75rem;
  }
  
  .feature {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .feature-icon {
    width: 2rem;
    height: 2rem;
    font-size: 1.25rem;
  }
  
  .status-header {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .verification-section {
    padding: 1.5rem;
  }
  
  .verification-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .resend-btn, .back-btn {
    width: 100%;
    max-width: 20rem;
  }
}
</style>
