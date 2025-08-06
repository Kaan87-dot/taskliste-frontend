<script setup>
import { ref, onMounted } from 'vue'
import TaskItem from './components/TaskItem.vue'

const tasks = ref([])

onMounted(async () => {
  const response = await fetch('https://taskliste-backend.onrender.com/tasks')
  tasks.value = await response.json()
})
</script>

<template>
  <h1>Taskliste</h1>
  <ul>
    <TaskItem v-for="task in tasks" :key="task.id" :task="task" />
  </ul>
</template>
