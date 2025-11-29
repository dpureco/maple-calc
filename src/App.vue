<script setup>
import { ref, provide, onMounted } from 'vue'
import Navigation from './components/Navigation.vue'
import CubingCalculator from './components/cubing/CubingCalculator.vue'
import StarforceCalculator from './components/starforce/StarforceCalculator.vue'

const isDark = ref(false)
const currentView = ref('cubing')

provide('isDark', isDark)

// Check for saved theme and view preferences
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    // Check system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  updateTheme()

  const savedView = localStorage.getItem('currentView')
  if (savedView) {
    currentView.value = savedView
  }
})

function toggleTheme() {
  isDark.value = !isDark.value
  updateTheme()
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function updateTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)
}

function handleNavigate(view) {
  currentView.value = view
  localStorage.setItem('currentView', view)
}

const viewTitle = {
  cubing: 'Cubing Probability Calculator',
  starforce: 'Starforce Cost Calculator'
}
</script>

<template>
  <div class="app-wrapper">
    <header class="header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="title">MapleCalc</h1>
          <p class="subtitle">{{ viewTitle[currentView] }}</p>
        </div>
        <div class="header-actions">
          <Navigation :currentView="currentView" @navigate="handleNavigate" />
          <button
            @click="toggleTheme"
            class="theme-toggle"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <CubingCalculator v-if="currentView === 'cubing'" />
      <StarforceCalculator v-else-if="currentView === 'starforce'" />
    </main>

    <footer class="footer">
      <p>Calculation logic based on community research and data</p>
    </footer>
  </div>
</template>

<style>
/* CSS Variables for theming */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  --text-primary: #212529;
  --text-secondary: #495057;
  --text-tertiary: #6c757d;
  --border-color: #dee2e6;
  --accent-color: #0d6efd;
  --accent-hover: #0a58ca;
  --success-color: #198754;
  --success-bg: #d1e7dd;
  --card-bg: #ffffff;
  --input-bg: #ffffff;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.dark {
  --bg-primary: #1a1d20;
  --bg-secondary: #212529;
  --bg-tertiary: #343a40;
  --text-primary: #f8f9fa;
  --text-secondary: #dee2e6;
  --text-tertiary: #adb5bd;
  --border-color: #495057;
  --accent-color: #0d6efd;
  --accent-hover: #3d8bfd;
  --success-color: #198754;
  --success-bg: #0f5132;
  --card-bg: #212529;
  --input-bg: #343a40;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.2s, color 0.2s;
}

.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header Styles */
.header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.header-text {
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
  font-weight: 400;
}

.theme-toggle {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: var(--border-color);
  transform: scale(1.05);
}

.theme-toggle:active {
  transform: scale(0.98);
}

.theme-icon {
  font-size: 1.25rem;
  display: block;
}

/* Main Content */
.main-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Footer */
.footer {
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 1.5rem;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-text {
    width: 100%;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .main-content {
    padding: 1.5rem 1rem;
  }

  .theme-toggle {
    padding: 0.4rem 0.6rem;
  }

  .theme-icon {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0.75rem;
  }

  .title {
    font-size: 1.25rem;
  }

  .subtitle {
    font-size: 0.8rem;
  }

  .main-content {
    padding: 1rem 0.75rem;
  }
}
</style>
