<template>
  <div class="task-card" :class="{ done: task.done }">
    <label class="task-main">
      <input type="checkbox" class="checkbox" :checked="task.done" @change="$emit('toggle', task)" />
      <div class="task-texts">
        <div class="task-title">{{ task.title }}</div>
        <div class="task-desc" v-if="task.description">{{ task.description }}</div>
        <div class="task-due" :class="dueClass">
          📅 Fällig: {{ formattedDueDate }}
        </div>
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
    formattedDueDate() {
      if (!this.task.dueDate) return "kein Datum"
      return new Date(this.task.dueDate).toLocaleDateString('de-DE')
    },
    dueClass() {
      if (!this.task.dueDate) return ""
      const now = new Date()
      const due = new Date(this.task.dueDate)
      const diff = due - now
      if (diff < 0) return "overdue"
      if (diff < 1000*60*60*24) return "soon"
      return "intime"
    }
  }
}
</script>
