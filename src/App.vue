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

      <div class="progress"><div class="bar" :style="{ width: progress + '%' }"></div></div>

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
          <button class="btn" :class="{ 'btn-active': filter==='all' }"  @click="filter='all'">Alle</button>
          <button class="btn" :class="{ 'btn-active': filter==='open' }" @click="filter='open'">Offen</button>
          <button class="btn" :class="{ 'btn-active': filter==='done' }" @click="filter='done'">Erledigt</button>
          <select class="btn" v-model="sort">
            <option value="created-desc">Neueste</option>
            <option value="created-asc">Älteste</option>
            <option value="title-asc">Titel A–Z</option>
            <option value="title-desc">Titel Z–A</option>
          </select>
          <button class="btn" @click="clearDone" :disabled="!hasDone">Erledigte löschen</button>
          <button class="btn" @click="markAllDone" :disabled="!hasOpen">Alle erledigen</button>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <input class="input search" v-model="q" placeholder="Suchen…" />
          <button class="btn" @click="toggleDark">{{ dark ? '☀️' : '🌙' }}</button>
        </div>
      </section>

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
      filter: 'all',         // 'all' | 'open' | 'done'
      sort: 'created-desc',  // Sortiermodus
      loading: false,
      adding: false,
      error: '',
      api: import.meta.env.VITE_API_URL,
      dark: false,
      celebrated: false      // für Konfetti einmalig bei 100%
    }
  },
  computed: {
    openCount() { return this.tasks.filter(t => !t.done).length },
    hasDone()   { return this.tasks.some(t =>  t.done) },
    hasOpen()   { return this.tasks.some(t => !t.done) },
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
        default:             return list.sort((a,b)=> (b.id||0) - (a.id||0))
      }
    }
  },
  watch: {
    progress(p) {
      if (p === 100 && this.tasks.length && !this.celebrated) {
        this.celebrated = true
        this.confetti()
        setTimeout(()=> this.celebrated = false, 4000)
      }
    }
  },
  methods: {
    toggleDark() {
      this.dark = !this.dark
      document.documentElement.style.filter = this.dark ? 'invert(1) hue-rotate(180deg)' : ''
    },
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
        this.tasks.unshift(task)
        this.newTitle = ''
        this.newDescription = ''
      } catch (e) {
        this.error = e.message || String(e)
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
        this.error = e.message || String(e)
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
        this.error = e.message || String(e)
      }
    },
    async clearDone() {
      const done = this.tasks.filter(t => t.done).map(t => t.id)
      for (const id of done) await this.deleteTask(id)
    },
    async markAllDone() {
      const open = this.tasks.filter(t => !t.done)
      for (const t of open) await this.toggleTask(t)
    },
    // sehr kleines Konfetti ohne Lib
    confetti() {
      const end = Date.now() + 1000
      const colors = ['#bb86fc','#03dac6','#22c55e','#f472b6','#f59e0b','#60a5fa']
      const go = () => {
        const el = document.createElement('div')
        const size = 6 + Math.random()*10
        el.style.position='fixed'
        el.style.width=size+'px'; el.style.height=size+'px'
        el.style.borderRadius='2px'
        el.style.left=(Math.random()*100)+'vw'
        el.style.top='-10px'
        el.style.background = colors[Math.floor(Math.random()*colors.length)]
        el.style.zIndex=9999
        el.style.pointerEvents='none'
        el.style.transform=`rotate(${Math.random()*360}deg)`
        document.body.appendChild(el)
        const x = (-50 + Math.random()*100)
        const y = window.innerHeight + 40
        el.animate([
          { transform:`translate(0,0) rotate(0deg)` },
          { transform:`translate(${x}vw, ${y}px) rotate(720deg)` }
        ], { duration: 1200 + Math.random()*600, easing:'cubic-bezier(.2,.7,.2,1)' })
        setTimeout(()=> el.remove(), 1800)
        if (Date.now() < end) requestAnimationFrame(go)
      }
      go()
    }
  },
  mounted() { this.fetchTasks() }
}
</script>
