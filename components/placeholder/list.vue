<template>
  <v-card>
    <v-toolbar class="pl-4" color="primary">
      <v-icon start>mdi-format-list-bulleted</v-icon>
      <span class="text-h5 ml-1 mt-1">占位符</span>
      <!-- <v-spacer></v-spacer>
      <v-btn @click="onClose" fab plain small>
        <v-icon>mdi-close</v-icon>
      </v-btn> -->
    </v-toolbar>
    <v-row class="ma-0">
      <v-col class="pa-0">
        <v-card elevation="0" tile>
          <v-card-text class="d-flex flex-nowrap pa-2">
            <v-row class="text-center" style="height: 800px;">
              <v-col>占位符{{ tplId ?? '' }}</v-col>
              <v-col>文档</v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps({
  tplId: String
})
</script>
