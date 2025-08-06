<!-- src/components/TaskItem.vue -->
<template>
  <li class="task-item">
    <h3>{{ task.title }}</h3>
    <p>{{ task.description }}</p>
    <label>
      <input type="checkbox" :checked="task.done" disabled />
      erledigt
    </label>
  </li>
</template>

<script setup>
defineProps({ task: Object })
</script>

<style scoped>
.task-item {
  border-bottom: 1px solid #ccc;
  padding: 10px 0;
}
</style>
