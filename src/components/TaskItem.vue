<template>
  <div class="task-card" :class="{ done: task.done }">
    <label class="task-main">
      <input type="checkbox" class="checkbox" :checked="task.done" @change="$emit('toggle', task)" />
      <div class="task-texts">
        <div class="task-title">{{ task.title }}</div>
        <div class="task-desc" v-if="task.description">{{ task.description }}</div>
      </div>
    </label>
    <div class="task-actions">
      <button class="btn btn-danger" @click="$emit('delete', task.id)">🗑️</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskItem',
  props: { task: { type: Object, required: true } }
}
</script>
