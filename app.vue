<template>
  <NuxtLayout>
    <!-- <v-app> -->
      <NuxtPage />
    <!-- </v-app> -->
  </NuxtLayout>
</template>

<style lang="css">
html {
  overflow-y: hidden !important;
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
