export const WF_FIELD_LABEL = 'label_3_semibold secondary_text_color'

export const WF_FIELD_INPUT =
  'w-full rounded-lg border primary_border_color bg_secondary_color px-xl py-xs label_3_regular primary_text_color outline-none transition-colors placeholder:tertiary_text_color focus:border-info-500'

export const WF_FIELD_SELECT =
  'flex w-full items-center justify-between gap-md rounded-lg border primary_border_color bg_secondary_color px-xl py-xs label_3_medium primary_text_color outline-none transition-colors focus:border-info-500'

export const WF_POPOVER_PANEL =
  'absolute left-1/2 top-full z-[1000] mt-2 flex -translate-x-1/2 flex-col gap-3 rounded-xl border primary_border_color bg_secondary_color p-4 shadow-lg primary_text_color'

export const WF_TAB_PANEL =
  'flex flex-col gap-2 custom_scrollbar max-h-[250px] overflow-y-auto pr-1'

export const WF_BTN_ROW = 'mt-2 flex gap-md'

export const WF_BTN_PRIMARY =
  'primary_add_button flex-1 rounded-lg py-xs label_3_semibold primary_2_text_color disabled:opacity-50'

export const WF_BTN_DANGER =
  'flex-1 rounded-lg border primary_border_color py-xs label_3_semibold delete_text_color transition-colors hover:bg-error-50 disabled:opacity-50'

export const WF_LIST_ITEM =
  'flex items-center justify-between gap-md rounded-lg border primary_border_color bg_primary_color p-md label_3_regular'

export const WF_CHECKBOX =
  'rounded border primary_border_color text-info-500 focus:ring-info-500'

export const PATTERN_TYPE_OPTIONS = [
  { id: 'sequential', name: 'Sequential' },
  { id: 'parallel', name: 'Parallel' },
  { id: 'supervisor', name: 'Supervisor' },
  { id: 'agent_to_agent', name: 'Agent-to-agent' }
]

export const TRIGGER_TYPE_OPTIONS = [
  { id: 'email', name: 'Email' },
  { id: 'webhook', name: 'Webhook' },
  { id: 'schedule', name: 'Schedule' },
  { id: 'sms', name: 'SMS' },
  { id: 'voice', name: 'Voice' }
]
