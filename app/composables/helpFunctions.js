export const clamp = (min, num, max) => {
  return Math.min(Math.max(min, num), max)
}

export const convertPXToUnit = (deltaPx, unit, base) => {
  if (unit === '%' || unit.trim() === '%') {
    if (!base || base === 0) return 0
    return (deltaPx / base) * 100
  }
  const pxPerUnit = convertUnitToPX(unit)
  if (pxPerUnit === null) {
    // fallback for percent (shouldn't reach here)
    return deltaPx
  }
  return deltaPx / pxPerUnit
}

export const convertUnitToPX = (unit) => {
  // returns the number of pixels represented by 1 unit of `unit`
  switch (unit) {
    case 'px':
    case '':
      return 1
    case '%':
      // percent conversions vary by axis, handle separately
      return null
    case 'rem': {
      const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      return rootFont
    }
    case 'em': {
      // approximate em as root font-size (can't reliably get element font size here)
      const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      return rootFont
    }
    case 'vw':
      return window.innerWidth / 100
    case 'vh':
      return window.innerHeight / 100
    default:
      // unknown - fallback to px
      return 1
  }
}

export const formatValue = (n, unit) => {
  // for percent keep two decimals, for px keep 1 decimal if large else integer, for others keep two decimals
  if (unit === '%') return `${Math.round(n * 100) / 100}${unit}`
  if (unit === 'px' || unit === '') return `${Math.round(n * 10) / 10}px`
  return `${Math.round(n * 100) / 100}${unit}`
}

export const getIndexByDir = (targetIndex, targetArray, dir) => {
  targetArray = targetArray.filter((e) => e !== null)
  let targetIndexIndex = targetArray.indexOf(targetIndex)
  let nextTargetIndex = clamp(0, targetIndexIndex + dir, targetArray.length - 1)

  return targetArray[nextTargetIndex]
}

export const getIndexByLetter = (targetIndex, targetArray, userKey) => {
  targetArray = targetArray.filter((e) => e !== null)
  const letterArray = targetArray.map((e) => e.charAt(0).toUpperCase())
  const letterIndexArray = letterArray.map((e, i) => (e === userKey ? i : null)).filter((e) => e !== null)
  let nextTargetIndex = false

  if (letterIndexArray.length) {
    console.log(letterArray)
    console.log(letterIndexArray)
    const lastTargetIndex = letterIndexArray[letterIndexArray.length - 1]

    if (letterIndexArray.length > 1 && targetIndex !== lastTargetIndex) nextTargetIndex = letterIndexArray.find((e) => e > targetIndex)
    if (!nextTargetIndex) nextTargetIndex = letterIndexArray[0]
  }

  return nextTargetIndex
}