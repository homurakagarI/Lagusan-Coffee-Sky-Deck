<template>
  <div class="auth-overlay" @click="closeModal">
    <div class="auth-modal" @click.stop>
      <div class="auth-header">
        <h2>{{ isLogin ? 'Admin Login' : 'Admin Register' }}</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
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
        
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Processing...' : (isLogin ? 'Login' : 'Register') }}
        </button>
        
        <div class="auth-switch">
          <p v-if="isLogin">
            Need to register? 
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
import { ref, reactive } from 'vue'
import { useAuth } from '../stores/auth'

const emit = defineEmits(['close', 'success'])

const { login, register } = useAuth()

const isLogin = ref(true)
const isSubmitting = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const closeModal = () => {
  emit('close')
}

const handleSubmit = async () => {
  error.value = ''
  
  if (!isLogin.value && form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }
  
  isSubmitting.value = true
  
  try {
    let result
    if (isLogin.value) {
      result = await login(form.email, form.password)
    } else {
      result = await register(form.email, form.password)
    }
    
    if (result.success) {
      emit('success')
      closeModal()
    } else {
      error.value = getErrorMessage(result.error)
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}

const getErrorMessage = (error: any) => {
  if (!error?.code) return 'An error occurred'
  
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email'
    case 'auth/wrong-password':
      return 'Incorrect password'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters'
    case 'auth/invalid-email':
      return 'Invalid email address'
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
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

.auth-modal {
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 400px;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin: auto;
  transform: translateY(0);
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.auth-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.auth-header h2 {
  color: #8B4513;
  margin: 0;
  font-size: 1.5rem;
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
}

.close-btn:hover {
  color: #666;
}

.auth-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #8B4513;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #c33;
}

.submit-btn {
  width: 100%;
  background: #8B4513;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #654321;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-switch {
  margin-top: 1.5rem;
  text-align: center;
}

.auth-switch p {
  color: #666;
  margin: 0;
}

.switch-btn {
  background: none;
  border: none;
  color: #8B4513;
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
}

.switch-btn:hover {
  color: #654321;
}

/* Mobile styles */
@media (max-width: 480px) {
  .auth-modal {
    width: 95%;
    margin: 1rem;
  }
  
  .auth-header {
    padding: 1.5rem 1.5rem 1rem;
  }
  
  .auth-form {
    padding: 1.5rem;
  }
  
  .auth-header h2 {
    font-size: 1.3rem;
  }
}
</style>
