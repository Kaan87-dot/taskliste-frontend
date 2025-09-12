<template>
  <div
    class="flex items-center justify-between bg-gray-50 shadow-sm p-3 rounded-lg hover:bg-gray-100"
  >
    <div class="flex items-center gap-3">
      <input type="checkbox" v-model="task.done" @change="$emit('toggle', task)" />
      <div>
        <p
          :class="{
            'line-through text-gray-400': task.done,
            'font-semibold': !task.done
          }"
        >
          {{ task.title }}
        </p>
        <p class="text-sm text-gray-600">{{ task.description }}</p>
      </div>
    </div>
    <button
      class="text-red-500 hover:text-red-700"
      @click="$emit('delete', task.id)"
    >
      🗑️
    </button>
  </div>
</template>

<script>
export default {
  props: { task: Object }
}
</script>
