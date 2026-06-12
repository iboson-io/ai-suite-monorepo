import { apiService } from '../agentApi.js'
import { extractAgentPayload, mapAgentDetails } from './mappers.js'

export async function fetchAgentDetails(agentId) {
  const response = await apiService.getAgentById(agentId)
  const details = mapAgentDetails(extractAgentPayload(response))

  if (!details) {
    throw new Error('Agent details are unavailable.')
  }

  return details
}
