<script setup lang="ts">
// Router view will handle navigation
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  overflow-x: hidden;
}

#app {
  width: 100%;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Mobile-first responsive design */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}
</style>
