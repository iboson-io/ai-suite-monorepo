<template>
  <div class="grid grid-cols-1 gap-4xl sm:grid-cols-2">
    <div>
      <label class="label_2_semibold primary_text_color">
        Database Type <span class="text-error-600">*</span>
      </label>
      <SelectBox
        :model-value="dbConfig.type"
        :options="dbTypeOptions"
        placeholder="Select database type"
        wrapper-class="w-full"
        custom-class="flex items-center justify-between gap-md rounded-xl border bg-white px-4xl py-3xl outline-none label_2_regular primary_text_color disabled:opacity-75 disabled:cursor-not-allowed mt-md w-full text-left focus:border-info-500"
        :class="validationErrors.type ? 'border-error-200 focus:border-error-400' : 'primary_border_color'"
        dropdown-class="w-full"
        @change="updateField('type', $event.id)"
      />
    </div>

    <div>
      <label class="label_2_semibold primary_text_color">
        Host <span class="text-error-600">*</span>
      </label>
      <input
        :value="dbConfig.host"
        type="text"
        placeholder="db.example.com"
        class="label_2_regular primary_text_color mt-md w-full rounded-xl border bg-white px-4xl py-3xl outline-none focus:border-info-500"
        :class="validationErrors.host ? 'border-error-200' : 'primary_border_color'"
        @input="updateField('host', $event.target.value)"
      />
    </div>

    <div>
      <label class="label_2_semibold primary_text_color">
        Port <span class="text-error-600">*</span>
      </label>
      <input
        :value="dbConfig.port"
        type="number"
        placeholder="5432"
        class="label_2_regular primary_text_color mt-md w-full rounded-xl border bg-white px-4xl py-3xl outline-none focus:border-info-500"
        :class="validationErrors.port ? 'border-error-200' : 'primary_border_color'"
        @input="updateField('port', $event.target.value)"
      />
    </div>

    <div>
      <label class="label_2_semibold primary_text_color">
        Database Name <span class="text-error-600">*</span>
      </label>
      <input
        :value="dbConfig.database"
        type="text"
        placeholder="my_database"
        class="label_2_regular primary_text_color mt-md w-full rounded-xl border bg-white px-4xl py-3xl outline-none focus:border-info-500"
        :class="validationErrors.database ? 'border-error-200' : 'primary_border_color'"
        @input="updateField('database', $event.target.value)"
      />
    </div>

    <div>
      <label class="label_2_semibold primary_text_color">
        Username <span class="text-error-600">*</span>
      </label>
      <input
        :value="dbConfig.username"
        type="text"
        autocomplete="off"
        placeholder="username"
        class="label_2_regular primary_text_color mt-md w-full rounded-xl border bg-white px-4xl py-3xl outline-none focus:border-info-500"
        :class="validationErrors.username ? 'border-error-200' : 'primary_border_color'"
        @input="updateField('username', $event.target.value)"
      />
    </div>

    <div>
      <label class="label_2_semibold primary_text_color">
        Password <span class="text-error-600">*</span>
      </label>
      <div class="relative mt-md">
        <input
          :value="dbConfig.password"
          :type="showDbPassword ? 'text' : 'password'"
          autocomplete="new-password"
          placeholder="password"
          class="label_2_regular primary_text_color w-full rounded-xl border bg-white px-4xl py-3xl pr-16xl outline-none focus:border-info-500"
          :class="validationErrors.password ? 'border-error-200' : 'primary_border_color'"
          @input="updateField('password', $event.target.value)"
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 px-4xl flex items-center"
          @click="$emit('toggle-db-password')"
        >
          <img
            :src="showDbPassword ? EyeCloseIcon : EyeOpenIcon"
            :alt="showDbPassword ? 'Hide password' : 'Show password'"
            class="h-5 w-5 opacity-60 hover:opacity-100 transition-opacity"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { SelectBox } from '@ai-suite/shared-ui'
import EyeOpenIcon from '../../../../../../packages/shared-ui/src/assets/images/EyeOpen.svg'
import EyeCloseIcon from '../../../../../../packages/shared-ui/src/assets/images/EyeCloseIcon.svg'

const props = defineProps({
  dbConfig: {
    type: Object,
    default: () => ({
      type: '',
      host: '',
      port: '',
      database: '',
      username: '',
      password: '',
    }),
  },
  showDbPassword: { type: Boolean, default: false },
  validationErrors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:db-config', 'toggle-db-password', 'validate-field'])

const dbTypeOptions = [
  { id: 'postgresql', name: 'PostgreSQL' },
  { id: 'mysql', name: 'MySQL' },
  { id: 'sqlite', name: 'SQLite' },
  { id: 'mongodb', name: 'MongoDB' },
  { id: 'redis', name: 'Redis' },
  { id: 'oracle', name: 'Oracle' },
  { id: 'mssql', name: 'MSSQL' },
]

function updateField(field, value) {
  emit('update:db-config', { ...props.dbConfig, [field]: value })
  emit('validate-field', field)
}
</script>
