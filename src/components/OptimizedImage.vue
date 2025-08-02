<template>
  <div class="optimized-image-container" :class="{ loading: isLoading }">
    <img
      ref="imageRef"
      :src="imageSrc"
      :alt="alt"
      :class="imageClass"
      @load="handleLoad"
      @error="handleError"
      :loading="lazyLoad ? 'lazy' : 'eager'"
    />
    <div v-if="isLoading" class="image-placeholder">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  src: string
  alt: string
  lazyLoad?: boolean
  placeholder?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  lazyLoad: true,
  placeholder: '',
  class: ''
})

const imageRef = ref<HTMLImageElement>()
const isLoading = ref(true)
const hasError = ref(false)

const imageSrc = computed(() => {
  return props.src
})

const imageClass = computed(() => {
  return `optimized-image ${props.class} ${isLoading.value ? 'loading' : ''} ${hasError.value ? 'error' : ''}`
})

const handleLoad = () => {
  isLoading.value = false
  hasError.value = false
}

const handleError = () => {
  isLoading.value = false
  hasError.value = true
  console.warn(`Failed to load image: ${props.src}`)
}

onMounted(() => {
  // Check if image is already loaded (cached)
  if (imageRef.value?.complete && imageRef.value?.naturalHeight !== 0) {
    handleLoad()
  }
})
</script>

<style scoped>
.optimized-image-container {
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
}

.optimized-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  
  /* High quality rendering */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: high-quality;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.optimized-image.loading {
  opacity: 0;
}

.optimized-image:not(.loading) {
  opacity: 1;
}

.optimized-image.error {
  opacity: 0.5;
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #8B4513;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* High-DPI display optimization */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .optimized-image {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* Mobile optimization */
@media (max-width: 768px) {
  .optimized-image {
    image-rendering: auto;
  }
}
</style>
