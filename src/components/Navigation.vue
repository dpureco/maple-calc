<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  currentView: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['navigate'])

function navigate(view) {
  emit('navigate', view)
}
</script>

<template>
  <nav class="navigation">
    <div class="nav-links">
      <button
        @click="navigate('cubing')"
        class="nav-link"
        :class="{ active: currentView === 'cubing' }"
      >
        Cubing
      </button>
      <button
        @click="navigate('starforce')"
        class="nav-link"
        :class="{ active: currentView === 'starforce' }"
      >
        Starforce
      </button>
    </div>
  </nav>
</template>

<style scoped>
.navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  background-color: var(--bg-tertiary);
  padding: 0.25rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.nav-link {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.nav-link.active {
  color: var(--text-primary);
  background-color: var(--card-bg);
  box-shadow: var(--shadow);
}

.nav-link:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .nav-links {
    width: 100%;
  }

  .nav-link {
    flex: 1;
    padding: 0.4rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
