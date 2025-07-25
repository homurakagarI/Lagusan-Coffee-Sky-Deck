<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Lagusan Coffee Sky Deck</h3>
          <p>Elevating your coffee experience to new heights with premium brews and breathtaking views.</p>
          <div class="social-links">
            <a href="#" class="social-link">📘</a>
            <a href="#" class="social-link">📷</a>
            <a href="#" class="social-link">🐦</a>
            <a href="#" class="social-link">📌</a>
          </div>
        </div>
        
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul class="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#menu">Menu</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>Opening Hours</h4>
          <div class="hours">
            <div class="hour-item">
              <span>Mon - Fri</span>
              <span>6:00 AM - 10:00 PM</span>
            </div>
            <div class="hour-item">
              <span>Saturday</span>
              <span>7:00 AM - 11:00 PM</span>
            </div>
            <div class="hour-item">
              <span>Sunday</span>
              <span>7:00 AM - 9:00 PM</span>
            </div>
          </div>
        </div>
        
        <div class="footer-section">
          <h4>Contact Info</h4>
          <div class="contact-info">
            <p>📍 Sky Tower, 42nd Floor<br>Downtown Business District</p>
            <p>📞 (555) 123-4567</p>
            <p>✉️ hello@lagusanskydeck.com</p>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Lagusan Coffee Sky Deck. All rights reserved.</p>
        <p>Crafted with ❤️ for coffee lovers</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background: #2c1810;
  color: #fff;
  padding: 3rem 0 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3 {
  color: #D4AF37;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.footer-section h4 {
  color: #D4AF37;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.footer-section p {
  line-height: 1.6;
  margin-bottom: 1rem;
  color: #ccc;
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.social-link {
  display: inline-block;
  width: 40px;
  height: 40px;
  background: #8B4513;
  text-align: center;
  line-height: 40px;
  border-radius: 50%;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.social-link:hover {
  background: #D4AF37;
  transform: translateY(-2px);
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #D4AF37;
}

.hours {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hour-item {
  display: flex;
  justify-content: space-between;
  color: #ccc;
  padding: 0.25rem 0;
}

.contact-info p {
  margin-bottom: 0.5rem;
  color: #ccc;
}

.footer-bottom {
  border-top: 1px solid #444;
  padding-top: 1rem;
  text-align: center;
  color: #999;
}

.footer-bottom p {
  margin-bottom: 0.5rem;
}

/* Mobile styles */
@media (max-width: 768px) {
  .footer {
    padding: 2rem 0 1rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }
  
  .footer-section h3 {
    font-size: 1.3rem;
  }
  
  .footer-section h4 {
    font-size: 1.1rem;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .hour-item {
    justify-content: center;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .footer-bottom {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .footer-section h3 {
    font-size: 1.2rem;
  }
  
  .social-link {
    width: 35px;
    height: 35px;
    line-height: 35px;
    font-size: 1rem;
  }
}
</style>
