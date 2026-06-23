<template>
  <aside v-if="false" class="workflow-build-panel w-full lg:w-[380px] xl:w-[300px] flex-shrink-0 border-b lg:border-b-0 lg:border-l border-slate-200 bg-white overflow-y-auto max-h-[40vh] lg:max-h-none">
    <div class="p-4 space-y-4 text-sm text-slate-800">
      <!-- Workflow -->
      <div class="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-xs font-medium text-slate-500">Workflow</p>
            <p class="font-semibold text-slate-900 truncate">{{ workflowRecord?.name || '…' }}</p>
            <p v-if="workflowRecord?.status" class="text-xs capitalize text-slate-600 mt-0.5">
              {{ workflowRecord.status }}
            </p>
          </div>
          <div :class="wfCardTipWrap">
            <button
              type="button"
              class="shrink-0 rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-white hover:text-slate-900"
              aria-label="Edit workflow"
              @click="openWorkflowEditModal"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <span role="tooltip" :class="wfCardTip">Edit workflow</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            class="text-xs px-2 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            :disabled="saving || workflowRecord?.status === 'active'"
            @click="doActivateWorkflow"
          >
            Activate
          </button>
          <button
            type="button"
            class="text-xs px-2 py-1.5 rounded border border-slate-300 hover:bg-white disabled:opacity-50"
            :disabled="saving || workflowRecord?.status !== 'active'"
            @click="doDeactivateWorkflow"
          >
            Deactivate
          </button>
          <div :class="wfCardTipWrap">
            <button
              type="button"
              class="rounded-md border border-red-300 p-1.5 text-red-700 hover:bg-red-50"
              aria-label="Delete workflow"
              @click="confirmDeleteWorkflow"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
            <span role="tooltip" :class="wfCardTip">Delete workflow</span>
          </div>
        </div>
      </div>

      <!-- Node selected on canvas → properties OR Adding a trigger -->
      <div
        v-if="(canvasSelection && canvasSelection.kind !== 'workflow-hub') || isAddingTrigger"
        class="rounded-lg border-2 border-blue-300/80 bg-gradient-to-b from-blue-50/90 to-white p-3 space-y-3 shadow-sm"
      >
        <div class="flex items-center justify-between gap-2">
          <p class="text-xs font-bold uppercase tracking-wide text-blue-900">
            {{ isAddingTrigger ? 'Add trigger' : 'Canvas selection' }}
          </p>
          <button
            type="button"
            class="text-[11px] font-medium text-slate-500 hover:text-slate-900"
            @click="isAddingTrigger ? (isAddingTrigger = false) : requestClearCanvasSelection()"
          >
            {{ isAddingTrigger ? 'Cancel' : 'Clear' }}
          </button>
        </div>

        <template v-if="isAddingTrigger">
          <div class="space-y-3">
            <label class="block text-xs font-medium text-slate-600">Type</label>
            <div ref="triggerModalTypeDropdownRef" class="relative">
              <button
                type="button"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100/80 text-left text-slate-900"
                :aria-expanded="triggerModalTypeOpen"
                aria-haspopup="listbox"
                @click="triggerModalTypeOpen = !triggerModalTypeOpen"
              >
                <span>{{ triggerTypeOptionLabel(triggerForm.trigger_type) }}</span>
                <svg
                  class="w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200"
                  :class="{ 'rotate-180': triggerModalTypeOpen }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <ul
                v-show="triggerModalTypeOpen"
                class="absolute z-[10010] left-0 right-0 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg py-1 max-h-56 overflow-auto"
                role="listbox"
              >
                <li
                  v-for="opt in TRIGGER_TYPE_OPTIONS"
                  :key="opt.value"
                  role="option"
                  :aria-selected="triggerForm.trigger_type === opt.value"
                  class="px-3 py-2 text-sm cursor-pointer hover:bg-slate-50"
                  :class="{ 'bg-slate-100 font-medium': triggerForm.trigger_type === opt.value }"
                  @click="selectTriggerModalType(opt.value)"
                >
                  {{ opt.label }}
                </li>
              </ul>
            </div>

            <label class="flex items-center gap-2 text-xs text-slate-700">
              <input v-model="triggerForm.is_active" type="checkbox" class="rounded border-slate-300" />
              Active
            </label>

            <template v-if="triggerForm.trigger_type === 'email'">
              <label class="block text-xs font-medium text-slate-600">Inbound email</label>
              <input
                v-model="triggerEmail"
                type="email"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                :class="{ 'border-red-500 ring-1 ring-red-200': triggerErr('config.inbound_email', 'inbound_email') }"
                placeholder="support@company.com"
                @input="onTriggerFieldInput('email')"
              >
              <p v-if="triggerErr('config.inbound_email', 'inbound_email')" class="text-red-600 text-xs">
                {{ triggerErr('config.inbound_email', 'inbound_email') }}
              </p>
            </template>
            <template v-else-if="triggerForm.trigger_type === 'webhook'">
              <label class="block text-xs font-medium text-slate-600">Endpoint URL</label>
              <input
                v-model="triggerWebhook"
                type="url"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                :class="{ 'border-red-500 ring-1 ring-red-200': triggerErr('config.endpoint', 'endpoint', 'config.url', 'url') }"
                placeholder="https://…"
                @input="onTriggerFieldInput('webhook')"
              >
              <p v-if="triggerErr('config.endpoint', 'endpoint', 'config.url', 'url')" class="text-red-600 text-xs">
                {{ triggerErr('config.endpoint', 'endpoint', 'config.url', 'url') }}
              </p>
            </template>
            <template v-else-if="triggerForm.trigger_type === 'schedule'">
              <label class="block text-xs font-medium text-slate-600">Cron</label>
              <input
                v-model="triggerCron"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                :class="{ 'border-red-500 ring-1 ring-red-200': triggerErr('config.cron', 'cron') }"
                placeholder="0 9 * * *"
                @input="onTriggerFieldInput('schedule')"
              >
              <p v-if="triggerErr('config.cron', 'cron')" class="text-red-600 text-xs">
                {{ triggerErr('config.cron', 'cron') }}
              </p>
            </template>
            <template v-else-if="triggerForm.trigger_type === 'sms' || triggerForm.trigger_type === 'voice'">
              <label class="block text-xs font-medium text-slate-600">Phone</label>
              <input
                v-model="triggerPhone"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                :class="{ 'border-red-500 ring-1 ring-red-200': triggerErr('config.phone_number', 'phone_number', 'phone') }"
                placeholder="+14155552671"
                @input="onTriggerFieldInput('phone')"
              >
              <p v-if="triggerErr('config.phone_number', 'phone_number', 'phone')" class="text-red-600 text-xs">
                {{ triggerErr('config.phone_number', 'phone_number', 'phone') }}
              </p>
            </template>

            <div class="flex gap-2 pt-1">
              <button
                type="button"
                class="flex-1 py-2 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                :disabled="saving"
                @click="submitTrigger"
              >
                {{ saving ? 'Saving…' : 'Create' }}
              </button>
              <button
                type="button"
                class="flex-1 py-2 px-3 rounded-lg border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                :disabled="saving"
                @click="isAddingTrigger = false"
              >
                Cancel
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="canvasSelection.kind === 'trigger'">
          <div class="text-xs text-slate-600 py-2 font-medium">
            Configure this trigger directly inside the trigger node on the canvas.
          </div>
        </template>

        <template v-else-if="canvasSelection.kind === 'pattern'">
          <div v-if="canvasPatternLoading" class="text-xs text-slate-600 py-2">Loading pattern…</div>
          <div v-else-if="canvasEditPattern" class="space-y-3">
            <label class="block text-xs font-medium text-slate-600">Pattern type</label>
            <select
              v-model="canvasPatternForm.pattern_type"
              class="w-full border rounded-lg px-3 py-2 text-sm"
              :class="{ 'border-red-500 ring-1 ring-red-200': canvasPatternErr('pattern_type') }"
              @change="onCanvasPatternTypeChange"
            >
              <option value="sequential">Sequential</option>
              <option value="parallel">Parallel</option>
              <option value="supervisor">Supervisor</option>
              <option value="agent_to_agent">Agent-to-agent</option>
            </select>
            <!-- <p v-if="canvasPatternErr('pattern_type')" class="text-red-600 text-xs">{{ canvasPatternErr('pattern_type') }}</p>
            <label class="block text-xs font-medium text-slate-600">Execution order</label>
            <input
              v-model="canvasPatternForm.execution_order"
              type="text"
              inputmode="numeric"
              class="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="e.g. 2"
              @input="clearCanvasPatternErrKeys(['execution_order'])"
            > -->
            <label class="block text-xs font-medium text-slate-600">Name <span class="text-red-600" aria-hidden="true">*</span></label>
            <input
              v-model="canvasPatternForm.name"
              type="text"
              autocomplete="off"
              class="w-full border rounded-lg px-3 py-2 text-sm"
              :class="{ 'border-red-500 ring-1 ring-red-200': canvasPatternErr('name') }"
              @input="clearCanvasPatternErrKeys(['name'])"
            >
            <p v-if="canvasPatternErr('name')" class="text-red-600 text-xs">{{ canvasPatternErr('name') }}</p>
            <label class="block text-xs font-medium text-slate-600">Description <span class="text-red-600" aria-hidden="true">*</span></label>
            <textarea
              v-model="canvasPatternForm.description"
              rows="3"
              class="w-full border rounded-lg px-3 py-2 text-sm"
              :class="{ 'border-red-500 ring-1 ring-red-200': canvasPatternErr('description') }"
              @input="clearCanvasPatternErrKeys(['description'])"
            />
            <p v-if="canvasPatternErr('description')" class="text-red-600 text-xs">{{ canvasPatternErr('description') }}</p>
            <div
              v-if="canvasPatternForm.pattern_type === 'supervisor' && canvasEditPattern?.id"
              class="rounded-lg border border-violet-200 bg-violet-50/90 px-2.5 py-2.5 space-y-2"
            >
              <p class="text-[11px] font-medium text-violet-900">Workflow router</p>
              <p v-if="canvasPatternAgentsLoading" class="text-xs text-violet-800/90">Loading pattern agents…</p>
              <p
                v-else-if="!canvasPatternAgents.length"
                class="text-[11px] text-violet-900/85 leading-snug"
              >
                Add at least one agent to this supervisor pattern (on the canvas or via Pattern agents), then configure routing here.
              </p>
              <template v-else>
                <button
                  type="button"
                  class="w-full py-1.5 px-2 rounded-lg border border-violet-300 bg-white text-violet-900 text-xs font-semibold hover:bg-violet-100"
                  @click="canvasRouterExpanded = !canvasRouterExpanded"
                >
                  {{
                    canvasRouterExpanded
                      ? 'Hide workflow router'
                      : canvasRouterExists
                        ? 'Edit workflow router'
                        : 'Add workflow router'
                  }}
                </button>
                <div v-show="canvasRouterExpanded" class="space-y-3 pt-2 border-t border-violet-200/80">
                  <WorkflowRouterRulesFields
                    v-model="canvasRouterForm"
                    :pattern-agents="canvasPatternAgents"
                    rule-key-prefix="cr"
                    :agent-label="agentLabelById"
                  />
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="flex-1 min-w-[6rem] py-1.5 px-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50"
                      :disabled="saving"
                      @click="submitCanvasRouter"
                    >
                      {{ saving ? 'Saving…' : canvasRouterExists ? 'Update router' : 'Create router' }}
                    </button>
                    <button
                      v-if="canvasRouterExists"
                      type="button"
                      class="flex-1 min-w-[6rem] py-1.5 px-2 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                      :disabled="saving"
                      @click="deleteCanvasRouterFromSidebar"
                    >
                      Remove router
                    </button>
                  </div>
                </div>
              </template>
            </div>
            <div class="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                class="flex-1 min-w-[6rem] py-2 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                :disabled="saving"
                @click="submitCanvasPatternUpdate"
              >
                {{ saving ? 'Saving…' : 'Update' }}
              </button>
              <button
                type="button"
                class="flex-1 min-w-[6rem] py-2 px-3 rounded-lg border border-red-300 text-red-800 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                :disabled="saving"
                @click="deleteSelectedCanvasPattern"
              >
                Delete
              </button>
            </div>
          </div>
          <p v-else class="text-xs text-amber-700">Could not load this pattern.</p>
        </template>
        <template v-else-if="canvasSelection.kind === 'router'">
          <div v-if="!canvasSelection.patternId" class="text-xs text-amber-700">
            Missing pattern for this router. Reload the workflow.
          </div>
          <div v-else class="space-y-3">
            <div>
              <p class="text-xs font-semibold text-slate-800">Supervisor router</p>
             
            </div>
            <p v-if="canvasPatternAgentsLoading" class="text-xs text-violet-800/90">Loading router and pattern agents…</p>
            <div
              v-else-if="!canvasPatternAgents.length && canvasRouterExists"
              class="space-y-2 rounded-lg border border-amber-200 bg-amber-50/90 px-2 py-2 text-[11px] text-amber-950"
            >
              <p>No agents on this pattern. Add agents to edit routing rules, or remove the router config.</p>
              <button
                type="button"
                class="w-full py-1.5 px-2 rounded-lg border border-red-200 text-red-800 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                :disabled="saving"
                @click="deleteCanvasRouterFromSidebar"
              >
                Delete router
              </button>
            </div>
            <p
              v-else-if="!canvasPatternAgents.length"
              class="text-[11px] text-violet-900/85 leading-snug rounded-lg border border-amber-200 bg-amber-50/90 px-2 py-2"
            >
              Add at least one agent to this supervisor pattern, then assign routing rules (conditions map to
              <code class="text-[10px]">agent_id</code> values).
            </p>
            <div
              v-else
              class="rounded-lg border border-violet-200 bg-violet-50/90 px-2.5 py-2.5 space-y-3"
            >
              <WorkflowRouterRulesFields
                v-model="canvasRouterForm"
                :pattern-agents="canvasPatternAgents"
                rule-key-prefix="crr"
                :agent-label="agentLabelById"
              />
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="flex-1 min-w-[6rem] py-1.5 px-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50"
                  :disabled="saving"
                  @click="submitCanvasRouter"
                >
                  {{ saving ? 'Saving…' : canvasRouterExists ? 'Update router' : 'Create router' }}
                </button>
                <button
                  v-if="canvasRouterExists"
                  type="button"
                  class="flex-1 min-w-[6rem] py-1.5 px-2 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                  :disabled="saving"
                  @click="deleteCanvasRouterFromSidebar"
                >
                  Delete router
                </button>
              </div>
            </div>
        
          </div>
        </template>
        <template v-else-if="canvasSelection.kind === 'agent'">
          <div
            v-if="!canvasSelection.patternId || !canvasSelection.patternAgentId"
            class="text-xs text-amber-700"
          >
            This step is missing pattern metadata. Reload the workflow or re-add the agent.
          </div>
          <div v-else-if="canvasAgentLoading" class="text-xs text-slate-600 py-2">Loading agent step…</div>
          <div v-else-if="canvasEditAgent" class="space-y-3">
            <p class="text-xs text-slate-600">
              Pattern agent
              </p>
            <label class="block text-xs font-medium text-slate-600">Agent</label>
            <p v-if="agentsLoading" class="text-xs text-slate-500">Loading your agents…</p>
            <p v-else-if="!agentOptions.length" class="text-xs text-amber-700">No agents in catalog. Create an agent first.</p>
            <select
              v-model="canvasAgentForm.agent_id"
              class="w-full border rounded-lg px-3 py-2 text-sm"
              :class="{ 'border-red-500 ring-1 ring-red-200': canvasAgentErr('agent_id') }"
              :disabled="agentsLoading || !agentOptions.length"
              @change="clearCanvasAgentErrKeys(['agent_id'])"
            >
              <option value="" disabled>Select agent</option>
              <option v-for="a in agentOptions" :key="a.id" :value="String(a.id)">{{ agentLabel(a) }}</option>
            </select>
            <p v-if="canvasAgentErr('agent_id')" class="text-red-600 text-xs">{{ canvasAgentErr('agent_id') }}</p>
            <label class="flex items-center gap-2 text-xs text-slate-700">
              <input v-model="canvasAgentForm.is_fallback" type="checkbox" class="rounded border-slate-300" />
              Fallback agent
            </label>
            <label class="block text-xs font-medium text-slate-600">Timeout (seconds)</label>
            <input
              v-model="canvasAgentForm.timeoutSec"
              type="number"
              min="0"
              step="1"
              class="w-full border rounded-lg px-3 py-2 text-sm"
              :class="{ 'border-red-500 ring-1 ring-red-200': canvasAgentErr('timeout') }"
              placeholder="e.g. 30"
              @input="clearCanvasAgentErrKeys(['timeout'])"
            >
            <p v-if="canvasAgentErr('timeout')" class="text-red-600 text-xs">{{ canvasAgentErr('timeout') }}</p>
            <div class="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                class="flex-1 min-w-[6rem] py-2 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                :disabled="saving || !canvasAgentForm.agent_id"
                @click="submitCanvasAgentUpdate"
              >
                {{ saving ? 'Saving…' : 'Update' }}
              </button>
              <button
                type="button"
                class="flex-1 min-w-[6rem] py-2 px-3 rounded-lg border border-red-300 text-red-800 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                :disabled="saving"
                @click="deleteSelectedCanvasAgent"
              >
                Remove
              </button>
            </div>
          </div>
          <p v-else class="text-xs text-amber-700">Could not load this agent step.</p>
        </template>
        <template v-else-if="canvasSelection.kind === 'output'">
          <div v-if="!canvasSelection.channelId" class="text-xs text-amber-700">
            Missing channel id for this node. Reload the workflow.
          </div>
          <div v-else-if="canvasOutputChannelLoading" class="text-xs text-slate-600 py-2">Loading output channel…</div>
          <div v-else-if="canvasEditOutputChannel" class="space-y-3">
            <p class="text-xs font-semibold text-slate-800">Output channel</p>
            <label class="block text-xs font-medium text-slate-600">Channel type</label>
            <div
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mb-3 text-sm bg-slate-50 text-slate-700"
            >
              {{ outputChannelTypeLabel(canvasOutputChannelForm.channel_type) }}
            </div>
            <template v-if="canvasOutputChannelForm.channel_type === 'email'">
              <label class="block text-xs font-medium text-slate-600">To</label>
              <input
                v-model="canvasOutputChannelForm.emailTo"
                type="email"
                class="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="owner@example.com"
                autocomplete="off"
              >
              <label class="block text-xs font-medium text-slate-600">Subject</label>
              <input
                v-model="canvasOutputChannelForm.emailSubject"
                type="text"
                class="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Workflow result"
                autocomplete="off"
              >
            </template>
            <template v-else-if="canvasOutputChannelForm.channel_type === 'sms'">
              <label class="block text-xs font-medium text-slate-600">From number</label>
              <input
                v-model="canvasOutputChannelForm.smsFromNumber"
                type="text"
                class="w-full border rounded-lg px-3 py-2 text-sm focus-outline-none"
                placeholder="+15551234567"
                autocomplete="off"
              >
              <p class="text-[11px] text-slate-500 mt-1 mb-3">
              Use international format: a leading
                <code class="text-[10px]">+</code>, country code, 
              </p>
            </template>
            <template v-else-if="canvasOutputChannelForm.channel_type === 'voice'">
             
            </template>
            <template v-else-if="canvasOutputChannelForm.channel_type === 'outbound_call'">
              <label class="block text-xs font-medium text-slate-600">From number</label>
              <input
                v-model="canvasOutputChannelForm.outboundFromNumber"
                type="text"
                class="w-full border rounded-lg px-3 py-2 text-sm mb-2 focus-outline-none"
                placeholder="+15551234567"
                autocomplete="off"
              >
              <label class="block text-xs font-medium text-slate-600">TTS voice</label>
              <input
                v-model="canvasOutputChannelForm.outboundTtsVoice"
                type="text"
                class="w-full border rounded-lg px-3 py-2 text-sm mb-2 focus-outline-none"
                placeholder="e.g. Polly.Joanna"
                autocomplete="off"
              >
              <label class="block text-xs font-medium text-slate-600">Language</label>
              <input
                v-model="canvasOutputChannelForm.outboundLanguage"
                type="text"
                class="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. en-US"
                autocomplete="off"
              >
            </template>
            <template v-else>
              <label class="block text-xs font-medium text-slate-600">Config (JSON)</label>
              <textarea
                v-model="canvasOutputChannelForm.configJson"
                rows="5"
                class="w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                placeholder="{}"
              />
            </template>
            <label class="flex items-center gap-2 text-xs text-slate-700">
              <input v-model="canvasOutputChannelForm.is_primary" type="checkbox" class="rounded border-slate-300">
              Primary channel
            </label>
            <div class="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                class="flex-1 min-w-[6rem] py-2 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                :disabled="saving"
                @click="submitCanvasOutputChannelUpdate"
              >
                {{ saving ? 'Saving…' : 'Update' }}
              </button>
              <button
                type="button"
                class="flex-1 min-w-[6rem] py-2 px-3 rounded-lg border border-red-300 text-red-800 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                :disabled="saving"
                @click="deleteSelectedCanvasOutput"
              >
                Remove
              </button>
            </div>
          </div>
          <p v-else class="text-xs text-amber-700">Could not load this output channel.</p>
        </template>
        <template v-else-if="canvasSelection.kind === 'hitl'">
          <p class="text-xs font-semibold text-slate-800">Human-in-the-loop</p>
         
          <p v-if="canvasHitlLoading" class="text-xs text-slate-500">Loading…</p>
          <div v-else class="space-y-2 pt-1">
            <label class="flex items-center gap-2 text-xs">
              <input v-model="hitlForm.is_enabled" type="checkbox" class="rounded border-slate-300">
              Enabled
            </label>
            <label class="block text-xs font-medium text-slate-600">Pause on</label>
            <select v-model="hitlForm.pause_on" class="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="failure">failure</option>
              <option value="before_confidential">before_confidential</option>
              <option value="both">both</option>
              <option value="custom">custom</option>
            </select>
            <label class="block text-xs font-medium text-slate-600">Contact channel</label>
            <input v-model="hitlForm.contact_channel" class="w-full border rounded-lg px-3 py-2 text-sm" placeholder="email">
            <label class="block text-xs font-medium text-slate-600">Message template</label>
            <textarea v-model="hitlForm.message_template" rows="2" class="w-full border rounded-lg px-3 py-2 text-sm" />
            <label class="block text-xs font-medium text-slate-600">Timeout (hours)</label>
            <input v-model.number="hitlForm.timeout_hours" type="number" min="1" class="w-full border rounded-lg px-3 py-2 text-sm">
            <label class="block text-xs font-medium text-slate-600">On timeout</label>
            <select v-model="hitlForm.on_timeout" class="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="reject">reject</option>
              <option value="approve">approve</option>
              <option value="escalate">escalate</option>
            </select>
            <label class="block text-xs font-medium text-slate-600">Owner message</label>
            <input v-model="hitlForm.owner_message" class="w-full border rounded-lg px-3 py-2 text-sm">
            <div class="flex flex-wrap gap-2 pt-1">
              <button
                v-if="hitlExists"
                type="button"
                class="flex-1 min-w-[6rem] py-2 px-3 rounded-lg border border-red-300 text-red-800 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                :disabled="saving"
                @click="deleteHitlConfig"
              >
                Delete
              </button>
              <button
                type="button"
                class="flex-1 min-w-[6rem] py-2 px-3 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 disabled:opacity-50"
                :disabled="saving"
                @click="submitHitl({ closeModal: false })"
              >
                {{ saving ? 'Saving…' : hitlExists ? 'Update' : 'Create' }}
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Primary actions -->
      <div class="flex flex-col gap-2">
        <button
          type="button"
          class="w-full py-2 px-3 rounded-lg border border-slate-300 text-slate-800 font-medium hover:bg-slate-50"
          @click="openPatternModal"
        >
          Add pattern
        </button>
        <button
          type="button"
          class="w-full py-2 px-3 rounded-lg border border-slate-300 text-slate-800 font-medium hover:bg-slate-50"
          @click="openOutputChannelModal"
        >
          Add output channel
        </button>
        <button
          type="button"
          class="w-full py-2 px-3 rounded-lg border border-amber-300 text-amber-900 font-medium hover:bg-amber-50"
          @click="openHitlModal"
        >
          Human-in-the-loop (HITL)
        </button>
      </div>
    </div>
  </aside>

  <Teleport to="body">
    <!-- Workflow edit -->
    <div
      v-if="showWorkflowEditModal"
      class="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50"
      @mousedown.self="handleBackdropMousedown"
      @click.self="handleBackdropClick($event, () => showWorkflowEditModal = false)"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-5" @click.stop>
        <h3 class="font-semibold text-slate-900 mb-3">Edit workflow</h3>
        <label class="block text-xs font-medium text-slate-600 mb-1">Name</label>
        <input v-model="workflowEditForm.name" class="focus:outline-none w-full border rounded-lg px-3 py-2 mb-3 text-sm" />
        <label class="block text-xs font-medium text-slate-600 mb-1">Description</label>
        <textarea v-model="workflowEditForm.description" rows="3" class="focus:outline-none w-full border rounded-lg px-3 py-2 mb-3 text-sm" />
        <div class="flex justify-end gap-2">
          <button type="button" class="px-3 py-2 text-sm border rounded-lg" @click="showWorkflowEditModal = false">Cancel</button>
          <button type="button" class="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50" :disabled="saving" @click="submitWorkflowEdit">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>



    <!-- Pattern create -->
    <div
      v-if="showPatternModal"
      class="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50"
      @mousedown.self="handleBackdropMousedown"
      @click.self="handleBackdropClick($event, () => showPatternModal = false)"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-5" @click.stop>
        <h3 class="font-semibold text-slate-900 mb-3">Add pattern</h3>
        <div class="mb-4">
          <label class="block text-xs font-medium text-slate-600 mb-1">Pattern type</label>
          <div ref="patternModalTypeDropdownRef" class="relative">
            <button
              type="button"
              class="w-full border rounded-lg px-3 py-2 text-sm flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100/80 text-left text-slate-900 focus:outline-none"
              :class="patternAddErr('pattern_type') ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-200'"
              :aria-expanded="patternModalTypeOpen"
              aria-haspopup="listbox"
              @click="patternModalTypeOpen = !patternModalTypeOpen"
            >
              <span>{{ patternTypeOptionLabel(patternForm.pattern_type) }}</span>
              <svg
                class="w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200"
                :class="{ 'rotate-180': patternModalTypeOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ul
              v-show="patternModalTypeOpen"
              class="absolute z-[10010] left-0 right-0 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg py-1 max-h-56 overflow-auto"
              role="listbox"
            >
              <li
                v-for="opt in PATTERN_TYPE_OPTIONS"
                :key="opt.value"
                role="option"
                :aria-selected="patternForm.pattern_type === opt.value"
                class="px-3 py-2 text-sm cursor-pointer hover:bg-slate-50"
                :class="{ 'bg-slate-100 font-medium': patternForm.pattern_type === opt.value }"
                @click="selectPatternModalType(opt.value)"
              >
                {{ opt.label }}
              </li>
            </ul>
          </div>
          <p v-if="patternAddErr('pattern_type')" class="text-red-600 text-xs mt-1">{{ patternAddErr('pattern_type') }}</p>
        </div>
        <div class="mb-4">
          <label class="block text-xs font-medium text-slate-600 mb-1">
            Name <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            v-model="patternForm.name"
            type="text"
            required
            autocomplete="off"
            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
            :class="{ 'border-red-500 ring-1 ring-red-200': patternAddErr('name') }"
            placeholder="Search & answer"
            @input="clearPatternAddFieldErrors(['name'])"
          >
          <p v-if="patternAddErr('name')" class="text-red-600 text-xs mt-1">{{ patternAddErr('name') }}</p>
        </div>
        <div class="mb-4">
          <label class="block text-xs font-medium text-slate-600 mb-1">
            Description <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <textarea
            v-model="patternForm.description"
            rows="2"
            required
            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
            :class="{ 'border-red-500 ring-1 ring-red-200': patternAddErr('description') }"
            @input="clearPatternAddFieldErrors(['description'])"
          />
          <p v-if="patternAddErr('description')" class="text-red-600 text-xs mt-1">{{ patternAddErr('description') }}</p>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="px-3 py-2 text-sm border rounded-lg" @click="showPatternModal = false">Cancel</button>
          <button
            type="button"
            class="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50"
            :disabled="saving || !patternAddCanSubmit"
            @click="submitPattern"
          >
            {{ saving ? 'Saving…' : 'Create' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pattern edit -->
    <div
      v-if="showPatternEditModal"
      class="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50"
      @mousedown.self="handleBackdropMousedown"
      @click.self="handleBackdropClick($event, () => showPatternEditModal = false)"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-5" @click.stop>
        <h3 class="font-semibold text-slate-900 mb-3">Edit pattern</h3>
        <div
          v-if="Object.keys(patternEditApiErrorsFlat).length"
          class="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
        >
          <p class="font-medium text-red-900 mb-1">Please fix the following:</p>
          <ul class="list-disc pl-4 space-y-0.5">
            <li v-for="(msg, key) in patternEditApiErrorsFlat" :key="key">
              <span class="font-mono text-[11px] text-red-700">{{ key }}</span>
              — {{ msg }}
            </li>
          </ul>
        </div>
        <div class="mb-4">
          <label class="block text-xs font-medium text-slate-600 mb-1">Pattern type</label>
          <select
            v-model="patternEditForm.pattern_type"
            class="w-full border rounded-lg px-3 py-2 text-sm"
            :class="{ 'border-red-500 ring-1 ring-red-200': patternEditErr('pattern_type') }"
            @change="clearPatternEditFieldErrors(['pattern_type'])"
          >
            <option value="sequential">Sequential</option>
            <option value="parallel">Parallel</option>
            <option value="supervisor">Supervisor</option>
            <option value="agent_to_agent">Agent-to-agent</option>
          </select>
          <p v-if="patternEditErr('pattern_type')" class="text-red-600 text-xs mt-1">{{ patternEditErr('pattern_type') }}</p>
        </div>
        <div class="mb-4">
          <label class="block text-xs font-medium text-slate-600 mb-1">
            Name <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            v-model="patternEditForm.name"
            type="text"
            required
            autocomplete="off"
            class="w-full border rounded-lg px-3 py-2 text-sm"
            :class="{ 'border-red-500 ring-1 ring-red-200': patternEditErr('name') }"
            @input="clearPatternEditFieldErrors(['name'])"
          >
          <p v-if="patternEditErr('name')" class="text-red-600 text-xs mt-1">{{ patternEditErr('name') }}</p>
        </div>
        <div class="mb-4">
          <label class="block text-xs font-medium text-slate-600 mb-1">
            Description <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <textarea
            v-model="patternEditForm.description"
            rows="2"
            required
            class="w-full border rounded-lg px-3 py-2 text-sm"
            :class="{ 'border-red-500 ring-1 ring-red-200': patternEditErr('description') }"
            @input="clearPatternEditFieldErrors(['description'])"
          />
          <p v-if="patternEditErr('description')" class="text-red-600 text-xs mt-1">{{ patternEditErr('description') }}</p>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="px-3 py-2 text-sm border rounded-lg" @click="showPatternEditModal = false">Cancel</button>
          <button
            type="button"
            class="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50"
            :disabled="saving || !patternEditCanSubmit"
            @click="submitPatternEdit"
          >
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Router (supervisor) — same structured UI as canvas “Workflow router” -->
    <div
      v-if="showRouterModal"
      class="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      @mousedown.self="handleBackdropMousedown"
      @click.self="handleBackdropClick($event, () => showRouterModal = false)"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 my-8" @click.stop>
        <h3 class="font-semibold text-slate-900 mb-2">Workflow router</h3>
        <p class="text-xs text-slate-500 mb-3">
          Map each condition to an agent on this pattern. Set a fallback when no rule matches.
        </p>
        <p v-if="routerModalPatternAgentsLoading" class="text-xs text-violet-800/90 mb-3">Loading pattern agents…</p>
        <div
          v-else-if="!routerModalPatternAgents.length"
          class="mb-3 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-[11px] text-amber-950"
        >
          Add at least one agent to this supervisor pattern (on the canvas or via Pattern agents), then configure routing here.
        </div>
        <div
          v-else
          class="rounded-lg border border-violet-200 bg-violet-50/90 px-2.5 py-2.5 space-y-3 mb-4"
        >
          <WorkflowRouterRulesFields
            v-model="routerModalForm"
            :pattern-agents="routerModalPatternAgents"
            rule-key-prefix="rmodal"
            :agent-label="agentLabelById"
          />
        </div>
        <div class="flex justify-between gap-2 flex-wrap">
          <button
            v-if="routerExists"
            type="button"
            class="px-3 py-2 text-sm border border-red-300 text-red-800 rounded-lg"
            :disabled="saving"
            @click="deleteRouterConfig"
          >
            Delete router
          </button>
          <div class="flex gap-2 ml-auto">
            <button type="button" class="px-3 py-2 text-sm border rounded-lg" @click="showRouterModal = false">Cancel</button>
            <button
              v-if="!routerModalPatternAgentsLoading && routerModalPatternAgents.length"
              type="button"
              class="px-3 py-2 text-sm bg-violet-600 text-white rounded-lg disabled:opacity-50"
              :disabled="saving"
              @click="submitRouter"
            >
              {{ saving ? 'Saving…' : routerExists ? 'Update router' : 'Create router' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Agent add -->
    <div
      v-if="showAgentModal"
      class="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50"
      @mousedown.self="handleBackdropMousedown"
      @click.self="handleBackdropClick($event, () => showAgentModal = false)"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-5" @click.stop>
        <h3 class="font-semibold text-slate-900 mb-3">Add agent to pattern</h3>
        <label class="block text-xs font-medium text-slate-600 mb-1">Pattern</label>
        <select v-model="agentForm.pattern_id" class="w-full border rounded-lg px-3 py-2 mb-3 text-sm">
          <option value="" disabled>Select pattern</option>
          <option v-for="p in patterns" :key="p.id" :value="p.id">{{ p.name }} ({{ p.pattern_type }})</option>
        </select>
        <div
          v-if="addAgentPatternMeta?.pattern_type === 'supervisor' && agentForm.pattern_id"
          class="mb-3 rounded-lg border border-violet-200 bg-violet-50/90 px-2.5 py-2 space-y-1.5"
        >
          <p class="text-[11px] font-medium text-violet-900">Supervisor router</p>
          <p class="text-[11px] text-violet-900/85 leading-snug">
            After adding agents, define <code class="text-[10px]">routing rules</code> so the supervisor knows when to use each.
          </p>
        </div>
        <label class="block text-xs font-medium text-slate-600 mb-1">Agent</label>
        <p v-if="agentsLoading" class="text-xs text-slate-500 mb-2">Loading your agents…</p>
        <p v-else-if="!agentOptions.length" class="text-xs text-amber-700 mb-2">No agents found. Create an agent in the dashboard first.</p>
        <div
          v-if="agentsLoading || !agentOptions.length"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400 mb-3"
        >
          Select agent
        </div>
        <div v-else ref="agentModalAgentDropdownRef" class="relative mb-3">
          <button
            type="button"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100/80 text-left text-slate-900 focus:outline-none"
            :aria-expanded="agentModalAgentOpen"
            aria-haspopup="listbox"
            @click="agentModalAgentOpen = !agentModalAgentOpen"
          >
            <span class="truncate min-w-0">{{ addAgentAgentDisplayLabel() }}</span>
            <svg
              class="w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200"
              :class="{ 'rotate-180': agentModalAgentOpen }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <ul
            v-show="agentModalAgentOpen"
            class="absolute z-[10010] left-0 right-0 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg py-1 max-h-56 overflow-auto"
            role="listbox"
          >
            <li
              v-for="a in agentOptions"
              :key="a.id"
              role="option"
              :aria-selected="String(agentForm.agent_id) === String(a.id)"
              class="px-3 py-2 text-sm cursor-pointer hover:bg-slate-50"
              :class="{ 'bg-slate-100 font-medium': String(agentForm.agent_id) === String(a.id) }"
              @click="selectAddAgentAgent(a.id)"
            >
              {{ agentLabel(a) }}
            </li>
          </ul>
        </div>
        <label class="block text-xs font-medium text-slate-600 mb-1">Timeout (seconds)</label>
        <input
          v-model="agentForm.timeoutSec"
          type="number"
          min="0"
          step="1"
          class="w-full border rounded-lg px-3 py-2 mb-3 text-sm focus:outline-none"
          placeholder="e.g. 30"
        >
        <div class="flex justify-end gap-2">
          <button type="button" class="px-3 py-2 text-sm border rounded-lg" @click="showAgentModal = false">Cancel</button>
          <button
            type="button"
            class="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50"
            :disabled="saving || !agentForm.pattern_id || !agentForm.agent_id"
            @click="submitAgent"
          >
            {{ saving ? 'Saving…' : 'Add' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Manage pattern agents -->
    <div
      v-if="showManageAgentsModal"
      class="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50"
      @mousedown.self="handleBackdropMousedown"
      @click.self="handleBackdropClick($event, () => showManageAgentsModal = false)"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 max-h-[90vh] overflow-y-auto" @click.stop>
        <h3 class="font-semibold text-slate-900 mb-3">Pattern agents</h3>
        <label class="block text-xs font-medium text-slate-600 mb-1">Pattern</label>
        <select v-model="managePatternId" class="w-full border rounded-lg px-3 py-2 mb-3 text-sm" @change="loadManageAgents">
          <option value="" disabled>Select pattern</option>
          <option v-for="p in patterns" :key="p.id" :value="p.id">{{ p.name }} ({{ p.pattern_type }})</option>
        </select>
        <div
          v-if="manageAgentsPatternMeta?.pattern_type === 'supervisor' && managePatternId"
          class="mb-3 rounded-lg border border-violet-200 bg-violet-50/90 px-2.5 py-2 space-y-1.5"
        >
          <p class="text-[11px] font-medium text-violet-900">Supervisor router</p>
          <p class="text-[11px] text-violet-900/85 leading-snug">
            Map natural-language <code class="text-[10px]">conditions</code> to the agents below via routing rules, plus fallback and status.
          </p>
          <button
            type="button"
            class="w-full py-1.5 px-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50"
            :disabled="saving"
            @click="openRouterModalForManageAgents"
          >
            Create or edit router
          </button>
        </div>
        <p v-if="manageAgentsLoading" class="text-xs text-slate-500">Loading…</p>
        <ul v-else-if="managePatternAgents.length" class="space-y-2 text-xs">
          <li
            v-for="(row, idx) in manageAgentsSorted"
            :key="row.id"
            class="flex items-center justify-between gap-2 border rounded-md p-2 bg-slate-50"
          >
            <div class="min-w-0">
              <span class="font-medium">{{ agentLabelById(row.agent_id) }}</span>
              <span class="text-slate-500 ml-2">#{{ row.execution_order }}</span>
            </div>
            <div class="flex gap-1.5 shrink-0">
              <div class="group/wf-reorder relative inline-flex">
                <button
                  type="button"
                  aria-label="Move agent up"
                  class="inline-flex items-center justify-center min-h-9 min-w-9 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 hover:border-slate-300 disabled:opacity-35 disabled:pointer-events-none"
                  :disabled="idx === 0"
                  @click="moveManageAgent(row, -1)"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.25" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <span
                  role="tooltip"
                  class="pointer-events-none absolute bottom-full left-1/2 z-[10060] mb-1.5 w-max -translate-x-1/2 rounded-md bg-black px-2 py-1.5 text-center text-[11px] font-medium leading-tight text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/wf-reorder:opacity-100 group-focus-within/wf-reorder:opacity-100"
                >
                  Move up
                </span>
              </div>
              <div class="group/wf-reorder relative inline-flex">
                <button
                  type="button"
                  aria-label="Move agent down"
                  class="inline-flex items-center justify-center min-h-9 min-w-9 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 hover:border-slate-300 disabled:opacity-35 disabled:pointer-events-none"
                  :disabled="idx === manageAgentsSorted.length - 1"
                  @click="moveManageAgent(row, 1)"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.25" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <span
                  role="tooltip"
                  class="pointer-events-none absolute bottom-full left-1/2 z-[10060] mb-1.5 w-max -translate-x-1/2 rounded-md bg-black px-2 py-1.5 text-center text-[11px] font-medium leading-tight text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/wf-reorder:opacity-100 group-focus-within/wf-reorder:opacity-100"
                >
                  Move down
                </span>
              </div>
              <button type="button" class="text-red-600 px-1.5" @click="removeManageAgent(row)">✕</button>
            </div>
          </li>
        </ul>
        <p v-else-if="managePatternId" class="text-xs text-slate-500">No agents in this pattern.</p>
        <div class="flex justify-end mt-4">
          <button type="button" class="px-3 py-2 text-sm border rounded-lg" @click="showManageAgentsModal = false">Close</button>
        </div>
      </div>
    </div>

    <!-- Output channel (create / edit) -->
    <div
      v-if="showOutputChannelModal"
      class="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/50"
      @mousedown.self="handleBackdropMousedown"
      @click.self="handleBackdropClick($event, closeOutputChannelModal)"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto" @click.stop>
        <h3 class="font-semibold text-slate-900 mb-3">
          {{ outputChannelEditId ? 'Edit output channel' : 'Add output channel' }}
        </h3>
        <label class="block text-xs font-medium text-slate-600 mb-1">Channel type</label>
        <div
          v-if="outputChannelEditId"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 mb-3 text-sm bg-slate-50 text-slate-700"
        >
          {{ outputChannelTypeLabel(outputChannelForm.channel_type) }}
        </div>
        <div v-else ref="outputChannelTypeDropdownRef" class="relative mb-3">
          <button
            type="button"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100/80 text-left text-slate-900 focus:outline-none"
            :aria-expanded="outputChannelTypeOpen"
            aria-haspopup="listbox"
            @click="outputChannelTypeOpen = !outputChannelTypeOpen"
          >
            <span>{{ outputChannelTypeLabel(outputChannelForm.channel_type) }}</span>
            <svg
              class="w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200"
              :class="{ 'rotate-180': outputChannelTypeOpen }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <ul
            v-show="outputChannelTypeOpen"
            class="absolute z-[10010] left-0 right-0 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg py-1 max-h-56 overflow-auto"
            role="listbox"
          >
            <li
              v-for="opt in OUTPUT_CHANNEL_TYPE_OPTIONS"
              :key="opt.value"
              role="option"
              :aria-selected="outputChannelForm.channel_type === opt.value"
              class="px-3 py-2 text-sm cursor-pointer hover:bg-slate-50"
              :class="{ 'bg-slate-100 font-medium': outputChannelForm.channel_type === opt.value }"
              @click="selectOutputChannelType(opt.value)"
            >
              {{ opt.label }}
            </li>
          </ul>
        </div>
        <template v-if="outputChannelForm.channel_type === 'email'">
          <label class="block text-xs font-medium text-slate-600 mb-1">To</label>
          <input
            v-model="outputChannelForm.emailTo"
            type="email"
            class="w-full border rounded-lg px-3 py-2 mb-3 text-sm focus:outline-none"
            placeholder="owner@example.com"
            autocomplete="off"
          >
          <label class="block text-xs font-medium text-slate-600 mb-1">Subject</label>
          <input
            v-model="outputChannelForm.emailSubject"
            type="text"
            class="w-full border rounded-lg px-3 py-2 mb-3 text-sm focus:outline-none"
            placeholder="Workflow result"
            autocomplete="off"
          >
        </template>
        <template v-else-if="outputChannelForm.channel_type === 'sms'">
          <label class="block text-xs font-medium text-slate-600 mb-1">From number</label>
          <input
            v-model="outputChannelForm.smsFromNumber"
            type="text"
            class="w-full border rounded-lg px-3 py-2 mb-2 text-sm focus:outline-none"
            placeholder="+15551234567"
            autocomplete="off"
          >
          <p class="text-[11px] text-slate-500 mt-1 mb-3">
            Use international format: a leading
            <code class="text-[10px]">+</code>, country code
          </p>
        </template>
        <template v-else-if="outputChannelForm.channel_type === 'voice'">
          <p class="text-xs text-slate-600 mb-3">
            No extra settings for this channel type.
          </p>
        </template>
        <template v-else-if="outputChannelForm.channel_type === 'outbound_call'">
          <label class="block text-xs font-medium text-slate-600 mb-1">From number</label>
          <input
            v-model="outputChannelForm.outboundFromNumber"
            type="text"
            class="w-full border rounded-lg px-3 py-2 mb-3 text-sm focus:outline-none"
            placeholder="+15551234567"
            autocomplete="off"
          >
          <label class="block text-xs font-medium text-slate-600 mb-1">TTS voice</label>
          <input
            v-model="outputChannelForm.outboundTtsVoice"
            type="text"
            class="w-full border rounded-lg px-3 py-2 mb-3 text-sm focus:outline-none"
            placeholder="e.g. Polly.Joanna"
            autocomplete="off"
          >
          <label class="block text-xs font-medium text-slate-600 mb-1">Language</label>
          <input
            v-model="outputChannelForm.outboundLanguage"
            type="text"
            class="w-full border rounded-lg px-3 py-2 mb-3 text-sm focus:outline-none"
            placeholder="e.g. en-US"
            autocomplete="off"
          >
        </template>
        <template v-else>
          <label class="block text-xs font-medium text-slate-600 mb-1">Config (JSON)</label>
          <textarea v-model="outputChannelForm.configJson" rows="5" class="w-full border rounded-lg px-3 py-2 mb-3 text-xs font-mono" placeholder="{}" />
        </template>
        <label class="flex items-center gap-2 mb-3 text-sm">
          <input v-model="outputChannelForm.is_primary" type="checkbox" class="rounded">
          Primary channel
        </label>
        <div class="flex justify-between gap-2 flex-wrap">
          <button
            v-if="outputChannelEditId"
            type="button"
            class="px-3 py-2 text-sm border border-red-300 text-red-800 rounded-lg"
            :disabled="saving"
            @click="deleteOutputChannelFromModal"
          >
            Delete
          </button>
          <div class="flex gap-2 ml-auto">
            <button type="button" class="px-3 py-2 text-sm border rounded-lg" @click="closeOutputChannelModal">Cancel</button>
            <button type="button" class="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50" :disabled="saving" @click="submitOutputChannel">
              {{ saving ? 'Saving…' : outputChannelEditId ? 'Save' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </div>



    <!-- Confirm (replaces window.confirm; z above other modals) -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/50"
      @mousedown.self="handleBackdropMousedown"
      @click.self="handleBackdropClick($event, () => closeConfirmModal(false))"
    >
      <div
        class="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        @click.stop
      >
        <h3 id="confirm-modal-title" class="font-semibold text-slate-900 mb-2">
          {{ confirmModalTitle }}
        </h3>
        <p class="text-sm text-slate-600 mb-6 whitespace-pre-wrap">{{ confirmModalMessage }}</p>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="px-3 py-2 text-sm border rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
            @click="closeConfirmModal(false)"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium"
            @click="closeConfirmModal(true)"
          >
            {{ confirmModalConfirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { apiService } from '@app/services/agentApi.js'
import { useWorkflow } from '@app/composables/useWorkflow'
import { clearWorkflowDiagramLocal } from '@app/composables/useWorkflowDiagramLocal'
import { useToast } from '@app/composables/useToast'
import { formatWorkflowValidationToast, firstErrorForKeys, flattenWorkflowValidationErrors } from '@app/utils/workflowApiErrors'
import WorkflowRouterRulesFields from '@app/components/workflow/WorkflowRouterRulesFields.vue'

const props = defineProps({
  workflowId: {
    type: String,
    required: true
  },
  canvasSelection: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['diagram-updated', 'workflow-deleted', 'clear-canvas-selection'])

function emitDiagramUpdated(payload = null) {
  emit('diagram-updated', payload)
}

const {
  listPatterns,
  nextPatternExecutionOrder,
  createTrigger,
  createPattern,
  addPatternAgent,
  nextAgentExecutionOrder,
  upsertHitl,
  loadHitl,
  deleteHitl,
  getWorkflow,
  updateWorkflowRecord,
  activateWorkflow,
  deactivateWorkflow,
  removeWorkflow,
  listTriggers,
  getTrigger,
  updateTrigger,
  removeTrigger,
  updatePattern,
  getPattern,
  removePattern,
  reorderPatterns,
  listPatternAgents,
  getPatternAgent,
  updatePatternAgent,
  removePatternAgent,
  reorderPatternAgents,
  saveRouter,
  getRouter,
  removeRouter,
  listOutputChannels,
  getOutputChannel,
  createOutputChannel,
  updateOutputChannel,
  removeOutputChannel
} = useWorkflow()

const { showToast } = useToast()

/** Hover-only tooltips for workflow card icon actions (no focus-within — avoids stuck tooltips after click). */
const wfCardTipWrap = 'group/wf-wbc relative inline-flex shrink-0'
const wfCardTip =
  'pointer-events-none absolute top-full left-1/2 z-[200] mt-1.5 w-max max-w-[16rem] -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1.5 text-center text-[11px] font-medium leading-tight text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/wf-wbc:opacity-100 whitespace-normal'

const showConfirmModal = ref(false)
const confirmModalTitle = ref('Confirm')
const confirmModalMessage = ref('')
const confirmModalConfirmLabel = ref('Delete')
const confirmModalResolve = ref(null)

/**
 * @param {{ title?: string, message: string, confirmLabel?: string }} opts
 * @returns {Promise<boolean>}
 */
function openConfirmModal(opts) {
  confirmModalTitle.value = opts.title || 'Confirm'
  confirmModalMessage.value = opts.message || ''
  confirmModalConfirmLabel.value = opts.confirmLabel || 'Delete'
  showConfirmModal.value = true
  return new Promise((resolve) => {
    confirmModalResolve.value = resolve
  })
}

function closeConfirmModal(confirmed) {
  showConfirmModal.value = false
  const r = confirmModalResolve.value
  confirmModalResolve.value = null
  r?.(confirmed)
}

const isBackdropMousedown = ref(false)

function handleBackdropMousedown(e) {
  if (e.target === e.currentTarget) {
    isBackdropMousedown.value = true
  }
}

function handleBackdropClick(e, closeFn) {
  if (isBackdropMousedown.value && e.target === e.currentTarget) {
    closeFn()
  }
  isBackdropMousedown.value = false
}

const patterns = ref([])
const triggers = ref([])
const outputChannels = ref([])
const workflowRecord = ref(null)

const agentOptions = ref([])
const agentsLoading = ref(false)
const saving = ref(false)

const showWorkflowEditModal = ref(false)
const workflowEditForm = ref({ name: '', description: '' })

const isAddingTrigger = ref(false)
const showPatternModal = ref(false)
const showPatternEditModal = ref(false)
const patternEditForm = ref({ id: '', pattern_type: 'sequential', name: '', description: '' })

const showRouterModal = ref(false)
const routerPattern = ref(null)
const routerExists = ref(false)
/** Pattern agents + structured form for the Workflow router modal (matches canvas sidebar). */
const routerModalPatternAgents = ref([])
const routerModalPatternAgentsLoading = ref(false)
const routerModalForm = ref({
  rules: [{ condition: '', agent_id: '' }],
  fallback_agent_id: '',
  status: 'active'
})

const showAgentModal = ref(false)
const showManageAgentsModal = ref(false)
const managePatternId = ref('')
const managePatternAgents = ref([])
const manageAgentsLoading = ref(false)

const showOutputChannelModal = ref(false)
/** Set when editing an existing channel (create when null). */
const outputChannelEditId = ref(null)
const outputChannelForm = ref({
  channel_type: 'email',
  emailTo: '',
  emailSubject: 'Workflow result',
  smsFromNumber: '',
  outboundFromNumber: '',
  outboundTtsVoice: '',
  outboundLanguage: '',
  configJson: '{}',
  is_primary: false
})



/** Options for trigger type combobox (native select cannot animate chevron open/close). */
const TRIGGER_TYPE_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'sms', label: 'SMS' },
  { value: 'voice', label: 'Voice' }
]

/** Options for Add pattern modal pattern type combobox. */
const PATTERN_TYPE_OPTIONS = [
  { value: 'sequential', label: 'Sequential' },
  { value: 'parallel', label: 'Parallel' },
  { value: 'supervisor', label: 'Supervisor (router)' },
  { value: 'agent_to_agent', label: 'Agent-to-agent' }
]

/** Output channel modal — channel type combobox (create only; type locked when editing). */
const OUTPUT_CHANNEL_TYPE_OPTIONS = [
  { value: 'email', label: 'email' },
  { value: 'sms', label: 'sms' },
  { value: 'voice', label: 'voice' },
  { value: 'outbound_call', label: 'outbound call' }
]

const triggerModalTypeOpen = ref(false)
const triggerModalTypeDropdownRef = ref(null)
const canvasTriggerTypeOpen = ref(false)
const canvasTriggerTypeDropdownRef = ref(null)
const patternModalTypeOpen = ref(false)
const patternModalTypeDropdownRef = ref(null)
const agentModalAgentOpen = ref(false)
const agentModalAgentDropdownRef = ref(null)
const outputChannelTypeOpen = ref(false)
const outputChannelTypeDropdownRef = ref(null)

function triggerTypeOptionLabel(value) {
  return TRIGGER_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? String(value)
}

function closeTriggerDropdownsOnOutside(e) {
  if (triggerModalTypeDropdownRef.value && !triggerModalTypeDropdownRef.value.contains(e.target)) {
    triggerModalTypeOpen.value = false
  }
  if (canvasTriggerTypeDropdownRef.value && !canvasTriggerTypeDropdownRef.value.contains(e.target)) {
    canvasTriggerTypeOpen.value = false
  }
  if (patternModalTypeDropdownRef.value && !patternModalTypeDropdownRef.value.contains(e.target)) {
    patternModalTypeOpen.value = false
  }
  if (agentModalAgentDropdownRef.value && !agentModalAgentDropdownRef.value.contains(e.target)) {
    agentModalAgentOpen.value = false
  }
  if (outputChannelTypeDropdownRef.value && !outputChannelTypeDropdownRef.value.contains(e.target)) {
    outputChannelTypeOpen.value = false
  }
}

function outputChannelTypeLabel(value) {
  return OUTPUT_CHANNEL_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? String(value)
}

function selectOutputChannelType(val) {
  outputChannelForm.value.channel_type = val
  outputChannelTypeOpen.value = false
  if (!outputChannelEditId.value) {
    outputChannelForm.value.emailTo = ''
    outputChannelForm.value.emailSubject = 'Workflow result'
    outputChannelForm.value.smsFromNumber = ''
    outputChannelForm.value.outboundFromNumber = ''
    outputChannelForm.value.outboundTtsVoice = ''
    outputChannelForm.value.outboundLanguage = ''
    outputChannelForm.value.configJson = '{}'
  }
}

function selectTriggerModalType(val) {
  triggerForm.value.trigger_type = val
  clearTriggerErrorsOnTypeChange()
  triggerModalTypeOpen.value = false
}

function selectCanvasTriggerType(val) {
  canvasTriggerForm.value.trigger_type = val
  clearCanvasTriggerErrorsOnTypeChange()
  canvasTriggerTypeOpen.value = false
}

function patternTypeOptionLabel(value) {
  return PATTERN_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? String(value)
}

function selectPatternModalType(val) {
  patternForm.value.pattern_type = val
  clearPatternAddFieldErrors(['pattern_type'])
  patternModalTypeOpen.value = false
}

const triggerForm = ref({ trigger_type: 'email' })
const triggerEmail = ref('')
const triggerWebhook = ref('')
const triggerCron = ref('')
const triggerPhone = ref('')
/** API field errors for "Add trigger" modal (e.g. { "config.inbound_email": "Invalid email" }) */
const triggerApiErrors = ref({})

const triggerApiErrorsFlat = computed(() => flattenWorkflowValidationErrors(triggerApiErrors.value))

function clearTriggerFieldErrors(keys) {
  const next = { ...triggerApiErrors.value }
  for (const k of keys) delete next[k]
  triggerApiErrors.value = next
}

function onTriggerFieldInput(field) {
  const map = {
    email: ['config.inbound_email', 'inbound_email'],
    webhook: ['config.endpoint', 'endpoint', 'config.url', 'url'],
    schedule: ['config.cron', 'cron'],
    phone: ['config.phone_number', 'phone_number', 'phone']
  }
  clearTriggerFieldErrors(map[field] || [])
}

function clearTriggerErrorsOnTypeChange() {
  triggerApiErrors.value = {}
}

function triggerErr(...keys) {
  return firstErrorForKeys(triggerApiErrors.value, keys)
}

const canvasTriggerLoading = ref(false)
const canvasEditTrigger = ref(null)
const canvasTriggerForm = ref({ trigger_type: 'email', is_active: true })
const canvasTriggerEmail = ref('')
const canvasTriggerWebhook = ref('')
const canvasTriggerCron = ref('')
const canvasTriggerPhone = ref('')
const canvasTriggerApiErrors = ref({})

function canvasTriggerErr(...keys) {
  return firstErrorForKeys(canvasTriggerApiErrors.value, keys)
}

function clearCanvasTriggerErrorsOnTypeChange() {
  canvasTriggerApiErrors.value = {}
}

function requestClearCanvasSelection() {
  emit('clear-canvas-selection')
}

const canvasPatternLoading = ref(false)
const canvasEditPattern = ref(null)
const canvasPatternForm = ref({
  pattern_type: 'sequential',
  name: '',
  description: '',
  execution_order: ''
})
const canvasPatternApiErrors = ref({})

/** Supervisor pattern on canvas: agents in pattern + structured router form. */
const canvasPatternAgents = ref([])
const canvasPatternAgentsLoading = ref(false)
const canvasRouterExpanded = ref(false)
const canvasRouterExists = ref(false)
const canvasRouterForm = ref({
  rules: [{ condition: '', agent_id: '' }],
  fallback_agent_id: '',
  status: 'active'
})

/** Preview JSON for sidebar “Preview saved payload”. */
const canvasRouterPayloadExample = computed(() => {
  const routing_rules = canvasRouterForm.value.rules
    .map((r) => ({
      condition: (r.condition || '').trim(),
      agent_id: (r.agent_id || '').trim()
    }))
    .filter((r) => r.condition && r.agent_id)
  return JSON.stringify(
    {
      routing_rules,
      fallback_agent_id: (canvasRouterForm.value.fallback_agent_id || '').trim() || null,
      status: canvasRouterForm.value.status === 'inactive' ? 'inactive' : 'active'
    },
    null,
    2
  )
})

function canvasPatternErr(...keys) {
  return firstErrorForKeys(canvasPatternApiErrors.value, keys)
}

function clearCanvasPatternApiErrors() {
  canvasPatternApiErrors.value = {}
}

function clearCanvasPatternErrKeys(keys) {
  const next = { ...canvasPatternApiErrors.value }
  for (const k of keys) delete next[k]
  canvasPatternApiErrors.value = next
}

const canvasAgentLoading = ref(false)
const canvasEditAgent = ref(null)
const canvasAgentForm = ref({
  agent_id: '',
  is_fallback: false,
  timeoutSec: ''
})
const canvasAgentApiErrors = ref({})

function canvasAgentErr(...keys) {
  return firstErrorForKeys(canvasAgentApiErrors.value, keys)
}

function clearCanvasAgentErrKeys(keys) {
  const next = { ...canvasAgentApiErrors.value }
  for (const k of keys) delete next[k]
  canvasAgentApiErrors.value = next
}

const hitlForm = ref({
  is_enabled: false,
  pause_on: 'failure',
  contact_channel: 'email',
  message_template: 'Please review the workflow',
  timeout_hours: 24,
  on_timeout: 'reject',
  owner_message: 'Review needed'
})

const hitlExists = ref(false)
const canvasHitlLoading = ref(false)

const canvasEditOutputChannel = ref(null)
const canvasOutputChannelLoading = ref(false)
const canvasOutputChannelForm = ref({
  channel_type: 'email',
  emailTo: '',
  emailSubject: 'Workflow result',
  smsFromNumber: '',
  outboundFromNumber: '',
  outboundTtsVoice: '',
  outboundLanguage: '',
  configJson: '{}',
  is_primary: false
})

/** @param {object | null | undefined} cfg - response from GET /api/workflows/:id/hitl */
function applyHitlResponseToForm(cfg) {
  hitlExists.value = !!cfg
  if (cfg) {
    hitlForm.value = {
      is_enabled: !!cfg.is_enabled,
      pause_on: cfg.pause_on || 'failure',
      contact_channel: cfg.contact_channel || 'email',
      message_template: cfg.message_template || '',
      timeout_hours: cfg.timeout_hours ?? 24,
      on_timeout: cfg.on_timeout || 'reject',
      owner_message: cfg.owner_message || ''
    }
  } else {
    hitlForm.value = {
      is_enabled: false,
      pause_on: 'failure',
      contact_channel: 'email',
      message_template: 'Please review the workflow',
      timeout_hours: 24,
      on_timeout: 'reject',
      owner_message: 'Review needed'
    }
  }
}

/** Read `config.timeout` from API for the timeout input. */
function timeoutSecStringFromAgentConfig(cfg) {
  const t = cfg && typeof cfg === 'object' && !Array.isArray(cfg) ? cfg.timeout : undefined
  if (t == null || t === '') return ''
  const n = Number(t)
  return Number.isNaN(n) ? '' : String(n)
}

/** API payload shape: `{ config: { timeout: number } }` only. */
function buildPatternAgentTimeoutConfig(timeoutSecStr) {
  const ts = String(timeoutSecStr ?? '').trim()
  if (ts === '') {
    return { error: 'timeout', message: 'Timeout is required' }
  }
  const n = Number(ts)
  if (Number.isNaN(n) || n < 0) {
    return { error: 'timeout', message: 'Timeout must be a non-negative number' }
  }
  return { config: { timeout: n } }
}

function resetCanvasRouterSidebar() {
  canvasPatternAgents.value = []
  canvasPatternAgentsLoading.value = false
  canvasRouterExpanded.value = false
  canvasRouterExists.value = false
  canvasRouterForm.value = {
    rules: [{ condition: '', agent_id: '' }],
    fallback_agent_id: '',
    status: 'active'
  }
}

async function loadCanvasPatternRouterSidebar(workflowId, patternId) {
  canvasPatternAgentsLoading.value = true
  try {
    if (!agentOptions.value.length) await loadAgents()
    const agents = await listPatternAgents(workflowId, patternId)
    canvasPatternAgents.value = Array.isArray(agents) ? agents : []
    const r = await getRouter(workflowId, patternId)
    if (r) {
      canvasRouterExists.value = true
      const rr = Array.isArray(r.routing_rules) ? r.routing_rules : []
      canvasRouterForm.value = {
        rules: rr.length
          ? rr.map((x) => ({
              condition: x.condition != null ? String(x.condition) : '',
              agent_id: x.agent_id != null ? String(x.agent_id) : ''
            }))
          : [{ condition: '', agent_id: '' }],
        fallback_agent_id: r.fallback_agent_id != null ? String(r.fallback_agent_id) : '',
        status: r.status === 'inactive' ? 'inactive' : 'active'
      }
      canvasRouterExpanded.value = true
    } else {
      canvasRouterExists.value = false
      const first = canvasPatternAgents.value[0]
      const defAgent = first?.agent_id != null ? String(first.agent_id) : ''
      canvasRouterForm.value = {
        rules: [{ condition: '', agent_id: defAgent }],
        fallback_agent_id: defAgent,
        status: 'active'
      }
      canvasRouterExpanded.value = false
    }
  } catch (e) {
    console.error(e)
    canvasPatternAgents.value = []
    showToast('Error', e?.message || 'Failed to load router', 'error')
  } finally {
    canvasPatternAgentsLoading.value = false
  }
}

function onCanvasPatternTypeChange() {
  clearCanvasPatternApiErrors()
  const sel = props.canvasSelection
  if (sel?.kind !== 'pattern' || !sel.patternId || !props.workflowId) return
  if (canvasPatternForm.value.pattern_type === 'supervisor') {
    loadCanvasPatternRouterSidebar(props.workflowId, sel.patternId)
  } else {
    resetCanvasRouterSidebar()
  }
}

async function loadRouterModalSidebar(workflowId, patternId) {
  routerModalPatternAgentsLoading.value = true
  try {
    if (!agentOptions.value.length) await loadAgents()
    const agents = await listPatternAgents(workflowId, patternId)
    routerModalPatternAgents.value = Array.isArray(agents) ? agents : []
    const r = await getRouter(workflowId, patternId)
    if (r) {
      routerExists.value = true
      const rr = Array.isArray(r.routing_rules) ? r.routing_rules : []
      routerModalForm.value = {
        rules: rr.length
          ? rr.map((x) => ({
              condition: x.condition != null ? String(x.condition) : '',
              agent_id: x.agent_id != null ? String(x.agent_id) : ''
            }))
          : [{ condition: '', agent_id: '' }],
        fallback_agent_id: r.fallback_agent_id != null ? String(r.fallback_agent_id) : '',
        status: r.status === 'inactive' ? 'inactive' : 'active'
      }
    } else {
      routerExists.value = false
      const first = routerModalPatternAgents.value[0]
      const defAgent = first?.agent_id != null ? String(first.agent_id) : ''
      routerModalForm.value = {
        rules: [{ condition: '', agent_id: defAgent }],
        fallback_agent_id: defAgent,
        status: 'active'
      }
    }
  } catch (e) {
    console.error(e)
    routerModalPatternAgents.value = []
    routerExists.value = false
    showToast('Error', e?.message || 'Failed to load router', 'error')
  } finally {
    routerModalPatternAgentsLoading.value = false
  }
}

function resolveCanvasRouterPatternId() {
  const sel = props.canvasSelection
  if (sel?.kind === 'pattern' && canvasEditPattern.value?.id) return String(canvasEditPattern.value.id)
  if (sel?.kind === 'router' && sel.patternId) return String(sel.patternId)
  return null
}

/** When router is removed from the modal, keep sidebar in sync if that pattern/router is selected. */
function syncCanvasSidebarAfterRouterDeleted(patternId) {
  if (!patternId) return
  const deletedPid = String(patternId)
  const sel = props.canvasSelection
  if (!sel) return
  const selPid =
    sel.kind === 'pattern' && sel.patternId
      ? String(sel.patternId)
      : sel.kind === 'router' && sel.patternId
        ? String(sel.patternId)
        : ''
  if (selPid !== deletedPid) return
  canvasRouterExists.value = false
  const first = canvasPatternAgents.value[0]
  const defAgent = first?.agent_id != null ? String(first.agent_id) : ''
  canvasRouterForm.value = {
    rules: [{ condition: '', agent_id: defAgent }],
    fallback_agent_id: defAgent,
    status: 'active'
  }
}

async function submitCanvasRouter() {
  const patternId = resolveCanvasRouterPatternId()
  if (!patternId || !props.workflowId) return
  const routing_rules = canvasRouterForm.value.rules
    .map((r) => ({
      condition: (r.condition || '').trim(),
      agent_id: (r.agent_id || '').trim()
    }))
    .filter((r) => r.condition && r.agent_id)
  const payload = {
    routing_rules,
    fallback_agent_id: (canvasRouterForm.value.fallback_agent_id || '').trim() || null,
    status: canvasRouterForm.value.status === 'inactive' ? 'inactive' : 'active'
  }
  saving.value = true
  try {
    await saveRouter(props.workflowId, patternId, payload, canvasRouterExists.value)
    canvasRouterExists.value = true
    showToast('Success', 'Workflow router saved', 'success')
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e?.message || 'Router save failed', 'error')
  } finally {
    saving.value = false
  }
}

async function deleteCanvasRouterFromSidebar() {
  const patternId = resolveCanvasRouterPatternId()
  if (!patternId) return
  const ok = await openConfirmModal({
    title: 'Remove router',
    message: 'Remove workflow router configuration for this pattern?',
    confirmLabel: 'Remove'
  })
  if (!ok) return
  saving.value = true
  try {
    await removeRouter(props.workflowId, patternId)
    canvasRouterExists.value = false
    const first = canvasPatternAgents.value[0]
    const defAgent = first?.agent_id != null ? String(first.agent_id) : ''
    canvasRouterForm.value = {
      rules: [{ condition: '', agent_id: defAgent }],
      fallback_agent_id: defAgent,
      status: 'active'
    }
    showToast('Success', 'Router removed', 'success')
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e?.message || 'Delete failed', 'error')
  } finally {
    saving.value = false
  }
}

watch(
  () => [props.canvasSelection, props.workflowId],
  async ([sel, wid]) => {
    isAddingTrigger.value = false
    canvasEditTrigger.value = null
    canvasTriggerApiErrors.value = {}
    canvasTriggerLoading.value = false
    canvasEditPattern.value = null
    canvasPatternApiErrors.value = {}
    canvasPatternLoading.value = false
    canvasEditAgent.value = null
    canvasAgentApiErrors.value = {}
    canvasAgentLoading.value = false
    canvasHitlLoading.value = false
    canvasEditOutputChannel.value = null
    canvasOutputChannelLoading.value = false
    resetCanvasRouterSidebar()

    if (!sel || !wid) return

    if (sel.kind === 'trigger' && sel.triggerId) {
      canvasTriggerLoading.value = true
      try {
        const t = await getTrigger(wid, sel.triggerId)
        canvasEditTrigger.value = t
        canvasTriggerForm.value = {
          trigger_type: t.trigger_type || 'email',
          is_active: t.is_active !== false
        }
        const c = t.config || {}
        canvasTriggerEmail.value = c.inbound_email || ''
        canvasTriggerWebhook.value = c.endpoint || ''
        canvasTriggerCron.value = c.cron || ''
        canvasTriggerPhone.value = c.phone_number || ''
      } catch (e) {
        console.error(e)
        canvasEditTrigger.value = null
        showToast('Error', e?.message || 'Failed to load trigger', 'error')
      } finally {
        canvasTriggerLoading.value = false
      }
      return
    }

    if (sel.kind === 'pattern' && sel.patternId) {
      canvasPatternLoading.value = true
      try {
        const p = await getPattern(wid, sel.patternId)
        canvasEditPattern.value = p
        canvasPatternForm.value = {
          pattern_type: p.pattern_type || 'sequential',
          name: p.name || '',
          description: p.description || '',
          execution_order: p.execution_order != null ? String(p.execution_order) : ''
        }
        if (p.pattern_type === 'supervisor') {
          await loadCanvasPatternRouterSidebar(wid, sel.patternId)
        }
      } catch (e) {
        console.error(e)
        canvasEditPattern.value = null
        showToast('Error', e?.message || 'Failed to load pattern', 'error')
      } finally {
        canvasPatternLoading.value = false
      }
      return
    }

    if (sel.kind === 'router' && sel.patternId) {
      try {
        await loadCanvasPatternRouterSidebar(wid, sel.patternId)
        canvasRouterExpanded.value = true
      } catch (e) {
        console.error(e)
        showToast('Error', e?.message || 'Failed to load router', 'error')
      }
      return
    }

    if (sel.kind === 'agent' && sel.patternId && sel.patternAgentId) {
      canvasAgentLoading.value = true
      try {
        if (!agentOptions.value.length) await loadAgents()
        const row = await getPatternAgent(wid, sel.patternId, sel.patternAgentId)
        canvasEditAgent.value = row
        const cfg = row?.config && typeof row.config === 'object' ? row.config : {}
        canvasAgentForm.value = {
          agent_id: row?.agent_id != null ? String(row.agent_id) : '',
          is_fallback: !!row.is_fallback,
          timeoutSec: timeoutSecStringFromAgentConfig(cfg) || '30'
        }
      } catch (e) {
        console.error(e)
        canvasEditAgent.value = null
        showToast('Error', e?.message || 'Failed to load pattern agent', 'error')
      } finally {
        canvasAgentLoading.value = false
      }
      return
    }

    if (sel.kind === 'output' && sel.channelId) {
      canvasOutputChannelLoading.value = true
      canvasEditOutputChannel.value = null
      try {
        const ch = await getOutputChannel(wid, sel.channelId)
        canvasEditOutputChannel.value = ch
        hydrateOutputForm(canvasOutputChannelForm, ch)
      } catch (e) {
        console.error(e)
        canvasEditOutputChannel.value = null
        showToast('Error', e?.message || 'Failed to load output channel', 'error')
      } finally {
        canvasOutputChannelLoading.value = false
      }
      return
    }

    if (sel.kind === 'hitl') {
      canvasHitlLoading.value = true
      try {
        const cfg = await loadHitl(wid)
        applyHitlResponseToForm(cfg)
      } catch (e) {
        console.error(e)
        applyHitlResponseToForm(null)
        showToast('Error', e?.message || 'Failed to load HITL', 'error')
      } finally {
        canvasHitlLoading.value = false
      }
    }
  },
  { immediate: true, deep: true }
)

const patternForm = ref({
  pattern_type: 'sequential',
  name: '',
  description: ''
})
/** API field errors for "Add pattern" modal (e.g. { description: "..." }) */
const patternApiErrors = ref({})
const patternApiErrorsFlat = computed(() => flattenWorkflowValidationErrors(patternApiErrors.value))

const patternAddCanSubmit = computed(() => {
  const n = patternForm.value.name?.trim() || ''
  const d = (patternForm.value.description || '').trim()
  return !!n && !!d
})

function patternAddErr(...keys) {
  return firstErrorForKeys(patternApiErrors.value, keys)
}

function clearPatternAddFieldErrors(keys) {
  const next = { ...patternApiErrors.value }
  for (const k of keys) delete next[k]
  patternApiErrors.value = next
}

/** API / client errors for "Edit pattern" modal */
const patternEditApiErrors = ref({})
const patternEditApiErrorsFlat = computed(() => flattenWorkflowValidationErrors(patternEditApiErrors.value))

const patternEditCanSubmit = computed(() => {
  const n = patternEditForm.value.name?.trim() || ''
  const d = (patternEditForm.value.description || '').trim()
  return !!n && !!d
})

function patternEditErr(...keys) {
  return firstErrorForKeys(patternEditApiErrors.value, keys)
}

function clearPatternEditFieldErrors(keys) {
  const next = { ...patternEditApiErrors.value }
  for (const k of keys) delete next[k]
  patternEditApiErrors.value = next
}

const agentForm = ref({
  pattern_id: '',
  agent_id: '',
  timeoutSec: '30'
})

const patternsSorted = computed(() =>
  [...patterns.value].sort((a, b) => (Number(a.execution_order) || 0) - (Number(b.execution_order) || 0))
)

const manageAgentsSorted = computed(() =>
  [...managePatternAgents.value].sort(
    (a, b) => (Number(a.execution_order) || 0) - (Number(b.execution_order) || 0)
  )
)

/** Pattern row for the open "Manage pattern agents" modal (for supervisor router UI). */
const manageAgentsPatternMeta = computed(() => {
  if (!managePatternId.value) return null
  return patterns.value.find((p) => String(p.id) === String(managePatternId.value)) || null
})

/** Add-agent modal: selected pattern is supervisor → offer router next to assigning agents. */
const addAgentPatternMeta = computed(() => {
  const id = agentForm.value.pattern_id
  if (!id) return null
  return patterns.value.find((p) => String(p.id) === String(id)) || null
})

function agentLabel(a) {
  if (!a) return ''
  const name = (a.name || a.title || a.agent_name || a.display_name || '').trim()
  if (name) return name
  const id = a.id != null ? String(a.id) : ''
  return id || 'Agent'
}

function agentLabelById(id) {
  const sid = String(id)
  const hit = agentOptions.value.find((a) => String(a.id) === sid)
  return hit ? agentLabel(hit) : sid
}

function addAgentAgentDisplayLabel() {
  const id = agentForm.value?.agent_id
  if (id == null || id === '') return 'Select agent'
  const a = agentOptions.value.find((x) => String(x.id) === String(id))
  return a ? agentLabel(a) : String(id)
}

function selectAddAgentAgent(agentId) {
  agentForm.value.agent_id = agentId
  agentModalAgentOpen.value = false
}

function triggerSummary(t) {
  const c = t.config || {}
  if (t.trigger_type === 'email') return c.inbound_email || ''
  if (t.trigger_type === 'webhook') return c.endpoint || ''
  if (t.trigger_type === 'schedule') return c.cron || ''
  if (t.trigger_type === 'sms' || t.trigger_type === 'voice') return c.phone_number || ''
  return JSON.stringify(c)
}

function channelSummary(c) {
  const cfg = c?.config && typeof c.config === 'object' && !Array.isArray(c.config) ? c.config : {}
  if (c.channel_type === 'email') {
    const to = cfg.to != null ? String(cfg.to) : ''
    const sub = cfg.subject != null ? String(cfg.subject) : ''
    const parts = []
    if (to) parts.push(`To: ${to}`)
    if (sub) parts.push(`Subject: ${sub}`)
    return parts.length ? parts.join(' · ') : '—'
  }
  if (c.channel_type === 'sms') {
    const n = cfg.from_number != null ? String(cfg.from_number) : ''
    return n ? `SMS · ${n}` : 'SMS'
  }
  if (c.channel_type === 'voice') {
    return 'Voice'
  }
  if (c.channel_type === 'outbound_call') {
    const parts = []
    if (cfg.from_number != null && String(cfg.from_number).trim()) parts.push(String(cfg.from_number))
    if (cfg.tts_voice != null && String(cfg.tts_voice).trim()) parts.push(`TTS: ${cfg.tts_voice}`)
    if (cfg.language != null && String(cfg.language).trim()) parts.push(String(cfg.language))
    return parts.length ? `Call · ${parts.join(' · ')}` : 'Outbound call'
  }
  try {
    return JSON.stringify(cfg)
  } catch {
    return ''
  }
}

function hydrateOutputForm(formRef, ch) {
  const cfg = ch?.config && typeof ch.config === 'object' && !Array.isArray(ch.config) ? ch.config : {}
  const t = ch.channel_type || 'email'
  const isEmail = t === 'email'
  formRef.value = {
    channel_type: t,
    emailTo: isEmail && cfg.to != null ? String(cfg.to) : '',
    emailSubject: isEmail ? (cfg.subject != null ? String(cfg.subject) : 'Workflow result') : 'Workflow result',
    smsFromNumber: t === 'sms' && cfg.from_number != null ? String(cfg.from_number) : '',
    outboundFromNumber: t === 'outbound_call' && cfg.from_number != null ? String(cfg.from_number) : '',
    outboundTtsVoice: t === 'outbound_call' && cfg.tts_voice != null ? String(cfg.tts_voice) : '',
    outboundLanguage: t === 'outbound_call' && cfg.language != null ? String(cfg.language) : '',
    configJson: JSON.stringify(
      t === 'email' || t === 'sms' || t === 'voice' || t === 'outbound_call' ? {} : cfg,
      null,
      2
    ),
    is_primary: !!ch.is_primary
  }
}

function applyOutputChannelToForm(ch) {
  hydrateOutputForm(outputChannelForm, ch)
}

function buildOutputChannelPayloadFromRef(formRef) {
  const f = formRef.value
  const t = f.channel_type
  if (t === 'email') {
    return {
      channel_type: 'email',
      config: {
        to: (f.emailTo || '').trim(),
        subject: (f.emailSubject || '').trim() || 'Workflow result'
      },
      is_primary: !!f.is_primary
    }
  }
  if (t === 'sms') {
    return {
      channel_type: 'sms',
      config: {
        from_number: (f.smsFromNumber || '').trim()
      },
      is_primary: !!f.is_primary
    }
  }
  if (t === 'voice') {
    return {
      channel_type: 'voice',
      config: {},
      is_primary: !!f.is_primary
    }
  }
  if (t === 'outbound_call') {
    return {
      channel_type: 'outbound_call',
      config: {
        from_number: (f.outboundFromNumber || '').trim(),
        tts_voice: (f.outboundTtsVoice || '').trim(),
        language: (f.outboundLanguage || '').trim()
      },
      is_primary: !!f.is_primary
    }
  }
  let config
  try {
    config = JSON.parse(f.configJson || '{}')
  } catch {
    throw new Error('INVALID_JSON')
  }
  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('INVALID_JSON')
  return {
    channel_type: t,
    config,
    is_primary: !!f.is_primary
  }
}

function buildOutputChannelPayload() {
  return buildOutputChannelPayloadFromRef(outputChannelForm)
}

async function refreshPatterns() {
  patterns.value = await listPatterns(props.workflowId)
}

async function refreshWorkflowRecord() {
  workflowRecord.value = await getWorkflow(props.workflowId)
}

async function refreshTriggers() {
  triggers.value = await listTriggers(props.workflowId, 1, 100)
}

async function refreshOutputChannels() {
  outputChannels.value = await listOutputChannels(props.workflowId)
}

async function refreshAll() {
  await Promise.all([refreshWorkflowRecord(), refreshPatterns(), refreshTriggers(), refreshOutputChannels()])
}

function openWorkflowEditModal() {
  const w = workflowRecord.value
  workflowEditForm.value = {
    name: (w?.name || '').trim(),
    description: (w?.description || '').trim()
  }
  showWorkflowEditModal.value = true
}

async function submitWorkflowEdit() {
  saving.value = true
  try {
    await updateWorkflowRecord(props.workflowId, {
      name: workflowEditForm.value.name.trim(),
      description: workflowEditForm.value.description.trim()
    })
    await refreshWorkflowRecord()
    showToast('Success', 'Workflow updated', 'success')
    showWorkflowEditModal.value = false
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Update failed', 'error')
  } finally {
    saving.value = false
  }
}

async function doActivateWorkflow() {
  saving.value = true
  try {
    await activateWorkflow(props.workflowId)
    await refreshWorkflowRecord()
    showToast('Success', 'Workflow activated', 'success')
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Activate failed', 'error')
  } finally {
    saving.value = false
  }
}

async function doDeactivateWorkflow() {
  saving.value = true
  try {
    await deactivateWorkflow(props.workflowId)
    await refreshWorkflowRecord()
    showToast('Success', 'Workflow deactivated', 'success')
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Deactivate failed', 'error')
  } finally {
    saving.value = false
  }
}

async function confirmDeleteWorkflow() {
  const ok = await openConfirmModal({
    title: 'Delete workflow',
    message: 'Delete this workflow permanently? This cannot be undone.',
    confirmLabel: 'Delete workflow'
  })
  if (!ok) return
  saving.value = true
  try {
    await removeWorkflow(props.workflowId)
    showToast('Success', 'Workflow deleted', 'success')
    emit('workflow-deleted')
  } catch (e) {
    showToast('Error', e.message || 'Delete failed', 'error')
  } finally {
    saving.value = false
  }
}

async function loadAgents() {
  agentsLoading.value = true
  try {
    const collected = []
    let page = 1
    const limit = 100
    let hasMore = true
    while (hasMore && page <= 50) {
      const res = await apiService.getAgentData(page, limit, null, null)
      const data = res?.data ?? res
      const batch = Array.isArray(data?.agents) ? data.agents : Array.isArray(data) ? data : []
      collected.push(...batch)
      const pag = data?.pagination
      hasMore = pag?.has_next === true && batch.length > 0
      page += 1
      if (!batch.length) hasMore = false
    }
    agentOptions.value = collected
  } catch (e) {
    console.error(e)
    agentOptions.value = []
  } finally {
    agentsLoading.value = false
  }
}

function openTriggerModal() {
  requestClearCanvasSelection()
  isAddingTrigger.value = true
  triggerForm.value = { trigger_type: 'email', is_active: true }
  triggerEmail.value = ''
  triggerWebhook.value = ''
  triggerCron.value = ''
  triggerPhone.value = ''
  triggerApiErrors.value = {}
  triggerModalTypeOpen.value = false
}

function openPatternModal() {
  patternForm.value = { pattern_type: 'sequential', name: '', description: '' }
  patternApiErrors.value = {}
  showPatternModal.value = true
}

function openPatternEditModal(p) {
  patternEditForm.value = {
    id: p.id,
    pattern_type: p.pattern_type || 'sequential',
    name: p.name || '',
    description: p.description || ''
  }
  patternEditApiErrors.value = {}
  showPatternEditModal.value = true
}

async function openRouterModal(p) {
  /** Only one stack modal at a time (avoid router behind Pattern agents / Add agent). */
  showManageAgentsModal.value = false
  showAgentModal.value = false
  routerPattern.value = p
  showRouterModal.value = true
  routerExists.value = false
  routerModalForm.value = {
    rules: [{ condition: '', agent_id: '' }],
    fallback_agent_id: '',
    status: 'active'
  }
  routerModalPatternAgents.value = []
  await loadRouterModalSidebar(props.workflowId, p.id)
}

/** Load pattern row and open router editor (supervisor patterns only). */
async function openRouterModalForPatternId(patternId) {
  if (!patternId) return
  let p = patterns.value.find((x) => String(x.id) === String(patternId))
  if (!p) {
    try {
      p = await getPattern(props.workflowId, patternId)
    } catch (e) {
      showToast('Error', e?.message || 'Could not load pattern', 'error')
      return
    }
  }
  if (!p || String(p.pattern_type || '').toLowerCase().replace(/\s+/g, '_') !== 'supervisor') return
  await openRouterModal(p)
}

function openRouterModalForManageAgents() {
  return openRouterModalForPatternId(managePatternId.value)
}

function openRouterModalForManageAgentsFromAddAgent() {
  return openRouterModalForPatternId(agentForm.value.pattern_id)
}

async function submitRouter() {
  const routing_rules = routerModalForm.value.rules
    .map((r) => ({
      condition: (r.condition || '').trim(),
      agent_id: (r.agent_id || '').trim()
    }))
    .filter((r) => r.condition && r.agent_id)
  const payload = {
    routing_rules,
    fallback_agent_id: (routerModalForm.value.fallback_agent_id || '').trim() || null,
    status: routerModalForm.value.status === 'inactive' ? 'inactive' : 'active'
  }
  saving.value = true
  try {
    await saveRouter(props.workflowId, routerPattern.value.id, payload, routerExists.value)
    routerExists.value = true
    showToast('Success', 'Workflow router saved', 'success')
    showRouterModal.value = false
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Router save failed', 'error')
  } finally {
    saving.value = false
  }
}

async function deleteRouterConfig() {
  const ok = await openConfirmModal({
    title: 'Remove router',
    message: 'Remove router configuration for this pattern?',
    confirmLabel: 'Remove'
  })
  if (!ok) return
  saving.value = true
  try {
    const patternId = routerPattern.value?.id
    await removeRouter(props.workflowId, patternId)
    syncCanvasSidebarAfterRouterDeleted(patternId)
    showToast('Success', 'Router deleted', 'success')
    showRouterModal.value = false
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Delete failed', 'error')
  } finally {
    saving.value = false
  }
}

async function openAgentModal(preferredPatternId = '') {
  showRouterModal.value = false
  showManageAgentsModal.value = false
  const preferred = String(preferredPatternId || '')
  const found = preferred
    ? patterns.value.find((p) => String(p.id) === preferred)
    : null
  const defaultPatternId = found?.id || patterns.value[0]?.id || ''
  agentForm.value = { pattern_id: defaultPatternId, agent_id: '', timeoutSec: '30' }
  await loadAgents()
  showAgentModal.value = true
}

async function openAgentModalForPattern(patternId) {
  await openAgentModal(patternId)
}

async function openManageAgentsModal(preferredPatternId = '') {
  showRouterModal.value = false
  showAgentModal.value = false
  const preferred = String(preferredPatternId || '')
  const found = preferred
    ? patterns.value.find((p) => String(p.id) === preferred)
    : null
  managePatternId.value = found?.id || patterns.value[0]?.id || ''
  managePatternAgents.value = []
  showManageAgentsModal.value = true
  await loadAgents()
  if (managePatternId.value) await loadManageAgents()
}

async function openManageAgentsModalForPattern(patternId) {
  await openManageAgentsModal(patternId)
}

async function loadManageAgents() {
  if (!managePatternId.value) {
    managePatternAgents.value = []
    return
  }
  manageAgentsLoading.value = true
  try {
    managePatternAgents.value = await listPatternAgents(props.workflowId, managePatternId.value)
  } catch (e) {
    managePatternAgents.value = []
    showToast('Error', e.message || 'Failed to load agents', 'error')
  } finally {
    manageAgentsLoading.value = false
  }
}

async function moveManageAgent(row, dir) {
  const sorted = [...manageAgentsSorted.value]
  const idx = sorted.findIndex((x) => x.id === row.id)
  const j = idx + dir
  if (idx < 0 || j < 0 || j >= sorted.length) return
  const swapped = [...sorted]
  const tmp = swapped[idx]
  swapped[idx] = swapped[j]
  swapped[j] = tmp
  const order = swapped.map((r, i) => ({
    pattern_agent_id: r.id,
    execution_order: i + 1
  }))
  saving.value = true
  try {
    await reorderPatternAgents(props.workflowId, managePatternId.value, order)
    await loadManageAgents()
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Reorder failed', 'error')
  } finally {
    saving.value = false
  }
}

async function removeManageAgent(row) {
  const ok = await openConfirmModal({
    title: 'Remove agent',
    message: 'Remove this agent from the pattern?',
    confirmLabel: 'Remove'
  })
  if (!ok) return
  saving.value = true
  try {
    await removePatternAgent(props.workflowId, managePatternId.value, row.id)
    await loadManageAgents()
    showToast('Success', 'Agent removed', 'success')
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Remove failed', 'error')
  } finally {
    saving.value = false
  }
}

function closeOutputChannelModal() {
  outputChannelTypeOpen.value = false
  showOutputChannelModal.value = false
  outputChannelEditId.value = null
}

function openOutputChannelModal() {
  outputChannelEditId.value = null
  outputChannelForm.value = {
    channel_type: 'email',
    emailTo: '',
    emailSubject: 'Workflow result',
    smsFromNumber: '',
    outboundFromNumber: '',
    outboundTtsVoice: '',
    outboundLanguage: '',
    configJson: '{}',
    is_primary: false
  }
  showOutputChannelModal.value = true
}

async function openOutputChannelEditModal(c) {
  if (!c?.id) return
  outputChannelEditId.value = c.id
  showOutputChannelModal.value = true
  saving.value = true
  try {
    const row = await getOutputChannel(props.workflowId, c.id)
    applyOutputChannelToForm(row || c)
  } catch (e) {
    console.error(e)
    applyOutputChannelToForm(c)
    showToast('Warning', 'Could not reload this channel; editing from the list row.', 'warning')
  } finally {
    saving.value = false
  }
}

async function submitOutputChannel() {
  let payload
  try {
    payload = buildOutputChannelPayload()
  } catch {
    showToast('Validation', 'Config must be valid JSON for this channel type.', 'error')
    return
  }
  if (payload.channel_type === 'email' && !(payload.config?.to || '').trim()) {
    showToast('Validation', 'Recipient email (To) is required.', 'error')
    return
  }
  saving.value = true
  try {
    if (outputChannelEditId.value) {
      await updateOutputChannel(props.workflowId, outputChannelEditId.value, payload)
      showToast('Success', 'Output channel updated', 'success')
    } else {
      await createOutputChannel(props.workflowId, payload)
      showToast('Success', 'Output channel created', 'success')
    }
    await refreshOutputChannels()
    closeOutputChannelModal()
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Failed to save channel', 'error')
  } finally {
    saving.value = false
  }
}

async function deleteOutputChannelFromModal() {
  if (!outputChannelEditId.value) return
  const ok = await openConfirmModal({
    title: 'Delete output channel',
    message: 'Delete this output channel?',
    confirmLabel: 'Delete'
  })
  if (!ok) return
  saving.value = true
  try {
    await removeOutputChannel(props.workflowId, outputChannelEditId.value)
    await refreshOutputChannels()
    showToast('Success', 'Channel removed', 'success')
    closeOutputChannelModal()
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Delete failed', 'error')
  } finally {
    saving.value = false
  }
}

async function deleteChannelRow(c) {
  const ok = await openConfirmModal({
    title: 'Delete output channel',
    message: 'Delete this output channel?',
    confirmLabel: 'Delete'
  })
  if (!ok) return
  saving.value = true
  try {
    await removeOutputChannel(props.workflowId, c.id)
    await refreshOutputChannels()
    showToast('Success', 'Channel removed', 'success')
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Delete failed', 'error')
  } finally {
    saving.value = false
  }
}

async function submitCanvasOutputChannelUpdate() {
  const sel = props.canvasSelection
  if (!sel || sel.kind !== 'output' || !sel.channelId) return
  let payload
  try {
    payload = buildOutputChannelPayloadFromRef(canvasOutputChannelForm)
  } catch {
    showToast('Validation', 'Config must be valid JSON for this channel type.', 'error')
    return
  }
  if (payload.channel_type === 'email' && !(payload.config?.to || '').trim()) {
    showToast('Validation', 'Recipient email (To) is required.', 'error')
    return
  }
  saving.value = true
  try {
    await updateOutputChannel(props.workflowId, sel.channelId, payload)
    await refreshOutputChannels()
    const ch = await getOutputChannel(props.workflowId, sel.channelId)
    canvasEditOutputChannel.value = ch
    hydrateOutputForm(canvasOutputChannelForm, ch)
    showToast('Success', 'Output channel updated', 'success')
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e?.message || 'Failed to save channel', 'error')
  } finally {
    saving.value = false
  }
}

async function deleteSelectedCanvasOutput() {
  const sel = props.canvasSelection
  if (!sel || sel.kind !== 'output' || !sel.channelId) return
  const ok = await openConfirmModal({
    title: 'Delete output channel',
    message: 'Delete this output channel?',
    confirmLabel: 'Delete'
  })
  if (!ok) return
  saving.value = true
  try {
    await removeOutputChannel(props.workflowId, sel.channelId)
    await refreshOutputChannels()
    showToast('Success', 'Channel removed', 'success')
    emit('clear-canvas-selection')
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e?.message || 'Delete failed', 'error')
  } finally {
    saving.value = false
  }
}

async function openHitlModal() {
  const cfg = await loadHitl(props.workflowId)
  applyHitlResponseToForm(cfg)
}

async function deleteHitlConfig() {
  const ok = await openConfirmModal({
    title: 'Delete HITL',
    message: 'Delete HITL configuration?',
    confirmLabel: 'Delete'
  })
  if (!ok) return
  saving.value = true
  try {
    await deleteHitl(props.workflowId)
    applyHitlResponseToForm(null)
    showToast('Success', 'HITL removed', 'success')
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Delete failed', 'error')
  } finally {
    saving.value = false
  }
}

async function submitTrigger() {
  saving.value = true
  triggerApiErrors.value = {}
  try {
    let config = {}
    const t = triggerForm.value.trigger_type
    if (t === 'email') {
      if (!triggerEmail.value.trim()) {
        showToast('Validation', 'Inbound email is required', 'error')
        return
      }
      config = { inbound_email: triggerEmail.value.trim() }
    } else if (t === 'webhook') {
      if (!triggerWebhook.value.trim()) {
        showToast('Validation', 'Endpoint URL is required', 'error')
        return
      }
      config = { endpoint: triggerWebhook.value.trim() }
    } else if (t === 'schedule') {
      if (!triggerCron.value.trim()) {
        showToast('Validation', 'Cron expression is required', 'error')
        return
      }
      config = { cron: triggerCron.value.trim() }
    } else if (t === 'sms' || t === 'voice') {
      if (!triggerPhone.value.trim()) {
        showToast('Validation', 'Phone number (E.164) is required', 'error')
        return
      }
      config = { phone_number: triggerPhone.value.trim() }
    }

    await createTrigger(props.workflowId, {
      trigger_type: t,
      config,
      is_active: true
    })
    await refreshTriggers()
    showToast('Success', 'Trigger added', 'success')
    isAddingTrigger.value = false
    emit('diagram-updated')
  } catch (e) {
    const raw = e?.errors && typeof e.errors === 'object' ? e.errors : {}
    const flat = flattenWorkflowValidationErrors(raw)
    triggerApiErrors.value = flat
    const msg =
      Object.keys(flat).length > 0 ? formatWorkflowValidationToast(flat) : e?.message || 'Failed to add trigger'
    showToast('Validation', msg, 'error')
  } finally {
    saving.value = false
  }
}

async function deleteTriggerRow(t) {
  const ok = await openConfirmModal({
    title: 'Remove trigger',
    message: 'Delete this trigger? This cannot be undone.',
    confirmLabel: 'Delete'
  })
  if (!ok) return
  saving.value = true
  try {
    await removeTrigger(props.workflowId, t.id)
    await refreshTriggers()
    showToast('Success', 'Trigger removed', 'success')
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Delete failed', 'error')
  } finally {
    saving.value = false
  }
}

async function deleteTriggerFromCanvas(triggerId) {
  const t = triggers.value.find((x) => String(x.id) === String(triggerId))
  if (!t) {
    showToast('Error', 'Trigger not found', 'error')
    return
  }
  await deleteTriggerRow(t)
}

async function submitCanvasTriggerUpdate() {
  const sel = props.canvasSelection
  const row = canvasEditTrigger.value
  if (!sel || sel.kind !== 'trigger' || !row?.id) return
  saving.value = true
  canvasTriggerApiErrors.value = {}
  try {
    let config = {}
    const t = canvasTriggerForm.value.trigger_type
    if (t === 'email') {
      if (!canvasTriggerEmail.value.trim()) {
        showToast('Validation', 'Inbound email is required', 'error')
        return
      }
      config = { inbound_email: canvasTriggerEmail.value.trim() }
    } else if (t === 'webhook') {
      if (!canvasTriggerWebhook.value.trim()) {
        showToast('Validation', 'Endpoint URL is required', 'error')
        return
      }
      config = { endpoint: canvasTriggerWebhook.value.trim() }
    } else if (t === 'schedule') {
      if (!canvasTriggerCron.value.trim()) {
        showToast('Validation', 'Cron expression is required', 'error')
        return
      }
      config = { cron: canvasTriggerCron.value.trim() }
    } else if (t === 'sms' || t === 'voice') {
      if (!canvasTriggerPhone.value.trim()) {
        showToast('Validation', 'Phone number (E.164) is required', 'error')
        return
      }
      config = { phone_number: canvasTriggerPhone.value.trim() }
    }

    await updateTrigger(props.workflowId, row.id, {
      trigger_type: t,
      config,
      is_active: canvasTriggerForm.value.is_active
    })
    await refreshTriggers()
    const updated = await getTrigger(props.workflowId, row.id)
    canvasEditTrigger.value = updated
    showToast('Success', 'Trigger updated', 'success')
    emit('diagram-updated')
  } catch (e) {
    const raw = e?.errors && typeof e.errors === 'object' ? e.errors : {}
    const flat = flattenWorkflowValidationErrors(raw)
    canvasTriggerApiErrors.value = flat
    const msg =
      Object.keys(flat).length > 0 ? formatWorkflowValidationToast(flat) : e?.message || 'Failed to update trigger'
    showToast('Validation', msg, 'error')
  } finally {
    saving.value = false
  }
}

async function deleteSelectedCanvasTrigger() {
  const row = canvasEditTrigger.value
  if (!row?.id) return
  const ok = await openConfirmModal({
    title: 'Remove trigger',
    message: 'Delete this trigger? This cannot be undone.',
    confirmLabel: 'Delete'
  })
  if (!ok) return
  saving.value = true
  try {
    await removeTrigger(props.workflowId, row.id)
    await refreshTriggers()
    showToast('Success', 'Trigger removed', 'success')
    emit('diagram-updated')
    emit('clear-canvas-selection')
  } catch (e) {
    showToast('Error', e.message || 'Delete failed', 'error')
  } finally {
    saving.value = false
  }
}

async function submitCanvasPatternUpdate() {
  const sel = props.canvasSelection
  const row = canvasEditPattern.value
  if (!sel || sel.kind !== 'pattern' || !row?.id) return
  const name = canvasPatternForm.value.name?.trim() || ''
  const desc = (canvasPatternForm.value.description || '').trim()
  if (!name || !desc) {
    canvasPatternApiErrors.value = flattenWorkflowValidationErrors({
      ...(!name && { name: 'Name is required' }),
      ...(!desc && { description: 'Description is required' })
    })
    showToast('Validation', 'Name and description are required.', 'error')
    return
  }

  saving.value = true
  canvasPatternApiErrors.value = {}
  try {
    const payload = {
      pattern_type: canvasPatternForm.value.pattern_type,
      name,
      description: desc
    }
    const eo = String(canvasPatternForm.value.execution_order ?? '').trim()
    if (eo !== '') {
      const n = Number(eo)
      if (!Number.isNaN(n)) payload.execution_order = n
    }

    await updatePattern(props.workflowId, row.id, payload)
    await refreshPatterns()
    const updated = await getPattern(props.workflowId, row.id)
    canvasEditPattern.value = updated
    canvasPatternForm.value = {
      pattern_type: updated.pattern_type || 'sequential',
      name: updated.name || '',
      description: updated.description || '',
      execution_order: updated.execution_order != null ? String(updated.execution_order) : ''
    }
    if (updated.pattern_type === 'supervisor') {
      await loadCanvasPatternRouterSidebar(props.workflowId, row.id)
    } else {
      resetCanvasRouterSidebar()
    }
    showToast('Success', 'Pattern updated', 'success')
    emit('diagram-updated')
  } catch (e) {
    const raw = e?.errors && typeof e.errors === 'object' ? e.errors : {}
    const flat = flattenWorkflowValidationErrors(raw)
    canvasPatternApiErrors.value = flat
    const msg =
      Object.keys(flat).length > 0 ? formatWorkflowValidationToast(flat) : e?.message || 'Failed to update pattern'
    showToast('Validation', msg, 'error')
  } finally {
    saving.value = false
  }
}

async function deleteSelectedCanvasPattern() {
  const p = canvasEditPattern.value
  if (!p?.id) return
  const deleted = await deletePatternRow(p)
  if (deleted) emit('clear-canvas-selection')
}

async function submitCanvasAgentUpdate() {
  const sel = props.canvasSelection
  const row = canvasEditAgent.value
  if (!sel || sel.kind !== 'agent' || !sel.patternId || !sel.patternAgentId || !row?.id) return
  if (!canvasAgentForm.value.agent_id?.trim()) {
    canvasAgentApiErrors.value = flattenWorkflowValidationErrors({ agent_id: 'Agent is required' })
    showToast('Validation', 'Select an agent.', 'error')
    return
  }
  const built = buildPatternAgentTimeoutConfig(canvasAgentForm.value.timeoutSec)
  if ('error' in built) {
    canvasAgentApiErrors.value = flattenWorkflowValidationErrors({
      [built.error]: built.message
    })
    showToast('Validation', built.message, 'error')
    return
  }
  const { config } = built

  saving.value = true
  canvasAgentApiErrors.value = {}
  try {
    await updatePatternAgent(props.workflowId, sel.patternId, sel.patternAgentId, {
      agent_id: canvasAgentForm.value.agent_id.trim(),
      is_fallback: !!canvasAgentForm.value.is_fallback,
      config
    })
    const updated = await getPatternAgent(props.workflowId, sel.patternId, sel.patternAgentId)
    canvasEditAgent.value = updated
    const cfg2 = updated?.config && typeof updated.config === 'object' ? updated.config : {}
    canvasAgentForm.value = {
      agent_id: updated?.agent_id != null ? String(updated.agent_id) : '',
      is_fallback: !!updated.is_fallback,
      timeoutSec: timeoutSecStringFromAgentConfig(cfg2) || '30'
    }
    showToast('Success', 'Agent step updated', 'success')
    emit('diagram-updated')
  } catch (e) {
    const raw = e?.errors && typeof e.errors === 'object' ? e.errors : {}
    const flat = flattenWorkflowValidationErrors(raw)
    canvasAgentApiErrors.value = flat
    const msg =
      Object.keys(flat).length > 0 ? formatWorkflowValidationToast(flat) : e?.message || 'Failed to update agent step'
    showToast('Validation', msg, 'error')
  } finally {
    saving.value = false
  }
}

async function deleteSelectedCanvasAgent() {
  const sel = props.canvasSelection
  const row = canvasEditAgent.value
  if (!sel || sel.kind !== 'agent' || !sel.patternId || !sel.patternAgentId || !row?.id) return
  const ok = await openConfirmModal({
    title: 'Remove agent step',
    message: 'Remove this agent from the pattern? This cannot be undone.',
    confirmLabel: 'Remove'
  })
  if (!ok) return
  saving.value = true
  try {
    await removePatternAgent(props.workflowId, sel.patternId, sel.patternAgentId)
    showToast('Success', 'Agent step removed', 'success')
    emit('diagram-updated')
    emit('clear-canvas-selection')
  } catch (e) {
    showToast('Error', e.message || 'Remove failed', 'error')
  } finally {
    saving.value = false
  }
}

async function submitPattern() {
  const name = patternForm.value.name?.trim() || ''
  const desc = (patternForm.value.description || '').trim()
  if (!name || !desc) {
    patternApiErrors.value = flattenWorkflowValidationErrors({
      ...(!name && { name: 'Name is required' }),
      ...(!desc && { description: 'Description is required' })
    })
    showToast('Validation', 'Name and description are required.', 'error')
    return
  }

  saving.value = true
  patternApiErrors.value = {}
  try {
    const order = await nextPatternExecutionOrder(props.workflowId)
    const created = await createPattern(props.workflowId, {
      pattern_type: patternForm.value.pattern_type,
      execution_order: order,
      name: patternForm.value.name.trim(),
      description: (patternForm.value.description || '').trim()
    })
    await refreshPatterns()
    showToast('Success', 'Pattern added', 'success')
    showPatternModal.value = false
    emitDiagramUpdated(created?.id ? { selectPatternId: String(created.id) } : null)
    if (patternForm.value.pattern_type === 'supervisor' && created?.id) {
      const p = patterns.value.find((x) => String(x.id) === String(created.id)) || created
      if (p?.id) await openRouterModal(p)
    }
  } catch (e) {
    const raw = e?.errors && typeof e.errors === 'object' ? e.errors : {}
    const flat = flattenWorkflowValidationErrors(raw)
    patternApiErrors.value = flat
    const msg =
      Object.keys(flat).length > 0 ? formatWorkflowValidationToast(flat) : e?.message || 'Failed to add pattern'
    showToast('Validation', msg, 'error')
  } finally {
    saving.value = false
  }
}

async function submitPatternEdit() {
  const name = patternEditForm.value.name?.trim() || ''
  const desc = (patternEditForm.value.description || '').trim()
  if (!name || !desc) {
    patternEditApiErrors.value = flattenWorkflowValidationErrors({
      ...(!name && { name: 'Name is required' }),
      ...(!desc && { description: 'Description is required' })
    })
    showToast('Validation', 'Name and description are required.', 'error')
    return
  }

  saving.value = true
  patternEditApiErrors.value = {}
  try {
    await updatePattern(props.workflowId, patternEditForm.value.id, {
      pattern_type: patternEditForm.value.pattern_type,
      name,
      description: desc
    })
    await refreshPatterns()
    showToast('Success', 'Pattern updated', 'success')
    showPatternEditModal.value = false
    emit('diagram-updated')
  } catch (e) {
    const raw = e?.errors && typeof e.errors === 'object' ? e.errors : {}
    const flat = flattenWorkflowValidationErrors(raw)
    patternEditApiErrors.value = flat
    const msg =
      Object.keys(flat).length > 0 ? formatWorkflowValidationToast(flat) : e?.message || 'Update failed'
    showToast('Validation', msg, 'error')
  } finally {
    saving.value = false
  }
}

async function deletePatternRow(p) {
  const ok = await openConfirmModal({
    title: 'Delete pattern',
    message: `Delete pattern "${p.name}"? This cannot be undone.`,
    confirmLabel: 'Delete'
  })
  if (!ok) return false
  saving.value = true
  try {
    await removePattern(props.workflowId, p.id)
    await refreshPatterns()
    showToast('Success', 'Pattern deleted', 'success')
    emit('diagram-updated')
    return true
  } catch (e) {
    showToast('Error', e.message || 'Delete failed', 'error')
    return false
  } finally {
    saving.value = false
  }
}

async function movePattern(p, dir) {
  const sorted = patternsSorted.value
  const idx = sorted.findIndex((x) => x.id === p.id)
  const j = idx + dir
  if (idx < 0 || j < 0 || j >= sorted.length) return
  const swapped = [...sorted]
  const tmp = swapped[idx]
  swapped[idx] = swapped[j]
  swapped[j] = tmp
  const order = swapped.map((pat, i) => ({
    pattern_id: pat.id,
    execution_order: i + 1
  }))
  saving.value = true
  try {
    await reorderPatterns(props.workflowId, order)
    clearWorkflowDiagramLocal(props.workflowId)
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Reorder failed', 'error')
  } finally {
    saving.value = false
  }
}

async function submitAgent() {
  const built = buildPatternAgentTimeoutConfig(agentForm.value.timeoutSec)
  if ('error' in built) {
    showToast('Validation', built.message, 'error')
    return
  }
  const { config } = built
  saving.value = true
  try {
    const order = await nextAgentExecutionOrder(props.workflowId, agentForm.value.pattern_id)
    await addPatternAgent(props.workflowId, agentForm.value.pattern_id, {
      agent_id: agentForm.value.agent_id,
      execution_order: order,
      config
    })
    showToast('Success', 'Agent linked to pattern', 'success')
    showAgentModal.value = false
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Failed to add agent', 'error')
  } finally {
    saving.value = false
  }
}

async function submitHitl(options = {}) {
  const closeModal = options.closeModal !== false
  saving.value = true
  try {
    const payload = {
      is_enabled: hitlForm.value.is_enabled,
      pause_on: hitlForm.value.pause_on,
      contact_channel: hitlForm.value.contact_channel,
      message_template: hitlForm.value.message_template,
      timeout_hours: hitlForm.value.timeout_hours,
      on_timeout: hitlForm.value.on_timeout,
      owner_message: hitlForm.value.owner_message
    }
    const wasUpdate = hitlExists.value
    await upsertHitl(props.workflowId, payload, wasUpdate)
    hitlExists.value = true
    showToast('Success', 'HITL config saved', 'success')
    emit('diagram-updated')
  } catch (e) {
    showToast('Error', e.message || 'Failed to save HITL', 'error')
  } finally {
    saving.value = false
  }
}

watch(
  () => props.workflowId,
  async () => {
    await refreshAll()
  }
)

watch(managePatternId, async () => {
  if (showManageAgentsModal.value) await loadManageAgents()
})

watch(isAddingTrigger, (open) => {
  if (!open) triggerModalTypeOpen.value = false
})

watch(showPatternModal, (open) => {
  if (!open) patternModalTypeOpen.value = false
})

watch(showAgentModal, (open) => {
  if (!open) agentModalAgentOpen.value = false
})

watch(showOutputChannelModal, (open) => {
  if (!open) outputChannelTypeOpen.value = false
})

watch(canvasEditTrigger, () => {
  canvasTriggerTypeOpen.value = false
})

onMounted(async () => {
  document.addEventListener('pointerdown', closeTriggerDropdownsOnOutside, true)
  await Promise.all([refreshAll(), loadAgents()])
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', closeTriggerDropdownsOnOutside, true)
})

defineExpose({
  openAgentModalForPattern,
  openManageAgentsModalForPattern,
  openTriggerModal,
  openPatternModal,
  deleteTriggerFromCanvas,
  refreshPatterns,
  openHitlModal,
  openWorkflowEditModal
})
</script>
