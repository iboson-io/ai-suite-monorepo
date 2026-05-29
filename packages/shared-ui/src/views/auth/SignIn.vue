 <template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white ">
    <BrandingSection />
    <SigninForm />
  </div>
</template>




<script setup>
    import BrandingSection from "../../components/auth/BrandingSection.vue";
    import SigninForm from "../../components/auth/SigninForm.vue";
</script>