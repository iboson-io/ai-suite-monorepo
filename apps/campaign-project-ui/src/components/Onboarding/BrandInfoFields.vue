<template>
  <div class="bg-white p-6xl rounded-[12px] w-full h-full">
    
    <!-- Product Name -->
    <div class="grid grid-cols-3 items-start mb-5xl">
      <label class="label_2_semibold primary_text_color">Product name</label>
      <input
        type="text"
        placeholder="Enter product name here..."
        class="col-span-2 input_box h-[44px] px-4 regular_border_color rounded-md"
      />
    </div>

    <!-- Address -->
    <div class="grid grid-cols-3 items-start mb-5xl">
      <label class="label_2_semibold primary_text_color">Address</label>
      <textarea
        placeholder="Enter address here..."
        rows="3"
        class="col-span-2 input_box px-4 py-3 regular_border_color rounded-md resize-none"
      ></textarea>
    </div>

    <!-- Country -->
    <div class="grid grid-cols-3 items-center mb-5xl">
      <label class="label_2_semibold primary_text_color">Country</label>
      <div class="col-span-2 relative">
        <select
          class="input_box h-[44px] px-4 regular_border_color rounded-md appearance-none w-full"
        >
          <option>United States</option>
          <option>India</option>
          <option>United Kingdom</option>
        </select>

        <!-- Dropdown Icon -->
        <div class="absolute right-3 top-1/2 -translate-y-1/2 ">
          <img :src="DownArrow" alt="">
        </div>
      </div>
    </div>

    <!-- State -->
    <div class="grid grid-cols-3 items-start mb-5xl">
      <label class="label_2_semibold primary_text_color">State</label>
      <input
        type="text"
        placeholder="Enter state name here..."
        class="col-span-2 input_box h-[44px] px-4 regular_border_color rounded-md"
      />
    </div>

    <!-- City -->
    <div class="grid grid-cols-3 items-start mb-5xl">
      <label class="label_2_semibold primary_text_color">City</label>
      <input
        type="text"
        placeholder="Enter city name here..."
        class="col-span-2 input_box h-[44px] px-4 regular_border_color rounded-md"
      />
    </div>

    <!-- Zip Code -->
    <div class="grid grid-cols-3 items-start">
      <label class="label_2_semibold primary_text_color">Zip/Post code</label>
      <input
        type="text"
        placeholder="Enter Zip/Post code here..."
        class="col-span-2 input_box h-[44px] px-4 regular_border_color rounded-md"
      />
    </div>

  </div>
</template>

<script setup>
// no logic needed for static UI
import DownArrow from "../../assets/images/DownArrow.svg";
</script>
<style>
    .relative > div[class*="absolute"] {
    border: 1px solid #f1f2f400;
}
</style>