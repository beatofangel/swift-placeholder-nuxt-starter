<template>
  <v-container>
    <VCascadeSelect v-model="props.data.businessCategory" :items="businessCategoryOptions" label="业务类型"
      placeholder="请选择业务类型" persistent-placeholder item-title="name" item-value="id" chips clearable open-on-clear  variant="outlined"
      :scroll-offset="0"></VCascadeSelect>
    {{ props.data.businessCategory }}
  </v-container>
</template>

<script setup lang="ts">
import { WorkData } from '~/index';
const props = defineProps<{ data: WorkData }>()
const businessCategoryOptions = ref([])
onMounted(() => {
  $fetch('/api/businessCategories').then((data) => {
    businessCategoryOptions.value = data
  })

})
</script>
