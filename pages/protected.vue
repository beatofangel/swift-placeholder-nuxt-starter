<template>
  <div>
    <div>I'm protected! Session data: {{ data }}</div>
    <button class="rounded-xl shadow-xl p-2 m-2" @click="signOut()">
      sign out
    </button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false,
  // middleware: 'auth'
})

const { data, signOut } = useSession()
</script>
