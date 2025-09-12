<template>
  <div class="task-card" :class="{ done: task.done }">
    <label class="task-main">
      <input type="checkbox" class="checkbox" :checked="task.done" @change="$emit('toggle', task)" />
      <div class="task-texts">
        <div class="task-title">{{ emoji }} {{ task.title }}</div>
        <div class="task-desc" v-if="task.description">{{ task.description }}</div>
      </div>
    </label>
    <div class="task-actions">
      <button class="icon-btn icon-trash" title="Löschen" @click="$emit('delete', task.id)">🗑️</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskItem',
  props: { task: { type: Object, required: true } },
  computed: {
    emoji() {
      // leichte Spielerei; deterministisch aus der ID
      const list = ['✅','🧠','🔥','⚡','📝','📌','🚀','📚','🎯','🌟']
      const i = typeof this.task.id === 'number' ? this.task.id : String(this.task.id || '').length
      return list[i % list.length]
    }
  }
}
</script>
