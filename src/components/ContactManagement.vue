<template>
  <div class="contact-management">
    <div class="section-header">
      <h2>Contact Information Management</h2>
      <p>Manage your coffee shop's contact information and business hours.</p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="contact-form">
      <div class="form-grid">
        <div class="form-group">
          <label for="businessName">Business Name *</label>
          <input
            id="businessName"
            v-model="form.businessName"
            type="text"
            required
            class="form-input"
            placeholder="Lagusan Coffee Sky Deck"
          >
        </div>
        
        <div class="form-group">
          <label for="phone">Phone Number *</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            required
            class="form-input"
            placeholder="+63 xxx xxx xxxx"
          >
        </div>
        
        <div class="form-group">
          <label for="email">Email Address *</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="form-input"
            placeholder="info@lagusancoffee.com"
          >
        </div>
        
        <div class="form-group">
          <label for="website">Website</label>
          <input
            id="website"
            v-model="form.website"
            type="url"
            class="form-input"
            placeholder="https://lagusancoffee.com"
          >
        </div>
      </div>
      
      <div class="form-group">
        <label for="address">Complete Address *</label>
        <textarea
          id="address"
          v-model="form.address"
          required
          class="form-textarea"
          placeholder="Complete business address..."
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-grid">
        <div class="form-group">
          <label for="openingTime">Opening Time *</label>
          <input
            id="openingTime"
            v-model="form.openingTime"
            type="time"
            required
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label for="closingTime">Closing Time *</label>
          <input
            id="closingTime"
            v-model="form.closingTime"
            type="time"
            required
            class="form-input"
          >
        </div>
      </div>
      
      <div class="form-group">
        <label for="description">Business Description</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-textarea"
          placeholder="Brief description of your coffee shop..."
          rows="4"
        ></textarea>
      </div>
      
      <div class="social-media-section">
        <h3>Social Media Links</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="facebook">Facebook</label>
            <input
              id="facebook"
              v-model="form.socialMedia.facebook"
              type="url"
              class="form-input"
              placeholder="https://facebook.com/lagusancoffee"
            >
          </div>
          
          <div class="form-group">
            <label for="instagram">Instagram</label>
            <input
              id="instagram"
              v-model="form.socialMedia.instagram"
              type="url"
              class="form-input"
              placeholder="https://instagram.com/lagusancoffee"
            >
          </div>
          
          <div class="form-group">
            <label for="twitter">Twitter</label>
            <input
              id="twitter"
              v-model="form.socialMedia.twitter"
              type="url"
              class="form-input"
              placeholder="https://twitter.com/lagusancoffee"
            >
          </div>
        </div>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-if="success" class="success-message">
        {{ success }}
      </div>
      
      <div class="form-actions">
        <button type="submit" :disabled="isSubmitting" class="submit-btn">
          {{ isSubmitting ? 'Saving...' : 'Update Contact Information' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getContactInfo, updateContactInfo } from '../firebase/services'

const isSubmitting = ref(false)
const error = ref('')
const success = ref('')

const form = reactive({
  businessName: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  openingTime: '',
  closingTime: '',
  description: '',
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: ''
  }
})

const loadContactInfo = async () => {
  try {
    const result = await getContactInfo()
    if (result.success && result.contactInfo) {
      const contactInfo = result.contactInfo as any
      Object.assign(form, {
        businessName: contactInfo.businessName || '',
        phone: contactInfo.phone || '',
        email: contactInfo.email || '',
        website: contactInfo.website || '',
        address: contactInfo.address || '',
        openingTime: contactInfo.openingTime || '',
        closingTime: contactInfo.closingTime || '',
        description: contactInfo.description || '',
        socialMedia: {
          facebook: contactInfo.socialMedia?.facebook || '',
          instagram: contactInfo.socialMedia?.instagram || '',
          twitter: contactInfo.socialMedia?.twitter || ''
        }
      })
    }
  } catch (error) {
    console.error('Error loading contact info:', error)
  }
}

const handleSubmit = async () => {
  error.value = ''
  success.value = ''
  isSubmitting.value = true
  
  try {
    const contactData = {
      businessName: form.businessName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      website: form.website.trim(),
      address: form.address.trim(),
      openingTime: form.openingTime,
      closingTime: form.closingTime,
      description: form.description.trim(),
      socialMedia: {
        facebook: form.socialMedia.facebook.trim(),
        instagram: form.socialMedia.instagram.trim(),
        twitter: form.socialMedia.twitter.trim()
      }
    }
    
    const result = await updateContactInfo(contactData)
    
    if (result.success) {
      success.value = 'Contact information updated successfully!'
      setTimeout(() => {
        success.value = ''
      }, 3000)
    } else {
      error.value = (result.error as any)?.message || 'Failed to update contact information'
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
    console.error('Error updating contact info:', err)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadContactInfo()
})
</script>

<style scoped>
.contact-management {
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
  margin: 0;
  color: #8B4513;
}

.contact-form {
  max-width: 800px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
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

.form-input,
.form-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #8B4513;
}

.social-media-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.social-media-section h3 {
  margin-bottom: 1.5rem;
  color: #8B4513;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #c33;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #28a745;
}

.form-actions {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.submit-btn {
  background: #8B4513;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
}

.submit-btn:hover:not(:disabled) {
  background: #654321;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
