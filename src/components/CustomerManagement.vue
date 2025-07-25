<template>
  <div class="customer-management">
    <div class="management-header">
      <h2>Customer Management</h2>
      <p>Manage customer accounts, view profiles, and monitor activity</p>
    </div>

    <!-- Customer Stats -->
    <div class="customer-stats">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>{{ totalCustomers }}</h3>
          <p>Total Customers</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h3>{{ activeCustomers }}</h3>
          <p>Active This Month</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <h3>{{ newCustomers }}</h3>
          <p>New This Week</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🛒</div>
        <div class="stat-info">
          <h3>{{ customersWithOrders }}</h3>
          <p>With Orders</p>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="customer-controls">
      <div class="search-section">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search customers by name, email, or phone..." 
            class="search-input"
          >
          <button @click="searchCustomers" class="search-btn">
            🔍 Search
          </button>
        </div>
      </div>
      
      <div class="filter-section">
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="new">New</option>
        </select>
        
        <select v-model="sortBy" class="filter-select">
          <option value="createdAt">Sort by Join Date</option>
          <option value="fullName">Sort by Name</option>
          <option value="lastOrder">Sort by Last Order</option>
          <option value="totalOrders">Sort by Total Orders</option>
        </select>
        
        <button @click="clearFilters" class="clear-btn">Clear Filters</button>
      </div>
    </div>

    <!-- Customer List -->
    <div class="customer-list">
      <div class="list-header">
        <h3>Customer Directory ({{ filteredCustomers.length }})</h3>
        <button @click="exportCustomers" class="export-btn">
          📊 Export Data
        </button>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading customers...</p>
      </div>

      <div v-else-if="filteredCustomers.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>No customers found</h3>
        <p>{{ searchQuery ? 'Try adjusting your search criteria' : 'No customers have registered yet' }}</p>
      </div>

      <div v-else class="customer-table">
        <div class="table-header">
          <div class="header-cell">Customer Info</div>
          <div class="header-cell">Contact</div>
          <div class="header-cell">Activity</div>
          <div class="header-cell">Orders</div>
          <div class="header-cell">Status</div>
          <div class="header-cell">Actions</div>
        </div>

        <div 
          v-for="customer in paginatedCustomers" 
          :key="customer.id" 
          class="table-row"
          :class="{ 'row-selected': selectedCustomer?.id === customer.id }"
        >
          <div class="cell customer-info">
            <div class="customer-avatar">
              <img 
                v-if="customer.photoURL" 
                :src="customer.photoURL" 
                :alt="customer.fullName"
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder">
                {{ getInitials(customer.fullName || 'User') }}
              </div>
            </div>
            <div class="customer-details">
              <h4>{{ customer.fullName || 'Unknown' }}</h4>
              <p class="customer-id">ID: {{ customer.id?.substring(0, 8) }}...</p>
              <p class="join-date">Joined {{ formatDate(customer.createdAt) }}</p>
            </div>
          </div>

          <div class="cell contact-info">
            <p class="email">{{ customer.email }}</p>
            <p class="phone">{{ customer.phoneNumber || 'No phone' }}</p>
          </div>

          <div class="cell activity-info">
            <p class="last-seen">Last seen: {{ formatLastSeen(customer.lastLoginAt) }}</p>
            <p class="login-count">{{ customer.loginCount || 0 }} logins</p>
          </div>

          <div class="cell orders-info">
            <p class="order-count">{{ getCustomerOrderCount(customer.id) }} orders</p>
            <p class="last-order">Last: {{ getLastOrderDate(customer.id) }}</p>
          </div>

          <div class="cell status-info">
            <span 
              class="status-badge" 
              :class="getCustomerStatus(customer)"
            >
              {{ getCustomerStatusText(customer) }}
            </span>
          </div>

          <div class="cell actions">
            <button 
              @click="viewCustomer(customer)" 
              class="action-btn view-btn"
              title="View Details"
            >
              👁️
            </button>
            <button 
              @click="editCustomer(customer)" 
              class="action-btn edit-btn"
              title="Edit Customer"
            >
              ✏️
            </button>
            <button 
              @click="viewCustomerOrders(customer)" 
              class="action-btn orders-btn"
              title="View Orders"
            >
              🛒
            </button>
            <button 
              @click="toggleCustomerStatus(customer)" 
              class="action-btn status-btn"
              :class="customer.isActive ? 'deactivate' : 'activate'"
              :title="customer.isActive ? 'Deactivate' : 'Activate'"
            >
              {{ customer.isActive ? '🚫' : '✅' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          First
        </button>
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          Previous
        </button>
        
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          Next
        </button>
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          Last
        </button>
      </div>
    </div>

    <!-- Customer Details Modal -->
    <div v-if="showCustomerModal" class="modal-overlay" @click.self="closeCustomerModal">
      <div class="modal-content customer-modal">
        <div class="modal-header">
          <h3>Customer Details</h3>
          <button @click="closeCustomerModal" class="close-btn">&times;</button>
        </div>
        
        <div v-if="selectedCustomer" class="customer-details-full">
          <div class="customer-profile">
            <div class="profile-avatar">
              <img 
                v-if="selectedCustomer.photoURL" 
                :src="selectedCustomer.photoURL" 
                :alt="selectedCustomer.fullName"
                class="profile-img"
              />
              <div v-else class="profile-placeholder">
                {{ getInitials(selectedCustomer.fullName || 'User') }}
              </div>
            </div>
            <div class="profile-info">
              <h2>{{ selectedCustomer.fullName || 'Unknown User' }}</h2>
              <p class="customer-status">
                <span 
                  class="status-badge" 
                  :class="getCustomerStatus(selectedCustomer)"
                >
                  {{ getCustomerStatusText(selectedCustomer) }}
                </span>
              </p>
            </div>
          </div>

          <div class="customer-tabs">
            <button 
              @click="activeTab = 'info'" 
              :class="{ active: activeTab === 'info' }"
              class="tab-btn"
            >
              Personal Info
            </button>
            <button 
              @click="activeTab = 'orders'" 
              :class="{ active: activeTab === 'orders' }"
              class="tab-btn"
            >
              Order History
            </button>
            <button 
              @click="activeTab = 'activity'" 
              :class="{ active: activeTab === 'activity' }"
              class="tab-btn"
            >
              Activity Log
            </button>
          </div>

          <div class="tab-content">
            <div v-if="activeTab === 'info'" class="info-tab">
              <div class="info-grid">
                <div class="info-item">
                  <label>Full Name:</label>
                  <span>{{ selectedCustomer.fullName || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <label>Email:</label>
                  <span>{{ selectedCustomer.email }}</span>
                </div>
                <div class="info-item">
                  <label>Phone:</label>
                  <span>{{ selectedCustomer.phoneNumber || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <label>Customer ID:</label>
                  <span>{{ selectedCustomer.id }}</span>
                </div>
                <div class="info-item">
                  <label>Join Date:</label>
                  <span>{{ formatDate(selectedCustomer.createdAt) }}</span>
                </div>
                <div class="info-item">
                  <label>Last Login:</label>
                  <span>{{ formatLastSeen(selectedCustomer.lastLoginAt) }}</span>
                </div>
                <div class="info-item">
                  <label>Total Logins:</label>
                  <span>{{ selectedCustomer.loginCount || 0 }}</span>
                </div>
                <div class="info-item">
                  <label>Account Status:</label>
                  <span>{{ selectedCustomer.isActive ? 'Active' : 'Inactive' }}</span>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'orders'" class="orders-tab">
              <div class="orders-summary">
                <div class="summary-item">
                  <strong>Total Orders:</strong> {{ getCustomerOrderCount(selectedCustomer.id) }}
                </div>
                <div class="summary-item">
                  <strong>Last Order:</strong> {{ getLastOrderDate(selectedCustomer.id) }}
                </div>
              </div>
              <div class="orders-list">
                <p>Order history integration would go here...</p>
              </div>
            </div>

            <div v-if="activeTab === 'activity'" class="activity-tab">
              <div class="activity-list">
                <div class="activity-item">
                  <span class="activity-time">{{ formatDate(selectedCustomer.createdAt) }}</span>
                  <span class="activity-text">Account created</span>
                </div>
                <div v-if="selectedCustomer.lastLoginAt" class="activity-item">
                  <span class="activity-time">{{ formatDate(selectedCustomer.lastLoginAt) }}</span>
                  <span class="activity-text">Last login</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { db } from '../firebase/config'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

// Reactive data
const customers = ref<any[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('createdAt')
const currentPage = ref(1)
const itemsPerPage = 10
const selectedCustomer = ref<any>(null)
const showCustomerModal = ref(false)
const activeTab = ref('info')

// Computed properties
const totalCustomers = computed(() => customers.value.length)
const activeCustomers = computed(() => {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  return customers.value.filter(c => 
    c.lastLoginAt && new Date(c.lastLoginAt.toDate()) > oneMonthAgo
  ).length
})
const newCustomers = computed(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return customers.value.filter(c => 
    c.createdAt && new Date(c.createdAt.toDate()) > oneWeekAgo
  ).length
})
const customersWithOrders = computed(() => {
  // This would need to be calculated based on actual order data
  return Math.floor(customers.value.length * 0.6) // Placeholder
})

const filteredCustomers = computed(() => {
  let result = [...customers.value]
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(customer => 
      (customer.fullName?.toLowerCase().includes(query)) ||
      (customer.email?.toLowerCase().includes(query)) ||
      (customer.phoneNumber?.includes(query))
    )
  }
  
  // Status filter
  if (statusFilter.value) {
    result = result.filter(customer => {
      const status = getCustomerStatus(customer)
      return status === statusFilter.value
    })
  }
  
  // Sort
  result.sort((a, b) => {
    if (sortBy.value === 'fullName') {
      return (a.fullName || '').localeCompare(b.fullName || '')
    } else if (sortBy.value === 'createdAt') {
      return new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime()
    }
    return 0
  })
  
  return result
})

const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / itemsPerPage))

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredCustomers.value.slice(start, end)
})

// Methods
const loadCustomers = async () => {
  try {
    isLoading.value = true
    const customersQuery = query(collection(db, 'customers'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(customersQuery)
    
    customers.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error loading customers:', error)
  } finally {
    isLoading.value = false
  }
}

const searchCustomers = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  sortBy.value = 'createdAt'
  currentPage.value = 1
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'Unknown'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatLastSeen = (timestamp: any) => {
  if (!timestamp) return 'Never'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

const getCustomerStatus = (customer: any) => {
  if (!customer.lastLoginAt) return 'new'
  
  const lastLogin = customer.lastLoginAt.toDate ? customer.lastLoginAt.toDate() : new Date(customer.lastLoginAt)
  const daysSinceLogin = (new Date().getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
  
  if (daysSinceLogin <= 30) return 'active'
  return 'inactive'
}

const getCustomerStatusText = (customer: any) => {
  const status = getCustomerStatus(customer)
  switch (status) {
    case 'active': return 'Active'
    case 'inactive': return 'Inactive'
    case 'new': return 'New'
    default: return 'Unknown'
  }
}

const getCustomerOrderCount = (_customerId: string) => {
  // This would need to query the orders collection based on customerId
  // For now, return a placeholder - will implement actual order counting later
  return Math.floor(Math.random() * 10) // Placeholder
}

const getLastOrderDate = (_customerId: string) => {
  // This would need to query the orders collection based on customerId
  // For now, return a placeholder - will implement actual order date lookup later
  return 'No orders' // Placeholder
}

const viewCustomer = (customer: any) => {
  selectedCustomer.value = customer
  activeTab.value = 'info'
  showCustomerModal.value = true
}

const editCustomer = (customer: any) => {
  // Implement edit functionality
  console.log('Edit customer:', customer)
}

const viewCustomerOrders = (customer: any) => {
  selectedCustomer.value = customer
  activeTab.value = 'orders'
  showCustomerModal.value = true
}

const toggleCustomerStatus = async (customer: any) => {
  // Implement status toggle
  console.log('Toggle status for:', customer)
}

const closeCustomerModal = () => {
  showCustomerModal.value = false
  selectedCustomer.value = null
}

const exportCustomers = () => {
  // Implement export functionality
  console.log('Export customers')
}

// Lifecycle
onMounted(() => {
  loadCustomers()
})
</script>

<style scoped>
.customer-management {
  padding: 2rem;
  max-width: 100%;
  width: 100%;
}

.management-header {
  text-align: center;
  margin-bottom: 2rem;
}

.management-header h2 {
  margin: 0 0 0.5rem 0;
  color: #8B4513;
  font-size: 2.5rem;
}

.management-header p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

/* Customer Stats */
.customer-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid #8B4513;
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #8B4513, #A0522D);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 2rem;
  color: #333;
}

.stat-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* Search and Controls */
.customer-controls {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.search-section {
  margin-bottom: 1rem;
}

.search-box {
  display: flex;
  gap: 1rem;
  max-width: 600px;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #8B4513;
}

.search-btn {
  background: #8B4513;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.search-btn:hover {
  background: #654321;
}

.filter-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  padding: 0.5rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
}

.clear-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.clear-btn:hover {
  background: #545b62;
}

/* Customer List */
.customer-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
}

.list-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h3 {
  margin: 0;
  color: #333;
}

.export-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.export-btn:hover {
  background: #138496;
}

/* Loading and Empty States */
.loading-state,
.empty-state {
  padding: 3rem;
  text-align: center;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Customer Table */
.customer-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr 1fr;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.header-cell {
  padding: 1rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr 1fr;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
}

.table-row:hover {
  background: #f8f9fa;
}

.row-selected {
  background: rgba(139, 69, 19, 0.05) !important;
}

.cell {
  padding: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.customer-info {
  flex-direction: row;
  gap: 1rem;
}

.customer-avatar {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B4513, #A0522D);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1rem;
}

.customer-details h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1rem;
}

.customer-details p {
  margin: 0;
  color: #666;
  font-size: 0.8rem;
}

.contact-info,
.activity-info,
.orders-info {
  flex-direction: column;
  align-items: flex-start;
}

.contact-info p,
.activity-info p,
.orders-info p {
  margin: 0.125rem 0;
  color: #666;
  font-size: 0.85rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.active {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status-badge.inactive {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.status-badge.new {
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
}

.actions {
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn {
  background: rgba(23, 162, 184, 0.1);
  color: #17a2b8;
}

.view-btn:hover {
  background: #17a2b8;
  color: white;
}

.edit-btn {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.edit-btn:hover {
  background: #ffc107;
  color: #333;
}

.orders-btn {
  background: rgba(139, 69, 19, 0.1);
  color: #8B4513;
}

.orders-btn:hover {
  background: #8B4513;
  color: white;
}

.status-btn.activate {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status-btn.activate:hover {
  background: #28a745;
  color: white;
}

.status-btn.deactivate {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.status-btn.deactivate:hover {
  background: #dc3545;
  color: white;
}

/* Pagination */
.pagination {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  border-top: 1px solid #e9ecef;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e9ecef;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #8B4513;
  color: white;
  border-color: #8B4513;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 500;
  color: #333;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 15px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.customer-modal {
  padding: 0;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-radius: 15px 15px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #8B4513;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #333;
}

.customer-details-full {
  padding: 1.5rem;
}

.customer-profile {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.profile-avatar {
  width: 80px;
  height: 80px;
}

.profile-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.profile-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B4513, #A0522D);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
}

.profile-info h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.customer-tabs {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 1.5rem;
}

.tab-btn {
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tab-btn:hover {
  background: #f8f9fa;
}

.tab-btn.active {
  color: #8B4513;
  border-bottom-color: #8B4513;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 600;
  color: #8B4513;
  font-size: 0.9rem;
}

.info-item span {
  color: #333;
}

.orders-summary {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-time {
  font-weight: 500;
  color: #8B4513;
}

/* Responsive Design */
@media (max-width: 768px) {
  .customer-management {
    padding: 1rem;
  }

  .customer-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .search-box {
    flex-direction: column;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .table-header {
    display: none;
  }

  .cell {
    padding: 0.5rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .customer-info {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.5rem;
  }

  .actions {
    justify-content: center;
    padding: 1rem;
  }

  .customer-profile {
    flex-direction: column;
    text-align: center;
  }

  .customer-tabs {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .customer-stats {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .actions {
    flex-wrap: wrap;
  }
}

/* Custom Coffee-Themed Scrollbars */
.customer-management {
  max-height: 85vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #8B4513 #f8f9fa;
}

.customer-management::-webkit-scrollbar {
  width: 12px;
}

.customer-management::-webkit-scrollbar-track {
  background: linear-gradient(to bottom, rgba(139, 69, 19, 0.1), rgba(160, 82, 45, 0.1));
  border-radius: 10px;
  border: 1px solid rgba(139, 69, 19, 0.2);
}

.customer-management::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #8B4513, #A0522D);
  border-radius: 10px;
  border: 1px solid #654321;
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
  min-height: 20px;
}

.customer-management::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #A0522D, #8B4513);
  box-shadow: 0 0 10px rgba(139, 69, 19, 0.5);
  transform: scaleY(1.05);
}

.customer-table {
  max-height: 60vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #8B4513 #f8f9fa;
}

.customer-table::-webkit-scrollbar {
  width: 8px;
}

.customer-table::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 6px;
}

.customer-table::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #8B4513, #A0522D);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.customer-table::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #654321, #8B4513);
  box-shadow: 0 2px 6px rgba(139, 69, 19, 0.3);
}

.modal-content {
  scrollbar-width: thin;
  scrollbar-color: #8B4513 #f8f9fa;
}

.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 6px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #8B4513, #A0522D);
  border-radius: 6px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #654321, #8B4513);
}
</style>
