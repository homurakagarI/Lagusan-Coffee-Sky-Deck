<template>
  <div class="preorder-management">
    <div class="section-header">
      <h2>Pre-Order Management</h2>
      <p>Manage customer pre-orders and update their status.</p>
      <div class="header-actions">
        <button @click="loadOrders" class="refresh-btn" :disabled="isLoading">
          {{ isLoading ? 'Loading...' : 'Refresh' }}
        </button>
        <select v-model="statusFilter" @change="filterOrders" class="status-filter">
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
    
    <div v-if="isLoading && orders.length === 0" class="loading">
      Loading pre-orders...
    </div>
    
    <div v-else-if="filteredOrders.length === 0" class="no-orders">
      <div class="no-orders-icon">📋</div>
      <h4>No pre-orders found</h4>
      <p>{{ statusFilter ? `No ${statusFilter} orders found.` : 'No pre-orders have been placed yet.' }}</p>
    </div>
    
    <div v-else class="orders-container">
      <div class="orders-stats">
        <div class="stat-card">
          <h3>{{ totalOrders }}</h3>
          <p>Total Orders</p>
        </div>
        <div class="stat-card">
          <h3>{{ pendingOrders }}</h3>
          <p>Pending</p>
        </div>
        <div class="stat-card">
          <h3>{{ todayOrders }}</h3>
          <p>Today</p>
        </div>
        <div class="stat-card">
          <h3>₱{{ totalRevenue.toFixed(2) }}</h3>
          <p>Total Revenue</p>
        </div>
      </div>
      
      <div class="orders-list">
        <div 
          v-for="order in filteredOrders" 
          :key="order.id" 
          class="order-card"
          :class="getStatusClass(order.status)"
        >
          <div class="order-header">
            <div class="order-info">
              <h4>{{ order.orderNumber }}</h4>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="order-status">
              <select 
                :value="order.status" 
                @change="updateOrderStatus(order.id, ($event.target as HTMLSelectElement)?.value || '')"
                class="status-select"
                :class="`status-${order.status}`"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready for Pickup</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div class="customer-info">
            <div class="customer-details">
              <span class="customer-name">👤 {{ order.customerName || 'N/A' }}</span>
              <span class="customer-email">📧 {{ order.customerEmail || 'N/A' }}</span>
              <span v-if="order.customerPhone" class="customer-phone">📱 {{ order.customerPhone }}</span>
            </div>
          </div>
          
          <div class="pickup-info">
            <div class="pickup-details">
              <span class="pickup-label">📅 Pickup:</span>
              <span class="pickup-datetime">
                {{ formatPickupDate(order.pickupDate) }} at {{ order.pickupTime }}
              </span>
            </div>
          </div>
          
          <div class="order-items">
            <h5>Items:</h5>
            <div class="items-list">
              <div v-for="item in order.items" :key="item.id" class="order-item">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
                <span class="item-price">₱{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="order.specialInstructions" class="special-instructions">
            <strong>🗒️ Special Instructions:</strong>
            <p>{{ order.specialInstructions }}</p>
          </div>
          
          <div class="order-footer">
            <div class="order-total">
              <strong>Total: ₱{{ order.totalAmount.toFixed(2) }}</strong>
            </div>
            <div class="order-actions">
              <button 
                v-if="order.status === 'pending'"
                @click="quickUpdateStatus(order.id, 'confirmed')"
                class="quick-btn confirm-btn"
              >
                ✅ Confirm
              </button>
              <button 
                v-if="order.status === 'confirmed'"
                @click="quickUpdateStatus(order.id, 'preparing')"
                class="quick-btn prepare-btn"
              >
                👨‍🍳 Prepare
              </button>
              <button 
                v-if="order.status === 'preparing'"
                @click="quickUpdateStatus(order.id, 'ready')"
                class="quick-btn ready-btn"
              >
                🔔 Ready
              </button>
              <button 
                v-if="order.status === 'ready'"
                @click="quickUpdateStatus(order.id, 'completed')"
                class="quick-btn complete-btn"
              >
                ✅ Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="success" class="success-message">
      {{ success }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getAllPreOrders, updatePreOrderStatus } from '../firebase/services'

const orders = ref<any[]>([])
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const statusFilter = ref('')

const filteredOrders = computed(() => {
  if (!statusFilter.value) return orders.value
  return orders.value.filter(order => order.status === statusFilter.value)
})

const totalOrders = computed(() => orders.value.length)

const pendingOrders = computed(() => 
  orders.value.filter(order => order.status === 'pending').length
)

const todayOrders = computed(() => {
  const today = new Date().toDateString()
  return orders.value.filter(order => {
    const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
    return orderDate.toDateString() === today
  }).length
})

const totalRevenue = computed(() => 
  orders.value
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.totalAmount, 0)
)

const loadOrders = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const result = await getAllPreOrders()
    if (result.success) {
      orders.value = result.orders || []
    } else {
      error.value = 'Failed to load pre-orders'
    }
  } catch (err) {
    error.value = 'Error loading pre-orders'
  } finally {
    isLoading.value = false
  }
}

const updateOrderStatus = async (orderId: string, newStatus: string) => {
  try {
    const result = await updatePreOrderStatus(orderId, newStatus)
    if (result.success) {
      // Update local state
      const orderIndex = orders.value.findIndex(o => o.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = newStatus
      }
      success.value = `Order status updated to ${newStatus}`
      setTimeout(() => {
        success.value = ''
      }, 3000)
    } else {
      error.value = 'Failed to update order status'
    }
  } catch (err) {
    error.value = 'Error updating order status'
  }
}

const quickUpdateStatus = (orderId: string, newStatus: string) => {
  updateOrderStatus(orderId, newStatus)
}

const filterOrders = () => {
  // This method is called when the filter changes
  // The computed property will automatically update
}

const getStatusClass = (status: string) => {
  return `order-${status}`
}

const formatDate = (dateField: any) => {
  if (!dateField) return 'Unknown'
  
  let date
  if (dateField.toDate) {
    date = dateField.toDate()
  } else if (dateField instanceof Date) {
    date = dateField
  } else {
    date = new Date(dateField)
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPickupDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.preorder-management {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-height: calc(100vh - 160px);
  overflow-y: auto;
}

.section-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  margin: 0 0 0.5rem 0;
  color: #8B4513;
}

.section-header p {
  margin: 0 0 1rem 0;
  color: #666;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.refresh-btn,
.status-filter {
  padding: 0.5rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn {
  background: #8B4513;
  color: white;
  border-color: #8B4513;
}

.refresh-btn:hover:not(:disabled) {
  background: #654321;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.status-filter {
  background: white;
}

.status-filter:focus {
  outline: none;
  border-color: #8B4513;
}

.loading {
  text-align: center;
  color: #666;
  padding: 3rem;
  font-size: 1.1rem;
}

.no-orders {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.no-orders-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-orders h4 {
  color: #8B4513;
  margin-bottom: 0.5rem;
}

.orders-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.orders-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: #8B4513;
  font-size: 2rem;
}

.stat-card p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-card.order-pending {
  border-left: 4px solid #ffc107;
}

.order-card.order-confirmed {
  border-left: 4px solid #17a2b8;
}

.order-card.order-preparing {
  border-left: 4px solid #fd7e14;
}

.order-card.order-ready {
  border-left: 4px solid #28a745;
}

.order-card.order-completed {
  border-left: 4px solid #6f42c1;
}

.order-card.order-cancelled {
  border-left: 4px solid #dc3545;
  opacity: 0.7;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.order-info h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1.2rem;
}

.order-date {
  color: #666;
  font-size: 0.9rem;
}

.status-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-select.status-pending {
  background: #fff3cd;
  color: #856404;
  border-color: #ffc107;
}

.status-select.status-confirmed {
  background: #d1ecf1;
  color: #0c5460;
  border-color: #17a2b8;
}

.status-select.status-preparing {
  background: #ffeaa7;
  color: #d68910;
  border-color: #fd7e14;
}

.status-select.status-ready {
  background: #d4edda;
  color: #155724;
  border-color: #28a745;
}

.status-select.status-completed {
  background: #e2e3f3;
  color: #4c4c95;
  border-color: #6f42c1;
}

.status-select.status-cancelled {
  background: #f8d7da;
  color: #721c24;
  border-color: #dc3545;
}

.customer-info {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.customer-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.customer-name,
.customer-email,
.customer-phone {
  color: #333;
  font-size: 0.9rem;
}

.pickup-info {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #e8f5e8;
  border-radius: 8px;
  border-left: 3px solid #28a745;
}

.pickup-label {
  font-weight: bold;
  color: #155724;
}

.pickup-datetime {
  color: #333;
  margin-left: 0.5rem;
}

.order-items {
  margin-bottom: 1rem;
}

.order-items h5 {
  margin: 0 0 0.75rem 0;
  color: #8B4513;
}

.items-list {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-name {
  flex: 1;
  color: #333;
}

.item-quantity {
  color: #666;
  margin: 0 1rem;
}

.item-price {
  color: #8B4513;
  font-weight: bold;
}

.special-instructions {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #fff3cd;
  border-radius: 8px;
  border-left: 3px solid #ffc107;
}

.special-instructions strong {
  color: #856404;
}

.special-instructions p {
  margin: 0.5rem 0 0 0;
  color: #333;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.order-total {
  color: #8B4513;
  font-size: 1.2rem;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
}

.quick-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-btn {
  background: #17a2b8;
  color: white;
}

.confirm-btn:hover {
  background: #138496;
}

.prepare-btn {
  background: #fd7e14;
  color: white;
}

.prepare-btn:hover {
  background: #e76a00;
}

.ready-btn {
  background: #28a745;
  color: white;
}

.ready-btn:hover {
  background: #218838;
}

.complete-btn {
  background: #6f42c1;
  color: white;
}

.complete-btn:hover {
  background: #5a32a3;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  border-left: 4px solid #c33;
  text-align: center;
}

.success-message {
  background: #efe;
  color: #363;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  border-left: 4px solid #28a745;
  text-align: center;
}

/* Mobile styles */
@media (max-width: 768px) {
  .preorder-management {
    padding: 1rem;
  }
  
  .orders-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .order-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .order-actions {
    justify-content: space-between;
  }
  
  .customer-details {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
}
</style>
