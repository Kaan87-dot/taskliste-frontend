<template>
  <!-- Task-Karte: bekommt extra Klasse 'done', wenn Aufgabe erledigt ist -->
  <div class="task-card" :class="{ done: task.done }">

    <!-- Hauptbereich mit Checkbox und Text -->
    <label class="task-main">
      <!-- Checkbox: zeigt Status (done) an, sendet "toggle"-Event bei Änderung -->
      <input 
        type="checkbox" 
        class="checkbox" 
        :checked="task.done" 
        @change="$emit('toggle', task)" 
      />

      <!-- Titel, Beschreibung, Fälligkeitsdatum -->
      <div class="task-texts">
        <div class="task-title">{{ task.title }}</div>
        <!-- Beschreibung nur anzeigen, wenn vorhanden -->
        <div class="task-desc" v-if="task.description">{{ task.description }}</div>
        <!-- Fälligkeitsdatum mit dynamischer Farbe (intime, soon, overdue) -->
        <div class="task-due" :class="dueClass">
          📅 Fällig: {{ formattedDueDate }}
        </div>
      </div>
    </label>

    <!-- Aktionen (z. B. Löschen) -->
    <div class="task-actions">
      <button 
        class="icon-btn icon-trash" 
        title="Löschen" 
        @click="$emit('delete', task.id)"
      >🗑️</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskItem', // Name der Komponente
  props: { 
    task: { type: Object, required: true } // Task wird vom Elternteil übergeben
  },
  computed: {
    // Gibt Datum in deutschem Format zurück oder "kein Datum"
    formattedDueDate() {
      if (!this.task.dueDate) return "kein Datum"
      return new Date(this.task.dueDate).toLocaleDateString('de-DE')
    },
    // Bestimmt, welche CSS-Klasse die Deadline bekommt
    dueClass() {
      if (!this.task.dueDate) return ""
      const now = new Date()
      const due = new Date(this.task.dueDate)
      const diff = due - now
      if (diff < 0) return "overdue" // schon überfällig → rot
      if (diff < 1000*60*60*24) return "soon" // weniger als 1 Tag → gelb
      return "intime" // sonst → grün
    }
  }
}
</script>
