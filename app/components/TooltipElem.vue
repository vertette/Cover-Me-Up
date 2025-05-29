<script setup>
import { get, useElementByPoint, set, useEventListener, usePointer } from '@vueuse/core'

const { x, y } = usePointer({ type: 'client' })
const { element } = useElementByPoint({ x, y })

const tooltipUpsideDown = ref(false)
const tooltipContent = ref('Test')
const tooltipActive = ref(false)
const tooltipStyle = ref('')
const tooltipElem = ref(null)
const tooltipMargin = ref('')
const lastTooltipElem = ref(null)

onMounted(() => {
  watch(element, (newElement, oldElement) => {
    if (!get(element) || !newElement) return

    const tooltipOpacity = getComputedStyle(get(tooltipElem))['opacity']
    const oldTooltipTarget = (oldElement) ? get(oldElement).closest('[tooltip]:not(.active)') : null
    const tooltipTarget = get(element).closest('[tooltip]:not(.active)')
    if (tooltipTarget !== oldTooltipTarget) set(tooltipActive, false)
    if (!tooltipTarget || tooltipTarget === get(lastTooltipElem)) {
      set(lastTooltipElem, null)
      return
    }

    setTimeout(async () => {
      const target = get(element).closest('[tooltip]:not(.active)')
      if (!target || !target.getAttribute('tooltip')) return
      set(tooltipContent, target.getAttribute('tooltip'))
      await nextTick()

      const tooltipOffset = 16
      const tooltipLeft = target.getBoundingClientRect().x - (get(tooltipElem).getBoundingClientRect().width - target.getBoundingClientRect().width) / 2
      const tooltipTop = target.getBoundingClientRect().y - get(tooltipElem).getBoundingClientRect().height - tooltipOffset

      const tooltipMaxLeft = window.innerWidth - get(tooltipElem).getBoundingClientRect().width - tooltipOffset
      const tooltipClampLeft = clamp(tooltipOffset, tooltipLeft, tooltipMaxLeft)
      const tooltipMaxTop = tooltipTop < 0 ? target.getBoundingClientRect().bottom + get(tooltipElem).getBoundingClientRect().height - tooltipOffset : tooltipTop

      set(tooltipUpsideDown, target.getBoundingClientRect().y - get(tooltipElem).getBoundingClientRect().height - 16 < 0)
      if (tooltipLeft > tooltipMaxLeft) set(tooltipMargin, `margin-left: ${(tooltipLeft - tooltipMaxLeft) * (get(tooltipUpsideDown) ? -1 : 1)}px`)
      else if (tooltipLeft < 0) set(tooltipMargin, `margin-left: ${(tooltipLeft - tooltipOffset) * (get(tooltipUpsideDown) ? -1 : 1)}px`)
      else set(tooltipMargin, '')
      set(tooltipStyle, `left: ${tooltipClampLeft}px; top: ${tooltipMaxTop}px`)
      set(tooltipActive, true)
    }, tooltipOpacity * 200)
  })

  useEventListener(document, 'mousedown', (event) => {
    const tooltipTarget = event.target.closest('[tooltip]:not(.active)')
    if (tooltipTarget) {
      set(tooltipActive, false)
      set(lastTooltipElem, tooltipTarget)
    } else set(lastTooltipElem, null)
  })
})
</script>

<template>
  <div
    class="pointer-events-none fixed z-1000 block w-max opacity-0 transition-opacity select-none"
    :class="{ 'opacity-100': tooltipActive, 'rotate-180': tooltipUpsideDown }"
    :style="tooltipStyle"
    ref="tooltipElem"
  >
    <p class="relative z-1 w-max rounded-md bg-slate-950 px-5 py-1 text-sm text-white" :class="{ 'rotate-180': tooltipUpsideDown }">{{ tooltipContent }}</p>
    <span class="pointer-events-none absolute bottom-0 left-1/2 z-0 size-3 -translate-x-1/2 translate-y-1/2 -rotate-45 bg-slate-950" :style="tooltipMargin"></span>
  </div>
</template>
