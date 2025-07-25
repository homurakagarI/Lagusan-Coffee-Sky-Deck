<template>
  <div class="menu-management">
    <div class="section-header">
      <h2>Menu Management</h2>
      <div class="header-actions">
        <select v-model="filterCategory" class="filter-select">
          <option value="">All Categories</option>
          <option value="coffee">Coffee</option>
          <option value="drinks">Drinks</option>
          <option value="food">Food</option>
          <option value="dessert">Dessert</option>
          <option value="pastry">Pastry</option>
        </select>
        <button @click="addSampleItems" class="sample-btn">Add Sample Items</button>
        <button @click="loadMenuItems" class="refresh-btn">Refresh</button>
        <button @click="openMenuEditor()" class="add-btn">Add New Item</button>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading menu items...</p>
    </div>
    
    <div v-else-if="menuItems.length === 0" class="empty-state">
      <div class="empty-icon">🍽️</div>
      <h3>No Menu Items Found</h3>
      <p>Start by adding your first menu item to get started.</p>
      <button @click="openMenuEditor()" class="add-first-btn">Add First Item</button>
    </div>
    
    <div v-else class="menu-grid">
      <div v-for="item in filteredMenuItems" :key="item.id" class="menu-item-card">
        <div class="item-image">
          <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
          <div v-else class="no-image">
            <span class="no-image-icon">🖼️</span>
            <span>No Image</span>
          </div>
        </div>
        <div class="item-details">
          <h3>{{ item.name }}</h3>
          <p class="item-description">{{ item.description }}</p>
          <p class="item-price">₱{{ parseFloat(item.price).toFixed(2) }}</p>
          <div class="item-meta">
            <span class="item-category">{{ item.category }}</span>
            <span class="item-status" :class="{ available: item.available, unavailable: !item.available }">
              {{ item.available ? 'Available' : 'Unavailable' }}
            </span>
          </div>
          <div v-if="item.createdAt" class="item-date">
            Added: {{ formatDate(item.createdAt) }}
          </div>
        </div>
        <div class="item-actions">
          <button @click="openMenuEditor(item)" class="edit-btn">Edit</button>
          <button @click="deleteMenuItem(item.id)" class="delete-btn">Delete</button>
        </div>
      </div>
    </div>
    
    <!-- Menu Editor Modal -->
    <MenuEditor 
      v-if="showEditor"
      :menu-item="selectedItem"
      @close="closeMenuEditor"
      @save="handleMenuSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getMenuItems, deleteMenuItemFromDB } from '../firebase/services'
import MenuEditor from './MenuEditor.vue'

const loading = ref(true)
const menuItems = ref<any[]>([])
const showEditor = ref(false)
const selectedItem = ref<any>(null)
const filterCategory = ref('')

const filteredMenuItems = computed(() => {
  if (!filterCategory.value) {
    return menuItems.value
  }
  return menuItems.value.filter(item => item.category === filterCategory.value)
})

const loadMenuItems = async () => {
  loading.value = true
  try {
    console.log('Loading menu items from Firestore...')
    const result = await getMenuItems()
    console.log('Menu items result:', result)
    if (result.success && result.items) {
      menuItems.value = result.items
      console.log(`Successfully loaded ${result.items.length} menu items:`, result.items)
      if (result.items.length === 0) {
        console.log('No menu items found in database')
      }
    } else {
      console.error('Failed to load menu items:', result.error)
      menuItems.value = []
    }
  } catch (error) {
    console.error('Error loading menu items:', error)
    menuItems.value = []
  } finally {
    loading.value = false
    console.log('Menu loading complete. Current items count:', menuItems.value.length)
  }
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'Unknown'
  try {
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

const openMenuEditor = (item: any = null) => {
  selectedItem.value = item
  showEditor.value = true
}

const closeMenuEditor = () => {
  showEditor.value = false
  selectedItem.value = null
}

const handleMenuSave = () => {
  console.log('🔄 MenuManagement: handleMenuSave called - menu item was saved')
  console.log('🔄 MenuManagement: Closing editor and refreshing menu list...')
  closeMenuEditor()
  loadMenuItems()
}

const deleteMenuItem = async (itemId: string) => {
  if (confirm('Are you sure you want to delete this menu item?')) {
    try {
      const result = await deleteMenuItemFromDB(itemId)
      if (result.success) {
        loadMenuItems()
      } else {
        alert('Failed to delete menu item')
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
      alert('Error deleting menu item')
    }
  }
}

const addSampleItems = async () => {
  try {
    const { addMenuItem } = await import('../firebase/services')
    
    const sampleItems = [
      {
        name: "Signature Espresso",
        description: "Rich, bold espresso shot from our premium house blend",
        price: 85,
        category: "coffee",
        imageUrl: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400",
        available: true
      },
      {
        name: "Cappuccino Supreme",
        description: "Traditional cappuccino with perfectly balanced milk foam",
        price: 95,
        category: "coffee",
        imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
        available: true
      },
      {
        name: "Chocolate Croissant",
        description: "Buttery, flaky croissant filled with rich dark chocolate",
        price: 65,
        category: "pastry",
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab794f6eb9f3?w=400",
        available: true
      }
    ]
    
    let addedCount = 0
    for (const item of sampleItems) {
      const result = await addMenuItem(item)
      if (result.success) {
        addedCount++
      }
    }
    
    alert(`Added ${addedCount} sample items successfully!`)
    loadMenuItems()
  } catch (error) {
    console.error('Error adding sample items:', error)
    alert('Error adding sample items')
  }
}

onMounted(() => {
  loadMenuItems()
})
</script>

<style scoped>
.menu-management {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-height: calc(100vh - 160px);
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
  font-size: 0.9rem;
}

.add-btn {
  background: #8B4513;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.add-btn:hover {
  background: #654321;
}

.refresh-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.refresh-btn:hover {
  background: #218838;
}

.sample-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.sample-btn:hover {
  background: #138496;
}

.loading {
  text-align: center;
  padding: 3rem 0;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #8B4513;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 1rem 0;
  color: #333;
}

.empty-state p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.add-first-btn {
  background: #8B4513;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
}

.add-first-btn:hover {
  background: #654321;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.menu-item-card {
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.menu-item-card:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.item-image {
  height: 200px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.9rem;
}

.no-image-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.item-details {
  padding: 1rem;
}

.item-details h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.item-description {
  color: #666;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.item-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #8B4513;
  margin: 0.5rem 0;
}

.item-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  margin: 0.5rem 0;
}

.item-date {
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.5rem;
}

.item-category {
  background: #e9ecef;
  color: #495057;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  display: inline-block;
  margin: 0.5rem 0;
}

.item-status {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  display: inline-block;
  margin: 0.5rem 0 0.5rem 0.5rem;
  font-weight: 500;
}

.item-status.available {
  background: #d4edda;
  color: #155724;
}

.item-status.unavailable {
  background: #f8d7da;
  color: #721c24;
}

.item-actions {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.edit-btn {
  background: #007bff;
  color: white;
}

.edit-btn:hover {
  background: #0056b3;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
