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
        
        <div v-if="success" class="success-message">
          {{ success }}
        </div>
        
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Processing...' : (isLogin ? 'Login' : 'Register') }}
        </button>
        
        <div class="auth-switch">
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
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/config'
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

const { register } = useCustomerAuth()

const isLogin = ref(true)
const isSubmitting = ref(false)
const error = ref('')
const success = ref('')

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
      // Unified login - works for both customers and admins
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password)
      result = { success: true, user: userCredential.user }
    } else {
      // Registration only for customers
      result = await register(form.email, form.password, {
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim()
      })
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

const getErrorMessage = (error: any) => {
  if (!error?.code) return error?.message || 'An error occurred'
  
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
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding: 20px;
  box-sizing: border-box;
}

.auth-modal {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
  margin: auto;
  position: relative;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.auth-header h2 {
  color: #8B4513;
  font-size: 1.8rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #8B4513;
  font-size: 0.9rem;
}

.form-input {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #fcc;
  font-size: 0.9rem;
  text-align: center;
}

.success-message {
  background: #efe;
  color: #363;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #cfc;
  font-size: 0.9rem;
  text-align: center;
}

.submit-btn {
  background: #D4AF37;
  color: #333;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.submit-btn:hover:not(:disabled) {
  background: #F4D03F;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.auth-switch {
  text-align: center;
  margin-top: 1rem;
}

.auth-switch p {
  color: #666;
  margin: 0;
}

.switch-btn {
  background: none;
  border: none;
  color: #D4AF37;
  cursor: pointer;
  font-weight: bold;
  text-decoration: underline;
  padding: 0;
  font-size: inherit;
}

.switch-btn:hover {
  color: #8B4513;
}

/* Mobile styles */
@media (max-width: 768px) {
  .auth-overlay {
    padding: 10px;
  }
  
  .auth-modal {
    padding: 1.5rem;
    width: 100%;
    max-width: 100%;
    margin: 0;
    border-radius: 15px;
  }
  
  .auth-header h2 {
    font-size: 1.5rem;
  }
  
  .form-input {
    padding: 0.8rem;
  }
  
  .submit-btn {
    padding: 0.8rem 1.5rem;
  }
}

/* Register Prompt Banner Styles */
.register-prompt {
  background: linear-gradient(135deg, #D4AF37, #F4E9A1);
  padding: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.prompt-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.prompt-content {
  flex: 1;
}

.prompt-content p {
  margin: 0;
  color: #333;
  line-height: 1.4;
}

.prompt-content p:first-child {
  font-size: 1rem;
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
</style>
