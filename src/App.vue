<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <h1>🧠 Meine Taskliste</h1>
        <div class="stats">
          <span>{{ openCount }} offen</span>
          <span>•</span>
          <span>{{ tasks.length }} gesamt</span>
        </div>
      </header>

      <!-- Fortschrittsbalken -->
      <div class="progress">
        <div class="bar" :style="{ width: progress + '%' }"></div>
        <span class="progress-label">{{ progress }}%</span>
      </div>

      <!-- Neue Aufgabe -->
      <section class="form add-form" @submit.prevent="addTask">
        <form>
          <input class="input" v-model="newTitle" placeholder="Neue Aufgabe" />
          <input class="input" v-model="newDescription" placeholder="Beschreibung" />
          <select class="input" v-model="newCategory">
            <option value="📚">📚 Lernen</option>
            <option value="💼">💼 Arbeit</option>
            <option value="🏋️">🏋️ Sport</option>
            <option value="🍽️">🍽️ Kochen</option>
            <option value="🎮">🎮 Freizeit</option>
          </select>
          <button class="btn btn-primary" :disabled="adding || !newTitle.trim()">
            {{ adding ? 'Speichern…' : 'Hinzufügen' }}
          </button>
        </form>
        <p v-if="error" class="error">Fehler: {{ error }}</p>
      </section>

      <!-- Filter -->
      <section class="filters">
        <div class="filter-group">
          <button class="btn" :class="{ 'btn-active': filter==='all' }" @click="filter='all'">Alle</button>
          <button class="btn" :class="{ 'btn-active': filter==='open' }" @click="filter='open'">Offen</button>
          <button class="btn" :class="{ 'btn-active': filter==='done' }" @click="filter='done'">Erledigt</button>
          <select class="btn" v-model="sort">
            <option value="created-desc">Neueste</option>
            <option value="created-asc">Älteste</option>
            <option value="title-asc">Titel A–Z</option>
            <option value="title-desc">Titel Z–A</option>
          </select>
        </div>
        <input class="input search" v-model="q" placeholder="Suchen…" />
      </section>

      <!-- Aufgabenliste -->
      <section class="list">
        <div v-if="loading" class="loading">Lade…</div>
        <template v-else>
          <transition-group name="fade" tag="div">
            <TaskItem
              v-for="t in visibleSorted"
              :key="t.id"
              :task="t"
              @toggle="toggleTask"
              @delete="deleteTask"
            />
          </transition-group>
          <div v-if="!visibleSorted.length" class="empty">
            <p class="empty-title">Keine Aufgaben vorhanden.</p>
            <p class="empty-sub">Neue Aufgabe oben hinzufügen.</p>
          </div>
        </template>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <p>{{ randomQuote }}</p>
        <p>📅 {{ today }}</p>
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
      tasks: [],
      newTitle: '',
      newDescription: '',
      newCategory: '📚',
      q: '',
      filter: 'all',
      sort: 'created-desc',
      loading: false,
      adding: false,
      error: '',
      api: import.meta.env.VITE_API_URL,
      quotes: [
        "🚀 Du schaffst das!",
        "🔥 Weiter so, Champion!",
        "💡 Jeder Task bringt dich weiter!",
        "🎯 Fokus: Ziel erreichen!",
        "✨ Kleine Schritte, große Wirkung!"
      ],
      randomQuote: "",
      today: new Date().toLocaleDateString('de-DE', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    }
  },
  computed: {
    openCount() { return this.tasks.filter(t => !t.done).length },
    progress() {
      if (!this.tasks.length) return 0
      return Math.round((this.tasks.filter(t => t.done).length / this.tasks.length) * 100)
    },
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
    },
    visibleSorted() {
      const list = [...this.visibleTasks]
      switch (this.sort) {
        case 'title-asc':  return list.sort((a,b)=> (a.title||'').localeCompare(b.title||''))
        case 'title-desc': return list.sort((a,b)=> (b.title||'').localeCompare(a.title||''))
        case 'created-asc':  return list.sort((a,b)=> (a.id||0) - (b.id||0))
        case 'created-desc':
        default:             return list.sort((b.id||0) - (a.id||0))
      }
    }
  },
  methods: {
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
            done: false
          })
        })
        if (!res.ok) throw new Error(`POST ${res.status}`)
        const task = await res.json()
        this.tasks.unshift(task)
        this.newTitle = ''
        this.newDescription = ''
      } catch (e) {
        this.error = e.message
      } finally {
        this.adding = false
      }
    },
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
        Object.assign(task, old)
        this.error = e.message
      }
    },
    async deleteTask(id) {
      const idx = this.tasks.findIndex(t => t.id === id)
      if (idx === -1) return
      const removed = this.tasks[idx]
      this.tasks.splice(idx, 1)
      try {
        const res = await fetch(`${this.api}/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error(`DELETE ${res.status}`)
      } catch (e) {
        this.tasks.splice(idx, 0, removed)
        this.error = e.message
      }
    }
  },
  mounted() {
    this.randomQuote = this.quotes[Math.floor(Math.random()*this.quotes.length)]
    this.fetchTasks()
  }
}
</script>
