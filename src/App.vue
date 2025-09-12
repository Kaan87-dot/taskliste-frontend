<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6 text-center">📝 Meine Taskliste</h1>

    <!-- Neue Aufgabe hinzufügen -->
    <form @submit.prevent="addTask" class="flex gap-2 mb-6">
      <input
        v-model="newTitle"
        placeholder="Neue Aufgabe"
        class="flex-1 border rounded-lg p-2"
      />
      <input
        v-model="newDescription"
        placeholder="Beschreibung"
        class="flex-1 border rounded-lg p-2"
      />
      <button
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Hinzufügen
      </button>
    </form>

    <!-- Aufgabenliste -->
    <div v-if="tasks.length" class="space-y-3">
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="toggleTask"
        @delete="deleteTask"
      />
    </div>
    <p v-else class="text-gray-500 text-center">Keine Aufgaben vorhanden.</p>
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
      api: import.meta.env.VITE_API_URL || 'http://localhost:8080/tasks'
    }
  },
  methods: {
    async fetchTasks() {
      const res = await fetch(this.api)
      this.tasks = await res.json()
    },
    async addTask() {
      if (!this.newTitle.trim()) return
      const res = await fetch(this.api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: this.newTitle,
          description: this.newDescription,
          done: false
        })
      })
      const task = await res.json()
      this.tasks.push(task)
      this.newTitle = ''
      this.newDescription = ''
    },
    async toggleTask(task) {
      await fetch(`${this.api}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      })
    },
    async deleteTask(id) {
      await fetch(`${this.api}/${id}`, { method: 'DELETE' })
      this.tasks = this.tasks.filter(t => t.id !== id)
    }
  },
  mounted() {
    this.fetchTasks()
  }
}
</script>