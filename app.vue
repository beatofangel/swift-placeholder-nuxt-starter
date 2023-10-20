<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Watermark />
</template>

<style lang="css">
/* html {
  overflow-y: auto !important;
} */
.no-click {
  pointer-events: none;
}
*::-webkit-scrollbar {
  width: 4px;
  height: 4px;
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
.v-file-input>.v-input__details {
  padding-left: 16px;
  padding-right: 16px;
}
.splitpanes__pane {
  /* box-shadow: 0 0 3px rgba(0, 0, 0, 0.2) inset; */
  justify-content: center;
  align-items: center;
  display: flex;
  position: relative;
}
    .splitpanes--vertical > .splitpanes__splitter,
    .splitpanes--vertical > .splitpanes__splitter
{
  width: 7px;
  border: unset;
  /* background-color: rgba(0, 0, 0, 0.02); */
  cursor: col-resize;
}

    .splitpanes--horizontal > .splitpanes__splitter,
    .splitpanes--horizontal > .splitpanes__splitter
{
  height: 7px;
  border: unset;
  /* background-color: rgba(0, 0, 0, 0.02); */
  cursor: row-resize;
}
.splitpanes__splitter::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  transition: opacity 0.4s;
  background-color: rgba(255, 0, 0, 0.3);
  opacity: 0;
  z-index: 1;
}
.splitpanes__splitter::after {
  opacity: 0;
}
.splitpanes__splitter:hover {
  transition: background-color 0.5s;
  background-color: rgba(0, 0, 0, 0.1);
}
.splitpanes__splitter:hover::before {
  transition: opacity 0.5s;
  opacity: 1;
}
.splitpanes__splitter:hover::after {
  transition: opacity 0.5s;
  opacity: 1;
}
.splitpanes--dragging div:has(>iframe):before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
}
</style>
