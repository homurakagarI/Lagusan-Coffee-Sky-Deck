<template>
  <section id="contact" class="contact">
      <h2 class="section-title">Visit Our Sky Deck</h2>
      <p class="section-subtitle">Come experience coffee at new heights</p>
      
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
      </div>
      
      <div v-else class="contact-info">
        <div class="info-card">
          <div class="info-icon">📍</div>
          <h3>Location</h3>
          <p v-if="contactInfo">{{ contactInfo.address || 'Location information coming soon' }}</p>
          <p v-else>Location information coming soon</p>
        </div>
        
        <div class="info-card">
          <div class="info-icon">🕒</div>
          <h3>Hours</h3>
          <div class="hours-list" v-if="contactInfo">
            <div class="hours-item" v-if="contactInfo.openingTime && contactInfo.closingTime">
              <span>Opening Hours</span>
              <span>{{ contactInfo.openingTime }} - {{ contactInfo.closingTime }}</span>
            </div>
            <div class="hours-item" v-else>
              <span>Hours information coming soon</span>
            </div>
          </div>
          <div class="hours-list" v-else>
            <div class="hours-item">
              <span>Hours information coming soon</span>
            </div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-icon">📞</div>
          <h3>Contact</h3>
          <p v-if="contactInfo">
            Phone: {{ contactInfo.phone || 'Coming soon' }}<br>
            Email: {{ contactInfo.email || 'Coming soon' }}<br>
            <span v-if="contactInfo.socialMedia">
              Follow: 
              <a v-if="contactInfo.socialMedia.facebook" :href="contactInfo.socialMedia.facebook" target="_blank">Facebook</a>
              <span v-if="contactInfo.socialMedia.facebook && (contactInfo.socialMedia.instagram || contactInfo.socialMedia.twitter)">, </span>
              <a v-if="contactInfo.socialMedia.instagram" :href="contactInfo.socialMedia.instagram" target="_blank">Instagram</a>
              <span v-if="contactInfo.socialMedia.instagram && contactInfo.socialMedia.twitter">, </span>
              <a v-if="contactInfo.socialMedia.twitter" :href="contactInfo.socialMedia.twitter" target="_blank">Twitter</a>
            </span>
          </p>
          <p v-else>Contact information coming soon</p>
        </div>
      </div>  
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getContactInfo } from '../firebase/services'

const contactInfo = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const result = await getContactInfo()
    if (result.success && result.contactInfo) {
      contactInfo.value = result.contactInfo
    }
  } catch (error) {
    console.error('Error fetching contact info:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.contact {
  padding: 100px 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section-title {
  font-size: 2.5rem;
  color: #8B4513;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: bold;
}

.section-subtitle {
  text-align: center;
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 4rem;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
}

.info-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.info-card h3 {
  color: #8B4513;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.info-card p {
  color: #666;
  line-height: 1.6;
}

.hours-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hours-item {
  display: flex;
  justify-content: space-between;
  color: #666;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.hours-item:last-child {
  border-bottom: none;
}

.contact-form {
  background: white;
  padding: 2.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.contact-form h3 {
  color: #8B4513;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: bold;
}

.form-group {
  margin-bottom: 1.5rem;
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

.form-textarea {
  resize: vertical;
  min-height: 120px;
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

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  width: 100%;
}

.spinner {
  border: 4px solid rgba(139, 69, 19, 0.1);
  border-radius: 50%;
  border-top: 4px solid #8B4513;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile styles */
@media (max-width: 768px) {
  .contact {
    padding: 60px 0;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .section-subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
  
  .contact-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .contact-form {
    padding: 1.5rem;
  }
  
  .info-card {
    padding: 1.5rem;
  }
  
  .hours-item {
    flex-direction: column;
    text-align: center;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.8rem;
  }
  
  .contact-form {
    padding: 1rem;
  }
  
  .info-card {
    padding: 1rem;
  }
  
  .info-icon {
    font-size: 2.5rem;
  }
}
</style>


  



