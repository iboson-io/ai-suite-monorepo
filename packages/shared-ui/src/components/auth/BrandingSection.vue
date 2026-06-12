<template>
  <div
    class="relative hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-[#F6F4FF] to-[#F2EEFF] px-10"
  >
    <!-- Logo -->
    <Logo />

    <!-- Sphere -->
    <div
      class="h-48 w-48 "
    >
    <div class="glass-sphere">

        <div class="fluid-container">
            <div class="base"></div>
            <div class="blob c1" :style="blobStyle(0)"></div>
            <div class="blob c2" :style="blobStyle(1)"></div>
            <div class="blob c3" :style="blobStyle(2)"></div>
            <div class="blob c4" :style="blobStyle(3)"></div>
        </div>
    </div>

    <svg style="position: absolute; width: 0; height: 0;">
        <defs>
            <filter id="liquid-filter">
                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="1">
                    <animate attributeName="baseFrequency" dur="6s" values="0.01;0.03;0.01" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" scale="80" />
            </filter>
        </defs>
    </svg>
    </div>

    <!-- Text -->
    <h2 class="heading_h4_bold gradient_text_color">
      {{ headline }}
    </h2>

    <p class="label_1_regular primary_text_color text-center mt-6xl">
      {{ description }}
    </p>
    <p class="label_1_regular primary_text_color text-center mt-3xl">
      {{ description2 }}
    </p>
  </div>
</template>
<script setup>
import Logo from "../common/Logo.vue";
import { getBrandingSectionConfig } from "@app/services/auth/branding.js";

const { headline, description, description2 } = getBrandingSectionConfig();

/** Optional hex colors (e.g. product `brandColors`) to tint the sphere; auth pages omit this. */
const props = defineProps({
  previewBrandColors: {
    type: Array,
    default: null,
  },
});

function blobStyle(index) {
  const list = props.previewBrandColors;
  if (!Array.isArray(list) || !list.length) return {};
  const hex = String(list[index % list.length]).trim();
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) return {};
  return {
    background: `radial-gradient(circle at 35% 35%, ${hex}, transparent 45%)`,
  };
}
</script>

<style setup>
  /* The Transparent Outer Layer (Stationary) */
        .glass-sphere {
            position: relative;
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(8px);
           
            box-shadow: 
                0 40px 80px rgba(0, 0, 0, 0.1),
                inset 0 0 30px rgba(255, 255, 255, 0.4);
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        /* Container for the fluid layers */
        .fluid-container {
            position: absolute;
            width: 140%;
            height: 140%;
            filter: url(#liquid-filter) blur(10px);
            animation: rotateFull 8s infinite linear;
        }

        /* Base layer (usually white/transparent to keep the "glass" look) */
        .base {
            position: absolute;
            width: 100%;
            height: 100%;
            background: white;
            opacity: 0.3;
        }

        /* Individual Color Layers with varying Opacity cycles */
        .blob {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            mix-blend-mode: color-burn;
        }

        .c1 { 
            background: radial-gradient(circle at 30% 30%, #FAB000, transparent 40%); 
            animation: pulseOpacity 7s infinite ease-in-out; 
        }
        .c2 { 
            background: radial-gradient(circle at 70% 30%, #9966FF, transparent 50%); 
            animation: pulseOpacity 11s infinite ease-in-out; 
        }
        .c3 { 
            background: radial-gradient(circle at 40% 70%, #0073E6, transparent 40%); 
            animation: pulseOpacity 5s infinite ease-in-out; 
        }
        .c4 { 
            background: radial-gradient(circle at 75% 70%, #15BE53, transparent 50%); 
            animation: pulseOpacity 13s infinite ease-in-out; 
        }

        /* Static Glass Shine */
        

        /* ANIMATIONS */
        @keyframes rotateFull {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @keyframes pulseOpacity {
            0%, 100% { opacity: 0; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
        }
</style>
