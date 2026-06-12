import { apiService } from '../../agentApi.js'
import { getDeploymentForEnvironment } from '../deployment.js'

function extractDeployments(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.deployments)) return response.data.deployments
  if (Array.isArray(response?.deployments)) return response.deployments
  if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    return [response.data]
  }
  if (response && typeof response === 'object' && response.id) return [response]
  return []
}

export async function fetchGroupDeployment(groupId) {
  const response = await apiService.getGroupDeployment(groupId)
  const deployments = extractDeployments(response)

  return {
    deployments,
    raw: response,
  }
}

export async function createGroupDeployment(groupId, deploymentData = {}) {
  return apiService.createGroupDeployment(groupId, deploymentData)
}

export { getDeploymentForEnvironment }
