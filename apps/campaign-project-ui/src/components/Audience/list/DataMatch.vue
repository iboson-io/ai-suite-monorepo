<template>
  <div
    class="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border primary_border_color bg_secondary_color p-6xl"
  >
    <div class="min-h-0 flex-1 overflow-auto">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] rounded-lg border border-gray-25">
          <thead class="sticky top-0 z-10">
            <tr class="border-b primary_border_color bg-gray-25">
              <th
                class="w-[5.5rem] bg-gray-25 py-xxl px-6xl text-left label_3_semibold secondary_text_color"
              >
                Import
              </th>
              <th
                class="bg-gray-25 py-xxl px-6xl text-left label_3_semibold secondary_text_color"
              >
                File column name
              </th>
              <th
                class="min-w-[220px] bg-gray-25 py-xxl px-6xl text-left label_3_semibold secondary_text_color"
              >
                Genius profile property
              </th>
              <th
                class="w-[6.5rem] bg-gray-25 py-xxl px-6xl text-left label_3_semibold secondary_text_color"
              >
                Mapped
              </th>
            </tr>
          </thead>
        <tbody>
          <tr
            v-for="row in mappingRows"
            :key="row.id"
            class="border-b primary_border_color last:border-b-0"
          >
            <td class="py-6xl px-7xl align-middle">
              <input
                v-model="row.import"
                type="checkbox"
                class="custom-checkbox h-5xl w-5xl cursor-pointer rounded"
                :aria-label="`Import ${row.fileColumn}`"
              />
            </td>
            <td class="p-xl align-middle label_2_medium secondary_text_color">
              {{ row.fileColumn }}
            </td>
            <td class="py-6xl px-7xl align-middle">
              <div class="relative">
                <select
                  v-model="row.profileProperty"
                  class="product-select w-full cursor-pointer appearance-none rounded-lg regular_border_color bg_secondary_color py-xxl pl-xl pr-10xl label_2_medium primary_text_color outline-none transition-colors focus:border-[3px] focus:border-[#D9E2FC]"
                  :disabled="!row.import"
                >
                  <option
                    v-for="opt in profilePropertyOptions"
                    :key="opt"
                    :value="opt"
                  >
                    {{ opt }}
                  </option>
                </select>
                <img
                  :src="DownArrow"
                  alt=""
                  class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 md:right-4"
                  aria-hidden="true"
                />
              </div>
            </td>
            <td class="p-xl align-middle">
              <span
                v-if="rowMappedStatus(row) === 'success'"
                class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-success-600"
                aria-label="Mapped"
              >
                <img :src="GreenTickIcon" alt="" class="h-2.5 w-2.5 brightness-0 invert" />
              </span>
              <span
                v-else
                class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-400"
                aria-label="Not mapped"
              >
                <span class="text-xs font-bold leading-none text-white">!</span>
              </span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DownArrow from '../../../assets/images/DownArrow.svg'
import GreenTickIcon from '../../../assets/images/GreenTickIcon.svg'

const profilePropertyOptions = [
  'Frist Name',
  'Last Name',
  'Contact Email',
  'Phone',
  'Customer ID',
  'External ID',
  'Address',
  'Company'
]

const SEED_MAPPING_ROWS = [
  {
    id: 1,
    import: true,
    fileColumn: 'Frist Name',
    profileProperty: 'Frist Name'
  },
  {
    id: 2,
    import: true,
    fileColumn: 'Last name',
    profileProperty: 'Last Name'
  },
  {
    id: 3,
    import: true,
    fileColumn: 'Email Address',
    profileProperty: 'Contact Email'
  },
  {
    id: 4,
    import: true,
    fileColumn: 'Phone',
    profileProperty: 'Phone'
  },
  {
    id: 5,
    import: false,
    fileColumn: 'Customer ID',
    profileProperty: 'Customer ID'
  }
]

const mappingRows = ref(SEED_MAPPING_ROWS.map((row) => ({ ...row })))

function rowMappedStatus(row) {
  if (!row.import) return 'warning'
  if (!row.profileProperty) return 'warning'
  return 'success'
}

defineExpose({
  mappingRows,
  rowMappedStatus
})
</script>
