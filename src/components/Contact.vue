<template>
  <section id="contact" class="contact">
    <div class="container">
      <h2 class="section-title">Visit Our Sky Deck</h2>
      <p class="section-subtitle">Come experience coffee at new heights</p>
      
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
      </div>
      
      <div v-else class="contact-content">
        <div class="contact-info">
          <div class="info-card">
            <div class="info-icon">📍</div>
            <h3>Location</h3>
            <p v-if="contactInfo">{{ contactInfo.address || defaultAddress }}</p>
            <p v-else>{{ defaultAddress }}</p>
            
            <!-- Navigation Map Section -->
            <div class="navigation-map">
              <h4>Find Us</h4>
              <div class="map-container">
                <!-- Google Maps Embed -->
                <div class="google-map-embed">
                  <iframe
                    ref="mapFrame"
                    :src="googleMapsEmbedUrlCoords"
                    width="100%"
                    height="300"
                    style="border:0;"
                    :allowfullscreen="true"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    title="Lagusan Coffee Sky Deck Location"
                  ></iframe>
                </div>
                
                <!-- Navigation Buttons -->
                <div class="map-buttons">
                  <button @click="openGoogleMaps" class="map-btn google-maps">
                    <span class="btn-icon">🌐</span>
                    Google Maps
                  </button>
                  <button @click="openAppleMaps" class="map-btn apple-maps">
                    <span class="btn-icon">🍎</span>
                    Apple Maps
                  </button>
                  <button @click="openWaze" class="map-btn waze">
                    <span class="btn-icon">🚗</span>
                    Waze
                  </button>
                </div>
              </div>
              
              <!-- Directions Info -->
              <div class="directions-info">
                <h5>📍 Address</h5>
                <p class="address-text">{{ contactInfo?.address || defaultAddress }}</p>
                
                <h5>🚗 Parking</h5>
                <p>{{ contactInfo?.parkingInfo || 'Ample parking available on-site' }}</p>
                
                <h5>🚌 Public Transport</h5>
                <p>{{ contactInfo?.publicTransport || 'Accessible via main city bus routes' }}</p>
              </div>
            </div>
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
                <span>Monday - Sunday</span>
                <span>6:00 AM - 10:00 PM</span>
              </div>
            </div>
            <div class="hours-list" v-else>
              <div class="hours-item">
                <span>Monday - Sunday</span>
                <span>6:00 AM - 10:00 PM</span>
              </div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="info-icon">📞</div>
            <h3>Contact</h3>
            <p v-if="contactInfo">
              Phone: {{ contactInfo.phone || defaultPhone }}<br>
              Email: {{ contactInfo.email || defaultEmail }}<br>
              <span v-if="contactInfo.socialMedia">
                Follow: 
                <a v-if="contactInfo.socialMedia.facebook" :href="contactInfo.socialMedia.facebook" target="_blank">Facebook</a>
                <span v-if="contactInfo.socialMedia.facebook && (contactInfo.socialMedia.instagram || contactInfo.socialMedia.twitter)">, </span>
                <a v-if="contactInfo.socialMedia.instagram" :href="contactInfo.socialMedia.instagram" target="_blank">Instagram</a>
                <span v-if="contactInfo.socialMedia.instagram && contactInfo.socialMedia.twitter">, </span>
                <a v-if="contactInfo.socialMedia.twitter" :href="contactInfo.socialMedia.twitter" target="_blank">Twitter</a>
              </span>
            </p>
            <p v-else>
              Phone: {{ defaultPhone }}<br>
              Email: {{ defaultEmail }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getContactInfo } from '../firebase/services'

const contactInfo = ref<any>(null)
const loading = ref(true)
const mapFrame = ref<HTMLIFrameElement>()

// Default contact information
const defaultAddress = "Lagusan Coffee Sky Deck, Sky Bridge Building, Makati City, Philippines"
const defaultPhone = "+63 (2) 8XXX-XXXX"
const defaultEmail = "info@lagusancoffee.com"

// Google Maps Embed URL using coordinates (works without API key)
const googleMapsEmbedUrlCoords = computed(() => {
  // Using a working Google Maps embed URL for Makati City area
  // This will show the general Makati area where Lagusan Coffee Sky Deck would be located
  const address = "Lagusan Coffee Sky Deck, Makati City, Metro Manila, Philippines"
  const encodedAddress = encodeURIComponent(address)
  
  // Simple embed URL that works without API key
  return `https://maps.google.com/maps?width=100%25&height=300&hl=en&q=${encodedAddress}&t=&z=16&ie=UTF8&iwloc=&output=embed`
})

// Navigation functions
const openGoogleMaps = () => {
  const address = contactInfo.value?.address || defaultAddress
  const encodedAddress = encodeURIComponent(address)
  window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank')
}

const openAppleMaps = () => {
  const address = contactInfo.value?.address || defaultAddress
  const encodedAddress = encodeURIComponent(address)
  window.open(`http://maps.apple.com/?q=${encodedAddress}`, '_blank')
}

const openWaze = () => {
  const address = contactInfo.value?.address || defaultAddress
  const encodedAddress = encodeURIComponent(address)
  window.open(`https://waze.com/ul?q=${encodedAddress}`, '_blank')
}

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
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
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

/* Navigation Map Styles */
.navigation-map {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
}

.navigation-map h4 {
  color: #8B4513;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: bold;
}

.navigation-map h5 {
  color: #8B4513;
  font-size: 1rem;
  margin: 1.5rem 0 0.5rem 0;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.map-container {
  margin-bottom: 2rem;
}

/* Google Maps Embed Styles */
.google-map-embed {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.google-map-embed:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.google-map-embed iframe {
  border-radius: 12px;
  display: block;
  transition: all 0.3s ease;
}

.map-placeholder {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.map-placeholder:hover {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
  border-color: #8B4513;
}

.map-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.map-placeholder p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.map-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.map-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 0.9rem;
}

.map-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.google-maps {
  background: #4285f4;
  color: white;
}

.google-maps:hover {
  background: #3367d6;
}

.apple-maps {
  background: #007aff;
  color: white;
}

.apple-maps:hover {
  background: #0056b3;
}

.waze {
  background: #33ccff;
  color: white;
}

.waze:hover {
  background: #00b8e6;
}

.btn-icon {
  font-size: 1.1rem;
}

.directions-info {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #8B4513;
}

.directions-info p {
  margin: 0.5rem 0 1rem 0;
  color: #666;
  line-height: 1.6;
}

.address-text {
  font-weight: 600;
  color: #333 !important;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
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
    gap: 2rem;
    padding: 0 1rem;
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
  
  /* Mobile Map Styles */
  .google-map-embed {
    margin-bottom: 1rem;
    border-radius: 8px;
  }
  
  .google-map-embed iframe {
    height: 250px !important;
    border-radius: 8px;
  }
  
  .map-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .map-btn {
    width: 200px;
    justify-content: center;
  }
  
  .map-placeholder {
    padding: 1.5rem;
  }
  
  .directions-info {
    padding: 1rem;
  }
  
  .navigation-map h4 {
    font-size: 1.1rem;
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
  
  /* Small Mobile Map Styles */
  .google-map-embed iframe {
    height: 200px !important;
  }
  
  .map-placeholder {
    padding: 1rem;
  }
  
  .map-icon {
    font-size: 2.5rem;
  }
  
  .map-btn {
    width: 180px;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
  
  .directions-info {
    padding: 0.75rem;
  }
  
  .navigation-map h4 {
    font-size: 1rem;
  }
  
  .navigation-map h5 {
    font-size: 0.9rem;
  }
}
</style>


  



