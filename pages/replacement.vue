<template>
  <v-container class="pa-0" fluid>
    <v-app-bar
      density="compact"
    >
      <v-slide-group
        v-model="tab"
        @change="onChanged"
        show-arrows
        mandatory
        style="max-width: calc(100vw - 176px)"
        class="align-self-end"
      >
        <v-slide-group-item
          v-for="item in sessions"
          :key="item.tab"
          v-slot="{ isSelected, toggle }"
        >
          <div class="align-self-end">
            <!-- 由于添加了tooltip，必须在外层嵌套一个容器否则会导致激活标签无法自动显示 -->
            <v-tooltip bottom open-delay="1000">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  class="mx-1 text-none tab-border-top"
                  :class="{
                    active: isSelected,
                    'primary--text': isSelected && !editing[item.id],
                    'error--text': editing[item.id],
                    'grey--text text--darken-2': !isSelected && !editing[item.id],
                    'font-weight-bold': isSelected,
                  }"
                  :color="isSelected ? 'white' : 'grey lighten-4'"
                  @click="toggle"
                  :elevation="isSelected ? 4 : 2"
                  :small="!isSelected"
                  :ripple="false"
                >
                  <div style="max-width: 160px" class="text-truncate">
                    {{
                      `${editing[item.id] ? "* " : ""}${calcSessionName(item)}`
                    }}
                  </div>
                  <v-hover v-slot="{ isHovering }">
                    <v-icon
                      :color="isHovering ? 'red' : ''"
                      :class="{ 'on-hover': isHovering }"
                      @click.stop="closeReplacementTab(item)"
                      right
                      >mdi-close</v-icon
                    >
                  </v-hover>
                </v-btn>
              </template>
              {{ calcSessionName(item) }}
            </v-tooltip>
          </div>
        </v-slide-group-item>
      </v-slide-group>
      <!-- <v-tabs v-model="tab">
        <v-tabs-slider></v-tabs-slider>
        <v-tab v-for="session in sessions" :key="session.id">
          <span class="text-h6">{{ session.name }}</span>
          <v-icon class="btn-icon-close" :ripple="false" @click="cancelReplace(session)" right>mdi-close</v-icon>
        </v-tab>
      </v-tabs> -->
      <!-- <v-hover v-slot="{ hover }">
        <v-btn
          @click="newReplacement"
          height="100%"
          color="transparent"
          min-width="48"
          class="px-2"
          depressed
          tile
        >
          <v-icon
            :class="{ 'rotate-transition-180': hover, 'mb-n3': !hover }"
            color="success"
            >mdi-plus</v-icon
          >
        </v-btn>
      </v-hover> -->
      <v-hover v-slot="{ isHovering, props }">
        <v-btn v-bind="props" @click="newReplacement" small icon>
          <v-icon color="success"
            >mdi-plus</v-icon
          >
        </v-btn>
      </v-hover>
      <v-menu
        v-model="showReplaceMenu"
        offset-y
        :close-on-content-click="false"
      >
        <template v-slot:activator="{ props }">
          <v-hover v-slot="{ isHovering, props: hoverProps }">
            <v-btn
              style="position: absolute; right: 16px"
              v-bind="Object.assign(hoverProps, props)"
              height="100%"
              min-width="48"
              class="px-2"
              depressed
              tile
            >
              <v-icon >mdi-dots-vertical</v-icon>
            </v-btn>
          </v-hover>
        </template>
        <v-list min-width="280" density="comfortable">
          <template
            v-for="(
              { name, icon, shortcut, handler, disabled }, key
            ) in dotMenuList"
            :key="key"
          >
            <v-list-item @click="handler" :disabled="disabled?.value">
              <template v-slot:prepend>
                <v-icon :icon="icon"></v-icon>
              </template>
              <v-list-item-title v-text="name"></v-list-item-title>
              <v-list-item-subtitle class="text-no-wrap d-flex justify-start">
                <CommonKey :shortcuts="shortcut" no-decorate></CommonKey>
              </v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-window v-model="tab">
      <template v-if="sessions.length > 0">
        <v-window-item v-for="session in sessions" :key="session.id">
          <keep-alive>
            <replacementTab
              :session="session"
              @input="handleBusinessCategoryChange"
            ></replacementTab>
          </keep-alive>
        </v-window-item>
      </template>
      <div
        style="height: calc(100vh - 124px)"
        class="d-flex flex-column justify-center align-center"
        v-else
      >
        <div class="text-h2 font-weight-medium mb-12 mt-n12">
          <common-key :shortcuts="shortcutNew">
            <template v-slot:prepend><span class="text--disabled">按下&nbsp;</span></template>
            <template v-slot:group-delimiter><span class="text--disabled">&nbsp;或&nbsp;</span></template>
          </common-key>
        </div>
        <div class="text-h2 font-weight-medium text--disabled mb-12">
          开启全新替换旅程！
        </div>
      </div>
    </v-window>
    <!-- <common-progress
      v-model="showProgress"
      :indeterminate="indeterminate"
      :total="total"
      :progressed="progressed"
      :completed="completed"
    >
    </common-progress> -->
    <v-btn @click="showDialog = !showDialog">show</v-btn>
    <CommonDialog v-model="showDialog" text="测试"></CommonDialog>
  </v-container>
</template>

<script setup lang="ts">
import { Session } from '~/index';

definePageMeta({
  icon: "mdi-file-replace",
  index: 1
});

// data
const showDialog = ref(false)
watch(showDialog, (val)=>console.log(val))
const tab = ref(0)
const sessions = ref([] as Session[])
const editing = ref({} as Record<string, boolean>)
const showReplaceMenu = ref(false)

// computed
const noSessionDisabled = computed(() => {
  return sessions.value.length == 0
})
const shortcutNew = computed(() => {
  return shortcuts.value.find((e) => e.id == "new")!.shortcut;
})
const shortcuts = computed(() => {
  return [
    {
      id: "new",
      handler: () => {
        showReplaceMenu.value = false;
        newReplacement();
      },
      icon: "mdi-plus",
      name: "新建",
      shortcut: [
        ["ctrl", "n"],
        ["shift", "n"],
      ],
    },
    {
      id: "close",
      handler: () => {
        sessions.value[tab.value] &&
          closeReplacementTab(sessions.value[tab.value]);
      },
      name: "关闭",
      shortcut: ["ctrl", "w"],
      invisible: true,
    },
    {
      id: "replace",
      handler: () => {
        if (noSessionDisabled) return;
        showReplaceMenu.value = false;
        doReplace();
      },
      icon: "mdi-file-document-outline",
      name: "替换",
      disabled: noSessionDisabled,
      shortcut: ["ctrl", "r"],
    },
    {
      id: "replaceAll",
      handler: () => {
        if (noSessionDisabled) return;
        showReplaceMenu.value = false;
        doReplaceAll();
      },
      icon: "mdi-file-document-multiple-outline",
      name: "全部替换",
      disabled: noSessionDisabled,
      shortcut: ["ctrl", "shift", "r"],
    },
  ];
})
const dotMenuList = computed(() => {
  return shortcuts.value.filter((e) => !e.invisible);
})

// methods
function onChanged (index: number) {
  console.log(index);
}
function calcSessionName(item: Session) {
  if (item.businessCategoryDisplay) {
    return `${item.businessCategoryDisplay}-${item.id}`;
  } else {
    return `替换-${item.id}`;
  }
}
function closeReplacementTab({ id }: { id: string }) {
  // $dialog
  //   .confirm({ text: `即将删除本次替换，是否继续？` })
  //   .then((res) => {
  //     if (res) {
  //       const index = sessions.value.findIndex((e) => e.id == id);
  //       if (index != -1) {
  //         const session = sessions.value.splice(index, 1);
  //         if (session.length > 0) {
  //           // TODO
  //           // window.store.deleteSession(session[0].id);
  //         }
  //       }
  //     }
  //   });
}
/**
 * 新建替换（标签页）
 */
function newReplacement() {

}
function doReplace() {

}
function doReplaceAll() {

}
function handleBusinessCategoryChange(sessionId: string, businessCategoryDisplay: string) {
  const session = sessions.value.find((s) => s.id == sessionId);
  session!['businessCategoryDisplay'] = businessCategoryDisplay;
  console.log(session);
}
</script>
