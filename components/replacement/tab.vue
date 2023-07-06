<template>
  <v-container>
    <v-card>
      <v-card-text>
        <v-row>
          <v-col>
            <VCascadeSelect v-model="props.data.businessCategory" :items="businessCategoryOptions" label="业务类型"
              placeholder="请选择业务类型" persistent-placeholder item-title="name" item-value="id" chips clearable open-on-clear
              :scroll-offset="0"></VCascadeSelect>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card>
              <v-toolbar
                density="compact" flat
              >
                <v-tabs
                  v-model="tab"
                  ref="templateTabs"
                  align-with-title
                >
                  <v-tab
                    v-for="{ id, name } in data.templates"
                    :key="id"
                  >
                    <span class="text-h6">{{ name }}</span>
                  </v-tab>
                  <v-banner v-if="!data.businessCategory">
                    <v-icon class="mt-n1 mr-1" color="warning">mdi-alert</v-icon>
                    <span class="text-h6">未选择业务类型</span>
                  </v-banner>
                </v-tabs>
              </v-toolbar>
              <v-window v-model="tab">
                <v-window-item
                  v-for="{ id, path } in data.templates"
                  :key="id"
                >
                  {{ id }} {{ path }}
                  <!-- <replacement-edit
                    :session="session"
                    :tplId="id"
                    :tplPath="path"
                    @input:template-path="onTemplatePathChange"
                    @input:placeholder-groups="onPlaceholderGroupsChange"
                  >
                  </replacement-edit> -->
                </v-window-item>
              </v-window>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

  </v-container>
</template>

<script setup lang="ts">
import { WorkData } from '~/index';
const props = defineProps<{ data: WorkData }>()
const businessCategoryOptions = ref([])
const tab = ref(0)
onMounted(() => {
  $fetch('/api/businessCategories').then((data) => {
    businessCategoryOptions.value = data
  })
})
watch(() => props.data.businessCategory, (newVal) => {
  // fetch templates data with newVal
  console.log('businessCategory changed.')
})
</script>
