<script setup lang="ts">
/**
 * Trang chủ tạm — Redirect về trang đăng nhập / admin.
 * (Sẽ được thay thế bằng Landing Page sau này)
 */
definePageMeta({
  middleware: [
    function () {
      const token = useCookie('auth_token')
      return navigateTo(token.value ? '/admin' : '/login')
    }
  ]
})
</script>
