<template>
  <div class="preorder-overlay" @click="closeModal">
    <div class="preorder-modal" @click.stop>
      <div class="preorder-header">
        <h2>Pre-Order</h2>
        <button 
          class="close-btn" 
          @click.stop="closeModal" 
          title="Close" 
          type="button"
        >&times;</button>
      </div>
      
      <div v-if="step === 1" class="menu-selection">
        <h3>Select Items</h3>
        <div v-if="menuItems.length === 0" class="loading">Loading menu...</div>
        
        <div v-else class="menu-categories">
          <div v-for="category in categories" :key="category" class="category-section">
            <h4>{{ category }}</h4>
            <div class="menu-items">
              <div 
                v-for="item in getItemsByCategory(category)" 
                :key="item.id" 
                class="menu-item"
              >
                <div class="item-info">
                  <h5>{{ item.name }}</h5>
                  <p class="item-description">{{ item.description }}</p>
                  <span class="item-price">₱{{ item.price.toFixed(2) }}</span>
                </div>
                <div class="item-controls">
                  <button 
                    @click="decreaseQuantity(item)" 
                    :disabled="getItemQuantity(item.id) === 0"
                    class="qty-btn"
                  >-</button>
                  <span class="quantity">{{ getItemQuantity(item.id) }}</span>
                  <button @click="increaseQuantity(item)" class="qty-btn">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="cartItems.length > 0" class="cart-summary">
          <h4>Your Order ({{ totalItems }} items)</h4>
          <div class="cart-items">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <span>{{ item.name }} x{{ item.quantity }}</span>
              <span>₱{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
          <div class="total">
            <strong>Total: ₱{{ totalAmount.toFixed(2) }}</strong>
          </div>
          <button @click="step = 2" class="continue-btn">Continue to Pickup Details</button>
        </div>
      </div>
      
      <div v-if="step === 2" class="pickup-details">
        <h3>Pickup Details</h3>
        <form @submit.prevent="submitPreOrder" class="pickup-form">
          <div class="form-group">
            <label for="pickupDate">Pickup Date *</label>
            <input
              id="pickupDate"
              v-model="pickupDetails.date"
              type="date"
              required
              class="form-input"
              :min="minDate"
            >
          </div>
          
          <div class="form-group">
            <label for="pickupTime">Pickup Time *</label>
            <select
              id="pickupTime"
              v-model="pickupDetails.time"
              required
              class="form-input"
            >
              <option value="">Select time</option>
              <option v-for="time in availableTimes" :key="time" :value="time">
                {{ time }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="specialInstructions">Special Instructions (Optional)</label>
            <textarea
              id="specialInstructions"
              v-model="pickupDetails.instructions"
              class="form-textarea"
              placeholder="Any special requests or notes..."
              rows="3"
            ></textarea>
          </div>
          
          <div class="order-summary">
            <h4>Order Summary</h4>
            <div class="summary-items">
              <div v-for="item in cartItems" :key="item.id" class="summary-item">
                <span>{{ item.name }} x{{ item.quantity }}</span>
                <span>₱{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
            <div class="summary-total">
              <strong>Total: ₱{{ totalAmount.toFixed(2) }}</strong>
            </div>
          </div>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <div v-if="success" class="success-message">
            {{ success }}
          </div>
          
          <div class="form-actions">
            <button type="button" @click="step = 1" class="back-btn">Back to Menu</button>
            <button type="submit" :disabled="isSubmitting" class="submit-btn">
              {{ isSubmitting ? 'Placing Order...' : 'Place Pre-Order' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useCustomerAuth } from '../stores/customer-auth'
import { getMenuItems, createPreOrder } from '../firebase/services'

const emit = defineEmits(['close', 'success', 'minimize'])

const { customerAuthState } = useCustomerAuth()

const step = ref(1)
const menuItems = ref<any[]>([])
const selectedItems = ref<{ [key: string]: number }>({})
const isSubmitting = ref(false)
const error = ref('')
const success = ref('')

const pickupDetails = reactive({
  date: '',
  time: '',
  instructions: ''
})

const availableTimes = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
]

const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const categories = computed(() => {
  const cats = [...new Set(menuItems.value.map(item => item.category))]
  return cats.sort()
})

const cartItems = computed(() => {
  return menuItems.value
    .filter(item => selectedItems.value[item.id] > 0)
    .map(item => ({
      ...item,
      quantity: selectedItems.value[item.id]
    }))
})

const totalItems = computed(() => {
  return Object.values(selectedItems.value).reduce((sum, qty) => sum + qty, 0)
})

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const getItemsByCategory = (category: string) => {
  return menuItems.value.filter(item => item.category === category)
}

const getItemQuantity = (itemId: string) => {
  return selectedItems.value[itemId] || 0
}

const increaseQuantity = (item: any) => {
  if (!selectedItems.value[item.id]) {
    selectedItems.value[item.id] = 0
  }
  selectedItems.value[item.id]++
}

const decreaseQuantity = (item: any) => {
  if (selectedItems.value[item.id] > 0) {
    selectedItems.value[item.id]--
  }
}

const loadMenuItems = async () => {
  try {
    const result = await getMenuItems()
    if (result.success) {
      menuItems.value = result.items || []
    } else {
      error.value = 'Failed to load menu items'
    }
  } catch (err) {
    error.value = 'Error loading menu'
  }
}

const submitPreOrder = async () => {
  error.value = ''
  success.value = ''
  
  if (!pickupDetails.date || !pickupDetails.time) {
    error.value = 'Please select pickup date and time'
    return
  }
  
  if (cartItems.value.length === 0) {
    error.value = 'Please select at least one item'
    return
  }
  
  isSubmitting.value = true
  
  try {
    const orderData = {
      items: cartItems.value.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category
      })),
      totalAmount: totalAmount.value,
      pickupDate: pickupDetails.date,
      pickupTime: pickupDetails.time,
      specialInstructions: pickupDetails.instructions.trim()
    }
    
    const result = await createPreOrder(customerAuthState.user.uid, orderData)
    
    if (result.success) {
      success.value = `Pre-order placed successfully! Order number: ${result.orderNumber}`
      setTimeout(() => {
        emit('success')
        closeModal()
      }, 3000)
    } else {
      error.value = 'Failed to place pre-order'
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  console.log('PreOrder.vue: Using direct DOM method to close modal')
  
  // Force modal closing through every possible approach
  try {
    // 1. DOM approach
    const modal = document.querySelector('.preorder-overlay') as HTMLElement
    if (modal) {
      modal.style.display = 'none'
      console.log('PreOrder.vue: Modal hidden via DOM manipulation')
    }
    
    // 2. Standard Vue event
    emit('close')
    
    // 3. Global event
    window.dispatchEvent(new CustomEvent('force-modal-close'))
    
    // 4. Parent state reset (last resort)
    const parent = document.querySelector('.preorder-minimized-bar')
    if (parent) {
      const closeBtn = parent.querySelector('button:last-child') as HTMLElement
      if (closeBtn) closeBtn.click()
    }
    
  } catch (err) {
    console.error('Error in closeModal:', err)
    // Still try to emit the event
    emit('close')
  }
}

// Minimize function removed as button is no longer present

onMounted(() => {
  loadMenuItems()
})
</script>

<style scoped>
.preorder-overlay {
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

.preorder-modal {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
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

.preorder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.preorder-header h2 {
  color: #8B4513;
  font-size: 1.8rem;
  margin: 0;
}

.minimize-btn {
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
  line-height: 1;
}

.minimize-btn:hover {
  background: #f0f0f0;
  color: #333;
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
  line-height: 1;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.menu-categories {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 2rem;
}

.category-section {
  margin-bottom: 2rem;
}

.category-section h4 {
  color: #8B4513;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.menu-items {
  display: grid;
  gap: 1rem;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  border-color: #8B4513;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-info h5 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
}

.item-description {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.item-price {
  color: #8B4513;
  font-weight: bold;
  font-size: 1.1rem;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.qty-btn {
  background: #8B4513;
  color: white;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.qty-btn:hover:not(:disabled) {
  background: #654321;
}

.qty-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.quantity {
  font-weight: bold;
  font-size: 1.1rem;
  min-width: 20px;
  text-align: center;
}

.cart-summary {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  margin-top: 2rem;
}

.cart-summary h4 {
  color: #8B4513;
  margin-bottom: 1rem;
}

.cart-items {
  margin-bottom: 1rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.total {
  font-size: 1.2rem;
  color: #8B4513;
  text-align: right;
  margin-bottom: 1rem;
}

.continue-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
}

.continue-btn:hover {
  background: #218838;
}

.pickup-form {
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

.form-input,
.form-textarea {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #8B4513;
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.order-summary {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
}

.order-summary h4 {
  color: #8B4513;
  margin-bottom: 1rem;
}

.summary-items {
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.summary-total {
  font-size: 1.2rem;
  color: #8B4513;
  text-align: right;
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

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.back-btn,
.submit-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  flex: 1;
}

.back-btn {
  background: #6c757d;
  color: white;
}

.back-btn:hover {
  background: #5a6268;
}

.submit-btn {
  background: #28a745;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #218838;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  color: #666;
  padding: 2rem;
  font-size: 1.1rem;
}

/* Mobile styles */
@media (max-width: 768px) {
  .preorder-modal {
    padding: 1.5rem;
    margin: 0;
  }
  
  .menu-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .item-controls {
    align-self: flex-end;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .qty-btn {
    width: 30px;
    height: 30px;
    font-size: 1rem;
  }
}
</style>
