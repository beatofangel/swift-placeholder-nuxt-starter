<template>
  <span
    class="text-grey"
    style="
      position: fixed;
      right: 0;
      bottom: 0;
      opacity: 75%;
      font-size: 32px;
      margin: 20px;
      z-index: 999999;
    "
  >
  测试版 v{{ appVersion }}
  </span>
</template>

<script setup lang="ts">
import { version } from "@/package.json"
console.log(`当前版本：${version}`)
const appVersion = ref(version)
</script>
