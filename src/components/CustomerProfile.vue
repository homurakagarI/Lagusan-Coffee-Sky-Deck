<template>
  <div>
    <!-- DEBUG: showPreOrderModal is {{ showPreOrderModal }} -->
    <PreOrder 
      v-if="showPreOrderModal && !minimizedPreOrder"
      :key="preOrderModalKey"
      @close="closePreOrderModal"
      @success="onPreOrderSuccess"
      @minimize="minimizePreOrderModal"
    />
    <div v-if="minimizedPreOrder" class="preorder-minimized-bar" @click="restorePreOrderModal">
      <span>Pre-Order (minimized)</span>
      <button @click.stop="restorePreOrderModal">Restore</button>
      <button @click.stop="closePreOrderModal">Close</button>
    </div>
    <template v-else>
      <div class="profile-overlay" @click.self="closeModal">
        <div class="profile-modal" @click.stop>
          <div class="profile-header">
            <h2>Customer Profile</h2>
            <button class="close-btn" @click="handleCloseClick" type="button">&times;</button>
          </div>
          <div v-if="customerAuthState.customerProfile" class="profile-content">
            <div v-if="currentView === 'profile'" class="profile-section">
              <div v-if="!isEditing" class="profile-view">
                <div class="profile-avatar">
                  <img 
                    :src="customerAuthState.customerProfile.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
                    alt="Profile Picture" 
                    class="avatar-img"
                  />
                  <button @click="isEditing = true" class="edit-avatar-btn">
                    <span>Update</span>
                  </button>
                </div>
                <div class="profile-field">
                  <label>Full Name:</label>
                  <span>{{ customerAuthState.customerProfile.fullName }}</span>
                </div>
                <div class="profile-field">
                  <label>Email:</label>
                  <span>{{ customerAuthState.customerProfile.email }}</span>
                </div>
                <div class="profile-field">
                  <label>Phone Number:</label>
                  <span>{{ customerAuthState.customerProfile.phoneNumber || 'Not provided' }}</span>
                </div>
                <div class="profile-field">
                  <label>Member Since:</label>
                  <span>{{ formatDate(customerAuthState.customerProfile.createdAt) }}</span>
                </div>
                <div class="profile-actions">
                  <button @click="isEditing = true" class="edit-btn">
                    Edit Profile
                  </button>
                  <button @click="handleLogout" class="logout-btn">
                    Logout
                  </button>
                </div>
              </div>
              <div v-else class="profile-edit">
                <form @submit.prevent="handleUpdateProfile" class="edit-form">
                  <div class="avatar-upload">
                    <div class="current-avatar">
                      <img 
                        :src="profileImagePreview || customerAuthState.customerProfile.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
                        alt="Profile Picture" 
                        class="avatar-img-edit"
                      />
                    </div>
                    <div class="upload-controls">
                      <label for="profilePicture" class="upload-btn">
                        Choose Image
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
                        Clear
                      </button>
                    </div>
                  </div>
                  
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
                  <div class="edit-actions">
                    <button type="submit" class="save-btn" :disabled="isSubmitting">
                      {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
                    </button>
                    <button type="button" @click="cancelEdit" class="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div v-if="currentView === 'preorder'" class="preorder-section">
              <PreOrderHistory 
                @newOrder="showPreOrderModal = true"
                @reorder="handleReorder"
              />
            </div>
            <div class="profile-navigation">
              <button 
                @click="currentView = 'profile'" 
                :class="{ active: currentView === 'profile' }"
                class="nav-btn"
              >
                👤 Profile
              </button>
              <button 
                @click="currentView = 'preorder'" 
                :class="{ active: currentView === 'preorder' }"
                class="nav-btn"
              >
                🛍️ Pre-Orders
              </button>
              <button 
                @click="openPreOrderModal" 
                class="nav-btn preorder-new"
              >
                ➕ New Pre-Order
              </button>
            </div>
          </div>
          <div v-else class="loading">
            Loading profile...
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useCustomerAuth } from '../stores/customer-auth'
import PreOrderHistory from './PreOrderHistory.vue'
import PreOrder from './PreOrder.vue'

const emit = defineEmits(['close'])

const { customerAuthState, logout, updateProfile } = useCustomerAuth()

const currentView = ref('profile')
const isEditing = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const success = ref('')
const showPreOrderModal = ref(false)
const preOrderModalKey = ref(0)
const minimizedPreOrder = ref(false)
const profileImageFile = ref<File | null>(null)
const profileImagePreview = ref<string | null>(null)
const uploadProgress = ref(0)

const editForm = reactive({
  fullName: '',
  phoneNumber: ''
})

const closeModal = () => {
  console.log('CustomerProfile: closeModal called') // Debug log
  console.log('CustomerProfile: About to emit close event') // Additional debug
  // Reset any form state
  if (isEditing.value) {
    cancelEdit()
  }
  // Close any open modals
  showPreOrderModal.value = false
  // Emit close event
  emit('close')
  console.log('CustomerProfile: Close event emitted') // Confirm emission
}

const closePreOrderModal = () => {
  console.log('CustomerProfile.vue: closePreOrderModal called, hiding modal')
  
  // Reset all modal-related states
  minimizedPreOrder.value = false
  showPreOrderModal.value = false
  preOrderModalKey.value++ // Increment key to force a complete re-render
  
  // Additional DOM-based hiding as a last resort
  try {
    const modalOverlay = document.querySelector('.preorder-overlay') as HTMLElement
    if (modalOverlay) {
      modalOverlay.style.display = 'none'
    }
  } catch (err) {
    console.error('Error in additional modal hiding:', err)
  }
  
  console.log('CustomerProfile.vue: showPreOrderModal after close', showPreOrderModal.value)
}

watch(showPreOrderModal, (val) => {
  console.log('CustomerProfile.vue: showPreOrderModal changed to', val)
})

const handleLogout = async () => {
  try {
    await logout()
    closeModal()
  } catch (err) {
    error.value = 'Error logging out'
  }
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

const handleUpdateProfile = async () => {
  error.value = ''
  success.value = ''
  uploadProgress.value = 0
  
  if (!editForm.fullName.trim()) {
    error.value = 'Full name is required'
    return
  }
  
  isSubmitting.value = true
  
  try {
    const result = await updateProfile(
      {
        fullName: editForm.fullName.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        profileImageFile: profileImageFile.value
      },
      (progress) => {
        uploadProgress.value = progress;
      }
    );
    
    if (result.success) {
      success.value = 'Profile updated successfully!'
      profileImageFile.value = null;
      setTimeout(() => {
        isEditing.value = false
        success.value = ''
      }, 2000)
    } else {
      error.value = (result.error as string) || 'Failed to update profile'
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  error.value = ''
  success.value = ''
  // Reset form to current profile data
  if (customerAuthState.customerProfile) {
    editForm.fullName = customerAuthState.customerProfile.fullName
    editForm.phoneNumber = customerAuthState.customerProfile.phoneNumber || ''
    // Reset image state
    profileImageFile.value = null
    profileImagePreview.value = null
  }
}

const handleReorder = (_items: any[]) => {
  // Close current modal and open pre-order with pre-selected items
  preOrderModalKey.value++
  showPreOrderModal.value = true
  // You could pass the items to the PreOrder component if needed
}

const onPreOrderSuccess = () => {
  showPreOrderModal.value = false
  // Refresh the pre-order history if we're viewing it
  if (currentView.value === 'preorder') {
    // The PreOrderHistory component will auto-refresh
  }
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

onMounted(() => {
  if (customerAuthState.customerProfile) {
    editForm.fullName = customerAuthState.customerProfile.fullName
    editForm.phoneNumber = customerAuthState.customerProfile.phoneNumber || ''
  }
  
  // Add global event listeners for direct modal closing
  const handleForceClose = () => {
    console.log('Global close event received')
    showPreOrderModal.value = false
    minimizedPreOrder.value = false
  }
  
  window.addEventListener('close-preorder-modal', handleForceClose)
  window.addEventListener('force-modal-close', handleForceClose)
})

const handleCloseClick = (event: Event) => {
  console.log('CustomerProfile: Close button clicked') // Debug log
  event.preventDefault()
  event.stopPropagation()
  closeModal()
}

const openPreOrderModal = () => {
  preOrderModalKey.value++;
  showPreOrderModal.value = true;
};

const minimizePreOrderModal = () => {
  console.log('CustomerProfile.vue: minimizePreOrderModal called')
  minimizedPreOrder.value = true
}
const restorePreOrderModal = () => {
  minimizedPreOrder.value = false
}
</script>

<style scoped>
/* Avatar upload styling */
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.profile-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #a67c52;
  margin-bottom: 10px;
}

.edit-avatar-btn {
  padding: 6px 12px;
  background-color: #D4AF37;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.edit-avatar-btn:hover {
  background-color: #F4D03F;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(212, 175, 55, 0.3);
}

.current-avatar {
  width: 120px;
  height: 120px;
  margin-bottom: 15px;
}

.avatar-img-edit {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #a67c52;
}

.file-input {
  display: none;
}

.profile-avatar-edit {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 15px;
}

.profile-avatar-edit img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #a67c52; /* Coffee-themed color */
}

.profile-avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee0d1; /* Light coffee color */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #6d4c41; /* Dark coffee color */
  border: 2px solid #a67c52;
}

.upload-btn {
  display: inline-block;
  padding: 6px 12px;
  background-color: #a67c52;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;
}

.upload-btn:hover {
  background-color: #8d6e63;
}

.upload-controls {
  display: flex;
  margin-top: 10px;
}

.clear-btn {
  padding: 6px 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

/* Upload progress styling */
.upload-progress {
  width: 100%;
  margin-top: 10px;
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
  background-color: #4caf50;
  transition: width 0.2s ease;
}

.progress-text {
  font-size: 12px;
  margin-top: 5px;
  text-align: center;
  color: #757575;
}

.profile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.profile-modal {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
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

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.profile-header h2 {
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

.profile-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.profile-field label {
  font-weight: bold;
  color: #8B4513;
  font-size: 0.9rem;
}

.profile-field span {
  color: #333;
  font-size: 1rem;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
}

.edit-btn, .logout-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.edit-btn {
  background: #D4AF37;
  color: #333;
}

.edit-btn:hover {
  background: #F4D03F;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
}

.logout-btn {
  background: #dc3545;
  color: white;
}

.logout-btn:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
}

.edit-form {
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

.edit-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.save-btn, .cancel-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.save-btn {
  background: #28a745;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(108, 117, 125, 0.3);
}

.loading {
  text-align: center;
  color: #666;
  padding: 2rem;
  font-size: 1.1rem;
}

.profile-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.nav-btn {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  background: #f8f9fa;
  color: #666;
  font-size: 0.9rem;
}

.nav-btn:hover {
  background: #e9ecef;
  color: #333;
}

.nav-btn.active {
  background: #8B4513;
  color: white;
}

.nav-btn.preorder-new {
  background: #28a745;
  color: white;
  margin-left: auto;
}

.nav-btn.preorder-new:hover {
  background: #218838;
}

.profile-section,
.preorder-section {
  min-height: 300px;
}

.preorder-minimized-bar {
  background: #f0f0f0;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.preorder-minimized-bar span {
  font-weight: bold;
  color: #333;
}

.preorder-minimized-bar button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.preorder-minimized-bar button:hover {
  background: #D4AF37;
  color: white;
}

/* Mobile styles */
@media (max-width: 768px) {
  .profile-modal {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .profile-header h2 {
    font-size: 1.5rem;
  }
  
  .profile-actions {
    flex-direction: column;
  }
  
  .edit-actions {
    flex-direction: column;
  }
  
  .form-input {
    padding: 0.8rem;
  }
  
  .profile-navigation {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .nav-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    flex: 1;
    min-width: auto;
  }
  
  .nav-btn.preorder-new {
    margin-left: 0;
    flex: 1 0 100%;
    margin-top: 0.5rem;
  }
}

/* Custom Scrollbar Styles */
* {
  scrollbar-width: thin;
  scrollbar-color: #8B4513 #f1f1f1;
}

*::-webkit-scrollbar {
  width: clamp(6px, 1.5vw, 12px);
  height: clamp(6px, 1.5vw, 12px);
}

*::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

*::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #8B4513, #A0522D);
  border-radius: 10px;
  border: 1px solid #f1f1f1;
  transition: all 0.3s ease;
}

*::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #654321, #8B4513);
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
}

*::-webkit-scrollbar-corner {
  background: #f1f1f1;
}

/* Enhanced Modal Scrolling */
.profile-modal {
  overflow-y: auto;
  max-height: 90vh;
  max-height: 90dvh;
  scrollbar-width: thin;
  scrollbar-color: #8B4513 #f1f1f1;
}

.profile-modal::-webkit-scrollbar {
  width: 8px;
}

.profile-modal::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.profile-modal::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #8B4513, #A0522D);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.profile-modal::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #654321, #8B4513);
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
}

/* Profile Content Scrolling */
.profile-content {
  overflow-y: auto;
  max-height: 70vh;
  max-height: 70dvh;
  padding-right: 0.5rem;
}

.profile-section,
.preorder-section {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #8B4513 #f1f1f1;
}

.profile-section::-webkit-scrollbar,
.preorder-section::-webkit-scrollbar {
  width: 6px;
}

.profile-section::-webkit-scrollbar-track,
.preorder-section::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 3px;
}

.profile-section::-webkit-scrollbar-thumb,
.preorder-section::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #8B4513, #A0522D);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.profile-section::-webkit-scrollbar-thumb:hover,
.preorder-section::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #654321, #8B4513);
}

/* Responsive Scrollbar Adjustments */
@media (max-width: 768px) {
  .profile-modal {
    max-height: 95vh;
    max-height: 95dvh;
  }
  
  .profile-content {
    max-height: 75vh;
    max-height: 75dvh;
  }
  
  *::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .profile-modal::-webkit-scrollbar {
    width: 6px;
  }
  
  .profile-section::-webkit-scrollbar,
  .preorder-section::-webkit-scrollbar {
    width: 4px;
  }
}

@media (max-width: 480px) {
  .profile-modal {
    max-height: 98vh;
    max-height: 98dvh;
  }
  
  .profile-content {
    max-height: 80vh;
    max-height: 80dvh;
    padding-right: 0.25rem;
  }
  
  *::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
}

/* Touch Device Scrolling Optimization */
@media (hover: none) and (pointer: coarse) {
  .profile-modal,
  .profile-content,
  .profile-section,
  .preorder-section {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
}

/* High DPI Display Optimization */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .profile-modal::-webkit-scrollbar {
    width: 6px;
  }
}
</style>
