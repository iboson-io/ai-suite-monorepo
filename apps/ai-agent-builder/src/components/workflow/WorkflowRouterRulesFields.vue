<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Shared supervisor routing UI: conditions → agents, fallback, status.
 * Used by canvas sidebar (pattern + router selection) and the Workflow router modal.
 */
const model = defineModel({
  type: Object,
  required: true
})

const props = defineProps({
  patternAgents: {
    type: Array,
    default: () => []
  },
  /** Prefix for stable :key on rule rows (e.g. "cr", "crr", "rmodal"). */
  ruleKeyPrefix: {
    type: String,
    default: 'wr'
  },
  /** (agentId) => display string — typically parent’s agentLabelById */
  agentLabel: {
    type: Function,
    required: true
  }
})

const STATUS_OPTIONS = [
  { value: 'active', label: 'active' },
  { value: 'inactive', label: 'inactive' }
]

/** Which combobox is open: 'rule-0', 'fallback', 'status', or null */
const openDropdownKey = ref(null)

function ruleDdKey(i) {
  return `rule-${i}`
}

function toggleDropdown(key) {
  openDropdownKey.value = openDropdownKey.value === key ? null : key
}

function closeDropdownsOnOutside(e) {
  const key = openDropdownKey.value
  if (!key) return
  let el = e.target
  while (el) {
    if (el.getAttribute?.('data-router-dd-key') === key) return
    el = el.parentElement
  }
  openDropdownKey.value = null
}

function labelForRuleAgent(rule) {
  const id = rule.agent_id
  if (id == null || id === '') return 'Select agent'
  const pa = props.patternAgents.find((x) => String(x.agent_id) === String(id))
  return pa ? props.agentLabel(pa.agent_id) : String(id)
}

function labelForFallback() {
  const id = model.value.fallback_agent_id
  if (id == null || id === '') return 'None'
  const pa = props.patternAgents.find((x) => String(x.agent_id) === String(id))
  return pa ? props.agentLabel(pa.agent_id) : String(id)
}

function labelForStatus() {
  return model.value.status === 'inactive' ? 'inactive' : 'active'
}

function selectRuleAgent(rIdx, agentId) {
  model.value.rules[rIdx].agent_id = agentId
  openDropdownKey.value = null
}

function selectFallbackAgent(agentId) {
  model.value.fallback_agent_id = agentId
  openDropdownKey.value = null
}

function selectStatus(val) {
  model.value.status = val
  openDropdownKey.value = null
}

function addRule() {
  const first = props.patternAgents[0]
  const def = first?.agent_id != null ? String(first.agent_id) : ''
  model.value.rules.push({ condition: '', agent_id: def })
}

function removeRule(idx) {
  openDropdownKey.value = null
  if (model.value.rules.length <= 1) {
    model.value.rules = [{ condition: '', agent_id: '' }]
    return
  }
  model.value.rules.splice(idx, 1)
}

onMounted(() => {
  document.addEventListener('pointerdown', closeDropdownsOnOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', closeDropdownsOnOutside, true)
})
</script>

<template>
  <div class="space-y-3">
    <div class="space-y-2">
      <p class="text-[11px] font-medium primary_text_color">Routing rules</p>
      <div
        v-for="(rule, rIdx) in model.rules"
        :key="ruleKeyPrefix + '-' + rIdx"
        class="flex flex-col gap-1.5 rounded-md border regular_border_color bg_secondary_color p-2"
      >
        <label class="text-[10px] font-medium secondary_text_color">Condition</label>
        <input
          v-model="rule.condition"
          type="text"
          class="w-full border regular_border_color rounded px-2 py-1.5 text-xs focus:outline-none bg_secondary_color"
          placeholder="Describe when this agent should run"
        >
        <label class="text-[10px] font-medium secondary_text_color">Agent</label>
        <div
          v-if="!patternAgents.length"
          class="w-full border regular_border_color rounded-lg px-2 py-1.5 text-xs bg_primary_color tertiary_text_color"
        >
          Select agent
        </div>
        <div
          v-else
          class="relative"
          :data-router-dd-key="ruleDdKey(rIdx)"
        >
          <button
            type="button"
            class="w-full border regular_border_color rounded-lg px-2 py-1.5 text-xs flex items-center justify-between gap-2 bg_primary_color hover:bg-gray-50-hover text-left primary_text_color focus:outline-none min-w-0"
            :aria-expanded="openDropdownKey === ruleDdKey(rIdx)"
            aria-haspopup="listbox"
            @click.stop="toggleDropdown(ruleDdKey(rIdx))"
          >
            <span class="truncate min-w-0">{{ labelForRuleAgent(rule) }}</span>
            <svg
              class="w-3.5 h-3.5 secondary_text_color shrink-0 transition-transform duration-200"
              :class="{ 'rotate-180': openDropdownKey === ruleDdKey(rIdx) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <ul
            v-show="openDropdownKey === ruleDdKey(rIdx)"
            class="absolute z-[1000] left-0 right-0 mt-1 rounded-lg border regular_border_color bg_secondary_color shadow-lg py-1 max-h-56 overflow-auto"
            role="listbox"
          >
            <li
              v-for="pa in patternAgents"
              :key="pa.id"
              role="option"
              :aria-selected="String(rule.agent_id) === String(pa.agent_id)"
              class="px-2 py-1.5 text-xs cursor-pointer hover:bg_primary_color"
              :class="{ 'bg_primary_color font-medium': String(rule.agent_id) === String(pa.agent_id) }"
              @click="selectRuleAgent(rIdx, String(pa.agent_id))"
            >
              {{ agentLabel(pa.agent_id) }}
            </li>
          </ul>
        </div>
        <button
          type="button"
          class="text-[11px] delete_text_color self-end hover:underline"
          @click="removeRule(rIdx)"
        >
          Remove rule
        </button>
      </div>
      <button
        type="button"
        class="text-xs font-medium text-violet-700 hover:underline"
        @click="addRule"
      >
        + Add rule
      </button>
    </div>
    <div>
      <label class="block text-[11px] font-medium secondary_text_color mb-1">Fallback agent</label>
      <div
        v-if="!patternAgents.length"
        class="w-full border regular_border_color rounded-lg px-2 py-1.5 text-xs bg_primary_color tertiary_text_color"
      >
        None
      </div>
      <div v-else class="relative" data-router-dd-key="fallback">
        <button
          type="button"
          class="w-full border regular_border_color rounded-lg px-2 py-1.5 text-xs flex items-center justify-between gap-2 bg_primary_color hover:bg-gray-50-hover text-left primary_text_color focus:outline-none min-w-0"
          :aria-expanded="openDropdownKey === 'fallback'"
          aria-haspopup="listbox"
          @click.stop="toggleDropdown('fallback')"
        >
          <span class="truncate min-w-0">{{ labelForFallback() }}</span>
          <svg
            class="w-3.5 h-3.5 secondary_text_color shrink-0 transition-transform duration-200"
            :class="{ 'rotate-180': openDropdownKey === 'fallback' }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <ul
          v-show="openDropdownKey === 'fallback'"
          class="absolute z-[1000] left-0 right-0 mt-1 rounded-lg border regular_border_color bg_secondary_color shadow-lg py-1 max-h-56 overflow-auto"
          role="listbox"
        >
          <li
            role="option"
            :aria-selected="!model.fallback_agent_id"
            class="px-2 py-1.5 text-xs cursor-pointer hover:bg_primary_color"
            :class="{ 'bg_primary_color font-medium': !model.fallback_agent_id }"
            @click="selectFallbackAgent('')"
          >
            None
          </li>
          <li
            v-for="pa in patternAgents"
            :key="ruleKeyPrefix + '-fb-' + pa.id"
            role="option"
            :aria-selected="String(model.fallback_agent_id) === String(pa.agent_id)"
            class="px-2 py-1.5 text-xs cursor-pointer hover:bg_primary_color"
            :class="{ 'bg_primary_color font-medium': String(model.fallback_agent_id) === String(pa.agent_id) }"
            @click="selectFallbackAgent(String(pa.agent_id))"
          >
            {{ agentLabel(pa.agent_id) }}
          </li>
        </ul>
      </div>
    </div>
    <div>
      <label class="block text-[11px] font-medium secondary_text_color mb-1">Status</label>
      <div class="relative" data-router-dd-key="status">
        <button
          type="button"
          class="w-full border regular_border_color rounded-lg px-2 py-1.5 text-xs flex items-center justify-between gap-2 bg_primary_color hover:bg-gray-50-hover text-left primary_text_color focus:outline-none min-w-0"
          :aria-expanded="openDropdownKey === 'status'"
          aria-haspopup="listbox"
          @click.stop="toggleDropdown('status')"
        >
          <span class="truncate min-w-0">{{ labelForStatus() }}</span>
          <svg
            class="w-3.5 h-3.5 secondary_text_color shrink-0 transition-transform duration-200"
            :class="{ 'rotate-180': openDropdownKey === 'status' }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <ul
          v-show="openDropdownKey === 'status'"
          class="absolute z-[1000] left-0 right-0 mt-1 rounded-lg border regular_border_color bg_secondary_color shadow-lg py-1 max-h-56 overflow-auto"
          role="listbox"
        >
          <li
            v-for="opt in STATUS_OPTIONS"
            :key="opt.value"
            role="option"
            :aria-selected="(model.status || 'active') === opt.value"
            class="px-2 py-1.5 text-xs cursor-pointer hover:bg_primary_color"
            :class="{ 'bg_primary_color font-medium': (model.status || 'active') === opt.value }"
            @click="selectStatus(opt.value)"
          >
            {{ opt.label }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
