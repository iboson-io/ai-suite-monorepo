import { API_ENDPOINTS, USER_API_URL, AGENT_API_URL, CHAT_API_URL, API_DEPLOYMENT_URL, PAYMENT_API_URL, NOTIFICATION_API_URL, CHAT_AI_API_URL, WORKFLOW_API_URL } from './constants.js'
import { flattenWorkflowValidationErrors, formatWorkflowValidationToast } from '@app/utils/workflowApiErrors'

class ApiService {
  constructor() {
    this.baseURL = USER_API_URL
    this.authToken = null
    this.agentBaseURL = AGENT_API_URL
    this.deploymentBaseURL = API_DEPLOYMENT_URL
    this.chatBaseURL = CHAT_API_URL
    this.paymentBaseURL = PAYMENT_API_URL
    this.notificationBaseURL = NOTIFICATION_API_URL
    this.chatAiBaseURL = CHAT_AI_API_URL
    this.workflowBaseURL = WORKFLOW_API_URL
    this.isRedirecting = false
    this.authErrorHandled = false
  }

  setAuthToken(token) {
    this.authToken = token
  }

  clearAuthToken() {
    this.authToken = null
  }

  getAuthHeader() {
    return this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}
  }

  async handleAuthError() {
    if (this.isRedirecting || this.authErrorHandled) return
    this.isRedirecting = true
    this.authErrorHandled = true
    this.clearAuthToken()

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/signin'
    }
  }

  isAuthError(response, errorData) {
    return ((response.status === 401 || errorData.status === false) && (errorData.message === "Authentication required" || errorData.message === "Invalid or expired token"))
  }

  async request(endpoint, options = {}) {
    // if (this.isRedirecting) {
    //   throw new Error('Authentication required')
    // }

    const url = `${this.baseURL}${endpoint}`

    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers
      }
    }

    const config = {
      ...defaultOptions,
      ...options
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (this.isAuthError(response, errorData)) {
          await this.handleAuthError()
          throw new Error('Authentication required')
        }
        if (errorData.errors && errorData.errors.email) {
          throw new Error(errorData.errors.email)
        }
        if (errorData.errors && errorData.errors.password) {
          throw new Error(errorData.errors.password)
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error.message === 'Authentication required') {
        throw error
      }
      console.error('API request failed:', error)
      throw error
    }
  }

  async requestAgent(endpoint, options = {}) {
    // if (this.isRedirecting) {
    //   throw new Error('Authentication required')
    // }

    const url = `${this.agentBaseURL}${endpoint}`

    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers
      }
    }

    const config = {
      ...defaultOptions,
      ...options
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (this.isAuthError(response, errorData)) {
          await this.handleAuthError()
          throw new Error('Authentication required')
        }

        if (errorData.errors) {
          throw new Error(formatWorkflowValidationToast(errorData.errors))
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error.message === 'Authentication required') {
        throw error
      }
      console.error('API request failed:', error)
      throw error
    }
  }

  async requestPayment(endpoint, options = {}) {
    // if (this.isRedirecting) {
    //   throw new Error('Authentication required')
    // }

    const url = `${this.paymentBaseURL}${endpoint}`

    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers
      }
    }

    const config = {
      ...defaultOptions,
      ...options
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (this.isAuthError(response, errorData)) {
          await this.handleAuthError()
          throw new Error('Authentication required')
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error.message === 'Authentication required') {
        throw error
      }
      console.error('Payment API request failed:', error)
      throw error
    }
  }

  async requestChatList(endpoint, options = {}) {
    const url = `${this.chatBaseURL}${endpoint}`

    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (this.isAuthError(response, errorData)) {
          await this.handleAuthError()
          throw new Error('Authentication required')
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error.message === 'Authentication required') {
        throw error
      }
      console.error('Chat list API request failed:', error)
      throw error
    }
  }

  async requestChatAI(endpoint, options = {}) {
    // if (this.isRedirecting) {
    //   throw new Error('Authentication required')
    // }

    const url = `${this.chatAiBaseURL}${endpoint}`

    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers
      }
    }

    const config = {
      ...defaultOptions,
      ...options
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (this.isAuthError(response, errorData)) {
          await this.handleAuthError()
          throw new Error('Authentication required')
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error.message === 'Authentication required') {
        throw error
      }
      console.error('Chat AI API request failed:', error)
      throw error
    }
  }

  /**
   * @param {string} message
   * @param {Record<string, unknown>} errorsRaw
   * @returns {Error & { errors: Record<string, string>, status?: boolean }}
   */
  workflowValidationError(message, errorsRaw) {
    const err = new Error(message || 'Validation failed')
    err.errors = flattenWorkflowValidationErrors(errorsRaw || {})
    err.status = false
    return err
  }

  async requestWorkflow(endpoint, options = {}) {
    const url = `${this.workflowBaseURL}${endpoint}`

    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers
      }
    }

    const config = {
      ...defaultOptions,
      ...options
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (this.isAuthError(response, data)) {
          await this.handleAuthError()
          throw new Error('Authentication required')
        }

        if (data?.status === false && data?.errors && typeof data.errors === 'object') {
          throw this.workflowValidationError(data.message || 'Validation failed', data.errors)
        }
        if (data?.errors && typeof data.errors === 'object') {
          throw this.workflowValidationError(
            data.message || `HTTP error! status: ${response.status}`,
            data.errors
          )
        }

        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      if (data?.status === false) {
        if (data.errors && typeof data.errors === 'object') {
          throw this.workflowValidationError(data.message || 'Validation failed', data.errors)
        }
        throw new Error(data.message || 'Request failed')
      }

      return data
    } catch (error) {
      if (error.message === 'Authentication required') {
        throw error
      }
      console.error('Workflow API request failed:', error)
      throw error
    }
  }

  async getWorkflows(page = 1, limit = 20, status = null, search = null) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) params.append('status', status)
    const s = search != null ? String(search).trim() : ''
    if (s) params.append('search', s)
    return this.requestWorkflow(`/api/workflows?${params}`, { method: 'GET' })
  }

  async createWorkflow(payload) {
    return this.requestWorkflow('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async getWorkflow(workflowId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}`, { method: 'GET' })
  }

  async updateWorkflow(workflowId, payload) {
    return this.requestWorkflow(`/api/workflows/${workflowId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }

  async deleteWorkflow(workflowId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}`, { method: 'DELETE' })
  }

  async activateWorkflow(workflowId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/activate`, { method: 'PATCH' })
  }

  async deactivateWorkflow(workflowId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/deactivate`, { method: 'PATCH' })
  }

  async getWorkflowSchema(workflowId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/schema`, { method: 'GET' })
  }

  async createWorkflowTrigger(workflowId, payload) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/triggers`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async getWorkflowPatterns(workflowId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/patterns`, { method: 'GET' })
  }

  async createWorkflowPattern(workflowId, payload) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/patterns`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async listWorkflowPatternAgents(workflowId, patternId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/patterns/${patternId}/agents`, { method: 'GET' })
  }

  async addWorkflowPatternAgent(workflowId, patternId, payload) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/patterns/${patternId}/agents`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async createWorkflowRouter(workflowId, patternId, payload) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/patterns/${patternId}/router`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async updateWorkflowRouter(workflowId, patternId, payload) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/patterns/${patternId}/router`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }

  async getWorkflowRouter(workflowId, patternId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/patterns/${patternId}/router`, { method: 'GET' })
  }

  async createHitlConfig(workflowId, payload) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/hitl`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async updateHitlConfig(workflowId, payload) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/hitl`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }

  async getHitlConfig(workflowId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/hitl`, { method: 'GET' })
  }

  async deleteHitlConfig(workflowId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/hitl`, { method: 'DELETE' })
  }

  async getWorkflowTriggers(workflowId, page = 1, limit = 50) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    return this.requestWorkflow(`/api/workflows/${workflowId}/triggers?${params}`, { method: 'GET' })
  }

  async getWorkflowTrigger(workflowId, triggerId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/triggers/${triggerId}`, { method: 'GET' })
  }

  async updateWorkflowTrigger(workflowId, triggerId, payload) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/triggers/${triggerId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }

  async deleteWorkflowTrigger(workflowId, triggerId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/triggers/${triggerId}`, { method: 'DELETE' })
  }

  async getWorkflowPattern(workflowId, patternId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/patterns/${patternId}`, { method: 'GET' })
  }

  async updateWorkflowPattern(workflowId, patternId, payload) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/patterns/${patternId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }

  async deleteWorkflowPattern(workflowId, patternId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/patterns/${patternId}`, { method: 'DELETE' })
  }

  async reorderWorkflowPatterns(workflowId, order) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/patterns/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ order })
    })
  }

  async getWorkflowPatternAgent(workflowId, patternId, patternAgentId) {
    return this.requestWorkflow(
      `/api/workflows/${workflowId}/patterns/${patternId}/agents/${patternAgentId}`,
      { method: 'GET' }
    )
  }

  async updateWorkflowPatternAgent(workflowId, patternId, patternAgentId, payload) {
    return this.requestWorkflow(
      `/api/workflows/${workflowId}/patterns/${patternId}/agents/${patternAgentId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload)
      }
    )
  }

  async deleteWorkflowPatternAgent(workflowId, patternId, patternAgentId) {
    return this.requestWorkflow(
      `/api/workflows/${workflowId}/patterns/${patternId}/agents/${patternAgentId}`,
      { method: 'DELETE' }
    )
  }

  async reorderWorkflowPatternAgents(workflowId, patternId, order) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/patterns/${patternId}/agents/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ order })
    })
  }

  async deleteWorkflowRouter(workflowId, patternId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/patterns/${patternId}/router`, {
      method: 'DELETE'
    })
  }

  async listWorkflowOutputChannels(workflowId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/output-channels`, { method: 'GET' })
  }

  async getWorkflowOutputChannel(workflowId, channelId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/output-channels/${channelId}`, { method: 'GET' })
  }

  async createWorkflowOutputChannel(workflowId, payload) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/output-channels`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async updateWorkflowOutputChannel(workflowId, channelId, payload) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/output-channels/${channelId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }

  async deleteWorkflowOutputChannel(workflowId, channelId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/output-channels/${channelId}`, {
      method: 'DELETE'
    })
  }

  async listWorkflowExecutions(workflowId, query = {}) {
    const params = new URLSearchParams()
    if (query.page != null) params.set('page', String(query.page))
    if (query.limit != null) params.set('limit', String(query.limit))
    if (query.status) params.set('status', query.status)
    if (query.trigger_type) params.set('trigger_type', query.trigger_type)
    if (query.date_from) params.set('date_from', query.date_from)
    if (query.date_to) params.set('date_to', query.date_to)
    const q = params.toString()
    return this.requestWorkflow(`/api/workflows/${workflowId}/executions${q ? `?${q}` : ''}`, { method: 'GET' })
  }

  async getWorkflowExecution(workflowId, executionId) {
    return this.requestWorkflow(`/api/workflows/${workflowId}/executions/${executionId}`, { method: 'GET' })
  }

  async getWorkflowExecutionSteps(workflowId, executionId, query = {}) {
    const params = new URLSearchParams()
    if (query.page != null) params.set('page', String(query.page))
    if (query.limit != null) params.set('limit', String(query.limit))
    if (query.status) params.set('status', query.status)
    if (query.pattern_id) params.set('pattern_id', query.pattern_id)
    if (query.agent_id) params.set('agent_id', query.agent_id)
    const q = params.toString()
    return this.requestWorkflow(
      `/api/workflows/${workflowId}/executions/${executionId}/steps${q ? `?${q}` : ''}`,
      { method: 'GET' }
    )
  }

  async getWorkflowExecutionStep(workflowId, executionId, stepId) {
    return this.requestWorkflow(
      `/api/workflows/${workflowId}/executions/${executionId}/steps/${stepId}`,
      { method: 'GET' }
    )
  }

  async listHitlEventsForExecution(executionId, query = {}) {
    const params = new URLSearchParams()
    if (query.page != null) params.set('page', String(query.page))
    if (query.limit != null) params.set('limit', String(query.limit))
    if (query.status) params.set('status', query.status)
    const q = params.toString()
    return this.requestWorkflow(`/api/hitl/executions/${executionId}/events${q ? `?${q}` : ''}`, { method: 'GET' })
  }

  async respondHitlEvent(eventId, payload) {
    return this.requestWorkflow(`/api/hitl/events/${eventId}/respond`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async signup(userData) {
    return this.request(API_ENDPOINTS.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async login(credentials) {
    return this.request(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  async loginWithCode(data) {
    return this.request(API_ENDPOINTS.LOGIN_WITH_CODE, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async sendVerificationCode(data) {
    return this.request(API_ENDPOINTS.SEND_VERIFICATION_CODE, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async validateEmail(email) {
    return this.request(API_ENDPOINTS.VALIDATE_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  async googleSignup() {
    try {
      const response = await this.request('/api/auth/google?auth_type=signup', {
        method: 'GET'
      })

      if (response.status && response.data && response.data.auth_url) {
        if (typeof window !== 'undefined') {
          window.location.href = response.data.auth_url
        }
      } else {
        throw new Error('Invalid response from authentication server')
      }
    } catch (error) {
      console.error('Google signup error:', error)
      throw error
    }
  }

  async googleAuth() {
    try {
      const response = await this.request('/api/auth/google?auth_type=login', {
        method: 'GET'
      })

      if (response.status && response.data && response.data.auth_url) {
        if (typeof window !== 'undefined') {
          window.location.href = response.data.auth_url
        }
      } else {
        throw new Error('Invalid response from authentication server')
      }
    } catch (error) {
      console.error('Google auth error:', error)
      throw error
    }
  }

  generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  async verifyEmail(token) {
    return this.request(API_ENDPOINTS.VERIFY_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ token })
    })
  }

  async resendVerification(email) {
    return this.request(API_ENDPOINTS.RESEND_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  async forgotPassword(email) {
    return this.request(API_ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  async confirmResetPassword(token, newPassword) {
    return this.request(API_ENDPOINTS.CONFIRM_RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword })
    })
  }

  async updatePassword(currentPassword, newPassword) {
    return this.request(API_ENDPOINTS.UPDATE_PASSWORD, {
      method: 'PUT',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    })
  }

  async getAgentById(agentId) {
    return this.requestAgent(`${API_ENDPOINTS.GET_AGENT_DATA}/${agentId}`, {
      method: 'GET'
    })
  }

  async getAgentData(page = 1, limit = 5, status = null, search = null) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (status && status !== 'All Agents') {
      const statusMap = {
        'Published': 'published',
        'Draft': 'draft',
        'Archived': 'archived'
      }
      const apiStatus = statusMap[status]
      if (apiStatus) {
        queryParams.append('status', apiStatus)
      }
    }

    if (search && search.trim()) {
      queryParams.append('search', search.trim())
    }

    return this.requestAgent(`${API_ENDPOINTS.GET_AGENT_DATA}?${queryParams}`, {
      method: 'GET'
    })
  }

  async getMultiAgents(page = 1, limit = 12, status = 'MultiAgents', search = null, isActive = undefined) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status: status || 'MultiAgents',
    })

    if (isActive !== undefined && isActive !== null) {
      queryParams.append('is_active', String(isActive))
    } else {
      queryParams.append('is_active', 'true')
    }

    if (search && search.trim()) {
      queryParams.append('search', search.trim())
    }

    return this.requestAgent(`/api/agent-groups?${queryParams}`, {
      method: 'GET'
    })
  }
  async getAgentDataWithStatusAndSearch(page = 1, limit = 5, status, search) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status: status,
      search: search
    })

    if (status && status !== 'All Agents') {
      const statusMap = {
        'Published': 'published',
        'Draft': 'draft',
        'Archived': 'archived'
      }
      const apiStatus = statusMap[status]
      if (apiStatus) {
        queryParams.append('status', apiStatus)
      }
    }

    if (search && search.trim()) {
      queryParams.append('search', search.trim())
    }

    return this.requestAgent(`${API_ENDPOINTS.GET_AGENT_DATA}?${queryParams}`, {
      method: 'GET'
    })
  }

  async getAgentAnalytics() {
    return this.request(API_ENDPOINTS.GET_AGENT_ANALYTICS, {
      method: 'GET'
    })
  }

  async createAgent(agentData) {
    return this.requestAgent(API_ENDPOINTS.CREATE_AGENT, {
      method: 'POST',
      body: JSON.stringify(agentData)
    })
  }

  async createAgentGroup(groupData) {
    return this.requestAgent(API_ENDPOINTS.CREATE_AGENT_GROUP, {
      method: 'POST',
      body: JSON.stringify(groupData)
    })
  }

  async getGroupAgentsById(groupId) {
    return this.requestAgent(`${API_ENDPOINTS.GET_GROUP_AGENTS_BY_ID}/${groupId}`, {
      method: 'GET'
    })
  }

  async fetchGroupAgents(groupId) {
    return this.requestAgent(`/api/agent-groups/${groupId}/details`, {
      method: 'GET'
    })
  }

  async removeAgentsFromGroup(groupId, agentIds) {
    return this.requestAgent(`/api/agent-groups/${groupId}/agents`, {
      method: 'DELETE',
      body: JSON.stringify({
        agent_ids: agentIds
      })
    })
  }
  async deleteAgentGroupById(groupId) {
    return this.requestAgent(`/api/agent-groups/${groupId}`, {
      method: 'DELETE',
      body: JSON.stringify({
      })
    })
  }

  /**
   * Update an agent group. Server: PUT /api/agent-groups/:groupId
   * Body may include redirection_rules: [{ condition, agent_id }, ...]
   */
  async updateAgentGroup(groupId, agentIds, groupName = null, description = null, voice = null, redirectionRules = undefined) {
    const payload = {
      agent_ids: agentIds
    }

    // Add group name and description if provided
    if (groupName !== null) {
      payload.group_name = groupName
    }
    if (description !== null) {
      payload.description = description
    }
    if (voice !== null) {
      payload.voice = voice
    }
    if (redirectionRules !== undefined) {
      payload.redirection_rules = redirectionRules
    }

    return this.requestAgent(`/api/agent-groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  }

  async updateGroupName(groupId, newName, token) {
    console.log('API: Updating group name for ID:', groupId, 'New name:', newName)

    const response = await this.requestAgent(`/api/agent-groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify({
        group_name: newName
      })
    })

    console.log('API: Update group name response:', response)
    return response
  }

  async createAgentWithFiles(agentData, schemaFiles = [], documentFiles = [], knowledgeType = 'api') {
    const formData = new FormData()

    // Base agent data
    formData.append('name', agentData.name)
    const promptTrimmed = agentData.prompt != null ? String(agentData.prompt).trim() : ''
    if (promptTrimmed) {
      formData.append('prompt', promptTrimmed)
    }
    formData.append('status', agentData.status || 'published')
    // Use agent_type from agentData if provided (for composio), otherwise use knowledgeType
    formData.append('agent_type', agentData.agent_type || knowledgeType)
    formData.append('auth_type', agentData.auth_type)
    if (agentData.base_url !== '') {
      formData.append('base_url', agentData.base_url)
    }
    if (agentData.token !== '') {
      formData.append('token', agentData.token)
    }


    // Add system type if available (single/multi)
    if (agentData.system_type) {
      formData.append('system_type', agentData.system_type)
    }

    if (agentData.voice !== undefined) {
      formData.append('voice', String(agentData.voice))
    }

    if (agentData.role && String(agentData.role).trim()) {
      formData.append('role', String(agentData.role).trim())
    }
    if (agentData.rules && Array.isArray(agentData.rules) && agentData.rules.length > 0) {
      const cleanedRules = agentData.rules.map((r) => String(r).trim()).filter(Boolean)
      if (cleanedRules.length > 0) {
        formData.append('rules', JSON.stringify(cleanedRules))
      }
    }

    // Handle different knowledge types
    switch (knowledgeType) {
      case 'api':
        schemaFiles.forEach((file) => {
          formData.append('schema_files', file)
        })
        formData.append('auth_config', JSON.stringify(agentData.auth_config))
        break

      case 'doc':

        documentFiles.forEach((file) => {
          formData.append('document_files', file)
        })
        formData.append('auth_config', JSON.stringify(agentData.auth_config))
        break

      case 'db':
        // Database type payload: name, prompt, agent_type=db, auth_config
        if (agentData.db_config) {
          formData.append('auth_config', JSON.stringify({
            host: agentData.db_config.host,
            port: parseInt(agentData.db_config.port),
            username: agentData.db_config.username,
            password: agentData.db_config.password,
            database: agentData.db_config.database,
            db_type: agentData.db_config.type
          }))
        }
        break

      case 'composio':
        // Composio type payload: name, prompt, agent_type=composio, auth_config as array
        if (agentData.auth_config && Array.isArray(agentData.auth_config)) {
          formData.append('auth_config', JSON.stringify(agentData.auth_config))
        }
        break
    }

    const url = `${this.agentBaseURL}${API_ENDPOINTS.CREATE_AGENT}`

    const config = {
      method: 'POST',
      headers: {
        ...this.getAuthHeader()
      },
      body: formData
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json().catch(() => ({}))

      const throwIfValidationFailure = (payload) => {
        if (payload && payload.status === false && payload.errors) {
          const validationError = new Error(payload.message || 'Validation failed')
          validationError.errors = payload.errors
          validationError.status = payload.status
          throw validationError
        }
      }

      if (!response.ok) {
        throwIfValidationFailure(data)
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      // Some endpoints return HTTP 200 with { status: false, errors: { ... } }
      throwIfValidationFailure(data)

      return data
    } catch (error) {
      console.error('Agent creation with files failed:', error)
      throw error
    }
  }

  async getProfile() {
    try {
      return await this.request(API_ENDPOINTS.GET_PROFILE, {
        method: 'GET'
      })
    } catch (error) {
      if (error.message === 'Authentication required' || error.message === 'Invalid or expired token') {
        this.clearAuthToken()
        if (typeof window !== 'undefined') {
          navigateTo('/login')
        }
        throw new Error(error.message)
      }
      throw error
    }
  }

  async updateProfilePicture(file) {
    const formData = new FormData()
    formData.append('profile_picture', file)

    const url = `${this.baseURL}${API_ENDPOINTS.UPDATE_PROFILE_PICTURE}`

    const config = {
      method: 'POST',
      headers: {
        ...this.getAuthHeader()
      },
      body: formData
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Profile picture upload failed:', error)
      throw error
    }
  }

  async getNotifications() {
    // if (this.isRedirecting) {
    //   throw new Error('Authentication required')
    // }

    const url = `${this.notificationBaseURL}/api/notifications`

    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (this.isAuthError(response, errorData)) {
          await this.handleAuthError()
          throw new Error('Authentication required')
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error.message === 'Authentication required') {
        throw error
      }
      console.error('Get notifications failed:', error)
      throw error
    }
  }

  async markNotificationAsRead(notificationId) {
    const url = `${this.notificationBaseURL}/api/notifications/${notificationId}/read`

    const config = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Mark notification as read failed:', error)
      throw error
    }
  }

  async markNotificationAsUnread(notificationId) {
    const url = `${this.notificationBaseURL}/api/notifications/${notificationId}/unread`

    const config = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Mark notification as unread failed:', error)
      throw error
    }
  }

  async markAllNotificationsAsRead() {
    const url = `${this.notificationBaseURL}/api/notifications/mark-all-read`

    const config = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Mark all notifications as read failed:', error)
      throw error
    }
  }

  async deleteNotification(notificationId) {
    const url = `${this.notificationBaseURL}/api/notifications/${notificationId}`

    const config = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Delete notification failed:', error)
      throw error
    }
  }

  async clearAllNotifications() {
    const url = `${this.notificationBaseURL}/api/notifications/all`

    const config = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Clear all notifications failed:', error)
      throw error
    }
  }

  async deleteAgent(agentId) {
    return this.requestAgent(`${API_ENDPOINTS.DELETE_AGENT}/${agentId}`, {
      method: 'DELETE'
    })
  }

  async deleteAgentGroup(agentGroupId, agentIds) {
    return this.requestAgent(`${API_ENDPOINTS.DELETE_AGENT_GROUP}/${agentGroupId}`, {
      method: 'DELETE',
      body: JSON.stringify({ agent_ids: agentIds })
    })
  }

  async updateAgentStatus(agentId, status) {
    return this.requestAgent(`${API_ENDPOINTS.UPDATE_AGENT_STATUS}/${agentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  }

  async updateAgent(agentId, agentData) {
    return this.requestAgent(`${API_ENDPOINTS.UPDATE_AGENT}/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(agentData)
    })
  }

  async updateAgentWithFiles(agentId, agentData, schemaFiles = [], documentFiles = []) {
    const formData = new FormData()

    Object.keys(agentData).forEach(key => {
      if (key !== 'schema_files' && key !== 'document_files') {
        let val = agentData[key]
        if (key === 'rules' && Array.isArray(val)) {
          val = JSON.stringify(val)
        }
        formData.append(key, val)
      }
    })

    schemaFiles.forEach((file, index) => {
      formData.append('schema_files', file)
    })

    documentFiles.forEach((file, index) => {
      formData.append('document_files', file)
    })

    const url = `${this.agentBaseURL}${API_ENDPOINTS.UPDATE_AGENT}/${agentId}`

    const config = {
      method: 'PUT',
      headers: {
        ...this.getAuthHeader()
      },
      body: formData
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Agent update with files failed:', error)
      throw error
    }
  }

  async deleteAgentFile(agentId, fileId) {
    return this.requestAgent(`${API_ENDPOINTS.DELETE_AGENT_FILE}/${agentId}/files/${fileId}`, {
      method: 'DELETE'
    })
  }

  async updateAgentFile(agentId, fileId, fileType, fileContent) {
    return this.requestAgent(`${API_ENDPOINTS.DELETE_AGENT_FILE}/${agentId}/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify({
        file_type: fileType,
        file_content: fileContent
      })
    })
  }

  async enhancePrompt(agentId, prompt) {
    return this.requestAgent(`${API_ENDPOINTS.ENHANCE_PROMPT}`, {
      method: 'POST',
      body: JSON.stringify({
        agent_id: agentId,
        prompt: prompt
      })
    })
  }

  async getCurrentPlan() {
    return this.requestPayment(API_ENDPOINTS.GET_CURRENT_PLAN)
  }

  async getAvailablePlans() {
    return this.requestPayment(API_ENDPOINTS.GET_AVAILABLE_PLANS)
  }

  async getPurchaseHistory(page = 1, limit = 2) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    const endpoint = `${API_ENDPOINTS.GET_PURCHASE_HISTORY}?${queryParams}`
    return this.requestPayment(endpoint)
  }

  async createSubscription(planId, customerData = {}) {
    return this.requestPayment(API_ENDPOINTS.CREATE_SUBSCRIPTION, {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        customer_email: customerData.email || '',
        customer_name: customerData.name || '',
        customer_surname: customerData.surname || ''
      })
    })
  }

  async upgradePlan(planId) {
    return this.createSubscription(planId)
  }

  async getDeployment(agentId) {
    const url = `${this.deploymentBaseURL}/api/deployments/agent/${agentId}`

    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Deployment API request failed:', error)
      throw error
    }
  }

  async getGroupDeployment(groupId) {
    const url = `${this.deploymentBaseURL}/api/deployments/groups/${groupId}`

    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Group deployment API request failed:', error)
      throw error
    }
  }

  async createDeployment(agentId, deploymentData = {}) {
    const url = `${this.deploymentBaseURL}/api/deployments`

    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify({
        agent_id: agentId,
        deployment_type: 'agent',
        ...deploymentData
      })
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Create deployment failed:', error)
      throw error
    }
  }
  async createGroupDeployment(groupId, deploymentData = {}) {
    const url = `${this.deploymentBaseURL}/api/deployments/groups`

    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify({
        group_id: groupId,
        ...deploymentData
      })
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Create deployment failed:', error)
      throw error
    }
  }

  async regenerateApiKey(deploymentId) {
    const url = `${this.deploymentBaseURL}/api/deployments/${deploymentId}/regenerate-key`

    const config = {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify({})
    }

    try {
      console.log('Regenerating API key for deployment:', deploymentId)
      console.log('Request URL:', url)
      console.log('Auth header:', this.getAuthHeader())

      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Regenerate API key failed with status:', response.status)
        console.error('Error data:', errorData)
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Regenerate API key failed:', error)
      throw error
    }
  }

  async updateDeployment(deploymentId, deploymentData = {}) {
    const url = `${this.deploymentBaseURL}/api/deployments/${deploymentId}`

    // Check if files are present (logoFile or iconFile)
    const hasFiles = deploymentData.logoFile || deploymentData.iconFile

    let config

    if (hasFiles) {
      // Use FormData for file uploads
      const formData = new FormData()

      // Add text fields
      if (deploymentData.color) {
        formData.append('color', deploymentData.color)
      }
      if (deploymentData.company_name) {
        formData.append('company_name', deploymentData.company_name)
      }

      // Add files if present
      if (deploymentData.logoFile) {
        formData.append('logo_file', deploymentData.logoFile)
      }
      if (deploymentData.iconFile) {
        formData.append('icon_file', deploymentData.iconFile)
      }

      config = {
        method: 'PUT',
        credentials: 'include',
        headers: {
          ...this.getAuthHeader()
          // Don't set Content-Type when using FormData, browser will set it with boundary
        },
        body: formData
      }
    } else {
      // Use JSON for regular updates
      config = {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify({
          color: deploymentData.color,
          company_name: deploymentData.company_name
        })
      }
    }

    try {
      console.log('Updating deployment:', deploymentId)
      console.log('Request URL:', url)
      console.log('Has files:', hasFiles)
      console.log('Request payload:', hasFiles ? 'FormData' : deploymentData)

      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (this.isAuthError(response, errorData)) {
          await this.handleAuthError()
          throw new Error('Authentication required')
        }

        console.error('Update deployment failed with status:', response.status)
        console.error('Error data:', errorData)
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error.message === 'Authentication required') {
        throw error
      }
      console.error('Update deployment failed:', error)
      throw error
    }
  }

  async createChat(agentId, chatName = 'New Chat', groupId) {
    const url = `${this.chatBaseURL}/api/chats`

    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify({
        ...(groupId ? { group_id: groupId } : { agent_id: agentId }),
        name: chatName
      })
    }

    try {
      console.log('Creating chat for agent:', agentId)
      console.log('Request URL:', url)
      console.log('Request payload:', { agent_id: agentId, name: chatName })

      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Create chat failed with status:', response.status)
        console.error('Error data:', errorData)
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Create chat failed:', error)
      throw error
    }
  }

  async getChats(agentId, page = 1, limit = 50) {
    const url = `${this.chatBaseURL}/api/chats/agents/${agentId}`

    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get chats failed:', error)
      throw error
    }
  }
  async getGroupChats(groupId, page = 1, limit = 50) {
    const url = `${this.chatBaseURL}/api/chats/groups/${groupId}`

    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Get chats failed:', error)
      throw error
    }
  }

  async deleteChat(chatId) {
    const url = `${this.chatBaseURL}/api/chats/${chatId}`

    const config = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Delete chat failed:', error)
      throw error
    }
  }

  async getChatHistory(chatId) {
    return this.requestChatAI(`/api/chats/${chatId}/history`, {
      method: 'GET'
    })
  }







  async sendMessage(chatId, message) {
    const url = `${this.chatBaseURL}/api/chats/${chatId}/messages`

    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify({
        role: message.role,
        content: {
          type: message.content.type,
          value: message.content.value
        }
      })
    }

    try {
      console.log('Sending message to chat:', chatId)
      console.log('Request URL:', url)
      console.log('Message payload:', message)

      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Send message failed with status:', response.status)
        console.error('Error data:', errorData)
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Send message failed:', error)
      throw error
    }
  }

  async updateChat(chatId, chatData) {
    const url = `${this.chatBaseURL}/api/chats/${chatId}`

    const config = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(chatData)
    }

    try {
      console.log('Updating chat:', chatId)
      console.log('Request URL:', url)
      console.log('Request payload:', chatData)

      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Update chat failed with status:', response.status)
        console.error('Error data:', errorData)
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Update chat failed:', error)
      throw error
    }
  }

  async getPaymentById(subscription_id) {
    return this.requestPayment(`/api/subscriptions/${subscription_id}`, {
      method: 'GET'
    })
  }

  async getPaymentByIdNotSubscription(id) {
    return this.requestPayment(`/api/payments/${id}`, {
      method: 'GET'
    })
  }

  async cancelSubscription(subscriptionId) {
    return this.requestPayment(`/api/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST'
    })
  }

  async sendMessageToAI(message) {
    return this.requestChatAI('/chat', {
      method: 'POST',
      body: JSON.stringify({
        query: message
      })
    })
  }

  async sendMessageToAIStream(message, chatId, onChunk, onComplete, onError) {
    const url = `${this.chatAiBaseURL}/api/chat/stream`

    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify({
        query: message,
        chat_id: chatId
      })
    }

    try {
      console.log('Sending streaming message to AI:', message)
      console.log('Chat ID:', chatId)
      console.log('Request URL:', url)
      console.log('Request payload:', { query: message, chat_id: chatId })

      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (this.isAuthError(response, errorData)) {
          await this.handleAuthError()
          throw new Error('Authentication required')
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.error) {
                onError(data.error)
                return
              }

              if (data.chunk) {
                fullResponse += data.chunk
                onChunk(data.chunk)
              }

              if (data.done) {
                onComplete(fullResponse)
                return
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Send streaming message to AI failed:', error)
      onError(error.message)
    }
  }

  async updateChatMessage(chatId, messageId, messageData) {
    const url = `${this.chatBaseURL}/api/chats/${chatId}/messages/${messageId}`

    const config = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader()
      },
      body: JSON.stringify(messageData)
    }

    try {
      console.log('Updating chat message:', messageId)
      console.log('Request URL:', url)
      console.log('Request payload:', messageData)

      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Update chat message failed with status:', response.status)
        console.error('Error data:', errorData)
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Update chat message failed:', error)
      throw error
    }
  }


  async getComposioApps(page = 1, limit = 50, search = null) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (search && search.trim()) {
      queryParams.append('search', search.trim())
    }

    return this.requestAgent(`/api/composio-apps?${queryParams}`, {
      method: 'GET'
    })
  }

  async authenticateComposioApp(composioAppId) {
    return this.requestAgent(`/api/composio-apps/${composioAppId}/auth`, {
      method: 'POST',
      body: JSON.stringify({})
    })
  }

  async disconnectConnectedApp(agentId, connectedAccountId) {
    return this.requestAgent(`/api/agents/${agentId}/connected-apps/${connectedAccountId}`, {
      method: 'DELETE'
    })
  }

  async submitSupportTicket(ticketData) {
    return this.request(API_ENDPOINTS.SUBMIT_SUPPORT_TICKET, {
      method: 'POST',
      body: JSON.stringify(ticketData)
    })
  }
}

export const apiService = new ApiService()
export const authService = apiService
export { API_BASE_URL, API_ENDPOINTS } from './constants.js'
