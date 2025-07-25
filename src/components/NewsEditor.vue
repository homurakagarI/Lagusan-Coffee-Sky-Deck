<template>
  <div class="news-editor-overlay" @click="closeEditor">
    <div class="news-editor-modal" @click.stop>
      <div class="editor-header">
        <h2>{{ news ? 'Edit News' : 'Add News Update' }}</h2>
        <button class="close-btn" @click="closeEditor">&times;</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="news-form">
        <div class="form-row">
          <div class="form-group">
            <label for="title">Title *</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              class="form-input"
              placeholder="Enter news title"
            >
          </div>
          
          <div class="form-group">
            <label for="category">Category *</label>
            <select id="category" v-model="form.category" required class="form-input">
              <option value="">Select category</option>
              <option value="announcement">Announcement</option>
              <option value="event">Event</option>
              <option value="promotion">Promotion</option>
              <option value="menu">Menu Update</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="content">Content *</label>
          <textarea
            id="content"
            v-model="form.content"
            required
            class="form-textarea"
            placeholder="Write your news content here..."
            rows="8"
          ></textarea>
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
            <div v-if="!form.imageUrl && !imagePreview" class="upload-placeholder">
              <div class="upload-icon">📷</div>
              <p>Click to upload image or drag and drop</p>
              <p class="upload-note">Supported: JPG, PNG, GIF (Max 5MB)</p>
            </div>
            <div v-if="imagePreview || form.imageUrl" class="image-preview">
              <img :src="imagePreview || form.imageUrl" alt="Preview" class="preview-image">
              <button type="button" @click="removeImage" class="remove-image-btn">Remove</button>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="video">Video URL (YouTube, Vimeo, etc.)</label>
          <input
            id="video"
            v-model="form.videoUrl"
            type="url"
            class="form-input"
            placeholder="https://www.youtube.com/watch?v=..."
          >
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="form.featured"
              type="checkbox"
              class="checkbox-input"
            >
            <span class="checkbox-text">Feature this news (show prominently)</span>
          </label>
        </div>
        
        <div class="form-group">
          <label for="status">Publication Status</label>
          <select id="status" v-model="form.status" required class="form-input">
            <option value="draft">Draft (save without publishing)</option>
            <option value="published" :disabled="!canPublish">Published (visible to users)</option>
            <option value="archived">Archived (hidden from users)</option>
          </select>
          <p v-if="!canPublish" class="field-note">
            ⚠️ Cannot publish: Maximum 7 published posts reached. Archive some posts first.
          </p>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-actions">
          <button type="button" @click="closeEditor" class="cancel-btn">Cancel</button>
          <button type="submit" :disabled="isSubmitting" class="submit-btn">
            {{ isSubmitting ? 'Saving...' : (news ? 'Update' : 'Publish') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { addNewsUpdate, updateNewsUpdate, uploadFile, getPublishedNewsCount } from '../firebase/services'

const props = defineProps({
  news: {
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
  title: '',
  content: '',
  category: '',
  imageUrl: '',
  videoUrl: '',
  featured: false,
  status: 'draft'
})

const publishedCount = ref(0)

const canPublish = computed(() => {
  // Can publish if editing existing published news OR if under the 7-post limit
  return (props.news && props.news.status === 'published') || publishedCount.value < 7
})

const loadPublishedCount = async () => {
  publishedCount.value = await getPublishedNewsCount()
}

const closeEditor = () => {
  emit('close')
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Clear previous error
    error.value = ''
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'Image size must be less than 5MB'
      return
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      error.value = 'Please select a valid image file'
      return
    }
    
    selectedFile.value = file
    
    // Create preview
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
  form.imageUrl = ''
  
  // Clear file input
  const fileInput = document.getElementById('image') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}

const handleSubmit = async () => {
  error.value = ''
  isSubmitting.value = true
  
  try {
    let imageUrl = form.imageUrl
    
    // Upload new image if selected
    if (selectedFile.value) {
      const uploadResult = await uploadFile(selectedFile.value, 'news-images')
      if (uploadResult.success && uploadResult.url) {
        imageUrl = uploadResult.url
      } else {
        error.value = (uploadResult.error as any)?.message || 'Failed to upload image'
        return
      }
    }
    
    const newsData = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      imageUrl,
      videoUrl: form.videoUrl.trim(),
      featured: form.featured,
      status: form.status
    }
    
    let result
    if (props.news) {
      // Update existing news
      result = await updateNewsUpdate(props.news.id, newsData)
    } else {
      // Add new news
      result = await addNewsUpdate(newsData)
    }
    
    if (result.success) {
      emit('save')
    } else {
      error.value = (result.error as any)?.message || 'Failed to save news update'
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
    console.error('Error saving news:', err)
  } finally {
    isSubmitting.value = false
  }
}

// Initialize form with existing news data if editing
onMounted(async () => {
  // Load published count for publish limit check
  await loadPublishedCount()
  
  if (props.news) {
    Object.assign(form, {
      title: props.news.title || '',
      content: props.news.content || '',
      category: props.news.category || '',
      imageUrl: props.news.imageUrl || '',
      videoUrl: props.news.videoUrl || '',
      featured: props.news.featured || false,
      status: props.news.status || 'draft'
    })
  }
})
</script>

<style scoped>
.news-editor-overlay {
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

.news-editor-modal {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 800px;
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

.close-btn:hover {
  color: #666;
}

.news-form {
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

.form-textarea {
  resize: vertical;
  min-height: 150px;
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
  padding: 3rem;
  text-align: center;
  color: #666;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-note {
  font-size: 0.9rem;
  color: #999;
  margin-top: 0.5rem;
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

.remove-image-btn:hover {
  background: rgba(220, 53, 69, 1);
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

.checkbox-text {
  color: #333;
}

.field-note {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: #856404;
  background: #fff3cd;
  padding: 0.5rem;
  border-radius: 3px;
  border: 1px solid #ffeaa7;
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

.cancel-btn:hover {
  background: #5a6268;
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

/* Mobile styles */
@media (max-width: 768px) {
  .news-editor-modal {
    width: 95%;
    margin: 1rem 0;
  }
  
  .editor-header {
    padding: 1.5rem 1.5rem 1rem;
  }
  
  .news-form {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .editor-header h2 {
    font-size: 1.3rem;
  }
}
</style>
