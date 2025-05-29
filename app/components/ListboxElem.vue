<script setup>
import { vOnClickOutside } from '@vueuse/components'
import { get, set, useElementBounding, useEventListener } from '@vueuse/core'

const model = defineModel()
const props = defineProps({
  optionArray: {
    type: Array,
    required: true,
  },
})

const placeholder = computed(() => {
  return props.optionArray.find((option) => option.value === get(model)).name
})
const active = ref(false)
const hover = ref(false)

const keyboardControls = (e) => {
  if (get(active)) {
    let newHover = false

    if (e.code === `Key${e.key.toUpperCase()}`)
      newHover = getIndexByLetter(
        get(hover),
        props.optionArray.map((e) => (e.disabled ? null : e.name)),
        e.key.toUpperCase(),
      )
    else if (e.key === `ArrowDown`)
      newHover = getIndexByDir(
        get(hover),
        props.optionArray.map((e, i) => (e.disabled ? null : i)),
        1,
      )
    else if (e.key === `ArrowUp`)
      newHover = getIndexByDir(
        get(hover),
        props.optionArray.map((e, i) => (e.disabled ? null : i)),
        -1,
      )

    if (get(hover) !== false && e.key === `Enter`) {
      const hoverValue = props.optionArray[get(hover)].value
      setValue(hoverValue)
      menuClose()
    } else if (newHover !== false) set(hover, clamp(0, newHover, props.optionArray.length - 1))
  } else if (e.key === `Enter`) {
    menuToggle()
  }
}
const onMenuLeave = () => {
  const oldIndex = props.optionArray.findIndex((option) => option.value === get(model))
  set(hover, oldIndex)
}
const onOptionOver = (index) => {
  set(hover, index)
}
const onOptionLeave = () => {
  set(hover, false)
}
const menuOpen = () => {
  set(active, false)
}
const menuClose = () => {
  set(active, false)
}
const menuToggle = () => {
  set(active, !get(active))

  if (get(active) && get(model)) {
    const modelIndex = props.optionArray.findIndex((option) => option.value === get(model))
    set(hover, modelIndex)
  }
}
const setValue = (value) => {
  set(model, value)
  menuClose()
}

const listHeight = ref(1000)
const upsideDown = ref(false)
const listElem = useTemplateRef('listElem')
const listElemBound = reactive(useElementBounding(listElem))

const calcMaxHeight = () => {
  if (window.innerHeight - get(listElemBound).bottom < 128) {
    set(upsideDown, true)
    return
  }

  const listOffset = 32
  const maxHeight = window.innerHeight - get(listElemBound).bottom - listOffset
  set(listHeight, maxHeight)
}

onMounted(() => calcMaxHeight())
useEventListener(window, 'resize', () => calcMaxHeight())
</script>

<template>
  <Listbox :class="{ active, upsideDown }" @click.self="menuToggle" @keydown="keyboardControls" @blur="menuClose" v-on-click-outside="menuClose" tabindex="0" ref="listElem">
    <ListboxPlaceholder>
      <slot><span>{{ placeholder }}</span></slot>
    </ListboxPlaceholder>
    <ListboxMenu :style="`min-width: ${listElemBound.width}px; max-height: ${listHeight}px;`" @mouseleave="onMenuLeave" tooltip=''>
      <ListboxOption
        v-for="(option, index) in optionArray"
        :class="{ hover: hover === index }"
        :disabled="option.disabled"
        :value="option.value"
        @click.self="setValue(option.value)"
        @mouseover="onOptionOver(index)"
        @mouseleave="onOptionLeave"
      >
        <span>{{ option.name }}</span>
      </ListboxOption>
    </ListboxMenu>
  </Listbox>
</template>
