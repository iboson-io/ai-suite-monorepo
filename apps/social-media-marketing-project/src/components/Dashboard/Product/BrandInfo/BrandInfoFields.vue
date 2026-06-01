<template>
  <div class=" bg_secondary_color rounded-2xl p-6xl brand_section_height primary_border_color">
    <!-- Product name field -->
    <div class="flex flex-col justify-between md:flex-row">
      <label class="label_2_medium primary_text_color w-32 flex-shrink-0 ">
        Product name
      </label>
      <div class="w-[100%] md:w-[70%]">
        <input
          :value="productName"
          @input="$emit('update:productName', $event.target.value)"
          type="text"
          placeholder="Enter product name"
          class="input_box w-full border border-gray-400 py-xl px-3xl mt-sm md:mt-0"
        />
      </div>
    </div>

    <!-- Description field -->
    <div class="flex flex-col justify-between md:flex-row mt-11xl">
      <label class="label_2_medium primary_text_color w-32 flex-shrink-0">
        Description
      </label>
      <div class="w-[100%] md:w-[70%]">
        <textarea
          :value="description"
          @input="$emit('update:description', $event.target.value)"
          placeholder="Enter product description"
          class="input_box w-full min-h-[100px] resize-y border border-gray-400 py-xl px-3xl mt-sm md:mt-0 label_1_regular primary_text_color"
          rows="4"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  productName: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
});

defineEmits(["update:productName", "update:description"]);
</script>

