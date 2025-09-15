import { createApp } from 'vue'   // Vue-Framework importieren, um eine App zu starten
import App from './App.vue'       // Haupt-Komponente "App.vue" laden
import './index.css'              // Tailwind-CSS-Datei laden
import './style.css'              // Eigene zusätzliche Styles laden

// Die App erstellen und an das HTML-Element mit id="app" hängen
createApp(App).mount('#app')
