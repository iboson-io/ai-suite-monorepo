 <template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white ">
    <BrandingSection />
    <ResetPassword />
  </div>
</template>




<script setup>
    import BrandingSection from "../../components/auth/BrandingSection.vue";
    import ResetPassword from "../../components/auth/ResetPassword.vue";
</script>