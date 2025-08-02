<template>
  <div class="content-editor-overlay" @click="closeEditor">
    <div class="content-editor" @click.stop>
      <div class="editor-header">
        <h2>Edit {{ sectionTitle }}</h2>
        <button @click="closeEditor" class="close-btn">&times;</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="editor-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <!-- Hero Section Fields -->
        <div v-if="section === 'hero'" class="form-section">
          <div class="form-group">
            <label for="featuredImage">Featured Image</label>
            <div class="image-upload-group" @click="heroImageInput?.click()">
              <input 
                type="file" 
                ref="heroImageInput"
                @change="handleImageUpload"
                accept="image/*"
                class="file-input"
                style="display: none;"
              />
              <div v-if="form.featuredImageUrl" class="image-preview">
                <img :src="form.featuredImageUrl" alt="Featured Image Preview" />
                <button type="button" @click.stop="removeImage" class="remove-image-btn">&times;</button>
              </div>
              <div v-else class="upload-placeholder">
                <span>📷</span>
                <p>Click to upload featured image</p>
              </div>
            </div>
          </div>
          
          <!-- Gallery Images Section -->
          <div class="gallery-images-section">
            <h3>Gallery Images for Homepage ({{ form.galleryImages?.length || 0 }}/5)</h3>
            <p class="gallery-description">Upload up to 5 images for the homepage gallery slider</p>
            
            <div class="gallery-grid">
              <div 
                v-for="(image, index) in displayGallerySlots" 
                :key="index" 
                class="gallery-slot"
                :class="{ 'has-image': image.url, 'empty-slot': !image.url }"
              >
                <div v-if="image.url" class="gallery-image-preview">
                  <img :src="image.url" :alt="`Gallery Image ${index + 1}`" />
                  <div class="gallery-image-overlay">
                    <button 
                      type="button" 
                      @click="removeGalleryImage(index)" 
                      class="remove-gallery-btn"
                      title="Remove Image"
                    >
                      🗑️
                    </button>
                    <span class="image-number">{{ index + 1 }}</span>
                  </div>
                </div>
                <div v-else class="gallery-upload-placeholder" @click="() => galleryImageInputs[index]?.click()">
                  <input 
                    type="file" 
                    :ref="(el) => setGalleryImageRef(el as HTMLInputElement, index)"
                    @change="(event) => handleGalleryImageUpload(event, index)"
                    accept="image/*"
                    style="display: none;"
                  />
                  <span class="upload-icon">🖼️</span>
                  <p>Upload Image {{ index + 1 }}</p>
                </div>
              </div>
            </div>
            
            <div class="gallery-controls">
              <button 
                type="button" 
                @click="addGalleryImage" 
                :disabled="(form.galleryImages?.length || 0) >= 5"
                class="add-gallery-btn"
              >
                ➕ Add Gallery Image
              </button>
              <button 
                type="button" 
                @click="clearAllGalleryImages" 
                :disabled="!form.galleryImages?.length"
                class="clear-gallery-btn"
              >
                🗑️ Clear All Images
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="title">Hero Title</label>
            <input 
              type="text" 
              id="title"
              v-model="form.title" 
              placeholder="Welcome to Lagusan Coffee Sky Deck"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="subtitle">Hero Subtitle</label>
            <textarea 
              id="subtitle"
              v-model="form.subtitle" 
              placeholder="Experience the perfect blend of premium coffee and breathtaking views"
              rows="3"
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="primaryButtonText">Primary Button Text</label>
            <input 
              type="text" 
              id="primaryButtonText"
              v-model="form.primaryButtonText" 
              placeholder="View Our Menu"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="secondaryButtonText">Secondary Button Text</label>
            <input 
              type="text" 
              id="secondaryButtonText"
              v-model="form.secondaryButtonText" 
              placeholder="Visit Us"
              required
            />
          </div>
        </div>
        
        <!-- About Section Fields -->
        <div v-if="section === 'about'" class="form-section">
          <div class="form-group">
            <label for="aboutFeaturedImage">Featured Image</label>
            <div class="image-upload-group" @click="aboutImageInput?.click()">
              <input 
                type="file" 
                ref="aboutImageInput"
                @change="handleImageUpload"
                accept="image/*"
                class="file-input"
                style="display: none;"
              />
              <div v-if="form.featuredImageUrl" class="image-preview">
                <img :src="form.featuredImageUrl" alt="Featured Image Preview" />
                <button type="button" @click.stop="removeImage" class="remove-image-btn">&times;</button>
              </div>
              <div v-else class="upload-placeholder">
                <span>📷</span>
                <p>Click to upload featured image</p>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="title">About Title</label>
            <input 
              type="text" 
              id="title"
              v-model="form.title" 
              placeholder="About Lagusan Coffee Sky Deck"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="description1">First Paragraph</label>
            <textarea 
              id="description1"
              v-model="form.description1" 
              placeholder="First paragraph of the about section..."
              rows="4"
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="description2">Second Paragraph</label>
            <textarea 
              id="description2"
              v-model="form.description2" 
              placeholder="Second paragraph of the about section..."
              rows="4"
              required
            ></textarea>
          </div>
          
          <div class="features-section">
            <h3>Features</h3>
            <div v-for="(feature, index) in form.features" :key="index" class="feature-group">
              <div class="feature-image-section">
                <label>Feature {{ index + 1 }} Image</label>
                <div class="feature-image-upload" @click="() => featureImageInputs[index]?.click()">
                  <input 
                    type="file" 
                    :ref="(el) => setFeatureImageRef(el as HTMLInputElement, index)"
                    @change="(event) => handleFeatureImageUpload(event, index)"
                    accept="image/*"
                    style="display: none;"
                  />
                  <div v-if="feature.imageUrl" class="feature-image-preview">
                    <img :src="feature.imageUrl" :alt="`Feature ${index + 1} Image`" />
                    <button type="button" @click.stop="removeFeatureImage(index)" class="remove-feature-image-btn">&times;</button>
                  </div>
                  <div v-else class="feature-upload-placeholder">
                    <span>🖼️</span>
                    <p>Click to upload feature image</p>
                  </div>
                </div>
              </div>
              
              <div class="feature-content-section">
                <div class="form-group">
                  <label>Feature {{ index + 1 }} Title</label>
                  <input 
                    type="text" 
                    v-model="feature.title" 
                    placeholder="Premium Coffee"
                    required
                    class="feature-title-input"
                  />
                </div>
                
                <div class="form-group">
                  <label>Feature {{ index + 1 }} Description</label>
                  <textarea 
                    v-model="feature.description" 
                    placeholder="Expertly sourced and roasted beans..."
                    rows="4"
                    required
                    class="feature-description-input"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="closeEditor" class="cancel-btn">Cancel</button>
          <button type="submit" :disabled="isSubmitting" class="submit-btn">
            {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { getContent, saveContent, uploadFile } from '../firebase/services'

const props = defineProps({
  section: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

// Template refs
const heroImageInput = ref<HTMLInputElement>()
const aboutImageInput = ref<HTMLInputElement>()

const isSubmitting = ref(false)
const error = ref('')

// Create refs for feature image inputs
const featureImageInputs = ref<Record<number, HTMLInputElement>>({})
// Create refs for gallery image inputs
const galleryImageInputs = ref<Record<number, HTMLInputElement>>({})

const setFeatureImageRef = (el: HTMLInputElement | null, index: number) => {
  if (el) {
    featureImageInputs.value[index] = el
  }
}

const setGalleryImageRef = (el: HTMLInputElement | null, index: number) => {
  if (el) {
    galleryImageInputs.value[index] = el
  }
}

const sectionTitle = computed(() => {
  switch (props.section) {
    case 'hero': return 'Hero Section'
    case 'about': return 'About Section'
    default: return 'Content'
  }
})

const form = reactive({
  // Hero fields
  title: '',
  subtitle: '',
  primaryButtonText: '',
  secondaryButtonText: '',
  featuredImageUrl: '',
  galleryImages: [] as string[],
  
  // About fields
  description1: '',
  description2: '',
  features: [
    { imageUrl: '', title: 'Premium Coffee', description: 'Expertly sourced and roasted beans from around the world' },
    { imageUrl: '', title: 'Sky Deck Views', description: 'Breathtaking panoramic views of the city skyline' },
    { imageUrl: '', title: 'Perfect Ambiance', description: 'Modern design meets comfort in our elevated space' }
  ]
})

// Computed property for gallery display slots (always show 5 slots)
const displayGallerySlots = computed(() => {
  const slots = []
  for (let i = 0; i < 5; i++) {
    slots.push({
      url: form.galleryImages[i] || '',
      index: i
    })
  }
  return slots
})

const loadContent = async () => {
  try {
    const result: any = await getContent(props.section)
    if (result.success && result.content) {
      // Load existing content
      Object.assign(form, result.content)
      console.log(`Loaded content for ${props.section}:`, result.content)
    } else {
      console.log(`No existing content for ${props.section}, using defaults`)
      // Set default values based on section
      if (props.section === 'hero') {
        form.title = 'Welcome to Lagusan Coffee Sky Deck'
        form.subtitle = 'Experience the perfect blend of premium coffee and breathtaking views'
        form.primaryButtonText = 'View Our Menu'
        form.secondaryButtonText = 'Visit Us'
        form.galleryImages = []
      } else if (props.section === 'about') {
        form.title = 'About Lagusan Coffee Sky Deck'
        form.description1 = 'Nestled high above the bustling city, Lagusan Coffee Sky Deck offers an unparalleled coffee experience where exceptional brews meet breathtaking panoramic views. Our carefully curated selection of premium coffee beans from around the world is expertly roasted to perfection.'
        form.description2 = 'Whether you\'re starting your morning with a perfect espresso or unwinding with friends over our signature blends, our sky deck provides the perfect ambiance for every coffee moment. Come experience coffee culture elevated to new heights.'
      }
    }
  } catch (err) {
    console.error('Error loading content:', err)
  }
}

const closeEditor = () => {
  emit('close')
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    isSubmitting.value = true
    console.log('Uploading image:', file.name)
    
    const result = await uploadFile(file, 'content-images')
    
    if (result.success && result.url) {
      form.featuredImageUrl = result.url
      console.log('Image uploaded successfully:', result.url)
    } else {
      error.value = 'Failed to upload image. Please try again.'
    }
  } catch (err) {
    console.error('Error uploading image:', err)
    error.value = 'Error uploading image. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const removeImage = () => {
  form.featuredImageUrl = ''
}

const handleFeatureImageUpload = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    isSubmitting.value = true
    console.log('Uploading feature image:', file.name)
    
    const result = await uploadFile(file, 'feature-images')
    
    if (result.success && result.url) {
      form.features[index].imageUrl = result.url
      console.log('Feature image uploaded successfully:', result.url)
      error.value = '' // Clear any previous errors
    } else {
      error.value = 'Failed to upload feature image. Please try again.'
    }
  } catch (err) {
    console.error('Error uploading feature image:', err)
    error.value = 'Error uploading feature image. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const removeFeatureImage = (index: number) => {
  form.features[index].imageUrl = ''
}

// Gallery image management methods
const handleGalleryImageUpload = async (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    isSubmitting.value = true
    console.log('Uploading gallery image:', file.name)
    
    const result = await uploadFile(file, 'gallery-images')
    
    if (result.success && result.url) {
      // Ensure galleryImages array has enough slots
      while (form.galleryImages.length <= index) {
        form.galleryImages.push('')
      }
      form.galleryImages[index] = result.url
      console.log('Gallery image uploaded successfully:', result.url)
      error.value = '' // Clear any previous errors
    } else {
      error.value = 'Failed to upload gallery image. Please try again.'
    }
  } catch (err) {
    console.error('Error uploading gallery image:', err)
    error.value = 'Error uploading gallery image. Please try again.'
  } finally {
    isSubmitting.value = false
    // Reset the input
    target.value = ''
  }
}

const removeGalleryImage = (index: number) => {
  if (form.galleryImages[index]) {
    form.galleryImages[index] = ''
    // Clean up empty trailing slots
    while (form.galleryImages.length > 0 && form.galleryImages[form.galleryImages.length - 1] === '') {
      form.galleryImages.pop()
    }
  }
}

const addGalleryImage = () => {
  if (form.galleryImages.length < 5) {
    const nextIndex = form.galleryImages.length
    galleryImageInputs.value[nextIndex]?.click()
  }
}

const clearAllGalleryImages = () => {
  form.galleryImages = []
}

const handleSubmit = async () => {
  error.value = ''
  isSubmitting.value = true
  
  try {
    // Validate required fields
    if (!form.title.trim()) {
      error.value = 'Title is required'
      return
    }
    
    // Prepare data based on section
    let contentData: any = {}
    
    if (props.section === 'hero') {
      contentData = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        primaryButtonText: form.primaryButtonText.trim(),
        secondaryButtonText: form.secondaryButtonText.trim(),
        featuredImageUrl: form.featuredImageUrl,
        galleryImages: form.galleryImages.filter(url => url.trim() !== '') // Remove empty URLs
      }
    } else if (props.section === 'about') {
      contentData = {
        title: form.title.trim(),
        description1: form.description1.trim(),
        description2: form.description2.trim(),
        featuredImageUrl: form.featuredImageUrl,
        features: form.features.map(f => ({
          imageUrl: f.imageUrl,
          title: f.title.trim(),
          description: f.description.trim()
        }))
      }
    }
    
    const result = await saveContent(props.section, contentData)
    
    if (result.success) {
      // Emit event to refresh the corresponding component
      if (props.section === 'about') {
        window.dispatchEvent(new CustomEvent('aboutContentUpdated'))
      } else if (props.section === 'hero') {
        window.dispatchEvent(new CustomEvent('heroContentUpdated'))
      }
      
      emit('save')
    } else {
      error.value = 'Failed to save content. Please try again.'
    }
  } catch (err) {
    console.error('Error saving content:', err)
    error.value = 'An error occurred while saving. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadContent()
})
</script>

<style scoped>
.content-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.content-editor {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.editor-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.editor-form {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #8B4513;
  box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.1);
}

.image-upload-group {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
  position: relative;
}

.image-upload-group:hover {
  border-color: #8B4513;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 1;
}

.upload-placeholder {
  padding: 2rem;
  color: #666;
  pointer-events: none;
}

.upload-placeholder span {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.upload-placeholder p {
  margin: 0;
  font-size: 1rem;
}

.image-preview {
  position: relative;
  display: inline-block;
  max-width: 300px;
  pointer-events: none;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}

.remove-image-btn:hover {
  background: #c82333;
}

.features-section {
  margin-top: 2rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.features-section h3 {
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.5rem;
  text-align: center;
  border-bottom: 3px solid #8B4513;
  padding-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.feature-group {
  margin-bottom: 3rem;
  padding: 2rem;
  border: 2px solid #dee2e6;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  align-items: start;
}

.feature-group:last-child {
  margin-bottom: 0;
}

.feature-image-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-image-section label {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.feature-image-upload {
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-image-upload:hover {
  border-color: #8B4513;
  background: #f8f9fa;
}

.feature-upload-placeholder {
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.feature-upload-placeholder span {
  font-size: 2.5rem;
}

.feature-upload-placeholder p {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.feature-image-preview {
  position: relative;
  display: inline-block;
  width: 100%;
}

.feature-image-preview img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.remove-feature-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-feature-image-btn:hover {
  background: #c82333;
}

.feature-content-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feature-title-input {
  font-weight: 700 !important;
  font-size: 1.3rem !important;
  padding: 1rem !important;
  border: 2px solid #e9ecef !important;
}

.feature-description-input {
  min-height: 120px !important;
  font-size: 1.1rem !important;
  line-height: 1.6 !important;
  padding: 1rem !important;
  border: 2px solid #e9ecef !important;
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 0.8rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.cancel-btn,
.submit-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #545b62;
}

.submit-btn {
  background: #8B4513;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #654321;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Gallery Images Styles */
.gallery-images-section {
  margin-top: 2rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.gallery-images-section h3 {
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 1.5rem;
  text-align: center;
  border-bottom: 3px solid #8B4513;
  padding-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.gallery-description {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-style: italic;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.gallery-slot {
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.gallery-slot.has-image {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.gallery-slot.empty-slot {
  border: 2px dashed #ddd;
}

.gallery-image-preview {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.gallery-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-image-preview:hover img {
  transform: scale(1.05);
}

.gallery-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-image-preview:hover .gallery-image-overlay {
  opacity: 1;
}

.remove-gallery-btn {
  background: #dc3545;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  margin-right: 0.5rem;
}

.remove-gallery-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

.image-number {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.gallery-upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
  padding: 1rem;
  text-align: center;
}

.gallery-upload-placeholder:hover {
  background: rgba(139, 69, 19, 0.05);
  color: #8B4513;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.gallery-upload-placeholder p {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.gallery-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.add-gallery-btn,
.clear-gallery-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-gallery-btn {
  background: #28a745;
  color: white;
}

.add-gallery-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
}

.add-gallery-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.clear-gallery-btn {
  background: #dc3545;
  color: white;
}

.clear-gallery-btn:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-2px);
}

.clear-gallery-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .content-editor {
    width: 95%;
    margin: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .feature-group {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-image-upload {
    min-height: 120px;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .gallery-controls {
    flex-direction: column;
  }
  
  .add-gallery-btn,
  .clear-gallery-btn {
    justify-content: center;
  }
}
</style>
