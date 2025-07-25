<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <h1 class="dashboard-title">Lagusan Coffee Admin Dashboard</h1>
      <div class="header-actions">
        <button @click="minimizeDashboard" class="minimize-btn" title="Minimize Dashboard">
          <span class="minimize-icon">–</span>
        </button>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </div>
    
    <div class="admin-content">
      <nav class="admin-nav">
        <button 
          @click="activeSection = 'content'" 
          :class="{ active: activeSection === 'content' }"
          class="nav-btn"
        >
          Content Management
        </button>
        <button 
          @click="activeSection = 'menu'" 
          :class="{ active: activeSection === 'menu' }"
          class="nav-btn"
        >
          Menu Management
        </button>
        <button 
          @click="activeSection = 'contact'" 
          :class="{ active: activeSection === 'contact' }"
          class="nav-btn"
        >
          Contact Info
        </button>
        <button 
          @click="activeSection = 'news'" 
          :class="{ active: activeSection === 'news' }"
          class="nav-btn"
        >
          News & Updates
        </button>
        <button 
          @click="activeSection = 'preorders'" 
          :class="{ active: activeSection === 'preorders' }"
          class="nav-btn"
        >
          Pre-Orders
        </button>
      </nav>
      
      <div class="admin-main">
        <ContentManagement v-if="activeSection === 'content'" />
        <MenuManagement v-if="activeSection === 'menu'" />
        <ContactManagement v-if="activeSection === 'contact'" />
        <NewsManagement v-if="activeSection === 'news'" />
        <PreOrderManagement v-if="activeSection === 'preorders'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ContentManagement from './ContentManagement.vue'
import MenuManagement from './MenuManagement.vue'
import ContactManagement from './ContactManagement.vue'
import NewsManagement from './NewsManagement.vue'
import PreOrderManagement from './PreOrderManagement.vue'
import { useAuth } from '../stores/auth'

// Define emits
const emit = defineEmits<{
  close: []
}>()

const { logout } = useAuth()
const activeSection = ref('content') // Start with content management

const minimizeDashboard = () => {
  emit('close')
}

const handleLogout = async () => {
  try {
    await logout()
    emit('close')
  } catch (error) {
    console.error('Error during logout:', error)
    emit('close')
  }
}

onMounted(() => {
  // For development: bypass authentication check
  // TODO: Implement proper authentication before production
  const isAdmin = localStorage.getItem('isAdmin')
  if (!isAdmin) {
    // Set admin status for development
    localStorage.setItem('isAdmin', 'true')
    console.log('Development mode: Admin access granted')
  }
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f8f9fa;
}

.admin-header {
  background: #8B4513;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.dashboard-title {
  margin: 0;
  font-size: 1.5rem;
}

.logout-btn {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.3);
}

.minimize-btn {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
}

.minimize-btn:hover {
  background: rgba(255,255,255,0.3);
}

.minimize-icon {
  line-height: 1;
}

.admin-content {
  display: flex;
  min-height: calc(100vh - 80px);
}

.admin-nav {
  width: 250px;
  background: white;
  padding: 2rem 0;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
}

.nav-btn {
  width: 100%;
  padding: 1rem 2rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-btn:hover {
  background: #f8f9fa;
}

.nav-btn.active {
  background: #e3f2fd;
  border-left-color: #8B4513;
  color: #8B4513;
  font-weight: bold;
}

.admin-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(100vh - 80px);
}

@media (max-width: 768px) {
  .admin-content {
    flex-direction: column;
  }
  
  .admin-nav {
    width: 100%;
    display: flex;
    overflow-x: auto;
    padding: 1rem 0;
  }
  
  .nav-btn {
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  
  .nav-btn.active {
    border-left: none;
    border-bottom-color: #8B4513;
  }
}
</style>
