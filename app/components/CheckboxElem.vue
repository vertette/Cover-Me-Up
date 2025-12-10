<script setup>
const props = defineProps({ label: { type: String, required: false } })
const model = defineModel()
</script>

<template>
  <Checkbox :class="{ active: model }" @mousedown.left="model = !model" @keydown.enter="model = !model" tabindex="0" />
  <label v-if="label" @mousedown.left="model = !model">{{ label }}</label>
</template>
