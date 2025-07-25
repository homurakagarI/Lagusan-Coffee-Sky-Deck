<template>
  <section id="contact" class="contact">
    <div class="container">
      <h2 class="section-title">Visit Our Sky Deck</h2>
      <p class="section-subtitle">Come experience coffee at new heights</p>
      
      <div class="contact-content">
        <div class="contact-info">
          <div class="info-card">
            <div class="info-icon">📍</div>
            <h3>Location</h3>
            <p>Sky Tower, 42nd Floor<br>Downtown Business District<br>City Center</p>
          </div>
          
          <div class="info-card">
            <div class="info-icon">🕒</div>
            <h3>Hours</h3>
            <div class="hours-list">
              <div class="hours-item">
                <span>Monday - Friday</span>
                <span>6:00 AM - 10:00 PM</span>
              </div>
              <div class="hours-item">
                <span>Saturday</span>
                <span>7:00 AM - 11:00 PM</span>
              </div>
              <div class="hours-item">
                <span>Sunday</span>
                <span>7:00 AM - 9:00 PM</span>
              </div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="info-icon">📞</div>
            <h3>Contact</h3>
            <p>Phone: (555) 123-4567<br>Email: hello@lagusanskydeck.com<br>Follow @LagusanSkyDeck</p>
          </div>
        </div>
        
        <div class="contact-form">
          <h3>Get in Touch</h3>
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <input 
                v-model="form.name" 
                type="text" 
                placeholder="Your Name" 
                required
                class="form-input"
              >
            </div>
            <div class="form-group">
              <input 
                v-model="form.email" 
                type="email" 
                placeholder="Your Email" 
                required
                class="form-input"
              >
            </div>
            <div class="form-group">
              <input 
                v-model="form.phone" 
                type="tel" 
                placeholder="Phone Number" 
                class="form-input"
              >
            </div>
            <div class="form-group">
              <textarea 
                v-model="form.message" 
                placeholder="Your Message" 
                rows="5" 
                required
                class="form-textarea"
              ></textarea>
            </div>
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'Sending...' : 'Send Message' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { submitContactForm } from '../firebase/services'

const isSubmitting = ref(false)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  message: ''
})

const submitForm = async () => {
  isSubmitting.value = true
  
  try {
    const result = await submitContactForm(form)
    
    if (result.success) {
      alert('Thank you for your message! We\'ll get back to you soon.')
      Object.assign(form, { name: '', email: '', phone: '', message: '' })
    } else {
      alert('Sorry, there was an error sending your message. Please try again.')
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('Sorry, there was an error sending your message. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
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
