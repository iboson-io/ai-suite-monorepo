<template>
  <div
    :class="['flex items-start gap-5xl rounded-2xl bg_secondary_color p-5xl primary_border_color shadow-sm flex-shrink-0 md:w-auto', mobileWdth]"
  >
    <!-- Content -->
    <div class="flex flex-col">
        <div>
             <img :src="icon" alt=""> 
        </div>
      
      <span class="bady_2_medium mt-md secondary_text_color">
        {{ title }}
      </span>

      <span class=" heading_h5_bold primary_text_color mt-xs">
        {{ animatedValue }}
      </span>

      <span class="mt-md bady_4_regular secondary_text_color">
        {{ description }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  title: String,
  value: String,
  description: String,
  icon: Object,
  iconBg: String,
  mobileWdth: String,
  iconColor: String,
});

const animatedValue = ref(props.value || '');

// Parse value to extract number and formatting
const parseValue = (val) => {
  if (!val) return { number: 0, prefix: '', suffix: '', format: 'number' };
  
  // Check for percentage
  if (val.includes('%')) {
    const num = parseFloat(val.replace('%', '').replace(/,/g, ''));
    return { number: num, prefix: '', suffix: '%', format: 'decimal' };
  }
  
  // Check for + prefix
  const hasPlus = val.startsWith('+');
  const cleanVal = hasPlus ? val.substring(1) : val;
  
  // Check for K suffix (thousands)
  if (cleanVal.toUpperCase().endsWith('K')) {
    const num = parseFloat(cleanVal.replace(/K/gi, '').replace(/,/g, ''));
    return { number: num * 1000, prefix: hasPlus ? '+' : '', suffix: 'K', format: 'number' };
  }
  
  // Check for M suffix (millions)
  if (cleanVal.toUpperCase().endsWith('M')) {
    const num = parseFloat(cleanVal.replace(/M/gi, '').replace(/,/g, ''));
    return { number: num * 1000000, prefix: hasPlus ? '+' : '', suffix: 'M', format: 'number' };
  }
  
  // Regular number
  const num = parseFloat(cleanVal.replace(/,/g, ''));
  return { number: isNaN(num) ? 0 : num, prefix: hasPlus ? '+' : '', suffix: '', format: 'number' };
};

// Format number back to display string
const formatValue = (parsed, currentNumber) => {
  if (parsed.format === 'decimal') {
    return `${parsed.prefix}${currentNumber.toFixed(1)}${parsed.suffix}`;
  }
  
  if (parsed.suffix === 'K') {
    const displayNum = currentNumber / 1000;
    return `${parsed.prefix}${Math.round(displayNum)}${parsed.suffix}`;
  }
  
  if (parsed.suffix === 'M') {
    const displayNum = currentNumber / 1000000;
    return `${parsed.prefix}${displayNum.toFixed(1)}${parsed.suffix}`;
  }
  
  // Regular number - add commas for thousands
  const rounded = Math.round(currentNumber);
  return `${parsed.prefix}${rounded.toLocaleString()}`;
};

// Animate from old value to new value
const animateValue = (newValue) => {
  const oldParsed = parseValue(animatedValue.value);
  const newParsed = parseValue(newValue);
  
  const startNumber = oldParsed.number;
  const endNumber = newParsed.number;
  const duration = 800; // milliseconds
  const startTime = Date.now();
  
  // Use the new value's formatting
  const targetFormat = newParsed;
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    const currentNumber = startNumber + (endNumber - startNumber) * easeOut;
    animatedValue.value = formatValue(targetFormat, currentNumber);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Ensure final value is exact
      animatedValue.value = newValue;
    }
  };
  
  animate();
};

watch(() => props.value, (newValue) => {
  if (newValue !== animatedValue.value) {
    animateValue(newValue);
  }
}, { immediate: false });

onMounted(() => {
  animatedValue.value = props.value || '';
});
</script>
