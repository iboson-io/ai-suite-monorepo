<template> 
  <div class="bg_secondary_color rounded-2xl p-6xl brand_section_height primary_border_color">
    <ul>
      <!-- Primary -->
      <div class=" flex flex-col items-start justify-between md:flex-row">
        <span class="label_2_medium primary_text_color">
          Primary
        </span>

        <div
          class="relative flex items-center rounded-lg px-3xl py-xl w-[100%] md:w-[70%] mt-sm md:mt-0 border primary_border_color"
          :style="{ backgroundColor: colors.primary }"
        >
          <input
            type="color"
            v-model="colors.primary"
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span
            class="body_2_medium"
            :class="{ 'primary_2_text_color': !isWhiteHex(colors.primary) }"
            :style="hexLabelStyle(colors.primary)"
          >
            {{ colors.primary.toUpperCase() }}
          </span>
        </div>
    </div>

      <!-- Secondary -->
      <div class=" flex flex-col items-start justify-between mt-10xl md:flex-row">
        <span class="label_2_medium primary_text_color">
          Secondary
        </span>

        <div
          class="relative flex items-center rounded-lg px-3xl py-xl w-[100%] md:w-[70%] mt-sm md:mt-0 border primary_border_color"
          :style="{ backgroundColor: colors.secondary }"
        >
          <input
            type="color"
            v-model="colors.secondary"
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span
            class="label_2_medium"
            :class="{ 'primary_2_text_color': !isWhiteHex(colors.secondary) }"
            :style="hexLabelStyle(colors.secondary)"
          >
            {{ colors.secondary.toUpperCase() }}
          </span>
        </div>
    </div>

      <!-- Font -->
      <li class="mt-10xl flex flex-col items-start justify-between md:flex-row">
        <span class="label_2_medium primary_text_color">
          Font
        </span>

        <div
          class="relative flex items-center rounded-lg px-3xl py-xl w-[100%] md:w-[70%] mt-sm md:mt-0 border primary_border_color"
          :style="{ backgroundColor: colors.font }"
        >
          <input
            type="color"
            v-model="colors.font"
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span
            class="label_2_medium"
            :class="{ 'primary_2_text_color': !isWhiteHex(colors.font) }"
            :style="hexLabelStyle(colors.font)"
          >
            {{ colors.font.toUpperCase() }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
const colors = defineModel("colors", {
  type: Object,
  default: () => ({
    primary: "#2684FF",
    secondary: "#8CB9FF",
    font: "#5A6772",
  }),
});

/** Matches `black.600` from tailwind.config.js — inline so it wins over `.primary_2_text_color`. */
const HEX_LABEL_ON_WHITE = "#1c1d2b";

/** True for #fff / #ffffff, 3-digit #fff, and rgb(255,255,255). */
function isWhiteHex(raw) {
  if (raw == null || typeof raw !== "string") return false;
  const s = raw.trim().toLowerCase();
  const rgb = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) {
    return (
      Number(rgb[1]) === 255 &&
      Number(rgb[2]) === 255 &&
      Number(rgb[3]) === 255
    );
  }
  let h = s.replace(/^#/, "");
  if (h === "fff" || h === "ffffff") return true;
  if (h.length === 3 && /^[0-9a-f]{3}$/i.test(h)) {
    h = h
      .toLowerCase()
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return h === "ffffff";
}

function hexLabelStyle(hex) {
  return isWhiteHex(hex) ? { color: HEX_LABEL_ON_WHITE } : undefined;
}
</script>
