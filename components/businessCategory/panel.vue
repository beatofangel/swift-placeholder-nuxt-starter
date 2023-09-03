<template>
  <VCascadeSelect ref="cascadeSelect" v-model="businessCategory" :items="businessCategoryOptions" label="业务分类" placeholder="请选择业务分类"
    persistent-placeholder item-title="name" item-value="id" chips clearable open-on-clear :scroll-offset="0">
  </VCascadeSelect>
</template>

<script setup lang="ts">
// @ts-ignore
import type { ListItem } from 'vuetify/composables/list-items.mjs'
const props = defineProps<{ modelValue: string | null }>()
const emit = defineEmits([
  'update:model-value'
])
const businessCategory = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:model-value', val)
  }
})
const cascadeSelect = ref({} as { cascadeSelections: ListItem[][] })
const selected: Ref<Pick<ListItem, 'icon' | 'name'>> = ref({ icon: 'mdi-family-tree', name: '请选择业务分类' })
const level: Ref<number | undefined> = ref(undefined)
const businessCategoryOptions = ref([])
onMounted(() => {
  // $fetch('/api/businessCategories').then((data) => {
  $fetch('/api/v1/businesscategories/cascaded').then((data) => {
    businessCategoryOptions.value = data as []
  })
})

const selectedItems = computed(()=>{
  return cascadeSelect.value.cascadeSelections ? cascadeSelect.value.cascadeSelections.map((sv: ListItem[]) => {
    return sv[0]
  }) : []
})
watch(selectedItems, (val) => {
  selected.value = val.length > 0 ? val.at(-1).raw : { icon: 'mdi-family-tree', name: '请选择业务分类', id: '' }
  level.value = val.length > 0 ? val.length - 1 : undefined
})
defineExpose({ selected, level })
</script>
