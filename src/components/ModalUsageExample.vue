<template>
  <div>
    <button @click="showModal = true" class="open-modal-btn">Open Modal</button>
    
    <!-- Modal will only render when showModal is true -->
    <PreOrderModal 
      v-if="showModal" 
      title="Sample Modal" 
      @close="handleClose"
    >
      <p>This is the modal content</p>
      
      <template #footer>
        <button @click="showModal = false" class="cancel-btn">Cancel</button>
        <button @click="handleAction" class="action-btn">Submit</button>
      </template>
    </PreOrderModal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PreOrderModal from './PreOrderModal.vue';

// Controls modal visibility
const showModal = ref(false);

const handleAction = () => {
  console.log('Action performed');
  showModal.value = false;
};

const handleClose = () => {
  console.log('Modal close event received');
  showModal.value = false;
};
</script>

<style scoped>
.open-modal-btn {
  background: #8B4513;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn, .action-btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.action-btn {
  background: #28a745;
  color: white;
}
</style>
