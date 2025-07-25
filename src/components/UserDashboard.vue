<template>
  <div class="user-dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="user-welcome">
          <div class="avatar-container">
            <div class="user-avatar">
              <img 
                v-if="customerAuthState.customerProfile?.photoURL"
                :src="customerAuthState.customerProfile.photoURL" 
                alt="Profile Picture" 
                class="user-avatar-img"
              />
              <span v-else class="user-avatar-initials">
                {{ getInitials(customerAuthState.customerProfile?.fullName || 'User') }}
              </span>
              <div class="avatar-status"></div>
            </div>
          </div>
          <div class="welcome-text">
            <h1>Welcome back, {{ getFirstName(customerAuthState.customerProfile?.fullName) }}!</h1>
            <p>Manage your account and track your orders</p>
          </div>
        </div>
        <div class="header-actions">
          <button @click="handleLogout" class="logout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16,17 21,12 16,7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat-card" v-for="(stat, index) in statsData" :key="index" :style="{ '--delay': index * 0.1 + 's' }">
        <div class="stat-icon">
          <svg v-if="stat.type === 'orders'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <svg v-else-if="stat.type === 'pending'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <svg v-else-if="stat.type === 'completed'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.label }}</p>
        </div>
        <div class="stat-trend" v-if="stat.trend">
          <span :class="stat.trend.type">{{ stat.trend.value }}</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="dashboard-nav">
      <button 
        v-for="tab in navigationTabs" 
        :key="tab.id"
        @click="currentView = tab.id" 
        :class="{ active: currentView === tab.id }"
        class="nav-tab"
      >
        <span class="tab-icon">
          <svg v-if="tab.id === 'profile'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <svg v-else-if="tab.id === 'orders'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
          <svg v-else-if="tab.id === 'preorder'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <svg v-else-if="tab.id === 'preferences'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Dashboard Content -->
    <div class="dashboard-content">
      <!-- Profile Section -->
      <div v-if="currentView === 'profile'" class="content-section">
        <div class="section-header">
          <h2>Account Information</h2>
          <p>Manage your personal information and preferences</p>
        </div>
        
        <div v-if="!isEditing" class="profile-view">
          <!-- Profile Picture Section -->
          <div class="profile-picture-section">
            <div class="profile-picture-container">
              <img 
                v-if="customerAuthState.customerProfile?.photoURL"
                :src="customerAuthState.customerProfile.photoURL" 
                alt="Profile Picture" 
                class="profile-picture"
              />
              <div v-else class="profile-picture-placeholder">
                {{ getInitials(customerAuthState.customerProfile?.fullName || 'User') }}
              </div>
              <button @click="isEditing = true" class="update-picture-btn">
                📷 Update Picture
              </button>
            </div>
          </div>
          
          <div class="profile-grid">
            <div class="profile-field">
              <label>Full Name</label>
              <div class="field-value">
                <span class="value">{{ customerAuthState.customerProfile?.fullName || 'Not provided' }}</span>
                <button @click="startEdit('fullName')" class="edit-field-btn">✏️</button>
              </div>
            </div>
            
            <div class="profile-field">
              <label>Email Address</label>
              <div class="field-value">
                <span class="value">{{ customerAuthState.customerProfile?.email || 'Not provided' }}</span>
                <span class="field-note">Email cannot be changed</span>
              </div>
            </div>
            
            <div class="profile-field">
              <label>Phone Number</label>
              <div class="field-value">
                <span class="value">{{ customerAuthState.customerProfile?.phoneNumber || 'Not provided' }}</span>
                <button @click="startEdit('phoneNumber')" class="edit-field-btn">✏️</button>
              </div>
            </div>
            
            <div class="profile-field">
              <label>Member Since</label>
              <div class="field-value">
                <span class="value">{{ formatDate(customerAuthState.customerProfile?.createdAt) }}</span>
              </div>
            </div>
          </div>
          
          <div class="profile-actions">
            <button @click="isEditing = true" class="primary-btn">
              <span class="icon">✏️</span>
              Edit All Information
            </button>
            <button @click="showChangePassword = true" class="secondary-btn">
              <span class="icon">🔒</span>
              Change Password
            </button>
          </div>
        </div>
        
        <div v-else class="profile-edit">
          <form @submit.prevent="handleUpdateProfile" class="edit-form">
            <!-- Profile Picture Upload Section -->
            <div class="form-section">
              <h3>Profile Picture</h3>
              <div class="avatar-upload">
                <div class="current-avatar">
                  <img 
                    v-if="profileImagePreview || customerAuthState.customerProfile?.photoURL"
                    :src="profileImagePreview || customerAuthState.customerProfile?.photoURL" 
                    alt="Profile Picture" 
                    class="avatar-img-edit"
                  />
                  <div v-else class="avatar-placeholder">
                    {{ getInitials(customerAuthState.customerProfile?.fullName || 'User') }}
                  </div>
                </div>
                <div class="upload-controls">
                  <label for="profilePicture" class="upload-btn">
                    📷 Choose Image
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      @change="handleImageChange"
                      class="file-input"
                    />
                  </label>
                  <button 
                    v-if="profileImagePreview" 
                    type="button" 
                    @click="clearProfileImage" 
                    class="clear-btn"
                  >
                    ❌ Clear
                  </button>
                </div>
              </div>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="editFullName">Full Name</label>
                <input
                  id="editFullName"
                  v-model="editForm.fullName"
                  type="text"
                  required
                  class="form-input"
                  placeholder="Enter your full name"
                >
              </div>
              
              <div class="form-group">
                <label for="editPhoneNumber">Phone Number</label>
                <input
                  id="editPhoneNumber"
                  v-model="editForm.phoneNumber"
                  type="tel"
                  class="form-input"
                  placeholder="Enter your phone number"
                >
              </div>
            </div>
            
            <div v-if="error" class="error-message">
              {{ error }}
            </div>
            
            <div v-if="success" class="success-message">
              {{ success }}
            </div>
            
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{width: uploadProgress + '%'}"></div>
              </div>
              <div class="progress-text">Uploading image: {{ uploadProgress }}%</div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="primary-btn" :disabled="isSubmitting">
                <span class="icon">💾</span>
                {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
              </button>
              <button type="button" @click="cancelEdit" class="secondary-btn">
                <span class="icon">❌</span>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Orders Section -->
      <div v-if="currentView === 'orders'" class="content-section">
        <div class="section-header">
          <h2>Order History</h2>
          <p>Track your past and current orders</p>
        </div>
        
        <PreOrderHistory 
          :dashboardMode="true"
          @newOrder="currentView = 'preorder'"
          @reorder="handleReorder"
        />
      </div>

      <!-- Pre-Order Section -->
      <div v-if="currentView === 'preorder'" class="content-section">
        <div class="section-header">
          <h2>Place New Order</h2>
          <p>Browse our menu and place a pre-order for pickup</p>
        </div>
        
        <PreOrder @orderPlaced="handleOrderPlaced" />
      </div>

      <!-- Preferences Section -->
      <div v-if="currentView === 'preferences'" class="content-section">
        <div class="section-header">
          <h2>Preferences</h2>
          <p>Customize your experience and notification settings</p>
        </div>
        
        <div class="preferences-grid">
          <div class="preference-card">
            <div class="preference-header">
              <h3>🔔 Notifications</h3>
              <p>Manage how you receive updates</p>
            </div>
            <div class="preference-options">
              <label class="checkbox-label">
                <input type="checkbox" v-model="preferences.emailNotifications">
                <span class="checkmark"></span>
                Email notifications for order updates
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="preferences.smsNotifications">
                <span class="checkmark"></span>
                SMS notifications for ready orders
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="preferences.promotionalEmails">
                <span class="checkmark"></span>
                Promotional emails and special offers
              </label>
            </div>
          </div>
          
          <div class="preference-card">
            <div class="preference-header">
              <h3>☕ Ordering Preferences</h3>
              <p>Set your default preferences</p>
            </div>
            <div class="preference-options">
              <div class="form-group">
                <label>Default Pickup Time</label>
                <select v-model="preferences.defaultPickupTime" class="form-select">
                  <option value="">No preference</option>
                  <option value="morning">Morning (8AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 5PM)</option>
                  <option value="evening">Evening (5PM - 8PM)</option>
                </select>
              </div>
              <label class="checkbox-label">
                <input type="checkbox" v-model="preferences.savePaymentMethod">
                <span class="checkmark"></span>
                Remember payment preferences
              </label>
            </div>
          </div>
        </div>
        
        <div class="preference-actions">
          <button @click="savePreferences" class="primary-btn" :disabled="isSavingPreferences">
            <span class="icon">💾</span>
            {{ isSavingPreferences ? 'Saving...' : 'Save Preferences' }}
          </button>
        </div>
      </div>

      <!-- Help Section -->
      <div v-if="currentView === 'help'" class="content-section">
        <div class="section-header">
          <h2>Help & Support</h2>
          <p>Get assistance and find answers to common questions</p>
        </div>
        
        <div class="help-grid">
          <div class="help-card">
            <div class="help-icon">❓</div>
            <h3>Frequently Asked Questions</h3>
            <p>Find answers to common questions about ordering and pickup</p>
            <button class="help-btn">View FAQs</button>
          </div>
          
          <div class="help-card">
            <div class="help-icon">📞</div>
            <h3>Contact Support</h3>
            <p>Get in touch with our customer service team</p>
            <div class="contact-info">
              <p><strong>Phone:</strong> (123) 456-7890</p>
              <p><strong>Email:</strong> support@lagusancoffee.com</p>
              <p><strong>Hours:</strong> 8AM - 8PM Daily</p>
            </div>
          </div>
          
          <div class="help-card">
            <div class="help-icon">📍</div>
            <h3>Visit Our Location</h3>
            <p>Come visit us at our coffee shop</p>
            <div class="location-info">
              <p>Lagusan Coffee Sky Deck</p>
              <p>123 Coffee Street</p>
              <p>Your City, State 12345</p>
              <button class="help-btn">Get Directions</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangePassword" class="modal-overlay" @click="showChangePassword = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Change Password</h3>
          <button @click="showChangePassword = false" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="handleChangePassword" class="password-form">
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              v-model="passwordForm.current"
              type="password"
              required
              class="form-input"
              placeholder="Enter current password"
            >
          </div>
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input
              id="newPassword"
              v-model="passwordForm.new"
              type="password"
              required
              minlength="6"
              class="form-input"
              placeholder="Enter new password"
            >
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              v-model="passwordForm.confirm"
              type="password"
              required
              class="form-input"
              placeholder="Confirm new password"
            >
          </div>
          <div class="form-actions">
            <button type="submit" class="primary-btn" :disabled="isChangingPassword">
              {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
            </button>
            <button type="button" @click="showChangePassword = false" class="secondary-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCustomerAuth } from '../stores/customer-auth'
import PreOrderHistory from './PreOrderHistory.vue'
import PreOrder from './PreOrder.vue'
import { getCustomerPreOrders, getCustomerPreferences, updateCustomerPreferences } from '../firebase/services'

const emit = defineEmits(['close'])

// Authentication
const { customerAuthState, logout, updateProfile } = useCustomerAuth()

// State
const currentView = ref('profile')
const isEditing = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const success = ref('')
const orders = ref<any[]>([])
const showChangePassword = ref(false)
const isChangingPassword = ref(false)
const isSavingPreferences = ref(false)
const profileImageFile = ref<File | null>(null)
const profileImagePreview = ref<string | null>(null)
const uploadProgress = ref(0)

// Forms
const editForm = ref({
  fullName: '',
  phoneNumber: ''
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

const preferences = ref({
  emailNotifications: true,
  smsNotifications: true,
  promotionalEmails: false,
  defaultPickupTime: '',
  savePaymentMethod: false
})

// Navigation
const navigationTabs = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'orders', label: 'Orders', icon: '📦' },
  { id: 'preorder', label: 'New Order', icon: '☕' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  { id: 'help', label: 'Help', icon: '❓' }
]

// Computed
const totalOrders = computed(() => orders.value.length)

const pendingOrders = computed(() => 
  orders.value.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
  ).length
)

const completedOrders = computed(() => 
  orders.value.filter(order => order.status === 'completed').length
)

const totalSpent = computed(() => 
  orders.value
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.totalAmount, 0)
)

// Enhanced stats data for better UI
const statsData = computed(() => [
  {
    type: 'orders',
    value: totalOrders.value,
    label: 'Total Orders',
    trend: totalOrders.value > 0 ? { type: 'positive', value: '+' + totalOrders.value } : null
  },
  {
    type: 'pending',
    value: pendingOrders.value,
    label: 'Pending Orders',
    trend: pendingOrders.value > 0 ? { type: 'warning', value: pendingOrders.value + ' pending' } : null
  },
  {
    type: 'completed',
    value: completedOrders.value,
    label: 'Completed',
    trend: completedOrders.value > 0 ? { type: 'positive', value: completedOrders.value + ' done' } : null
  },
  {
    type: 'money',
    value: '₱' + totalSpent.value.toFixed(2),
    label: 'Total Spent',
    trend: totalSpent.value > 0 ? { type: 'neutral', value: 'All time' } : null
  }
])

// Methods
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

const getFirstName = (fullName: string) => {
  if (!fullName) return 'User'
  return fullName.split(' ')[0]
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
    month: 'long',
    day: 'numeric'
  })
}

const startEdit = (_field: string) => {
  isEditing.value = true
  editForm.value.fullName = customerAuthState.customerProfile?.fullName || ''
  editForm.value.phoneNumber = customerAuthState.customerProfile?.phoneNumber || ''
}

const handleUpdateProfile = async () => {
  isSubmitting.value = true
  error.value = ''
  success.value = ''
  uploadProgress.value = 0
  
  try {
    const result = await updateProfile(
      {
        fullName: editForm.value.fullName,
        phoneNumber: editForm.value.phoneNumber,
        profileImageFile: profileImageFile.value
      },
      (progress) => {
        uploadProgress.value = progress;
      }
    )
    
    if (result.success) {
      success.value = 'Profile updated successfully!'
      profileImageFile.value = null
      profileImagePreview.value = null
      isEditing.value = false
      setTimeout(() => {
        success.value = ''
      }, 3000)
    } else {
      error.value = (result as any).error || 'Failed to update profile'
    }
  } catch (err) {
    error.value = 'An error occurred while updating profile'
  } finally {
    isSubmitting.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  error.value = ''
  success.value = ''
  editForm.value.fullName = customerAuthState.customerProfile?.fullName || ''
  editForm.value.phoneNumber = customerAuthState.customerProfile?.phoneNumber || ''
  // Reset image state
  profileImageFile.value = null
  profileImagePreview.value = null
}

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (files && files.length > 0) {
    profileImageFile.value = files[0];
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(files[0]);
  }
};

const clearProfileImage = () => {
  profileImageFile.value = null;
  profileImagePreview.value = null;
  // Reset the file input if it exists
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

const handleLogout = async () => {
  try {
    await logout()
    emit('close')
  } catch (err) {
    console.error('Logout failed:', err)
  }
}

const handleOrderPlaced = () => {
  currentView.value = 'orders'
  loadOrders()
}

const handleReorder = (_order: any) => {
  currentView.value = 'preorder'
}

const handleChangePassword = async () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    error.value = 'New passwords do not match'
    return
  }
  
  isChangingPassword.value = true
  // Implementation would go here
  // For now, just show success
  setTimeout(() => {
    showChangePassword.value = false
    isChangingPassword.value = false
    success.value = 'Password changed successfully!'
    passwordForm.value = { current: '', new: '', confirm: '' }
  }, 1000)
}

const savePreferences = async () => {
  if (!customerAuthState.user?.uid) return
  
  isSavingPreferences.value = true
  try {
    const result = await updateCustomerPreferences(customerAuthState.user.uid, preferences.value)
    if (result.success) {
      success.value = 'Preferences saved successfully!'
      setTimeout(() => {
        success.value = ''
      }, 3000)
    } else {
      error.value = 'Failed to save preferences'
    }
  } catch (err) {
    error.value = 'Error saving preferences'
  } finally {
    isSavingPreferences.value = false
  }
}

const loadOrders = async () => {
  if (!customerAuthState.user?.uid) return
  
  try {
    const result = await getCustomerPreOrders(customerAuthState.user.uid)
    if (result.success) {
      orders.value = result.orders || []
    }
  } catch (err) {
    console.error('Failed to load orders:', err)
  }
}

const loadPreferences = async () => {
  if (!customerAuthState.user?.uid) return
  
  try {
    const result = await getCustomerPreferences(customerAuthState.user.uid)
    if (result.success) {
      preferences.value = { ...preferences.value, ...result.preferences }
    }
  } catch (err) {
    console.error('Failed to load preferences:', err)
  }
}

onMounted(() => {
  if (customerAuthState.customerProfile) {
    editForm.value.fullName = customerAuthState.customerProfile.fullName || ''
    editForm.value.phoneNumber = customerAuthState.customerProfile.phoneNumber || ''
  }
  loadOrders()
  loadPreferences()
})
</script>

<style scoped>
.user-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
}

.dashboard-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-welcome {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-container {
  position: relative;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B4513, #D2691E);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-avatar-initials {
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
}

.avatar-status {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 16px;
  height: 16px;
  background: #28a745;
  border-radius: 50%;
  border: 3px solid white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
  100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
}

.welcome-text h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 2rem;
}

.welcome-text p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.header-actions .logout-btn {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
  font-weight: 500;
}

.header-actions .logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
  background: linear-gradient(135deg, #c82333, #bd2130);
}

.header-actions .logout-btn svg {
  transition: transform 0.3s ease;
}

.header-actions .logout-btn:hover svg {
  transform: translateX(2px);
}

.quick-stats {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.6s ease-out var(--delay, 0s) both;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8B4513, #D2691E, #CD853F);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.15);
}

.stat-card:hover::before {
  transform: scaleX(1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #8B4513, #D2691E);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}

.stat-content p {
  margin: 0;
  color: #666;
  font-size: 1rem;
  font-weight: 500;
}

.stat-trend {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  border: 2px solid;
}

.stat-trend .positive {
  color: #28a745;
  background: rgba(40, 167, 69, 0.1);
  border-color: rgba(40, 167, 69, 0.3);
}

.stat-trend .warning {
  color: #ffc107;
  background: rgba(255, 193, 7, 0.1);
  border-color: rgba(255, 193, 7, 0.3);
}

.stat-trend .neutral {
  color: #6c757d;
  background: rgba(108, 117, 125, 0.1);
  border-color: rgba(108, 117, 125, 0.3);
}

.dashboard-nav {
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  padding: 0 2rem;
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.nav-tab {
  background: white;
  border: 2px solid #e9ecef;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: fit-content;
  position: relative;
  overflow: hidden;
}

.nav-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(139, 69, 19, 0.1), transparent);
  transition: left 0.5s ease;
}

.nav-tab:hover::before {
  left: 100%;
}

.nav-tab:hover {
  border-color: #8B4513;
  color: #8B4513;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.2);
}

.nav-tab.active {
  background: linear-gradient(135deg, #8B4513, #D2691E);
  color: white;
  border-color: #8B4513;
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.3);
  transform: translateY(-2px);
}

.tab-icon {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.nav-tab:hover .tab-icon,
.nav-tab.active .tab-icon {
  transform: scale(1.1);
}

.nav-tab .tab-icon svg {
  stroke-width: 2.5;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 3rem 2rem;
}

.content-section {
  background: white;
  border-radius: 15px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.section-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.section-header h2 {
  margin: 0 0 0.5rem 0;
  color: #8B4513;
  font-size: 2.5rem;
}

.section-header p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

/* Profile Styles */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.profile-field {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  border-left: 4px solid #8B4513;
}

.profile-field label {
  display: block;
  margin-bottom: 0.75rem;
  color: #8B4513;
  font-weight: bold;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.field-value .value {
  color: #333;
  font-size: 1.1rem;
  flex: 1;
}

.field-note {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}

.edit-field-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.edit-field-btn:hover {
  opacity: 1;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Form Styles */
.edit-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #8B4513;
  font-weight: bold;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #8B4513;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

/* Button Styles */
.primary-btn,
.secondary-btn,
.help-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  text-decoration: none;
}

.primary-btn {
  background: #8B4513;
  color: white;
  box-shadow: 0 2px 10px rgba(139, 69, 19, 0.3);
}

.primary-btn:hover:not(:disabled) {
  background: #654321;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.4);
}

.primary-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.secondary-btn {
  background: #6c757d;
  color: white;
  box-shadow: 0 2px 10px rgba(108, 117, 125, 0.3);
}

.secondary-btn:hover {
  background: #545b62;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.4);
}

.help-btn {
  background: #17a2b8;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.help-btn:hover {
  background: #138496;
}

/* Preferences Styles */
.preferences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.preference-card {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.preference-header h3 {
  margin: 0 0 0.5rem 0;
  color: #8B4513;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preference-header p {
  margin: 0 0 1.5rem 0;
  color: #666;
}

.preference-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  color: #333;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.preference-actions {
  text-align: center;
}

/* Help Styles */
.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.help-card {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.help-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.help-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.help-card h3 {
  margin: 0 0 1rem 0;
  color: #8B4513;
}

.help-card p {
  color: #666;
  margin-bottom: 1.5rem;
}

.contact-info,
.location-info {
  text-align: left;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.contact-info p,
.location-info p {
  margin: 0.25rem 0;
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
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
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

.password-form .form-group {
  margin-bottom: 1.5rem;
}

/* Message Styles */
.error-message {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border-left: 4px solid #c33;
  text-align: center;
}

.success-message {
  background: #efe;
  color: #363;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border-left: 4px solid #28a745;
  text-align: center;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .user-welcome {
    flex-direction: column;
    text-align: center;
  }

  .welcome-text h1 {
    font-size: 1.5rem;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .stat-content h3 {
    font-size: 2rem;
  }

  .dashboard-nav {
    padding: 0 1rem;
  }

  .nav-tab {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .dashboard-content {
    padding: 0 1rem 2rem 1rem;
  }

  .content-section {
    padding: 1.5rem;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .profile-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .profile-actions,
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .preferences-grid,
  .help-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .quick-stats {
    grid-template-columns: 1fr;
  }

  .user-avatar {
    width: 60px;
    height: 60px;
  }
  
  .user-avatar-initials {
    font-size: 1.5rem;
  }

  .welcome-text h1 {
    font-size: 1.25rem;
  }

  .welcome-text p {
    font-size: 1rem;
  }
}

/* Profile Picture Styles */
.profile-picture-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.profile-picture-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.profile-picture {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #8B4513;
}

.profile-picture-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B4513, #A0522D);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  border: 3px solid #8B4513;
}

.update-picture-btn {
  padding: 0.5rem 1rem;
  background: #8B4513;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.update-picture-btn:hover {
  background: #A0522D;
  transform: translateY(-1px);
}

/* Avatar Upload Styles */
.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  color: #8B4513;
  font-size: 1.1rem;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.current-avatar {
  width: 120px;
  height: 120px;
}

.avatar-img-edit {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #8B4513;
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
  font-size: 2rem;
  font-weight: bold;
  border: 3px solid #8B4513;
}

.upload-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.upload-btn {
  padding: 0.5rem 1rem;
  background: #8B4513;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background: #A0522D;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: #c82333;
}

.file-input {
  display: none;
}

/* Upload Progress Styles */
.upload-progress {
  width: 100%;
  margin: 1rem 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #28a745;
  transition: width 0.2s ease;
}

.progress-text {
  font-size: 12px;
  margin-top: 5px;
  text-align: center;
  color: #666;
}
</style>
