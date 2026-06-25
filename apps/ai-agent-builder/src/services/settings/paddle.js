const PADDLE_SCRIPT_URL = 'https://cdn.paddle.com/paddle/v2/paddle.js'

let paddleInitialized = false
let paddleScriptPromise = null

export function getPaddleConfig() {
  return {
    token: import.meta.env.VITE_PADDLE_TOKEN || 'live_6426b191e5d48a344062e8f3854',
    environment: import.meta.env.VITE_PADDLE_ENV || 'production',
  }
}

function loadPaddleScript() {
  if (typeof window === 'undefined') {
    return Promise.resolve(false)
  }

  if (window.Paddle) {
    return Promise.resolve(true)
  }

  if (paddleScriptPromise) {
    return paddleScriptPromise
  }

  paddleScriptPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(`script[src="${PADDLE_SCRIPT_URL}"]`)
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(Boolean(window.Paddle)))
      existingScript.addEventListener('error', () => resolve(false))
      return
    }

    const script = document.createElement('script')
    script.src = PADDLE_SCRIPT_URL
    script.async = true
    script.onload = () => resolve(Boolean(window.Paddle))
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })

  return paddleScriptPromise
}

export async function initializePaddle(onCheckoutEvent) {
  if (typeof window === 'undefined' || paddleInitialized) {
    return Boolean(window?.Paddle)
  }

  const loaded = await loadPaddleScript()
  if (!loaded || !window.Paddle) {
    return false
  }

  try {
    const { token, environment } = getPaddleConfig()

    if (environment === 'sandbox') {
      window.Paddle.Environment.set('sandbox')
    } else {
      window.Paddle.Environment.set('production')
    }

    window.Paddle.Initialize({
      token,
      checkout: {
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          locale: 'en',
        },
        eventCallback: (data) => {
          if (data.name === 'checkout.closed' || data.name === 'checkout.completed') {
            onCheckoutEvent?.(data.name)
          }
        },
      },
    })

    if (window.Paddle.Checkout?.on) {
      window.Paddle.Checkout.on('checkout.closed', () => onCheckoutEvent?.('checkout.closed'))
      window.Paddle.Checkout.on('checkout.completed', () => onCheckoutEvent?.('checkout.completed'))
    }

    paddleInitialized = true
    return true
  } catch (error) {
    console.error('Error initializing Paddle.js:', error)
    return false
  }
}

export function redirectToPaddleCheckout(approvalUrl) {
  if (typeof window === 'undefined' || !approvalUrl) {
    return false
  }

  try {
    const approvalUrlObj = new URL(approvalUrl)
    const ptxnValue = approvalUrlObj.searchParams.get('_ptxn')

    if (!ptxnValue) {
      return false
    }

    const currentUrl = window.location.href
    const separator = currentUrl.includes('?') ? '&' : '?'
    window.location.href = `${currentUrl}${separator}_ptxn=${ptxnValue}`
    return true
  } catch (error) {
    console.error('Error redirecting to Paddle checkout:', error)
    return false
  }
}

export function clearCheckoutUrlParameters() {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)
  url.searchParams.delete('success')
  url.searchParams.delete('subscription_id')
  url.searchParams.delete('ba_token')
  url.searchParams.delete('token')
  url.searchParams.delete('_ptxn')
  window.history.replaceState({}, '', url)
}

export function isPaddleCheckoutMessage(event) {
  if (!event?.data || typeof event.data !== 'object') {
    return false
  }

  const eventName = event.data.name || event.data.event_name
  return eventName === 'checkout.closed' || eventName === 'checkout.completed'
}
