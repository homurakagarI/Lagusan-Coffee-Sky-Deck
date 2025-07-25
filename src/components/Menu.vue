<template>
  <section id="menu" class="menu">
    <div class="container">
      <div class="menu-header">
        <h2 class="section-title">Our Menu</h2>
        <p class="section-subtitle">Discover our carefully crafted selection of premium coffees and delicious treats</p>
        
        <!-- Cart Summary -->
        <div v-if="cart.length > 0" class="cart-summary">
          <div class="cart-info">
            <span class="cart-icon">🛒</span>
            <span class="cart-count">{{ totalCartItems }} items</span>
            <span class="cart-total">₱{{ cartTotal.toFixed(2) }}</span>
          </div>
          <div class="cart-actions">
            <button @click="viewCart" class="view-cart-btn">View Cart</button>
            <button @click="clearCart" class="clear-cart-btn">Clear</button>
          </div>
        </div>
      </div>
      
      <div class="menu-categories">
        <button 
          v-for="category in categories" 
          :key="category"
          class="category-btn"
          :class="{ active: activeCategory === category }"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>
      
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading our delicious menu...</p>
      </div>
      
      <div v-else-if="menuItems.length === 0" class="empty-menu">
        <div class="empty-icon">🍽️</div>
        <h3>Menu Coming Soon</h3>
        <p>We're preparing something special for you!</p>
      </div>
      
      <div v-else class="menu-grid">
        <div 
          v-for="item in filteredItems" 
          :key="item.id"
          class="menu-item"
          :class="{ 'in-cart': isInCart(item.id) }"
        >
          <div class="item-image">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="menu-image" />
            <div v-else class="item-placeholder">
              <div class="placeholder-icon">☕</div>
            </div>
            <div v-if="isInCart(item.id)" class="cart-badge">
              {{ getCartQuantity(item.id) }}
            </div>
          </div>
          <div class="item-content">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-description">{{ item.description }}</p>
            <div class="item-footer">
              <span class="item-price">₱{{ item.price.toFixed(2) }}</span>
              <div class="item-controls">
                <div v-if="isInCart(item.id)" class="quantity-controls">
                  <button @click="decreaseQuantity(item)" class="qty-btn minus">-</button>
                  <span class="quantity">{{ getCartQuantity(item.id) }}</span>
                  <button @click="increaseQuantity(item)" class="qty-btn plus">+</button>
                </div>
                <button v-else @click="addToCart(item)" class="order-btn">
                  <span class="btn-icon">🛒</span>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart Modal -->
    <div v-if="showCartModal" class="cart-overlay" @click="closeCart">
      <div class="cart-modal" @click.stop>
        <div class="cart-header">
          <h3>Your Order</h3>
          <button @click="closeCart" class="close-btn">&times;</button>
        </div>
        
        <div v-if="cart.length === 0" class="empty-cart">
          <div class="empty-icon">🛒</div>
          <p>Your cart is empty</p>
          <button @click="closeCart" class="continue-shopping-btn">Continue Shopping</button>
        </div>
        
        <div v-else class="cart-content">
          <div class="cart-items">
            <div v-for="cartItem in cart" :key="cartItem.id" class="cart-item">
              <div class="cart-item-info">
                <h4>{{ cartItem.name }}</h4>
                <p class="cart-item-price">₱{{ cartItem.price.toFixed(2) }} each</p>
              </div>
              <div class="cart-item-controls">
                <button @click="decreaseQuantity(cartItem)" class="qty-btn">-</button>
                <span class="quantity">{{ cartItem.quantity }}</span>
                <button @click="increaseQuantity(cartItem)" class="qty-btn">+</button>
                <button @click="removeFromCart(cartItem.id)" class="remove-btn">🗑️</button>
              </div>
              <div class="cart-item-total">
                ₱{{ (cartItem.price * cartItem.quantity).toFixed(2) }}
              </div>
            </div>
          </div>
          
          <div class="cart-summary-section">
            <div class="cart-total-row">
              <span>Total: ₱{{ cartTotal.toFixed(2) }}</span>
            </div>
            <div class="cart-actions-section">
              <button @click="proceedToCheckout" class="checkout-btn">
                <span class="btn-icon">📝</span>
                Place Order
              </button>
              <button @click="clearCart" class="clear-all-btn">Clear All</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Auth Required Modal with Registration Prompt -->
    <div v-if="showAuthRequired" class="auth-overlay" @click="closeAuthRequired">
      <div class="auth-modal" @click.stop>
        <div class="auth-header">
          <h3>Account Required</h3>
          <button @click="closeAuthRequired" class="close-btn">&times;</button>
        </div>
        <div class="auth-content">
          <div class="auth-icon">🔐</div>
          <h4>Login Required to Add Items to Cart</h4>
          <p class="auth-message">To place an order and add items to your cart, you need to have an account with us.</p>
          <div class="auth-info">
            <div class="info-item">
              <span class="info-icon">📝</span>
              <span>New customer? Please register first to create your account</span>
            </div>
            <div class="info-item">
              <span class="info-icon">👤</span>
              <span>Already have an account? Login to continue</span>
            </div>
          </div>
          <div class="auth-actions">
            <button @click="openLogin" class="login-btn primary">Login / Register</button>
            <button @click="closeAuthRequired" class="cancel-btn">Continue Browsing</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getMenuItems } from '../firebase/services'
import { useCustomerAuth } from '../stores/customer-auth'

const emit = defineEmits(['openLogin', 'openPreOrder'])

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  available: boolean
}

interface CartItem extends MenuItem {
  quantity: number
}

const { customerAuthState } = useCustomerAuth()

const activeCategory = ref('All')
const menuItems = ref<MenuItem[]>([])
const cart = ref<CartItem[]>([])
const loading = ref(true)
const showCartModal = ref(false)
const showAuthRequired = ref(false)

// Map database categories to display categories
const categoryMapping: Record<string, string> = {
  'coffee': 'Coffee',
  'drinks': 'Specialty Drinks', 
  'pastry': 'Pastries',
  'food': 'Light Meals',
  'dessert': 'Pastries'
}

const categories = ['All', 'Coffee', 'Specialty Drinks', 'Pastries', 'Light Meals']

// Cart computeds
const totalCartItems = computed(() => 
  cart.value.reduce((total, item) => total + item.quantity, 0)
)

const cartTotal = computed(() => 
  cart.value.reduce((total, item) => total + (item.price * item.quantity), 0)
)

const filteredItems = computed(() => {
  if (activeCategory.value === 'All') {
    return menuItems.value
  }
  return menuItems.value.filter(item => item.category === activeCategory.value)
})

// Cart methods
const isInCart = (itemId: string) => {
  return cart.value.some(item => item.id === itemId)
}

const getCartQuantity = (itemId: string) => {
  const cartItem = cart.value.find(item => item.id === itemId)
  return cartItem ? cartItem.quantity : 0
}

const addToCart = (item: MenuItem) => {
  if (!customerAuthState.isAuthenticated) {
    showAuthRequired.value = true
    return
  }

  const existingItem = cart.value.find(cartItem => cartItem.id === item.id)
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.value.push({ ...item, quantity: 1 })
  }
}

const increaseQuantity = (item: MenuItem) => {
  const cartItem = cart.value.find(cartItem => cartItem.id === item.id)
  if (cartItem) {
    cartItem.quantity += 1
  }
}

const decreaseQuantity = (item: MenuItem) => {
  const cartItem = cart.value.find(cartItem => cartItem.id === item.id)
  if (cartItem) {
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1
    } else {
      removeFromCart(item.id)
    }
  }
}

const removeFromCart = (itemId: string) => {
  const index = cart.value.findIndex(item => item.id === itemId)
  if (index !== -1) {
    cart.value.splice(index, 1)
  }
}

const clearCart = () => {
  cart.value = []
  showCartModal.value = false
}

const viewCart = () => {
  showCartModal.value = true
}

const closeCart = () => {
  showCartModal.value = false
}

const closeAuthRequired = () => {
  showAuthRequired.value = false
}

const openLogin = () => {
  showAuthRequired.value = false
  emit('openLogin')
}

const proceedToCheckout = () => {
  if (cart.value.length === 0) return
  
  // Convert cart to pre-order format
  const orderItems = cart.value.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    category: item.category
  }))
  
  // Clear cart and emit pre-order event
  cart.value = []
  showCartModal.value = false
  emit('openPreOrder', orderItems)
}

const loadMenuItems = async () => {
  try {
    console.log('Loading menu items for website display...')
    const result = await getMenuItems()
    if (result.success && result.items) {
      // Filter only available items for public display
      menuItems.value = result.items
        .filter((item: any) => item.available !== false)
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price || 0),
          category: categoryMapping[item.category] || item.category,
          imageUrl: item.imageUrl,
          available: item.available
        }))
      console.log(`Loaded ${menuItems.value.length} available menu items`)
    } else {
      console.log('No menu items found')
      menuItems.value = []
    }
  } catch (error) {
    console.error('Error loading menu items:', error)
    menuItems.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMenuItems()
})
</script>

<style scoped>
.menu {
  padding: 100px 0;
  background: rgb(245, 237, 228);
}

.container {
  max-width: 75rem;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
}

.section-title {
  font-size: clamp(2rem, 5vw, 2.5rem);
  color: #8B4513;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: bold;
}

.section-subtitle {
  text-align: center;
  color: #666;
  font-size: clamp(1rem, 3vw, 1.2rem);
  margin-bottom: 3rem;
  line-height: 1.5;
}

.menu-categories {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.8rem 1.5rem;
  border: 2px solid #8B4513;
  background: transparent;
  color: #8B4513;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.category-btn:hover,
.category-btn.active {
  background: #8B4513;
  color: white;
  transform: translateY(-2px);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #8B4513;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.empty-menu {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: clamp(3rem, 8vw, 4rem);
  margin-bottom: 1rem;
}

.empty-menu h3 {
  margin: 1rem 0;
  color: #333;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.menu-item {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.menu-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.item-image {
  height: 150px;
  background: linear-gradient(135deg, #D4AF37, #8B4513);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.menu-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.item-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  text-align: center;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.item-icon {
  font-size: 4rem;
  color: white;
}

.item-content {
  padding: 1.5rem;
}

.item-name {
  font-size: 1.3rem;
  color: #8B4513;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.item-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-size: 1.3rem;
  font-weight: bold;
  color: #D4AF37;
}

.order-btn {
  background: #8B4513;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-weight: 500;
}

.order-btn:hover {
  background: #654321;
}

/* Mobile styles */
@media (max-width: 48rem) {
  .menu {
    padding: 3.75rem 0;
  }
  
  .section-title {
    font-size: clamp(1.75rem, 6vw, 2rem);
  }
  
  .section-subtitle {
    font-size: clamp(0.9rem, 4vw, 1rem);
    margin-bottom: 2rem;
  }
  
  .menu-categories {
    gap: 0.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .category-btn {
    padding: 0.6rem 1rem;
    font-size: clamp(0.8rem, 3vw, 0.9rem);
    min-width: fit-content;
  }
  
  .menu-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .item-content {
    padding: 1rem;
  }
  
  .item-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .order-btn {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.8rem;
  }
  
  .item-image {
    height: 120px;
  }
  
  .item-icon {
    font-size: 3rem;
  }
}

/* Auth Modal Styles */
.auth-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.auth-modal {
  background: white;
  padding: 0;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.auth-header {
  background: linear-gradient(135deg, #8B4513, #A0522D);
  color: white;
  padding: 1.5rem;
  border-radius: 15px 15px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.auth-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.auth-content {
  padding: 2rem;
  text-align: center;
}

.auth-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.auth-content h4 {
  color: #333;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.auth-message {
  color: #666;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.auth-info {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-left: 4px solid #D4AF37;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  text-align: left;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.info-item span:last-child {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.4;
}

.auth-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.login-btn, .cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.login-btn.primary {
  background: linear-gradient(135deg, #8B4513, #A0522D);
  color: white;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
}

.login-btn.primary:hover {
  background: linear-gradient(135deg, #654321, #8B4513);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
  transform: translateY(-2px);
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background: #e9ecef;
  color: #333;
}

@media (max-width: 768px) {
  .auth-modal {
    width: 95%;
    margin: 1rem;
  }
  
  .auth-content {
    padding: 1.5rem;
  }
  
  .auth-actions {
    flex-direction: column;
  }
  
  .login-btn, .cancel-btn {
    width: 100%;
  }
}
</style>
