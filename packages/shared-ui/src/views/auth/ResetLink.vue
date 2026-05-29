 <template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white ">
    <BrandingSection />
    <ResetLinkSent />
  </div>
</template>




<script setup>
    import BrandingSection from "../../components/auth/BrandingSection.vue";
    import ResetLinkSent from "../../components/auth/ResetLinkSent.vue";
</script>