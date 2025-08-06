<!-- src/App.vue -->
<template>
  <h1>Taskliste</h1>
  <ul>
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
    />
  </ul>
</template>

<script setup>
import { ref } from 'vue'
import TaskItem from './components/TaskItem.vue'

const tasks = ref([
  { id: 1, title: 'Test', description: 'Beispiel-Task', done: false },
  { id: 2, title: 'Noch ein Task', description: 'Beschreibung', done: true }
])
</script>
