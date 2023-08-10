<template>
  <slot :props="$attrs"></slot>
</template>
<script lang="ts">
import { useField } from 'vee-validate';
export default {
  inheritAttrs: false,
  setup(props, ctx) {
    const fieldContext = useField(ctx.attrs.name as string)
    return {
      meta: fieldContext.meta,
    }
  }
}
</script>
