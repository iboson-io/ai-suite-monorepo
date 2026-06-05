<template>
  <div class="grid grid-cols-1 gap-4xl sm:grid-cols-2">
    <div>
      <label class="label_2_semibold primary_text_color">
        Database Type <span class="text-error-600">*</span>
      </label>
      <select
        :value="dbConfig.type"
        class="label_2_regular primary_text_color mt-md w-full rounded-xl border bg-white px-4xl py-3xl outline-none focus:border-info-500"
        :class="validationErrors.type ? 'border-error-200' : 'primary_border_color'"
        @change="updateField('type', $event.target.value)"
      >
        <option value="">Select database type</option>
        <option value="postgresql">PostgreSQL</option>
        <option value="mysql">MySQL</option>
        <option value="sqlite">SQLite</option>
        <option value="mongodb">MongoDB</option>
        <option value="redis">Redis</option>
        <option value="oracle">Oracle</option>
        <option value="mssql">MSSQL</option>
      </select>
      <p v-if="validationErrors.type" class="label_3_regular text-error-600 mt-sm">
        {{ validationErrors.type }}
      </p>
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
      <p v-if="validationErrors.host" class="label_3_regular text-error-600 mt-sm">
        {{ validationErrors.host }}
      </p>
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
      <p v-if="validationErrors.port" class="label_3_regular text-error-600 mt-sm">
        {{ validationErrors.port }}
      </p>
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
      <p v-if="validationErrors.database" class="label_3_regular text-error-600 mt-sm">
        {{ validationErrors.database }}
      </p>
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
      <p v-if="validationErrors.username" class="label_3_regular text-error-600 mt-sm">
        {{ validationErrors.username }}
      </p>
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
          class="absolute inset-y-0 right-0 px-4xl caption_1_medium secondary_text_color hover:primary_text_color"
          @click="$emit('toggle-db-password')"
        >
          {{ showDbPassword ? 'Hide' : 'Show' }}
        </button>
      </div>
      <p v-if="validationErrors.password" class="label_3_regular text-error-600 mt-sm">
        {{ validationErrors.password }}
      </p>
    </div>
  </div>
</template>

<script setup>
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

function updateField(field, value) {
  emit('update:db-config', { ...props.dbConfig, [field]: value })
  emit('validate-field', field)
}
</script>
