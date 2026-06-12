import { apiService } from '../agentApi.js'

function extractDeployments(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.deployments)) return response.data.deployments
  if (Array.isArray(response?.deployments)) return response.deployments
  if (response?.data && typeof response.data === 'object') return [response.data]
  if (response && typeof response === 'object' && response.id) return [response]
  return []
}

export async function fetchAgentDeployment(agentId) {
  const response = await apiService.getDeployment(agentId)
  const deployments = extractDeployments(response)

  return {
    deployments,
    raw: response,
  }
}

export async function createAgentDeployment(agentId, deploymentData = {}) {
  return apiService.createDeployment(agentId, deploymentData)
}

export async function updateAgentDeployment(deploymentId, deploymentData) {
  return apiService.updateDeployment(deploymentId, deploymentData)
}

export async function regenerateDeploymentApiKey(deploymentId) {
  return apiService.regenerateApiKey(deploymentId)
}

const ENVIRONMENT_ALIASES = {
  production: ['production', 'prod'],
  develop: ['develop', 'development', 'dev'],
  test: ['test', 'staging'],
}

function normalizeEnvironment(value) {
  const normalized = String(value ?? '').toLowerCase()
  for (const [canonical, aliases] of Object.entries(ENVIRONMENT_ALIASES)) {
    if (aliases.includes(normalized)) return canonical
  }
  return normalized
}

export function getDeploymentForEnvironment(deployments, environment = 'production') {
  if (!Array.isArray(deployments) || deployments.length === 0) return null

  const target = normalizeEnvironment(environment)

  return (
    deployments.find(
      (item) => normalizeEnvironment(item.environment ?? item.env) === target
    ) ?? null
  )
}
