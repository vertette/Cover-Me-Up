export const clamp = (min, num, max) => {
  return Math.min(Math.max(min, num), max)
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