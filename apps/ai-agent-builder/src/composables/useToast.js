import { ref } from 'vue'

// Create a global state that persists across component instances
const toasts = ref([])

export const useToast = () => {
  const showToast = (title, message = '', type = 'info') => {
    const toast = {
      id: Date.now(),
      title,
      message,
      type, // 'success', 'error', 'warning', 'info'
      visible: true
    }
    
    toasts.value.push(toast)
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(toast.id)
    }, 5000)
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    showToast,
    removeToast
  }
} 