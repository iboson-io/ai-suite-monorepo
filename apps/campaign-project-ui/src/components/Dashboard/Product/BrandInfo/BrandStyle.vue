<template>
    <div class="bg_secondary_color rounded-2xl p-6xl brand_section_height primary_border_color">
  <div class="flex flex-col items-start justify-between md:flex-row">
    <label class="label_2_medium primary_text_color">Brand Voice</label>

    <div class="relative flex items-center rounded-xl mt-sm md:mt-0  w-[100%] md:w-[70%]">
    <ul class="grid grid-cols-2 gap-6xl w-[100%]">
      <!-- Friendly -->
      <li
        @click="brandVoice = 'friendly'"
        class="relative flex flex-col  items-start rounded-xl cursor-pointer p-4xl"
        :class="
          brandVoice === 'friendly'
            ? 'gradient-border bg_primary_color'
            : 'default-border'
        "
      >
        <!-- Handshake Icon -->
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.4974 12.5717L11.9974 19.9997L4.49737 12.5717C4.00268 12.0903 3.61301 11.5117 3.35292 10.8723C3.09282 10.2329 2.96793 9.54664 2.98611 8.85662C3.00428 8.1666 3.16513 7.48782 3.45853 6.86303C3.75192 6.23823 4.17151 5.68094 4.69086 5.22627C5.21021 4.77159 5.81808 4.42938 6.47618 4.22117C7.13429 4.01296 7.82838 3.94327 8.51474 4.01649C9.2011 4.08971 9.86487 4.30425 10.4642 4.64659C11.0636 4.98894 11.5856 5.45169 11.9974 6.00569C12.4109 5.45571 12.9335 4.99701 13.5325 4.65829C14.1314 4.31958 14.7939 4.10814 15.4783 4.03721C16.1627 3.96628 16.8545 4.03739 17.5101 4.24608C18.1658 4.45477 18.7714 4.79656 19.2889 5.25005C19.8064 5.70354 20.2248 6.25897 20.5178 6.88158C20.8108 7.50419 20.9721 8.18057 20.9917 8.8684C21.0112 9.55622 20.8886 10.2407 20.6315 10.8789C20.3744 11.5172 19.9883 12.0955 19.4974 12.5777M11.9998 6L8.70685 9.293C8.51938 9.48053 8.41406 9.73484 8.41406 10C8.41406 10.2652 8.51938 10.5195 8.70685 10.707L9.24985 11.25C9.93985 11.94 11.0598 11.94 11.7498 11.25L12.7498 10.25C13.3466 9.65327 14.1559 9.31803 14.9998 9.31803C15.8438 9.31803 16.6531 9.65327 17.2498 10.25L19.4998 12.5M12.5 15.5L14.5 17.5M15 13L17 15" stroke="#1D2125" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
       </svg>

        <span
          class="mt-md label_1_semibold primary_text_color"
        >
          Friendly
        </span>
      </li>

      <!-- Professional -->
      <li
        @click="brandVoice = 'professional'"
        class="relative flex flex-col items-start justify-center rounded-xl p-4xl cursor-pointer transition-all"
        :class="
          brandVoice === 'professional'
            ? 'gradient-border bg_primary_color'
            : 'default-border'
        "
      >
        <!-- Briefcase Icon -->
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 7V5C8 4.46957 8.21071 3.96086 8.58579 3.58579C8.96086 3.21071 9.46957 3 10 3H14C14.5304 3 15.0391 3.21071 15.4142 3.58579C15.7893 3.96086 16 4.46957 16 5V7M12 12V12.01M3 13C5.79158 14.4067 8.87403 15.1394 12 15.1394C15.126 15.1394 18.2084 14.4067 21 13M3 9C3 8.46957 3.21071 7.96086 3.58579 7.58579C3.96086 7.21071 4.46957 7 5 7H19C19.5304 7 20.0391 7.21071 20.4142 7.58579C20.7893 7.96086 21 8.46957 21 9V18C21 18.5304 20.7893 19.0391 20.4142 19.4142C20.0391 19.7893 19.5304 20 19 20H5C4.46957 20 3.96086 19.7893 3.58579 19.4142C3.21071 19.0391 3 18.5304 3 18V9Z" stroke="#1D2125" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

        <span
          class="mt-md label_1_semibold primary_text_color">
          Professional
        </span>
      </li>

      <!-- Playful -->
      <li
        @click="brandVoice = 'playful'"
        class="relative flex flex-col  items-start rounded-xl cursor-pointer transition-all p-4xl"
        :class="
          brandVoice === 'playful'
            ? 'gradient-border bg_primary_color'
            : 'default-border'
        "
      >
        <!-- Game Controller Icon -->
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14 14.9983L18.07 19.2823C18.4128 19.643 18.8632 19.8828 19.3538 19.9657C19.8444 20.0487 20.3487 19.9703 20.7909 19.7423C21.2332 19.5144 21.5896 19.1492 21.8067 18.7015C22.0238 18.2538 22.0899 17.7478 21.995 17.2593L20.395 9.02734M8 9V11M7 10H9M14 10H16M15.4983 5C16.8244 5 18.0961 5.52678 19.0338 6.46447C19.9715 7.40215 20.4983 8.67392 20.4983 10C20.4983 11.3261 19.9715 12.5979 19.0338 13.5355C18.0961 14.4732 16.8244 15 15.4983 15H9.99829L5.98329 19.227C5.63985 19.5886 5.18819 19.8288 4.69637 19.9113C4.20455 19.9939 3.69923 19.9143 3.25655 19.6847C2.81387 19.4551 2.45781 19.0878 2.24205 18.6382C2.02628 18.1886 1.96249 17.681 2.06029 17.192L3.69429 9.019C3.9211 7.88546 4.53368 6.86553 5.42778 6.13278C6.32189 5.40003 7.44228 4.99973 8.59829 5H15.4983Z" stroke="#1D2125" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

        <span
          class="mt-md label_1_semibold primary_text_color">
          Playful
        </span>
      </li>

      <!-- Calm -->
      <li
        @click="brandVoice = 'calm'"
        class="relative flex flex-col  items-start rounded-xl cursor-pointer transition-all p-4xl"
        :class="
          brandVoice === 'calm'
            ? 'gradient-border bg_primary_color'
            : 'default-border'
        "
      >
        <!-- Smile Icon -->
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 10C9.5 9 7.5 9 7 10M17 10C16.5 9 14.5 9 14 10M14.5 15C14.1741 15.3326 13.7852 15.5968 13.3559 15.7772C12.9266 15.9576 12.4656 16.0505 12 16.0505C11.5344 16.0505 11.0734 15.9576 10.6441 15.7772C10.2148 15.5968 9.82588 15.3326 9.5 15M12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 10.8181 3.23279 9.64778 3.68508 8.55585C4.13738 7.46392 4.80031 6.47177 5.63604 5.63604C6.47177 4.80031 7.46392 4.13738 8.55585 3.68508C9.64778 3.23279 10.8181 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12C21 14.3869 20.0518 16.6761 18.364 18.364C16.6761 20.0518 14.3869 21 12 21Z" stroke="#1D2125" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

        <span
          class="mt-md label_1_semibold primary_text_color">
          Calm
        </span>
      </li>
    </ul>
    </div>
  </div>
  </div>
</template>

<script setup>
const brandVoice = defineModel("brandVoice", {
  type: String,
  default: "friendly",
});
</script>

<style scoped>
.default-border {
  border: 2px solid #F3F4F5;
}

.gradient-border {
  position: relative;
  border: 2px solid transparent;
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 0.75rem;
  padding: 2px;
  background: linear-gradient(131.96deg, #FAB000 -3.18%, #9966FF 12.33%, #0073E6 85.54%, #15BE53 103.49%);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
  z-index: 0;
}

.gradient-border > * {
  position: relative;
  z-index: 1;
}
</style>