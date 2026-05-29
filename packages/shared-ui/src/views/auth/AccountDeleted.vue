<template>
  <div class="min-h-screen bg_primary_color flex items-center justify-center ">
    <div class="flex flex-col items-center justify-center w-full max-w-lg">
      <!-- 3D Character Illustration -->
      <div class=" w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
        <!-- Replace this with your actual 3D character image -->
       
        
        <!-- Placeholder - Replace with actual 3D character image when available -->
        <div 
          class="w-full h-full flex items-center justify-center"
        >
          <img :src="WomenByeImage" alt="No Image" class="h-80">
        </div>
      </div>

      <!-- Text Content -->
      <div class="text-center ">
        <!-- Main Heading - Larger, Bold -->
        <h1 class="heading_h6_bold primary_text_color">
          Your account has been deleted.
        </h1>
        
        <!-- Secondary Text -->
        <p class="label_1_regular secondary_text_color mt-sm">
          Thank you for using Genius.
        </p>
        
        <!-- Tertiary Text -->
        <p class="label_1_regular secondary_text_color">
          You can always create a new account anytime.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import WomenByeImage from "../../assets/images/WomenByeImage.png"
</script>