 <template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white ">
    <BrandingSection />
    <PasswordUpdation />
  </div>
</template>




<script setup>
    import BrandingSection from "../../components/auth/BrandingSection.vue";
    import PasswordUpdation from '../../components/auth/PasswordUpdation.vue'
</script>