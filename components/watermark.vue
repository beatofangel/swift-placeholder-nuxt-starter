<template>
  <span
    class="text-white"
    style="
      position: fixed;
      right: 0;
      bottom: 0;
      opacity: 50%;
      font-size: 28px;
      margin: 20px;
      z-index: 999999;
    "
  >
    v{{ appVersion }}
  </span>
</template>

<script setup lang="ts">
import { version } from "@/package.json"
console.log(`当前版本：${version}`)
const appVersion = ref(version)
</script>
