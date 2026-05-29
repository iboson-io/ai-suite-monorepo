<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay backdrop-blur-sm"
    @click="onBackdropClick"
  >
    <!-- Modal -->
    <div
      class="relative w-full max-w-xl mx-4 bg_secondary_color rounded-2xl shadow-2xl overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div class="p-6xl">
        <div class="flex items-start justify-between">
          <h2 class="heading_h6_semibold">{{ title }}</h2>
          <button
            type="button"
            :disabled="isVerifying"
            @click="$emit('close')" class=" p-md bg-gray-25 rounded-lg disabled:opacity-50"
          >
            <img :src="BlackCloseIcon" alt="">
          </button>
        </div>
        <p class="label_2_regular secondary_text_color mt-6xl">
          {{ description }}
        </p>
      </div>

      <!-- Content -->
      <div class="px-6xl pb-6xl">
        <!-- Verification Code Input -->
        <div>
          <div>
            <label class="label_2_medium primary_text_color whitespace-nowrap">
              Verification Code:
            </label>
            <div class="flex items-center justify-center gap-xl mt-4xl flex-wrap" ref="inputsContainer">
              <input
                v-for="(digit, index) in codeDigits"
                :key="index"
                v-model="codeDigits[index]"
                @input="handleCodeInput(index, $event)"
                @keydown="handleKeyDown(index, $event)"
                @paste="handlePaste"
                @focus="handleFocus(index, $event)"
                @blur="handleBlur(index, $event)"
                type="text"
                maxlength="1"
                :placeholder="codeDigits[index] ? '' : '—'"
                class="w-14 h-14 text-center label_2_semibold primary_text_color border border-gray-25 rounded-lg focus:outline-none"
              />
            </div>
            <p
              v-if="verifyError"
              class="label_2_semibold text-error-600 mt-4xl text-center"
              role="alert"
            >
              {{ verifyError }}
            </p>
          </div>
        </div>

        <!-- Timer and Resend -->
        <div class="flex items-center  flex-wrap gap-4xl mt-6xl">
          <div class="body_3_regular secondary_text_color">
            Code expires in: <span class="label_1_bold primary_text_color">{{ formattedTime }}</span>
          </div>
          <button
            type="button"
            :disabled="!canResendCode || isResendingOtp || isVerifying"
            @click="handleResend"
            class="label_2_semibold underline transition-opacity"
            :class="
              canResendCode && !isResendingOtp && !isVerifying
                ? 'primary_text_color cursor-pointer'
                : 'text-gray-400 cursor-not-allowed opacity-60'
            "
          >
            {{ isResendingOtp ? "Sending…" : "Resend Code" }}
          </button>
        </div>
        <p
          v-if="resendError"
          class="label_2_semibold text-error-600 mt-3 text-center"
          role="alert"
        >
          {{ resendError }}
        </p>
      </div>

      <!-- Footer -->
      <div class="p-3xl border-t border-gray-25">
        <button
          type="button"
          @click="handleContinue"
          :disabled="!isCodeComplete || isVerifying"
          class="w-full px-3xl py-xl rounded-lg primary_button disabled:disabled_primary_button"
        >
          {{ isVerifying ? "Verifying…" : "Continue" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import BlackCloseIcon from "../../assets/images/BlackCloseIcon.svg";
import { resendChangeEmailOtp } from "@app/services/settings/userProfile.js";
import { parseSettingsError } from "@app/services/settings/errors.js";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "We've sent you a code",
  },
  description: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: "",
  },
  initialTime: {
    type: Number,
    default: 120, // 2 minutes in seconds
  },
  verifyError: {
    type: String,
    default: "",
  },
  isVerifying: {
    type: Boolean,
    default: false,
  },
  /** Optional JSON body for `POST /auth/change-email/resend` (e.g. `{ new_email }` when confirming a new address). */
  resendBody: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "verify", "clear-verify-error"]);

const onBackdropClick = () => {
  if (props.isVerifying) return;
  emit("close");
};

const CODE_LENGTH = 6;
const emptyDigits = () => Array.from({ length: CODE_LENGTH }, () => "");

const codeDigits = ref(emptyDigits());
const timeRemaining = ref(props.initialTime);
const inputsContainer = ref(null);
const isResendingOtp = ref(false);
const resendError = ref("");
let timerInterval = null;

const canResendCode = computed(() => timeRemaining.value <= 0);

function extractResendError(e) {
  return parseSettingsError(e);
}

const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60);
  const seconds = timeRemaining.value % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});

const isCodeComplete = computed(() => {
  return codeDigits.value.every((digit) => digit !== "");
});

const handleCodeInput = (index, event) => {
  resendError.value = "";
  if (props.verifyError) {
    emit("clear-verify-error");
  }
  const value = event.target.value.replace(/[^0-9]/g, "");
  codeDigits.value[index] = value;

  // Auto-focus next input
  if (value && index < CODE_LENGTH - 1) {
    const nextInput = event.target.parentElement.children[index + 1];
    if (nextInput) {
      nextInput.focus();
    }
  }
};

const handleKeyDown = (index, event) => {
  // Handle backspace
  if (event.key === "Backspace" && !codeDigits.value[index] && index > 0) {
    const prevInput = event.target.parentElement.children[index - 1];
    if (prevInput) {
      prevInput.focus();
      codeDigits.value[index - 1] = "";
    }
  }
  // Handle arrow keys
  else if (event.key === "ArrowLeft" && index > 0) {
    event.target.parentElement.children[index - 1].focus();
  } else if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
    event.target.parentElement.children[index + 1].focus();
  }
};

const handlePaste = (event) => {
  event.preventDefault();
  resendError.value = "";
  if (props.verifyError) {
    emit("clear-verify-error");
  }
  const pastedData = event.clipboardData
    .getData("text")
    .replace(/[^0-9]/g, "")
    .slice(0, CODE_LENGTH);

  for (let i = 0; i < pastedData.length && i < CODE_LENGTH; i++) {
    codeDigits.value[i] = pastedData[i];
  }

  // Focus the next empty input or the last one
  const nextEmptyIndex = codeDigits.value.findIndex((digit) => digit === "");
  const lastIndex = CODE_LENGTH - 1;
  const focusIndex = nextEmptyIndex === -1 ? lastIndex : Math.min(nextEmptyIndex, lastIndex);
  const inputs = event.target.parentElement.children;
  if (inputs[focusIndex]) {
    inputs[focusIndex].focus();
  }
};

const focusedInputs = ref(new Set());

const handleFocus = (index, event) => {
  focusedInputs.value.add(index);
};

const handleBlur = (index, event) => {
  focusedInputs.value.delete(index);
};

const handleContinue = () => {
  if (isCodeComplete.value) {
    const code = codeDigits.value.join("");
    emit("verify", code);
  }
};

const handleResend = async () => {
  if (!canResendCode.value || isResendingOtp.value || props.isVerifying) return;

  isResendingOtp.value = true;
  resendError.value = "";
  emit("clear-verify-error");
  try {
    const body = props.resendBody && typeof props.resendBody === "object" ? { ...props.resendBody } : {};
    await resendChangeEmailOtp(body);
    codeDigits.value = emptyDigits();
    timeRemaining.value = props.initialTime;
    startTimer();
  } catch (e) {
    resendError.value = extractResendError(e);
  } finally {
    isResendingOtp.value = false;
  }
};

const startTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      // Reset code and timer when modal opens
      codeDigits.value = emptyDigits();
      timeRemaining.value = props.initialTime;
      resendError.value = "";
      isResendingOtp.value = false;
      startTimer();
      // Focus first input after modal opens
      setTimeout(() => {
        if (inputsContainer.value) {
          const firstInput = inputsContainer.value.querySelector("input");
          if (firstInput) {
            firstInput.focus();
          }
        }
      }, 100);
    } else {
      stopTimer();
    }
  },
  { immediate: true }
);

watch(
  () => props.initialTime,
  (newTime) => {
    timeRemaining.value = newTime;
  }
);

onUnmounted(() => {
  stopTimer();
});
</script>

<style scoped>
input[type="text"]::-webkit-inner-spin-button,
input[type="text"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="text"]::placeholder {
  color: #000000;
  opacity: 1;
  font-size: 1.5rem;
  line-height: 1;
}

input[type="text"]:focus::placeholder,
input[type="text"]:hover::placeholder {
  opacity: 0;
}
</style>

