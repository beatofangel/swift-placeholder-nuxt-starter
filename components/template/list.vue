<template>

  <v-card>
    <v-toolbar class="pl-4" color="primary">
      <v-icon start>mdi-format-list-bulleted</v-icon>
      <span class="text-h5 ml-1 mt-1">业务分类</span>
      <!-- <v-spacer></v-spacer>
      <v-btn @click="onClose" fab plain small>
        <v-icon>mdi-close</v-icon>
      </v-btn> -->
    </v-toolbar>
    <v-row class="ma-0">
      <v-col class="pa-0">
        <v-card elevation="0" tile>
          <v-card-text class="d-flex flex-nowrap pa-2">
            <CommonTable
              style="width: 100%;"
              height="576"
              hide-tool-bar
              hide-select-btn
              flat
              :condition="condition"
              api="/api/templates"
              title="模板"
              :headers="templateHeaders"
              :item-names="['name', 'path', 'ordinal', 'pid']"
              visible
              show-select
              draggable
              show-index
              fixed-header
              @selectionChange="(val) => selectionChangeHandler(val)"
              @change="changeHandler"
            >
              <template v-slot:[`item.icon`]="{ item }">
                <v-icon color="accent">{{
                  item ? item.icon : "item 未定义"
                }}</v-icon>
              </template>
              <template
                v-slot:editor="props"
              >
                <TemplateDetail
                  v-bind="props"
                ></TemplateDetail>
              </template>
            </CommonTable>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
const condition = ref({})
const templateHeaders = [{
    title: "名称",
    key: "name",
    class: "text-center",
    cellClass: "nameClass text-center text-truncate ",
  },
  {
    title: "文档",
    key: "path",
    class: "text-center",
    cellClass: "text-center text-truncate ",
    style: "min-width: 64px;"
  }
]
const selectionChangeHandler = (templateId?: string) => {

}
const changeHandler = () => {

}
</script>
