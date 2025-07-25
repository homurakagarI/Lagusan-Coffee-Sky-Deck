<template>
  <div class="preorder-history">
    <div class="history-header">
      <h3>Your Pre-Orders</h3>
      <button @click="refreshOrders" class="refresh-btn" :disabled="isLoading">
        {{ isLoading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>
    
    <div v-if="isLoading && orders.length === 0" class="loading">
      Loading your orders...
    </div>
    
    <div v-else-if="orders.length === 0" class="no-orders">
      <div class="no-orders-icon">🛍️</div>
      <h4>No pre-orders yet</h4>
      <p>Your pre-orders will appear here once you place them.</p>
      <button @click="$emit('newOrder')" class="new-order-btn">
        Place Your First Pre-Order
      </button>
    </div>
    
    <div v-else class="orders-list">
      <div 
        v-for="order in orders" 
        :key="order.id" 
        class="order-card"
        :class="getStatusClass(order.status)"
      >
        <div class="order-header">
          <div class="order-info">
            <h4>Order #{{ order.orderNumber }}</h4>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="order-status">
            <span :class="`status-badge status-${order.status}`">
              {{ getStatusText(order.status) }}
            </span>
          </div>
        </div>
        
        <div class="pickup-info">
          <div class="pickup-details">
            <span class="pickup-label">Pickup:</span>
            <span class="pickup-datetime">
              {{ formatPickupDate(order.pickupDate) }} at {{ order.pickupTime }}
            </span>
          </div>
        </div>
        
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-quantity">x{{ item.quantity }}</span>
            <span class="item-price">₱{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
        
        <div v-if="order.specialInstructions" class="special-instructions">
          <strong>Special Instructions:</strong>
          <p>{{ order.specialInstructions }}</p>
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            <strong>Total: ₱{{ order.totalAmount.toFixed(2) }}</strong>
          </div>
          <div class="order-actions">
            <button 
              v-if="order.status === 'pending' && canCancelOrder(order)"
              @click="cancelOrder(order.id)"
              class="cancel-btn"
              :disabled="isCancelling"
            >
              {{ isCancelling ? 'Cancelling...' : 'Cancel Order' }}
            </button>
            <button 
              v-if="order.status === 'completed'"
              @click="reorderItems(order)"
              class="reorder-btn"
            >
              Reorder
            </button>
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
import { ref, onMounted } from 'vue'
import { useCustomerAuth } from '../stores/customer-auth'
import { getCustomerPreOrders, cancelPreOrder } from '../firebase/services'

// Props
defineProps<{
  dashboardMode?: boolean
}>()

const emit = defineEmits(['newOrder', 'reorder'])

const { customerAuthState } = useCustomerAuth()

const orders = ref<any[]>([])
const isLoading = ref(false)
const isCancelling = ref(false)
const error = ref('')
const success = ref('')

const loadOrders = async () => {
  if (!customerAuthState.user) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const result = await getCustomerPreOrders(customerAuthState.user.uid)
    if (result.success) {
      orders.value = result.orders || []
    } else {
      error.value = 'Failed to load your orders'
    }
  } catch (err) {
    error.value = 'Error loading orders'
  } finally {
    isLoading.value = false
  }
}

const refreshOrders = () => {
  loadOrders()
}

const cancelOrder = async (orderId: string) => {
  isCancelling.value = true
  error.value = ''
  success.value = ''
  
  try {
    const result = await cancelPreOrder(orderId)
    if (result.success) {
      success.value = 'Order cancelled successfully'
      // Update the order status locally
      const orderIndex = orders.value.findIndex(o => o.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = 'cancelled'
      }
      setTimeout(() => {
        success.value = ''
      }, 3000)
    } else {
      error.value = 'Failed to cancel order'
    }
  } catch (err) {
    error.value = 'Error cancelling order'
  } finally {
    isCancelling.value = false
  }
}

const reorderItems = (order: any) => {
  emit('reorder', order.items)
}

const canCancelOrder = (order: any) => {
  // Can cancel if pickup is more than 2 hours away
  const pickupDateTime = new Date(`${order.pickupDate}T${order.pickupTime}`)
  const now = new Date()
  const timeDiff = pickupDateTime.getTime() - now.getTime()
  const hoursDiff = timeDiff / (1000 * 60 * 60)
  
  return hoursDiff > 2
}

const getStatusClass = (status: string) => {
  return `order-${status}`
}

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready for Pickup',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return statusMap[status] || status
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
.preorder-history {
  max-height: 500px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.history-header h3 {
  color: #8B4513;
  margin: 0;
}

.refresh-btn {
  background: #6f42c1;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #5a32a3;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  color: #666;
  padding: 2rem;
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

.no-orders p {
  margin-bottom: 2rem;
}

.new-order-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.new-order-btn:hover {
  background: #218838;
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
  font-size: 1.1rem;
}

.order-date {
  color: #666;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-confirmed {
  background: #d1ecf1;
  color: #0c5460;
}

.status-preparing {
  background: #ffeaa7;
  color: #d68910;
}

.status-ready {
  background: #d4edda;
  color: #155724;
}

.status-completed {
  background: #e2e3f3;
  color: #4c4c95;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.pickup-info {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.pickup-label {
  font-weight: bold;
  color: #8B4513;
}

.pickup-datetime {
  color: #333;
}

.order-items {
  margin-bottom: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
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
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #17a2b8;
}

.special-instructions strong {
  color: #8B4513;
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
  font-size: 1.1rem;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
}

.cancel-btn,
.reorder-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #dc3545;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background: #c82333;
}

.cancel-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.reorder-btn {
  background: #28a745;
  color: white;
}

.reorder-btn:hover {
  background: #218838;
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
  .order-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .order-actions {
    justify-content: space-between;
  }
  
  .order-item {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
</style>
