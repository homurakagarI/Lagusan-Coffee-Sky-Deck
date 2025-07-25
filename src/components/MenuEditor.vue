<template>
  <div class="menu-editor-overlay" @click="closeEditor">
    <div class="menu-editor-modal" @click.stop>
      <div class="editor-header">
        <h2>{{ menuItem ? 'Edit Menu Item' : 'Add Menu Item' }}</h2>
        <button class="close-btn" @click="closeEditor">&times;</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="menu-form">
        <div class="form-row">
          <div class="form-group">
            <label for="name">Item Name *</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="form-input"
              placeholder="Enter item name"
            >
          </div>
          
          <div class="form-group">
            <label for="price">Price *</label>
            <input
              id="price"
              v-model.number="form.price"
              type="number"
              step="0.01"
              required
              class="form-input"
              placeholder="0.00"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="description">Description *</label>
          <textarea
            id="description"
            v-model="form.description"
            required
            class="form-textarea"
            placeholder="Describe the menu item..."
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="category">Category *</label>
            <select id="category" v-model="form.category" required class="form-input">
              <option value="">Select category</option>
              <option value="coffee">Coffee</option>
              <option value="drinks">Drinks</option>
              <option value="food">Food</option>
              <option value="dessert">Dessert</option>
              <option value="pastry">Pastry</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="form.available"
                type="checkbox"
                class="checkbox-input"
              >
              <span class="checkbox-text">Available</span>
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label for="image">Image</label>
          <div class="file-upload-area">
            <input
              id="image"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="file-input"
            >
            <div v-if="!form.image && !imagePreview" class="upload-placeholder">
              <div class="upload-icon">🍽️</div>
              <p>Click to upload menu item image</p>
            </div>
            <div v-if="imagePreview || form.image" class="image-preview">
              <img :src="imagePreview || form.image" alt="Preview" class="preview-image">
              <button type="button" @click="removeImage" class="remove-image-btn">Remove</button>
            </div>
          </div>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-actions">
          <button type="button" @click="closeEditor" class="cancel-btn">Cancel</button>
          <button type="submit" :disabled="isSubmitting" class="submit-btn">
            {{ isSubmitting ? 'Saving...' : (menuItem ? 'Update' : 'Add Item') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { addMenuItem, updateMenuItem, uploadFile } from '../firebase/services'

const props = defineProps({
  menuItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const isSubmitting = ref(false)
const error = ref('')
const imagePreview = ref('')
const selectedFile = ref<File | null>(null)

const form = reactive({
  name: '',
  description: '',
  price: 0,
  category: '',
  image: '',
  available: true
})

const closeEditor = () => {
  // Reset form when closing
  Object.assign(form, {
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    available: true
  })
  imagePreview.value = ''
  selectedFile.value = null
  error.value = ''
  
  emit('close')
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    error.value = ''
    
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'Image size must be less than 5MB'
      return
    }
    
    if (!file.type.startsWith('image/')) {
      error.value = 'Please select a valid image file'
      return
    }
    
    selectedFile.value = file
    
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.onerror = () => {
      error.value = 'Error reading image file'
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  selectedFile.value = null
  imagePreview.value = ''
  form.image = ''
  
  const fileInput = document.getElementById('image') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}

const handleSubmit = async () => {
  console.log('🔥 MenuEditor handleSubmit called with form data:', form)
  error.value = ''
  isSubmitting.value = true
  
  try {
    // Validate required fields
    if (!form.name.trim()) {
      console.log('❌ Validation failed: Item name is required')
      error.value = 'Item name is required'
      return
    }
    if (!form.description.trim()) {
      console.log('❌ Validation failed: Description is required')
      error.value = 'Description is required'
      return
    }
    if (!form.category) {
      console.log('❌ Validation failed: Category is required')
      error.value = 'Category is required'
      return
    }
    if (form.price <= 0) {
      console.log('❌ Validation failed: Price must be greater than 0')
      error.value = 'Price must be greater than 0'
      return
    }
    
    console.log('✅ Form validation passed')
    
    let imageUrl = form.image
    
    // Handle image upload if a file is selected
    if (selectedFile.value) {
      console.log('📷 Uploading image file:', selectedFile.value.name)
      const uploadResult = await uploadFile(selectedFile.value, 'menu-images')
      if (uploadResult.success && uploadResult.url) {
        imageUrl = uploadResult.url
        console.log('✅ Image uploaded successfully:', imageUrl)
      } else {
        console.log('⚠️ Image upload failed, continuing without image')
        error.value = 'Failed to upload image. Item saved without image.'
        // Continue without image instead of failing
      }
    } else {
      console.log('📷 No image file selected, using existing imageUrl:', imageUrl)
    }
    
    const menuData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      imageUrl: imageUrl || '',
      available: form.available
    }
    
    console.log('💾 Prepared menu data for save:', menuData)
    
    let result
    if (props.menuItem) {
      console.log('🔄 Updating existing menu item with ID:', props.menuItem.id)
      result = await updateMenuItem(props.menuItem.id, menuData)
    } else {
      console.log('➕ Adding new menu item')
      result = await addMenuItem(menuData)
    }
    
    console.log('📊 Firebase operation result:', result)
    
    if (result.success) {
      console.log('🎉 Menu item saved successfully! Emitting save event...')
      emit('save')
    } else {
      console.log('❌ Failed to save menu item:', result.error)
      error.value = 'Failed to save menu item. Please try again.'
    }
  } catch (err) {
    error.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (props.menuItem) {
    Object.assign(form, {
      name: props.menuItem.name || '',
      description: props.menuItem.description || '',
      price: props.menuItem.price || 0,
      category: props.menuItem.category || '',
      image: props.menuItem.image || '',
      available: props.menuItem.available !== false
    })
  }
})
</script>

<style scoped>
/* Similar styles to NewsEditor.vue */
.menu-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  overflow-y: auto;
  padding: 2rem 0;
}

.menu-editor-modal {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin: 2rem 0;
}

.editor-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  border-radius: 15px 15px 0 0;
}

.editor-header h2 {
  color: #8B4513;
  margin: 0;
  font-size: 1.5rem;
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
}

.menu-form {
  padding: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.file-upload-area {
  border: 2px dashed #ddd;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-placeholder {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.preview-image {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.remove-image-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.5rem;
}

.checkbox-input {
  width: auto;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #c33;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.submit-btn {
  background: #8B4513;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.submit-btn:hover:not(:disabled) {
  background: #654321;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
