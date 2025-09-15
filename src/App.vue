<template>
  <div class="page">
    <div class="container">

      <!-- HEADER: Titel + kleine Statistik -->
      <header class="header">
        <h1>🧠 Meine Taskliste</h1>
        <div class="stats">
          <span>{{ openCount }} offen</span> <!-- Anzahl unerledigter Tasks -->
          <span>•</span>
          <span>{{ tasks.length }} gesamt</span> <!-- Gesamtanzahl Tasks -->
        </div>
      </header>

      <!-- FORTSCHRITTSBALKEN -->
      <div class="progress">
        <!-- grüne Leiste wächst mit erledigten Aufgaben -->
        <div class="bar" :style="{ width: progress + '%' }"></div>
        <span class="progress-label">{{ progress }}%</span>
      </div>

      <!-- FORMULAR: Neue Aufgabe hinzufügen -->
      <section class="form add-form" @submit.prevent="addTask">
        <form>
          <!-- Eingabefelder -->
          <input class="input" v-model="newTitle" placeholder="Neue Aufgabe" />
          <input class="input" v-model="newDescription" placeholder="Beschreibung" />

          <!-- Kategorie-Auswahl mit Emojis -->
          <select class="input" v-model="newCategory">
            <option value="📚">📚 Lernen</option>
            <option value="💼">💼 Arbeit</option>
            <option value="🏋️">🏋️ Sport</option>
            <option value="🍽️">🍽️ Kochen</option>
            <option value="🎮">🎮 Freizeit</option>
          </select>

          <!-- Datumsauswahl für Deadline -->
          <input class="input" type="date" v-model="newDueDate" />

          <!-- Button -->
          <button class="btn btn-primary" :disabled="adding || !newTitle.trim()">
            {{ adding ? 'Speichern…' : 'Hinzufügen' }}
          </button>
        </form>

        <!-- Fehlerausgabe -->
        <p v-if="error" class="error">Fehler: {{ error }}</p>
      </section>
 
      <!-- FILTER: Alle / Offen / Erledigt + Suche -->
      <section class="filters">
        <div class="filter-group">
          <button class="btn" :class="{ 'btn-active': filter==='all' }" @click="filter='all'">Alle</button>
          <button class="btn" :class="{ 'btn-active': filter==='open' }" @click="filter='open'">Offen</button>
          <button class="btn" :class="{ 'btn-active': filter==='done' }" @click="filter='done'">Erledigt</button>
        </div>
        <input class="input search" v-model="q" placeholder="Suchen…" />
      </section>

      <!-- LISTE DER AUFGABEN -->
      <section class="list">
        <div v-if="loading" class="loading">Lade…</div>
        <template v-else>
          <!-- Transition-Effekt beim Einfügen/Löschen -->
          <transition-group name="fade" tag="div">
            <TaskItem
              v-for="t in visibleTasks"   <!-- Aufgaben mit v-for anzeigen -->
              :key="t.id"
              :task="t"
              @toggle="toggleTask"       <!-- Event: erledigt/unerledigt -->
              @delete="deleteTask"       <!-- Event: löschen -->
            />
          </transition-group>

          <!-- Falls keine Aufgaben -->
          <div v-if="!visibleTasks.length" class="empty">
            <p class="empty-title">Keine Aufgaben vorhanden.</p>
            <p class="empty-sub">Neue Aufgabe oben hinzufügen.</p>
          </div>
        </template>
      </section>

      <!-- FOOTER: Zitat + Datum + Uhrzeit -->
      <footer class="footer">
        <p>{{ randomQuote }}</p> <!-- Zufälliges Motivationszitat -->
        <p>📅 {{ today }}</p>    <!-- Heutiges Datum -->
        <p class="fact">🕒 Uhrzeit: {{ now }}</p> <!-- Echtzeit-Uhr -->
      </footer>
    </div>
  </div>
</template>

<script>
import TaskItem from './components/TaskItem.vue'

export default {
  components: { TaskItem },
  data() {
    return {
      tasks: [],            // Liste aller Aufgaben
      newTitle: '',         // Eingabe: Titel
      newDescription: '',   // Eingabe: Beschreibung
      newCategory: '📚',    // Eingabe: Kategorie (Standard: Lernen)
      newDueDate: '',       // Eingabe: Deadline
      q: '',                // Suchfeld
      filter: 'all',        // Filterstatus: all | open | done
      loading: false,       // Ladeanzeige
      adding: false,        // Status beim Speichern
      error: '',            // Fehlernachricht
      api: import.meta.env.VITE_API_URL, // Backend-URL

      // Motivationszitate
      quotes: [
        "🚀 Du schaffst das!",
        "🔥 Weiter so, Champion!",
        "💡 Jeder Task bringt dich weiter!",
        "🎯 Fokus: Ziel erreichen!",
        "✨ Kleine Schritte, große Wirkung!"
      ],
      randomQuote: "", // zufälliges Zitat
      today: new Date().toLocaleDateString('de-DE', { weekday:'long', year:'numeric', month:'long', day:'numeric' }),
      now: new Date().toLocaleTimeString('de-DE') // Uhrzeit
    }
  },
  computed: {
    // Anzahl unerledigter Aufgaben
    openCount() { return this.tasks.filter(t => !t.done).length },

    // Fortschritt in %
    progress() {
      if (!this.tasks.length) return 0
      return Math.round((this.tasks.filter(t => t.done).length / this.tasks.length) * 100)
    },

    // Gefilterte und gesuchte Liste
    visibleTasks() {
      const q = this.q.trim().toLowerCase()
      let list = this.tasks
      if (this.filter === 'open') list = list.filter(t => !t.done)
      if (this.filter === 'done') list = list.filter(t =>  t.done)
      if (q) {
        list = list.filter(t =>
          (t.title || '').toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
        )
      }
      return list
    }
  },
  methods: {
    // Aufgaben vom Backend holen
    async fetchTasks() {
      this.loading = true
      this.error = ''
      try {
        const res = await fetch(this.api)
        if (!res.ok) throw new Error(`GET ${res.status}`)
        this.tasks = await res.json()
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    // Neue Aufgabe speichern
    async addTask() {
      if (!this.newTitle.trim()) return
      this.adding = true
      this.error = ''
      try {
        const res = await fetch(this.api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: this.newCategory + " " + this.newTitle.trim(),
            description: this.newDescription.trim(),
            done: false,
            dueDate: this.newDueDate || null
          })
        })
        if (!res.ok) throw new Error(`POST ${res.status}`)
        const task = await res.json()
        this.tasks.unshift(task) // Neue Aufgabe oben einfügen
        this.newTitle = ''
        this.newDescription = ''
        this.newDueDate = ''
      } catch (e) {
        this.error = e.message
      } finally {
        this.adding = false
      }
    },

    // Aufgabe erledigt/unerledigt
    async toggleTask(task) {
      const old = { ...task }
      task.done = !task.done
      try {
        const res = await fetch(`${this.api}/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        })
        if (!res.ok) throw new Error(`PUT ${res.status}`)
      } catch (e) {
        Object.assign(task, old) // Fehler → zurücksetzen
        this.error = e.message
      }
    },

    // Aufgabe löschen
    async deleteTask(id) {
      const idx = this.tasks.findIndex(t => t.id === id)
      if (idx === -1) return
      const removed = this.tasks[idx]
      this.tasks.splice(idx, 1)
      try {
        const res = await fetch(`${this.api}/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error(`DELETE ${res.status}`)
      } catch (e) {
        this.tasks.splice(idx, 0, removed) // Fehler → wieder einfügen
        this.error = e.message
      }
    }
  },
  mounted() {
    // Zitat zufällig auswählen
    this.randomQuote = this.quotes[Math.floor(Math.random()*this.quotes.length)]
    // Uhrzeit jede Sekunde aktualisieren
    setInterval(() => {
      this.now = new Date().toLocaleTimeString('de-DE')
    }, 1000)
    // Aufgaben laden
    this.fetchTasks()
  }
}
</script>
