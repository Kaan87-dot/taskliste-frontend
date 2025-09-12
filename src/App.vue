<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <h1>📝 Meine Taskliste</h1>
        <div class="stats">
          <span>{{ openCount }} offen</span>
          <span>•</span>
          <span>{{ tasks.length }} gesamt</span>
        </div>
      </header>

      <section class="form add-form" @submit.prevent="addTask">
        <form>
          <input class="input" v-model="newTitle" placeholder="Neue Aufgabe" />
          <input class="input" v-model="newDescription" placeholder="Beschreibung" />
          <button class="btn btn-primary" :disabled="adding || !newTitle.trim()">
            {{ adding ? 'Speichern…' : 'Hinzufügen' }}
          </button>
        </form>
        <p v-if="error" class="error">Fehler: {{ error }}</p>
      </section>

      <section class="filters">
        <div class="filter-group">
          <button
            class="btn"
            :class="{ 'btn-active': filter==='all' }"
            @click="filter='all'">Alle</button>
          <button
            class="btn"
            :class="{ 'btn-active': filter==='open' }"
            @click="filter='open'">Offen</button>
          <button
            class="btn"
            :class="{ 'btn-active': filter==='done' }"
            @click="filter='done'">Erledigt</button>
        </div>
        <input class="input search" v-model="q" placeholder="Suchen…" />
      </section>

      <section class="list">
        <div v-if="loading" class="loading">Lade…</div>

        <template v-else>
          <TaskItem
            v-for="t in visibleTasks"
            :key="t.id"
            :task="t"
            @toggle="toggleTask"
            @delete="deleteTask"
          />

          <div v-if="!visibleTasks.length" class="empty">
            <p class="empty-title">Keine Aufgaben vorhanden.</p>
            <p class="empty-sub">Neue Aufgabe oben hinzufügen.</p>
          </div>
        </template>
      </section>
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
      q: '',
      filter: 'all',     // 'all' | 'open' | 'done'
      loading: false,
      adding: false,
      error: '',
      api: import.meta.env.VITE_API_URL  // keine Fallback-URL
    }
  },
  computed: {
    openCount() {
      return this.tasks.filter(t => !t.done).length
    },
    visibleTasks() {
      const q = this.q.trim().toLowerCase()
      let list = this.tasks
      if (this.filter === 'open') list = list.filter(t => !t.done)
      if (this.filter === 'done') list = list.filter(t => t.done)
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
    async fetchTasks() {
      this.loading = true
      this.error = ''
      try {
        if (!this.api) throw new Error('VITE_API_URL ist nicht gesetzt')
        const res = await fetch(this.api)
        if (!res.ok) throw new Error(`GET ${res.status}`)
        this.tasks = await res.json()
      } catch (e) {
        this.error = e.message || String(e)
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
            title: this.newTitle.trim(),
            description: this.newDescription.trim(),
            done: false
          })
        })
        if (!res.ok) throw new Error(`POST ${res.status}`)
        const task = await res.json()
        this.tasks.push(task)
        this.newTitle = ''
        this.newDescription = ''
      } catch (e) {
        this.error = e.message || String(e)
      } finally {
        this.adding = false
      }
    },
    async toggleTask(task) {
      // Optimistic UI
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
        Object.assign(task, old) // rollback
        this.error = e.message || String(e)
      }
    },
    async deleteTask(id) {
      const idx = this.tasks.findIndex(t => t.id === id)
      if (idx === -1) return
      const removed = this.tasks[idx]
      // Optimistic UI
      this.tasks.splice(idx, 1)
      try {
        const res = await fetch(`${this.api}/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error(`DELETE ${res.status}`)
      } catch (e) {
        // rollback
        this.tasks.splice(idx, 0, removed)
        this.error = e.message || String(e)
      }
    }
  },
  mounted() {
    this.fetchTasks()
  }
}
</script>
