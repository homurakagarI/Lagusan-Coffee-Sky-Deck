<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button @click="closeModal" class="close-btn" aria-label="Close">&times;</button>
      </div>
      
      <div class="modal-body">
        <slot></slot>
      </div>
      
      <div class="modal-footer" v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

defineProps({
  title: {
    type: String,
    default: 'Modal'
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  console.log('Close modal clicked');
  emit('close');
};

// Close on ESC key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    console.log('Escape key pressed');
    closeModal();
  }
};

onMounted(() => {
  console.log('Modal mounted - adding ESC key listener');
  window.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  console.log('Modal unmounted - removing ESC key listener');
  window.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #8B4513;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #333;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (max-width: 768px) {
  .modal-content {
    max-width: calc(100% - 2rem);
    margin: 0 1rem;
  }
  
  .modal-header, 
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
}
</style>

