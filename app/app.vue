<script setup>
import { vOnClickOutside } from '@vueuse/components'
import { get, set, reactiveComputed, useEventListener } from '@vueuse/core'
import { useSortable } from '@vueuse/integrations/useSortable'
import ListboxElem from './components/ListboxElem.vue'
import domToImage from 'dom-to-image'
import { Icon } from '@iconify/vue'

const cmsArray = [
  { name: 'Custom', value: 'custom' },
  { name: 'GOG', value: 'gog' },
  { name: 'Itch.io', value: 'itch' },
  /* { name: 'Nintendo eShop (US)', value: 'eshop_us' },
  { name: 'Nintendo eShop (EU/AU)', value: 'eshop_eu' },
  { name: 'Nintendo eShop (JP)', value: 'eshop_jp' }, */
  { name: 'Steam', value: 'steam' },
]
const cmsResFullArray = {
  custom: [{ name: 'Byte size', value: '256x256' }],
  steam: [
    { name: 'Header capsule *', value: '920x430' },
    { name: 'Small capsule *', value: '462x174' },
    { name: 'Main capsule *', value: '1232x706' },
    { name: 'Vertical capsule *', value: '748x896' },
    { name: 'Page background', value: '1438x810' },
    { name: 'Bundle header', value: '707x232' },
    { name: 'Community icon *', value: '184x184' },
    { name: 'Library header capsule *', value: '920x430x' },
    { name: 'Library capsule *', value: '600x900' },
    { name: 'Library header *', value: '3840x1240' },
    { name: 'Library logo *', value: '1280x720' },
    { name: 'Event header', value: '1920x622' },
    { name: 'Event cover *', value: '800x450' },
  ],
  gog: [
    { name: 'Logo *', value: '1600x740' },
    { name: 'Galaxy background *', value: '2560x670' },
    { name: 'Main art banner *', value: '1600x740x' },
    { name: 'Product card banner *', value: '1540x270' },
    { name: 'Box *', value: '342x482' },
    { name: 'Icon round *', value: '128x128' },
    { name: 'Icon square *', value: '128x128x' },
    { name: 'Web icon *', value: '98x98' },
    { name: 'Galaxy banner *', value: '1540x270x' },
    { name: 'News banner *', value: '1550x490' },
    { name: 'Desktop takeover', value: '2560x360' },
    { name: 'Mobile takeover', value: '960x570' },
    { name: 'Promo spot', value: '444x740' },
    { name: 'Desktop promo page', value: '2560x423' },
    { name: 'Mobile promo page', value: '767x472' },
    { name: 'Newsletter background', value: '2560x2560' },
    { name: 'Facebook post', value: '1200x630' },
    { name: 'Instagram post', value: '1200x1200' },
    { name: 'X (Twitter) post', value: '1200x675' },
  ],
  itch: [{ name: 'Cover image *', value: '630x500' }],
  eshop_us: [
    { name: 'Game icon *', value: '1024x1024' },
    { name: 'eShop Banner', value: '1920x1080' },
  ],
  eshop_eu: [
    { name: 'Game icon *', value: '1024x1024' },
    { name: 'eShop Banner', value: '1920x1080' },
    { name: '2x1 *', value: '2000x1000' },
    { name: '16x9 *', value: '1920x1080x' },
    { name: '1x1 *', value: '1080x1080' },
    { name: 'AOC 1x1', value: '1080x1080' },
    { name: '16x9', value: '1080x1920' },
  ],
  eshop_jp: [
    { name: 'Game icon *', value: '1024x1024' },
    { name: 'eShop Banner', value: '1920x1080' },
    { name: 'Square Hero Banner Banner', value: '1024x1024' },
  ],
}
const cmsModel = ref(cmsArray[cmsArray.length - 1]['value'])
const cmsResModel = ref(cmsResFullArray[get(cmsModel)][0].value)
let cmsResArray = computed(() => cmsResFullArray[get(cmsModel)])
const cmsResModelWidth = computed(() => parseFloat(get(cmsResModel).split('x')[0]))
const cmsResModelHeight = computed(() => parseFloat(get(cmsResModel).split('x')[1]))
const cmsLayerArray = reactive({})
const oldCmsModel = ref(get(cmsModel))
const oldCmsResModel = ref(get(cmsResModel))
const pushToCmsLayerArray = () => {
  const oldCmsName = get(oldCmsModel)
  const oldCmsRes = get(oldCmsResModel)
  const layerArraySnapshot = [...toRaw(layerArray)]

  if (JSON.stringify(layerArraySnapshot) !== JSON.stringify([structuredClone(layerDefault)])) {
    if (cmsLayerArray[oldCmsName] === undefined) {
      const oldModelObject = {}
      oldModelObject[oldCmsRes] = layerArraySnapshot
      cmsLayerArray[oldCmsName] = oldModelObject
    } else cmsLayerArray[oldCmsName][oldCmsRes] = layerArraySnapshot
    cmsLayerArray['default'] = layerArraySnapshot
  } else cmsLayerArray['default'] = [structuredClone(layerDefault)]

  const newModelRes = get(cmsResModel)
  const newModelName = get(cmsModel)

  if (cmsLayerArray[newModelName]?.[newModelRes]) {
    layerArray.length = 0
    cmsLayerArray[newModelName][newModelRes].forEach((layer) => layerArray.push(structuredClone(toRaw(layer))))
  } else {
    layerArray.length = 0
    cmsLayerArray['default'].forEach((layer) => layerArray.push(structuredClone(toRaw(layer))))
  }
}
watch(cmsModel, (_, oldModel) => {
  set(oldCmsModel, get(oldModel))
  set(cmsResModel, cmsResFullArray[get(cmsModel)][0].value)
})
watch(cmsResModel, (_, oldModel) => {
  set(oldCmsResModel, get(oldModel))
  pushToCmsLayerArray()
  if (!get(isExporting)) calculateResponsiveZoomScale()
})
useEventListener(window, 'resize', () => {
  calculateResponsiveZoomScale()
})

const resFormElem = useTemplateRef('resFormElem')
const isValidForm = (formElem) => {
  if (!get(formElem)) return
  let submitThisForm = true

  get(formElem)
    .querySelectorAll('input')
    .forEach((child) => {
      child.classList.remove('invalid')
      if (!child.checkValidity()) {
        submitThisForm = false
        child.classList.add('invalid')
      }
    })
  return submitThisForm
}

const cmsCustomResArray = ref(null)
const modifyResolutions = () => {
  if (!isValidForm(resFormElem)) return

  const newCustomResArray = get(cmsCustomResArray).map((res, index) => ({
    name: resFormElem.value.querySelectorAll('input')[index * 2].value.trim() || `Custom ${index + 1}`,
    value: resFormElem.value.querySelectorAll('input')[index * 2 + 1].value.trim()
  }))

  // Process duplicates by appending 'x' to resolution values
  const usedValues = new Set()
  const processedResArray = newCustomResArray.map((res, index) => {
    let newValue = res.value
    // Count the number of 'x' characters at the end of the current value
    const currentXCount = (newValue.match(/x+$/) || [''])[0].length
    // Base value is the resolution without trailing 'x' characters
    const baseValue = newValue.replace(/x+$/, '')

    // Check for duplicates, excluding the current index
    let maxXCount = 0
    newCustomResArray.forEach((otherRes, otherIndex) => {
      if (otherIndex !== index) {
        const otherBaseValue = otherRes.value.replace(/x+$/, '')
        if (otherBaseValue === baseValue) {
          const xCount = (otherRes.value.match(/x+$/) || [''])[0].length
          maxXCount = Math.max(maxXCount, xCount)
        }
      }
    })

    // Also check existing resolutions in cmsResFullArray.custom
    cmsResFullArray.custom.forEach((existingRes) => {
      const existingBaseValue = existingRes.value.replace(/x+$/, '')
      if (existingBaseValue === baseValue) {
        const xCount = (existingRes.value.match(/x+$/) || [''])[0].length
        maxXCount = Math.max(maxXCount, xCount)
      }
    })

    // If the base value is already used, append enough 'x' characters to make it unique
    if (usedValues.has(baseValue) || maxXCount > 0) {
      const neededXCount = maxXCount + 1
      newValue = baseValue + 'x'.repeat(neededXCount)
    }

    usedValues.add(baseValue)
    return { name: res.name, value: newValue }
  })

  cmsResFullArray.custom = processedResArray
  const currentResValue = get(cmsResModel)
  const resolutionExists = processedResArray.some(res => res.value === currentResValue)

  if (!resolutionExists && get(cmsModel) === 'custom') set(cmsResModel, processedResArray[0].value)
  if (cmsLayerArray['custom']) {
    const validResolutions = processedResArray.map(res => res.value)
    for (const res of Object.keys(cmsLayerArray['custom'])) {
      if (!validResolutions.includes(res)) {
        delete cmsLayerArray['custom'][res]
      }
    }
  }

  // Update cmsResArray to reflect changes
  cmsResArray = computed(() => cmsResFullArray[get(cmsModel)])

  pushToCmsLayerArray()
  calculateResponsiveZoomScale()
  setModal()
}
const addResolution = () => {
  const newRes = { name: 'Placeholder', value: '256x256' }
  get(cmsCustomResArray).push(newRes)
}
const removeResolution = (index) => {
  if (confirm('Are you sure you want to delete this resolution?')) {
    // remove this resolution from layerArray
    const newResArray = get(cmsCustomResArray).slice(0, index)
    set(cmsCustomResArray, newResArray)
  }
}

const openInfoLink = () => {
  const infoLinkObject = {
    steam: 'https://partner.steamgames.com/doc/store/assets/standard',
    gog: 'https://docs.gog.com/basic-game-assets/',
    itch: 'https://itch.io/game/new',
  }
  downloadFile(infoLinkObject[get(cmsModel)], null, false)
}

const zoomScale = ref(100)
const setZoomScale = (add) => {
  set(zoomScale, clamp(5, zoomScale.value + add, 100))
}
const layerWrapperElem = useTemplateRef('layerWrapperElem')
const layerWrapperBound = reactive(useElementBounding(layerWrapperElem))
const calculateResponsiveZoomScale = async () => {
  await nextTick()
  let setToFull = true
  let responsiveScale

  const calculateWidth = () => {
    const layerWrapperWidth = get(layerWrapperBound).width - 32

    if (get(cmsResModelWidth) > layerWrapperWidth) {
      setToFull = false
      responsiveScale = layerWrapperWidth / get(cmsResModelWidth)
      responsiveScale = Math.floor((responsiveScale * 100) / 5) * 5
      set(zoomScale, responsiveScale)
    }
  }
  const calculateHeight = () => {
    const layerWrapperHeight = get(layerWrapperBound).height - 64

    if (get(cmsResModelHeight) > layerWrapperHeight) {
      setToFull = false
      responsiveScale = layerWrapperHeight / get(cmsResModelHeight)
      responsiveScale = Math.floor((responsiveScale * 100) / 5) * 5
      set(zoomScale, responsiveScale)
    }
  }

  if (get(cmsResModelHeight) >= get(cmsResModelWidth)) {
    calculateWidth()
    calculateHeight()
  } else {
    calculateHeight()
    calculateWidth()
  }
  if (setToFull) set(zoomScale, 100)
}

const inPreview = ref(false)
const previewToggle = () => {
  set(inPreview, !get(inPreview))
}

const downloadFile = async (content, name, convertToURL = true) => {
  const a = document.createElement('a')
  a.href = convertToURL ? URL.createObjectURL(content) : content
  if (name) a.download = name
  else a.target = '_blank'
  a.click()
}
const settingsInput = useTemplateRef('settingsInput')
const isValidLayer = (layer) => {
  return (
    layer &&
    typeof layer === 'object' &&
    'id' in layer &&
    'name' in layer &&
    (layer.bgImage === false || typeof layer.bgImage === 'number') &&
    typeof layer.displayNone === 'boolean' &&
    typeof layer.bgImageRepeat === 'string' &&
    typeof layer.bgBlendMode === 'string' &&
    typeof layer.bgImageHorSize === 'string' &&
    typeof layer.bgImageHorPos === 'string' &&
    typeof layer.bgImageVerSize === 'string' &&
    typeof layer.bgImageVerPos === 'string' &&
    typeof layer.bgGradientDeg === 'string' &&
    typeof layer.bgGradientFrom === 'string' &&
    typeof layer.bgGradientTo === 'string' &&
    typeof layer.bgGradient === 'boolean' &&
    typeof layer.bgOpacity === 'number' &&
    typeof layer.bgColor === 'string' &&
    typeof layer.bgHorFlip === 'boolean' &&
    typeof layer.bgVerFlip === 'boolean' &&
    typeof layer.bgRotate === 'number' &&
    typeof layer.locked === 'boolean'
  )
}
const loadSettings = (event) => {
  if (!(event.target.files && event.target.files[0])) return

  for (const file of event.target.files) {
    if (!file.type.startsWith('application/json')) {
      alert(`Couldn't read ${file.name}. Try uploading a JSON file?`)
      return
    }
    let reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => {
      try {
        const result = JSON.parse(reader.result)
        if (result.imgArray && Array.isArray(result.imgArray) && result.cmsLayerArray && typeof result.cmsLayerArray === 'object') {
          set(imgArray, result.imgArray)

          for (const key of Object.keys(cmsLayerArray)) delete cmsLayerArray[key]
          for (const [cms, res] of Object.entries(result.cmsLayerArray)) {
            if (cms === 'default') {
              cmsLayerArray['default'] = [...res]
              continue
            }

            for (const [resolution, layers] of Object.entries(res)) {
              if (!layers.every(isValidLayer)) continue
              cmsLayerArray[cms] = cmsLayerArray[cms] || {}
              cmsLayerArray[cms][resolution] = [...layers]
            }
          }

          const newModelName = Object.keys(result.cmsLayerArray)[0]
          const newModelRes = Object.keys(Object.values(result.cmsLayerArray)[0])[0]
          set(cmsModel, newModelName)
          set(cmsResModel, newModelRes)
          layerArray.length = 0
          result.cmsLayerArray[newModelName][newModelRes].forEach((layer) => layerArray.push(structuredClone(layer)))
          set(currentLayerId, layerArray[0].id)
          calculateResponsiveZoomScale()
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        alert(`Couldn't read ${file.name}. The JSON seems invalid or corrupted.`)
      }
    }
  }
}
const saveSettings = () => {
  if (get(imgArray).some((img) => img.includes('base64'))) if (!confirm('Are you sure? Your exported settings will include uploaded images, your file will be pretty damn big!')) return
  const layerArraySnapshot = [...toRaw(layerArray)]
  if (cmsLayerArray[get(cmsModel)] === undefined) {
    const modelObject = {}
    modelObject[get(cmsResModel)] = layerArraySnapshot
    cmsLayerArray[get(cmsModel)] = modelObject
  } else cmsLayerArray[get(cmsModel)][get(cmsResModel)] = layerArraySnapshot
  cmsLayerArray['default'] = layerArraySnapshot

  const settingsArray = { cmsLayerArray: toRaw(cmsLayerArray), imgArray: get(imgArray) }
  downloadFile(
    new Blob([JSON.stringify(settingsArray, null, 2)], {
      type: 'text/plain',
    }),
    'coverArtSettings.json',
  )
}
const isExporting = ref(false)
const exportModel = ref('')
const exportArray = [
  { name: 'This preset as .png', value: 'png' },
  { name: 'This preset as .jpg', value: 'jpg' },
  { name: `All platform presets as .png`, value: 'png_all' },
  { name: `All platform presets as .jpg`, value: 'jpg_all' },
]
watch(exportModel, () => {
  exportImage(get(exportModel))
  set(exportModel, '')
})
const exportImage = async (kind) => {
  const imageWrapperElem = get(layerWrapperElem).querySelector('.imageWrapperElem')
  set(isExporting, true)
  set(zoomScale, 100)

  if (kind.endsWith('_all')) {
    const resolutions = cmsResFullArray[get(cmsModel)]
    await nextTick()

    for (const resolution of resolutions) {
      set(cmsResModel, resolution.value)
      await nextTick()

      await new Promise((resolve) => setTimeout(resolve, 250))
      const imageName = cmsResFullArray[get(cmsModel)]
        .find((res) => res.value === get(cmsResModel))
        .name.replace(/\s\*$/m, '')
        .replace(/\s/, '-')
        .toLowerCase()
      const imageBlob = await domToImage.toBlob(imageWrapperElem, {
        width: get(cmsResModelWidth),
        height: get(cmsResModelHeight),
        style: {
          left: 0,
          top: 0,
        },
      })
      downloadFile(imageBlob, `cover-${get(cmsModel)}_${imageName}.${kind.split('_')[0]}`)
    }
  } else {
    const imageName = cmsResFullArray[get(cmsModel)]
      .find((res) => res.value === get(cmsResModel))
      .name.replace(/\s\*$/m, '')
      .replace(/\s/, '-')
      .toLowerCase()
    const imageBlob = await domToImage.toBlob(imageWrapperElem, {
      width: get(cmsResModelWidth),
      height: get(cmsResModelHeight),
      style: {
        left: 0,
        top: 0,
      },
    })
    downloadFile(imageBlob, `cover_${get(cmsModel)}_${imageName}.${kind}`)
  }

  await new Promise((resolve) => setTimeout(resolve, 250))
  calculateResponsiveZoomScale()
  set(isExporting, false)
}

const bgSettingsRepeatArray = [
  { name: "Don't repeat", value: 'no-repeat' },
  { name: 'Repeat horizontally', value: 'repeat-x' },
  { name: 'Repeat vertically', value: 'repeat-y' },
  { name: 'Repeat both directions', value: 'repeat' },
]
const bgSettingsBlendArray = [
  { name: 'Normal', value: 'normal' },
  { name: 'Multiply', value: 'multiply' },
  { name: 'Screen', value: 'screen' },
  { name: 'Overlay', value: 'overlay' },
  { name: 'Darken', value: 'darken' },
  { name: 'Lighten', value: 'lighten' },
  { name: 'Color dodge', value: 'color-dodge' },
  { name: 'Color burn', value: 'color-burn' },
  { name: 'Hard light', value: 'hard-light' },
  { name: 'Soft light', value: 'soft-light' },
  { name: 'Difference', value: 'difference' },
  { name: 'Exclusion', value: 'exclusion' },
  { name: 'Hue', value: 'hue' },
  { name: 'Saturation', value: 'saturation' },
  { name: 'Color', value: 'color' },
  { name: 'Luminosity', value: 'luminosity' },
]
const layerDefault = {
  id: Date.now(),
  name: 'Layer #1',
  displayNone: false,
  bgImageRepeat: 'no-repeat',
  bgBlendMode: 'normal',
  bgImageHorSize: '100%',
  bgImageHorPos: '50%',
  bgImageVerSize: 'auto',
  bgImageVerPos: '100%',
  bgOpacity: null,
  bgHorFlip: false,
  bgVerFlip: false,
  bgRotate: 0,
  bgImage: false,
  bgColor: '',
  bgGradientFrom: '',
  bgGradientTo: '',
  bgGradient: false,
  bgGradientDeg: '',
  locked: false,
}
const layerArray = reactive([structuredClone(layerDefault)])
const layerStyleArray = computed(() => {
  const array = []

  for (let i = 0; i < get(layerArray).length; i++) {
    const layer = get(layerArray)[i]
    let str = ``

    if (layer.displayNone) str += `display: none; `
    if (layer.bgColor) layer.bgGradient ? (str += `background-color: transparent; `) : (str += `background-color: ${layer.bgColor}; `)
    if (layer.bgGradient) str += `background-image: linear-gradient(${layer.bgGradientDeg}deg in oklab, ${layer.bgGradientFrom}, ${layer.bgGradientTo}); `
    else if (layer.bgImage !== false) str += `background-image: url(${get(imgArray)[layer.bgImage]}); `
    if (layer.bgImageHorPos) str += `background-position-x: calc(${layer.bgHorFlip ? `100% - ` : ``}${layer.bgImageHorPos}); `
    if (layer.bgImageVerPos) str += `background-position-y: calc(${layer.bgVerFlip ? `100% - ` : ``}${layer.bgImageVerPos}); `
    if (layer.bgImageRepeat) str += `background-repeat: ${layer.bgImageRepeat}; `
    if (layer.bgImageHorSize && layer.bgImageVerSize) str += `background-size: ${layer.bgImageHorSize} ${layer.bgImageVerSize}; `
    if (layer.bgBlendMode) str += `mix-blend-mode: ${layer.bgBlendMode}; `
    str += `scale: ${layer.bgHorFlip ? -1 : 1} ${layer.bgVerFlip ? -1 : 1}; `
    if (layer.bgOpacity && layer.bgOpacity < 100) str += `opacity: ${parseFloat(layer.bgOpacity / 100)}; `
    if (layer.bgRotate % 360 !== 0) str += `rotate: ${layer.bgRotate}deg; `
    array.push(str)
  }

  return array
})
const currentLayerId = ref(layerDefault.id)
const currentLayer = reactiveComputed(() => {
  return layerArray.find((layer) => layer.id === get(currentLayerId))
})

const urlFormElem = useTemplateRef('urlFormElem')
const fileInput = useTemplateRef('fileInput')
const addFileLink = ref(null)
const imgArray = ref([])
const addFile = (event) => {
  if (!(event.target.files && event.target.files[0])) return

  for (const file of event.target.files) {
    if (!file.type.startsWith('image/')) {
      alert(`Couldn't read ${file.name}. Is this supposed to be an image?`)
      continue
    }
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      try {
        const result = reader.result
        get(imgArray).push(result)
        currentLayer.bgImage = get(imgArray).length - 1
      } catch {
        alert(`Couldn't read ${file.name}. Is this supposed to be an image?`)
      }
    }
  }
}
const addFileFromLink = () => {
  if (!isValidForm(urlFormElem)) return
  get(imgArray).push(get(addFileLink))
  currentLayer.bgImage = get(imgArray).length - 1
  set(currentModal, null)
  set(addFileLink, null)
}
const removeFile = (index) => {
  if (confirm('Are you sure you want to delete this image?')) {
    const newImgArray = get(imgArray).slice(0, index)
    set(imgArray, newImgArray)

    layerArray.forEach((layer) => {
      if (layer.bgImage === index) layer.bgImage = false
    })
  }
}

const flipImage = async (direction) => {
  set(isExporting, true)
  if (direction === 0) currentLayer.bgHorFlip = !currentLayer.bgHorFlip
  else if (direction === 1) currentLayer.bgVerFlip = !currentLayer.bgVerFlip

  await nextTick()
  set(isExporting, false)
}

const addLayer = () => {
  const layerNew = structuredClone(layerDefault)
  const layerNewId = Date.now()
  layerNew.id = layerNewId
  if (/#([0-9])*$/m.test(get(layerArray)[get(layerArray).length - 1].name)) {
    const layerNewNumber = get(layerArray)[get(layerArray).length - 1].name.replace(/.*#([0-9])*$/, '$1')
    layerNew.name = `Layer #${parseInt(layerNewNumber) + 1}`
  }
  layerArray.push(layerNew)
  set(currentLayerId, layerNewId)
}

const layerArrayWrapper = useTemplateRef('layerArrayWrapper')
const isDragging = ref(false)
useSortable(layerArrayWrapper, layerArray, {
  onStart: (event) => onDragStart(event),
  onEnd: (event) => onDragEnd(event),
  forceFallback: true,
  easing: 'cubic-bezier(1, 0, 0, 1)',
  dragClass: '!cursor-grabbing',
  ghostClass: 'opacity-0',
  direction: 'vertical',
  swapThreshold: 0.75,
  handle: '.handle',
  group: 'Layers',
  animation: 250,
})
const onDragStart = () => {
  set(isDragging, false)
}
const onDragEnd = () => {
  set(isDragging, false)
}

const nameInputElem = useTemplateRef('nameInputElem')
const nameInputId = ref(false)

const setEditName = async (id) => {
  const nameInputIndex = layerArray.findIndex((layer) => layer.id === id)
  set(nameInputId, id)
  await nextTick()

  if (get(nameInputElem)[nameInputIndex]) get(nameInputElem)[nameInputIndex].focus()
}
const stopEditingName = async () => {
  set(nameInputId, false)
}

const removeLayer = (id) => {
  if (!confirm('Are you sure you want to delete this layer?')) return
  const layerIndex = layerArray.findIndex((layer) => layer.id === id)
  if (id === get(currentLayerId)) {
    const newLayerIndex = clamp(layerIndex !== 0 ? 0 : 1, layerIndex - 1, layerArray.length - 2)
    set(currentLayerId, layerArray[newLayerIndex].id || layerArray[0].id)
  }
  layerArray.splice(layerIndex, 1)
}

const currentModal = ref(null)
const setModal = (modal = null) => {
  if (!modal) {
    set(cmsCustomResArray, null)
    set(addFileLink, '')
  }
  if (modal === 'resModal') {
    const cmsResTempArray = structuredClone(cmsResFullArray.custom)
    // remove all the x's at the end of every value
    set(cmsCustomResArray, structuredClone(cmsResTempArray))
  }
  set(currentModal, modal)
}
</script>

<template>
  <div
    class="pointer-events-none fixed top-0 left-0 z-100 h-screen w-screen bg-slate-950/70 opacity-0 transition-opacity delay-150 duration-250"
    :class="{ '!pointer-events-auto !opacity-100 delay-[0s]': currentModal }"
    @click.left.self="setModal()"
  >
    <TransitionGroup name="modalList">
      <window v-if="currentModal === 'resModal'" class="fixed top-1/2 left-1/2 w-[min(512px,50vw)] -translate-1/2 shadow-2xl">
        <span class="font-bold">Modify the custom resolution presets</span>
        <form class="flex flex-col gap-2 2xl:gap-4" @submit.prevent="modifyResolutions" novalidate="true" ref="resFormElem">
          <div v-for="(customRes, index) in cmsCustomResArray" class="flex flex-row gap-2 2xl:gap-4">
            <div class="flex flex-1 flex-col gap-2 2xl:gap-4">
              <label v-if="index === 0">Name</label>
              <input minlength="1" :value="customRes.name" required />
            </div>
            <div class="flex flex-1 flex-col gap-2">
              <label v-if="index === 0">Resolution</label>
              <input placeholder="e.g. 128x128" minlength="3" pattern="[0-9]*x[0-9]*" :value="customRes.value" required />
            </div>
            <div class="flex flex-col justify-end">
              <button class="transparent smallest" @click.left.prevent="removeResolution(index)" :disabled="cmsCustomResArray.length === 1" tooltip="Remove this preset">
                <Icon icon="mdi:minus" class="size-3" />
              </button>
              <button class="transparent smallest" @click.left.prevent="addResolution()" tooltip="Add a new preset">
                <Icon icon="mdi:plus" class="size-3" />
              </button>
            </div>
          </div>
          <div class="flex justify-end gap-4">
            <button class="transparent" @click.prevent.left="setModal()">
              <span>Cancel</span>
            </button>
            <button class="alt" type="submit">
              <span>Save</span>
            </button>
          </div>
        </form>
      </window>
      <window v-if="currentModal === 'urlModal'" class="fixed top-1/2 left-1/2 w-[min(512px,50vw)] -translate-1/2 shadow-2xl">
        <span class="font-bold">Link an image</span>
        <label for="bgimgurl">URL</label>
        <form class="flex flex-col gap-2 2xl:gap-4" @submit.prevent="addFileFromLink" novalidate="true" ref="urlFormElem">
          <input v-model.trim="addFileLink" id="bgimgurl" placeholder="https://validwebsite.com/validimage.jpg" pattern=".*\.[A-Za-z]{3,}$" required />
          <div class="flex justify-end gap-4">
            <button class="transparent" @click.prevent.left="setModal()">
              <span>Cancel</span>
            </button>
            <button class="alt" type="submit">
              <span>Add</span>
            </button>
          </div>
        </form>
      </window>
    </TransitionGroup>
  </div>
  <header class="flex w-full flex-row items-stretch justify-between bg-slate-700 px-4 py-3 transition-all xl:px-6 xl:py-5" :class="{ 'bg-transparent': inPreview }">
    <div class="flex flex-row items-stretch gap-2 xl:gap-4">
      <ListboxElem :class="{ 'pointer-events-none opacity-0': inPreview === true }" :optionArray="cmsArray" v-model="cmsModel" tooltip="Change platform" />
      <ListboxElem :class="{ 'pointer-events-none opacity-0': inPreview === true }" :optionArray="cmsResArray" v-model="cmsResModel" tooltip="Change preset" />
      <TransitionGroup name="buttonList">
        <button v-if="cmsModel === 'custom'" class="alt" :class="{ 'pointer-events-none opacity-0': inPreview === true }" @click.left="setModal('resModal')" tooltip="Edit the custom presets">
          <Icon icon="mdi:monitor-screenshot" class="size-5" />
          <span class="hidden xl:inline">Edit</span>
        </button>
        <button v-if="cmsModel !== 'custom'" :class="{ 'pointer-events-none opacity-0': inPreview === true }" class="max-w-none overflow-hidden transition-all" @click.left="openInfoLink">
          <Icon icon="mdi:info" class="size-5" />
          <span class="hidden xl:inline">Info</span>
        </button>
      </TransitionGroup>
    </div>
    <div class="absolute left-1/2 flex -translate-x-1/2 flex-row items-stretch">
      <button class="rounded-r-none px-4" :disabled="zoomScale === 5" @click.left.exact="setZoomScale(-5)" @click.left.shift="setZoomScale(-10)" tooltip="Zoom out by 5% (hold shift for 10%)">
        <Icon icon="mdi:minus" class="size-5" />
      </button>
      <button class="-mx-[1px] min-w-20 rounded-none px-4" @click.left.exact="zoomScale = 100" @click.left.shift="calculateResponsiveZoomScale()" tooltip="Reset to 100% (hold shift to reset to fit)">
        <span>{{ zoomScale }}%</span>
      </button>
      <button class="rounded-l-none px-4" :disabled="zoomScale === 100" @click.left.exact="setZoomScale(5)" @click.left.shift="setZoomScale(10)" tooltip="Zoom in by 5% (hold shift for 10%)">
        <Icon icon="mdi:plus" class="size-5" />
      </button>
    </div>
    <div class="flex flex-row items-stretch gap-2 xl:gap-4">
      <div class="flex flex-row">
        <button class="rounded-r-none" @click.left="settingsInput.click()" tooltip="Load your settings">
          <input type="file" class="hidden" accept="application/json" @change="loadSettings" ref="settingsInput" />
          <Icon icon="mdi:file-upload-outline" class="size-5" />
          <span class="hidden xl:inline">Load</span>
        </button>
        <button class="-mx-[1px] rounded-l-none" @click.left="saveSettings" tooltip="Save your settings">
          <Icon icon="mdi:file-download-outline" class="size-5" />
          <span class="hidden xl:inline">Save</span>
        </button>
      </div>
      <button class="alt" @click.left="previewToggle" tooltip="Preview your image">
        <Icon icon="mdi:print-preview" class="size-5" />
        <span class="hidden xl:inline">Preview</span>
      </button>
      <ListboxElem class="right" :optionArray="exportArray" v-model="exportModel" tooltip="Export your image">
        <Icon icon="mdi:file-export-outline" class="size-5 xl:hidden" />
        <span class="hidden xl:inline">Export</span>
      </ListboxElem>
    </div>
  </header>
  <div class="relative flex-1 overflow-hidden" ref="layerWrapperElem">
    <div class="absolute top-1/2 left-1/2 -translate-1/2 overflow-hidden border-1 border-slate-300">
      <TransitionGroup
        :style="`width: ${Math.round(cmsResModelWidth * (zoomScale / 100))}px; height: ${Math.round(cmsResModelHeight * (zoomScale / 100))}px`"
        :class="{ 'transition-[height,_width]': !isExporting }"
        class="imageWrapperElem"
        type="transition"
        tag="div"
      >
        <figure
          v-for="(layer, index) in layerArray"
          :class="{ 'transition-[background-size,_background-color,_background-position]': !isExporting }"
          class="absolute h-full w-full interpolate-keywords"
          :style="layerStyleArray[index]"
          :key="layer.id"
        ></figure>
      </TransitionGroup>
    </div>
    <span :style="`margin-top: ${Math.round(cmsResModelHeight * ((zoomScale / 100) * 0.5)) + 18}px`" class="absolute top-1/2 left-1/2 -translate-1/2 transition-[margin]">
      {{ `Width: ${cmsResModelWidth}px, height: ${cmsResModelHeight}px` }}
    </span>
  </div>
  <div class="pointer-events-none absolute right-6 bottom-5 left-6 flex items-end justify-between gap-2 *:pointer-events-auto">
    <window class="w-88 2xl:w-96" :class="{ 'pointer-events-none opacity-0': inPreview === true }">
      <div class="flex items-baseline justify-between gap-8">
        <span class="font-bold">Background color</span>
        <div class="flex gap-1">
          <button class="transparent smallest group" :class="{ active: !currentLayer.bgGradient }" @click.left="currentLayer.bgGradient = false" :disabled="currentLayer.locked" tooltip="Solid">
            <span class="size-2 rounded-full bg-gray-200 group-disabled:opacity-50"></span>
          </button>
          <button class="transparent smallest group" :class="{ active: currentLayer.bgGradient }" @click.left="currentLayer.bgGradient = true" :disabled="currentLayer.locked" tooltip="Gradient">
            <span class="size-2 rounded-full bg-gradient-to-r from-gray-200 group-disabled:opacity-50"></span>
          </button>
        </div>
      </div>
      <div v-if="currentLayer.bgGradient" class="flex flex-col gap-4">
        <div class="flex space-x-4">
          <label for="bgfrom" class="flex-1">From</label>
          <label for="bgto" class="flex-1">To</label>
          <label for="bgdeg" class="flex-1">Degrees</label>
        </div>
        <div class="flex space-x-4">
          <input v-model="currentLayer.bgGradientFrom" name="bgfrom" placeholder="Red" :disabled="currentLayer.locked" />
          <input v-model="currentLayer.bgGradientTo" name="bgto" placeholder="Blue" :disabled="currentLayer.locked" />
          <input v-model="currentLayer.bgGradientDeg" name="bgdeg" class="w-full" placeholder="45" pattern="[0-9]*" :disabled="currentLayer.locked" />
        </div>
      </div>
      <label v-if="!currentLayer.bgGradient" for="bgcolor"><a href="https://css-tricks.com/almanac/properties/b/background-color/" target="_blank">Color (in any valid CSS value)</a></label>
      <input v-if="!currentLayer.bgGradient" v-model="currentLayer.bgColor" id="bgcolor" placeholder="Transparent" :disabled="currentLayer.locked" />
      <div class="flex items-baseline justify-between gap-8">
        <span class="font-bold">Background image</span>
        <div class="flex gap-1">
          <button class="transparent smallest" @click.left="fileInput.click()" tooltip="Upload an image">
            <input type="file" class="hidden" accept="image/png, image/webp, image/jpeg, image/jpg" multiple @change="addFile" ref="fileInput" />
            <Icon icon="mdi:file-upload" class="size-3" />
          </button>
          <button class="transparent smallest" @click.left="setModal('urlModal')" tooltip="Link an image">
            <Icon icon="mdi:file-link" class="size-3" />
          </button>
        </div>
      </div>
      <div class="w-full overflow-x-auto">
        <div class="flex w-fit gap-4">
          <figure
            v-if="!imgArray.length"
            class="flex size-12 items-center justify-center overflow-hidden rounded-lg border-1 border-gray-300/50 bg-slate-800 transition-colors hover:border-gray-300"
            tooltip="Upload or link to an image, maybe?"
          >
            <Icon icon="mdi:close" class="size-8" />
          </figure>
          <button
            v-for="(img, index) in imgArray"
            class="relative block size-12 cursor-pointer overflow-hidden rounded-lg border-1 border-gray-300/50 bg-slate-800 p-0 transition hover:border-gray-300 disabled:pointer-events-none disabled:opacity-50"
            :class="{ '!border-white': currentLayer.bgImage === index, '!border-gray-300': currentLayer.locked }"
            @click.left.self="currentLayer.bgImage = currentLayer.bgImage !== index ? index : false"
            :tooltip="currentLayer.bgImage === index ? 'Unset this as background image' : 'Set this as background image'"
            :disabled="currentLayer.locked"
          >
            <img class="pointer-events-none absolute top-0 left-0 h-full w-full object-cover object-center transition-opacity group-disabled:opacity-70" :src="img" />
            <button
              class="absolute top-0 right-0 flex size-4 items-center justify-center rounded-none rounded-bl-sm bg-gray-300 p-0 text-slate-950 opacity-100 transition-colors hover:text-slate-950/50"
              :class="{ 'bg-white': currentLayer.bgImage === index }"
              @click.left="removeFile(index)"
              tooltip="Delete this image"
            >
              <Icon icon="mdi:trash-can" class="size-3" />
            </button>
          </button>
        </div>
      </div>
      <div class="flex items-baseline justify-between gap-8">
        <span class="font-bold">Background settings</span>
        <div class="flex gap-1">
          <button class="transparent smallest" @click.left="flipImage(0)" :disabled="currentLayer.locked" tooltip="Mirror horizontally">
            <Icon icon="mdi:arrow-left-right" class="size-3" />
          </button>
          <button class="transparent smallest" @click.left="flipImage(1)" :disabled="currentLayer.locked" tooltip="Mirror vertically">
            <Icon icon="mdi:arrow-up-down" class="size-3" />
          </button>
          <button
            class="transparent smallest"
            @click.left.exact="currentLayer.bgRotate -= 15"
            @click.left.shift="currentLayer.bgRotate -= 45"
            :disabled="currentLayer.locked"
            tooltip="Rotate 15 deg counter-clockwise (hold shift for 45)"
          >
            <Icon icon="mdi:rotate-counter-clockwise" class="size-3" />
          </button>
          <button
            class="transparent smallest"
            @click.left.exact="currentLayer.bgRotate += 15"
            @click.left.shift="currentLayer.bgRotate += 45"
            :disabled="currentLayer.locked"
            tooltip="Rotate 15 deg clockwise (hold shift for 45)"
          >
            <Icon icon="mdi:rotate-clockwise" class="size-3" />
          </button>
        </div>
      </div>
      <div class="flex items-center gap-x-1">
        <label for="horizontal"><a href="https://css-tricks.com/almanac/properties/b/background-position/" target="_blank">Horizontal position</a></label>
        <button class="transparent smallest invisible h-0"></button>
        <label for="vertical"><a href="https://css-tricks.com/almanac/properties/b/background-position/" target="_blank">Vertical position</a></label>
      </div>
      <div class="flex items-center gap-x-1">
        <input v-model="currentLayer.bgImageHorPos" id="horizontal" :disabled="currentLayer.locked" />
        <button
          @click.left="[currentLayer.bgImageHorPos, currentLayer.bgImageVerPos] = [currentLayer.bgImageVerPos, currentLayer.bgImageHorPos]"
          :disabled="currentLayer.locked"
          class="transparent smallest"
          tooltip="Swap these values"
        >
          <Icon icon="mdi:swap-horizontal" class="!size-5" />
        </button>
        <input v-model="currentLayer.bgImageVerPos" id="vertical" :disabled="currentLayer.locked" />
      </div>
      <div class="flex items-center gap-x-1">
        <label for="width"><a href="https://css-tricks.com/almanac/properties/b/background-size/" target="_blank">Background width</a></label>
        <button class="transparent smallest invisible h-0"></button>
        <label for="height"><a href="https://css-tricks.com/almanac/properties/b/background-size/" target="_blank">Background height</a></label>
      </div>
      <div class="flex items-center gap-x-1">
        <input v-model="currentLayer.bgImageHorSize" id="width" :disabled="currentLayer.locked" />
        <button
          @click.left="[currentLayer.bgImageHorSize, currentLayer.bgImageVerSize] = [currentLayer.bgImageVerSize, currentLayer.bgImageHorSize]"
          :disabled="currentLayer.locked"
          class="transparent smallest"
          tooltip="Swap these values"
        >
          <Icon icon="mdi:swap-horizontal" class="!size-5" />
        </button>
        <input v-model="currentLayer.bgImageVerSize" id="height" :disabled="currentLayer.locked" />
      </div>
      <ListboxElem class="flex-1" :optionArray="bgSettingsRepeatArray" v-model="currentLayer.bgImageRepeat" :disabled="currentLayer.locked" />
    </window>
    <window class="w-88 2xl:w-96" :class="{ 'pointer-events-none opacity-0': inPreview }">
      <div class="flex w-full justify-between">
        <span class="font-bold">Layers</span>
        <button class="transparent smallest" @click.left="addLayer" tooltip="Add a new layer">
          <Icon icon="mdi:layers-plus" class="size-3" />
        </button>
      </div>
      <div class="flex gap-4">
        <ListboxElem class="flex-1/2" :optionArray="bgSettingsBlendArray" v-model="currentLayer.bgBlendMode" :disabled="currentLayer.locked" tooltip="Change the current layer's blend mode" />
        <input class="flex-1/2" v-model="currentLayer.bgOpacity" :disabled="currentLayer.locked" placeholder="Opacity (0 to 100)" tooltip="Change the current layer's opacity" />
      </div>
      <div class="flex h-[313px] flex-col gap-2 overflow-y-auto lg:h-[321px] 2xl:h-[365px]" ref="layerArrayWrapper">
        <div
          v-for="(layer, index) in layerArray"
          class="flex cursor-pointer items-center gap-2 overflow-clip rounded-lg p-2 transition-colors"
          :class="{ '!bg-slate-600': layer.id === currentLayerId, 'hover:bg-slate-600/50': !isDragging }"
          @click.left.self="currentLayerId = layer.id"
          :key="layer.id"
        >
          <button class="handle transparent small -mr-2 cursor-grab hover:bg-transparent active:cursor-grabbing active:bg-transparent" :disabled="layerArray.length === 1">
            <Icon icon="mdi:dots-grid" />
          </button>
          <button class="transparent small" @click.left="layer.displayNone = !layer.displayNone" :tooltip="!layer.displayNone ? 'Turn this layer invisible' : 'Turn this layer visible'">
            <Icon v-if="!layer.displayNone" icon="mdi:eye" />
            <Icon v-else icon="mdi:eye-off" />
          </button>
          <figure class="pointer-events-none !block size-12 rounded-lg border-1 border-slate-300 bg-slate-800 !bg-cover !bg-center" :style="layerStyleArray[index]"></figure>
          <span
            v-show="nameInputId !== layer.id"
            class="flex-1 truncate overflow-hidden rounded-sm border border-transparent bg-transparent px-2 py-0.5 text-sm text-gray-200 hover:opacity-50 2xl:text-base"
            @dblclick="setEditName(layer.id)"
            tooltip="Change this layer's name"
          >
            {{ layer.name }}
          </span>
          <input
            v-show="nameInputId === layer.id"
            class="flex-1 overflow-hidden rounded-sm border-0 bg-transparent px-2 py-0.5 text-gray-200 outline-1 outline-gray-200"
            v-on-click-outside="stopEditingName"
            @keydown.enter="stopEditingName"
            v-model="layer.name"
            ref="nameInputElem"
          />
          <button class="transparent small" @click.left="layer.locked = !layer.locked" :tooltip="!layer.locked ? 'Lock this layer' : 'Unlock this layer'">
            <Icon v-if="!layer.locked" icon="mdi:lock" />
            <Icon v-else icon="mdi:lock-open-variant" />
          </button>
          <button class="transparent small" :disabled="layerArray.length === 1 ? true : false" @click.left="removeLayer(layer.id)" tooltip="Delete this layer">
            <Icon icon="mdi:trash-can" />
          </button>
        </div>
      </div>
    </window>
  </div>
  <TooltipElem />
</template>

<style scoped>
.modalList-enter-active,
.modalList-leave-active {
  transition: all 0.25s ease-in-out;
}

.modalList-enter-active {
  transition-delay: 0.15s;
}

.modalList-enter-from,
.modalList-leave-to {
  transform: translateY(1.5rem);
  opacity: 0;
}

.buttonList-enter-active,
.buttonList-leave-active {
  transition: all 0.25s ease-in-out;
  overflow: hidden;
}

.buttonList-enter-from,
.buttonList-leave-to {
  max-width: 0px;
  padding: 0;
}
</style>
