import { validateApiBaseUrl, validateDbConfig } from './validation.js'

const SCHEMA_MAX_BYTES = 50 * 1024 * 1024
const DOCUMENT_MAX_BYTES = 50 * 1024 * 1024

const SCHEMA_EXTENSIONS = ['.json', '.yaml', '.yml']
const SCHEMA_MIME_TYPES = [
  'application/json',
  'application/x-yaml',
  'text/yaml',
  'application/yaml',
  'text/x-yaml',
]

const DOCUMENT_EXTENSIONS = ['.pdf', '.docx']
const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function getExtension(fileName) {
  const index = String(fileName ?? '').toLowerCase().lastIndexOf('.')
  return index >= 0 ? String(fileName).toLowerCase().slice(index) : ''
}

export async function validateApiSchemaFiles(files) {
  const validFiles = []
  const errors = []

  for (const file of files) {
    const extension = getExtension(file.name)
    const isValidType =
      SCHEMA_MIME_TYPES.includes(file.type) || SCHEMA_EXTENSIONS.includes(extension)

    if (!isValidType) {
      errors.push(`${file.name}: Upload a JSON or YAML file.`)
      continue
    }

    if (file.size > SCHEMA_MAX_BYTES) {
      errors.push(`${file.name}: File must be under 50 MB.`)
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

export async function validateSchemaFiles(files) {
  const validFiles = []
  const errors = []

  for (const file of files) {
    const extension = getExtension(file.name)
    const isValidType =
      SCHEMA_MIME_TYPES.includes(file.type) || SCHEMA_EXTENSIONS.includes(extension)

    if (!isValidType) {
      errors.push(`${file.name}: Upload a JSON or YAML file.`)
      continue
    }

    if (file.size > SCHEMA_MAX_BYTES) {
      errors.push(`${file.name}: File must be under 50 MB.`)
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
      errors.push(`${file.name}: Upload a PDF or DOCX file.`)
      continue
    }

    if (file.size > DOCUMENT_MAX_BYTES) {
      errors.push(`${file.name}: File must be under 50 MB.`)
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
  selectedMergeApps = [],
  existingSchemaCount = 0,
  existingDocumentCount = 0,
}) {
  switch (knowledgeTab) {
    case 'api': {
      if (schemaFiles.length === 0 && existingSchemaCount === 0) {
        return {
          valid: false,
          message: 'Please upload API schema files.',
          field: 'schema',
        }
      }
      const baseUrlResult = validateApiBaseUrl(baseUrl, { required: true })
      if (!baseUrlResult.valid) {
        return { valid: false, message: baseUrlResult.message, field: 'baseUrl' }
      }
      return { valid: true, message: '' }
    }

    case 'documents': {
      if (documentFiles.length === 0 && existingDocumentCount === 0) {
        return {
          valid: false,
          message: 'Upload at least one document.',
          field: 'documents',
        }
      }
      const trimmedBaseUrl = String(baseUrl ?? '').trim()
      if (trimmedBaseUrl) {
        const baseUrlResult = validateApiBaseUrl(trimmedBaseUrl, { required: false })
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

    case 'mcp': {
      if (!selectedMergeApps.length) {
        return {
          valid: false,
          message: 'Select at least one Merge app to attach to this agent.',
          field: 'mcp',
        }
      }
      return { valid: true, message: '' }
    }

    default:
      return { valid: true, message: '' }
  }
}
