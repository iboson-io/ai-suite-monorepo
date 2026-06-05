import { validateApiBaseUrl, validateDbConfig } from './validation.js'

const SCHEMA_MAX_BYTES = 5 * 1024 * 1024
const DOCUMENT_MAX_BYTES = 5 * 1024 * 1024

const SCHEMA_EXTENSIONS = ['.json', '.txt', '.yaml', '.yml']
const SCHEMA_MIME_TYPES = [
  'application/json',
  'text/plain',
  'application/x-yaml',
  'text/yaml',
  'application/yaml',
  'text/x-yaml',
]

const DOCUMENT_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg']
const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
]

function getExtension(fileName) {
  const index = String(fileName ?? '').toLowerCase().lastIndexOf('.')
  return index >= 0 ? String(fileName).toLowerCase().slice(index) : ''
}

export async function validateSchemaFiles(files) {
  const validFiles = []
  const errors = []

  for (const file of files) {
    const extension = getExtension(file.name)
    const isValidType =
      SCHEMA_MIME_TYPES.includes(file.type) || SCHEMA_EXTENSIONS.includes(extension)

    if (!isValidType) {
      errors.push(`${file.name}: Upload a JSON, TXT, or YAML file.`)
      continue
    }

    if (file.size > SCHEMA_MAX_BYTES) {
      errors.push(`${file.name}: File must be under 5 MB.`)
      continue
    }

    if (extension === '.json') {
      try {
        JSON.parse(await file.text())
      } catch {
        errors.push(`${file.name}: Invalid JSON format.`)
        continue
      }
    }

    validFiles.push(file)
  }

  return { validFiles, errors }
}

export function validateDocumentFiles(files) {
  const validFiles = []
  const errors = []

  for (const file of files) {
    const extension = getExtension(file.name)
    const isValidType =
      DOCUMENT_MIME_TYPES.includes(file.type) || DOCUMENT_EXTENSIONS.includes(extension)

    if (!isValidType) {
      errors.push(`${file.name}: Upload a PDF, PNG, JPG, or JPEG file.`)
      continue
    }

    if (file.size > DOCUMENT_MAX_BYTES) {
      errors.push(`${file.name}: File must be under 5 MB.`)
      continue
    }

    validFiles.push(file)
  }

  return { validFiles, errors }
}

export function validateCreateKnowledgeStep({
  knowledgeTab,
  schemaFiles = [],
  documentFiles = [],
  baseUrl = '',
  dbConfig = null,
  selectedComposioApps = [],
}) {
  switch (knowledgeTab) {
    case 'api': {
      if (schemaFiles.length === 0) {
        return {
          valid: false,
          message: 'Upload at least one API schema file.',
          field: 'schema',
        }
      }
      const baseUrlResult = validateApiBaseUrl(baseUrl)
      if (!baseUrlResult.valid) {
        return { valid: false, message: baseUrlResult.message, field: 'baseUrl' }
      }
      return { valid: true, message: '' }
    }

    case 'documents': {
      if (documentFiles.length === 0) {
        return {
          valid: false,
          message: 'Upload at least one document.',
          field: 'documents',
        }
      }
      const trimmedBaseUrl = String(baseUrl ?? '').trim()
      if (trimmedBaseUrl) {
        const baseUrlResult = validateApiBaseUrl(trimmedBaseUrl)
        if (!baseUrlResult.valid) {
          return { valid: false, message: baseUrlResult.message, field: 'baseUrl' }
        }
      }
      return { valid: true, message: '' }
    }

    case 'db': {
      const dbResult = validateDbConfig(dbConfig)
      return {
        valid: dbResult.valid,
        message: dbResult.message || 'Complete all database fields.',
        field: 'db',
        errors: dbResult.errors,
      }
    }

    case 'composio': {
      if (!selectedComposioApps.length) {
        return {
          valid: false,
          message: 'Select at least one Composio app.',
          field: 'composio',
        }
      }
      return { valid: true, message: '' }
    }

    default:
      return { valid: true, message: '' }
  }
}
