<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Watermark />
</template>

<style lang="css">
html {
  overflow-y: auto !important;
}
.no-click {
  pointer-events: none;
}
*::-webkit-scrollbar {
  width: 4px;
}
*::-webkit-scrollbar-track {
  background: rgb(var(--v-scrollbarTrack));
}
*::-webkit-scrollbar-thumb {
  background: rgb(var(--v-scrollbarThumb));
  border-radius: 2px;
}
*::-webkit-scrollbar-thumb:hover {
  background: rgb(var(--v-scrollbarThumbHover));
}
</style>
