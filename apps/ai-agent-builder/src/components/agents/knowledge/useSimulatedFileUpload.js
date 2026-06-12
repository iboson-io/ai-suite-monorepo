import { onBeforeUnmount, ref } from 'vue'

let nextUploadId = 0

export function useSimulatedFileUpload({ onValidate, onFileComplete }) {
  const items = ref([])
  const intervals = {}

  function clearIntervalFor(id) {
    if (intervals[id]) {
      clearInterval(intervals[id])
      delete intervals[id]
    }
  }

  function startUpload(file) {
    const id = ++nextUploadId
    const item = {
      id,
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
      addedAt: new Date(),
      parentIndex: null,
    }

    items.value.push(item)

    const totalSteps = 20
    let currentStep = 0

    intervals[id] = setInterval(() => {
      const entry = items.value.find((f) => f.id === id)
      if (!entry) {
        clearIntervalFor(id)
        return
      }

      currentStep += 1
      entry.progress = Math.min((currentStep / totalSteps) * 100, 100)

      if (entry.progress >= 100) {
        entry.progress = 100
        entry.status = 'completed'
        entry.completedAt = new Date()
        clearIntervalFor(id)
        onFileComplete?.(entry)
      }
    }, 150)
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList ?? [])
    if (!files.length) return { errors: [] }

    const result = await onValidate(files)
    if (result.errors?.length) return result

    for (const file of result.validFiles) {
      startUpload(file)
    }

    return { errors: [] }
  }

  function cancelUpload(item) {
    clearIntervalFor(item.id)
    items.value = items.value.filter((f) => f.id !== item.id)
  }

  function removeItem(item, onRemoveFromParent) {
    clearIntervalFor(item.id)

    if (item.status === 'uploading') {
      items.value = items.value.filter((f) => f.id !== item.id)
      return
    }

    if (item.parentIndex != null) {
      onRemoveFromParent?.(item.parentIndex)
      items.value.forEach((entry) => {
        if (entry.parentIndex != null && entry.parentIndex > item.parentIndex) {
          entry.parentIndex -= 1
        }
      })
    }

    items.value = items.value.filter((f) => f.id !== item.id)
  }

  onBeforeUnmount(() => {
    Object.keys(intervals).forEach((id) => clearIntervalFor(Number(id)))
  })

  return { items, addFiles, cancelUpload, removeItem }
}
