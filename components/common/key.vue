<template>
  <span class="d-flex flex-row justify-center align-center">
    <slot name="prepend"></slot>
    <template v-for="(shortcut, sIdx) in parsedShortcut">
      <span v-if="sIdx > 0" :class="delimiterColor" :key="`group-delimiter_${sIdx}`"><slot name="group-delimiter">,&nbsp;</slot></span>
      <template v-for="(key, kIdx) in shortcut" :key="`${kIdx > 0 ? 'key_delimiter_' : ''}${sIdx}_${kIdx}`">
        <span v-if="kIdx > 0" :class="delimiterColor"><slot name="key-delimiter">&nbsp;+&nbsp;</slot></span>
        <span :class="`${color} ${noDecorate ? '' : `keyboard-decorate${$vuetify.theme.dark ? '-dark' : ''} px-6 py-2 mx-2`} keyboard-style`">
          {{ key }}
        </span>
      </template>
    </template>
    <slot name="append"></slot>
  </span>
</template>

<script>
export default {
  // name: 'CommonKey',
  props: {
    shortcuts: {
      type: Array,
      default: () => []
    },
    color: {
      type: String,
      default: ''
    },
    delimiterColor: {
      type: String,
      default: ''
    },
    noDecorate: {
      type: Boolean,
      default: false
    },
    size: String
  },
  computed: {
    parsedShortcut() {
      if (this.shortcuts && this.shortcuts.length > 0) {
        if (Array.isArray(this.shortcuts[0])) {
          return this.shortcuts
        } else {
          return [this.shortcuts]
        }
      }

      return this.shortcuts
    }
  }
}
</script>

<style scoped>
.keyboard-style {
  text-transform: capitalize;
}
.keyboard-decorate {
  border: rgb(172, 172, 172) 1px solid;
  border-radius: 5px;
  border-left-width: 2px;
  border-right-width: 2px;
  box-shadow: 0 8px rgb(172, 172, 172), 4px 12px 9px 2px rgb(212 212 212 / 70%);
}
.keyboard-decorate-dark {
  border: rgb(72, 72, 72) 1px solid;
  border-radius: 5px;
  border-left-width: 2px;
  border-right-width: 2px;
  box-shadow: 0 8px rgb(72, 72, 72), 4px 12px 9px 2px rgb(42 42 42 / 70%);
}
</style>
