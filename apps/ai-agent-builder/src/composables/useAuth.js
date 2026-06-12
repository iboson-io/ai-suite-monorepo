import { ref } from 'vue'
import { apiService } from '@app/services/agentApi'
import { TOKEN_KEY } from '@app/services/api.js'

const USER_KEY = 'auth_user'

export const useAuth = () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const isAuthenticated = ref(false)

  // Initialize auth state from localStorage
  const initializeAuth = () => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedUser = localStorage.getItem(USER_KEY)
      
      if (storedToken) {
        try {
          if (storedUser) {
            user.value = JSON.parse(storedUser)
          }
          isAuthenticated.value = true
          apiService.setAuthToken(storedToken)
        } catch (err) {
          console.error('Error parsing stored auth data:', err)
          logout()
        }
      }
    }
  }

  // Store auth data in localStorage
  const storeAuthData = (token, userData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      // Set token in API service for future requests
      apiService.setAuthToken(token)
    }
  }

  // Clear auth data from localStorage
  const clearAuthData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      // Clear token from API service
      apiService.clearAuthToken()
    }
  }

  // Signup function
  const signup = async (userData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.signup(userData)
      
      // Store token and user data if provided in response
      if (response.token && response.user) {
        storeAuthData(response.token, response.user)
        user.value = response.user
        isAuthenticated.value = true
      }
      
      console.log('Signup successful:', response)
      return { success: true, data: response }
    } catch (err) {
      error.value = err.message || 'Signup failed'
      console.error('Signup error:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Login function
  const login = async (credentials) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.login(credentials)
      
      const responseData = response.data || response
      const token = responseData.token || responseData.accessToken
      const userData = responseData.user || responseData.userData || responseData
      
      if (token && userData) {
        storeAuthData(token, userData)
        user.value = userData
        isAuthenticated.value = true
      }
      
      console.log('Login successful:', response)
      return { success: true, data: response }
    } catch (err) {
      error.value = err.message || 'Login failed'
      if(error.value=='data and hash arguments required'){
        err.message = 'Use google login instead'
      }
      else if(err.message=='HTTP error! status: 400'){
        err.message = 'Invalid email or password'
      }
      console.error('Login error:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Login with code function
  const loginWithCode = async (email, code) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.loginWithCode({ email, code })
      
      // Store token and user data
      if (response.token && response.user) {
        storeAuthData(response.token, response.user)
        user.value = response.user
        isAuthenticated.value = true
      }
      
      console.log('Code login successful:', response)
      return { success: true, data: response }
    } catch (err) {
      error.value = err.message || 'Code verification failed'
      console.error('Code login error:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Send verification code function
  const sendVerificationCode = async (email) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.sendVerificationCode({ email })
      console.log('Verification code sent:', response)
      return { success: true, data: response }
    } catch (err) {
      error.value = err.message || 'Failed to send verification code'
      console.error('Send code error:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Validate email function
  const validateEmail = async (email) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.validateEmail(email)
      console.log('Email validation successful:', response)
      return { success: true, data: response }
    } catch (err) {
      error.value = err.message || 'Email validation failed'
      console.error('Email validation error:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Google auth function - Updated to work with backend OAuth
  const googleAuth = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Redirect to backend OAuth endpoint
      const authUrl = `${apiService.baseURL}/api/auth/google`
      if (typeof window !== 'undefined') {
        window.location.href = authUrl
      }
    } catch (err) {
      error.value = err.message || 'Google authentication failed'
      console.error('Google auth error:', err)
      loading.value = false
    }
  }

  // Google signup function - Updated to work with backend OAuth
  const signupWithGoogle = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Redirect to backend OAuth endpoint
      const authUrl = `${apiService.baseURL}/api/auth/google`
      if (typeof window !== 'undefined') {
        window.location.href = authUrl
      }
    } catch (err) {
      error.value = err.message || 'Google signup failed'
      console.error('Google signup error:', err)
      loading.value = false
    }
  }

  // Verify email function
  const verifyEmail = async (token) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.verifyEmail(token)
      console.log('Email verification successful:', response)
      
      // Check if the response contains token and user data for automatic sign-in
      if (response.status && response.data && response.data.token && response.data.user) {
        storeAuthData(response.data.token, response.data.user)
        user.value = response.data.user
        isAuthenticated.value = true
        console.log('User automatically signed in after email verification')
      }
      
      return { success: true, data: response }
    } catch (err) {
      error.value = err.message || 'Email verification failed'
      console.error('Email verification error:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Resend verification email function
  const resendVerification = async (email) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.resendVerification(email)
      console.log('Verification email resent:', response)
      return { success: true, data: response }
    } catch (err) {
      error.value = err.message || 'Failed to resend verification email'
      console.error('Resend verification error:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Logout function
  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    clearAuthData()
    console.log('User logged out')
  }

  // Get current token
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  }

  const checkAuth = () => {
    return isAuthenticated.value && !!getToken()
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Initialize auth on composable creation
  initializeAuth()

  return {
    user,
    loading,
    error,
    isAuthenticated,
    signup,
    login,
    loginWithCode,
    sendVerificationCode,
    validateEmail,
    googleAuth,
    signupWithGoogle,
    verifyEmail,
    resendVerification,
    logout,
    getToken,
    checkAuth,
    clearError
  }
}
