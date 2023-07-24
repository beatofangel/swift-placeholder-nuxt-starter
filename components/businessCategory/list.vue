<template>
  <v-card>
    <v-toolbar class="pl-4" color="primary">
      <v-icon start>mdi-format-list-bulleted</v-icon>
      <span class="text-h5 ml-1 mt-1">业务类型列表</span>
      <v-spacer></v-spacer>
      <v-btn @click="onClose" fab plain small>
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-row class="ma-0">
      <v-col v-for="level in 3" cols="4" :key="level" class="pa-0">
        <v-card elevation="0" tile>
          <v-card-text class="d-flex flex-nowrap pa-2">
            <CommonTable
              style="width: 100%;"
              height="576"
              hide-tool-bar
              hide-select-btn
              flat
              :condition="conditions[level - 1]"
              api="/api/businesscategories"
              :title="getCategoryName(level)"
              :headers="categoryHeaders"
              :item-names="['name', 'icon', 'ordinal', 'pid']"
              :visible="visible"
              :show-select="level != 3"
              cascade
              draggable
              show-index
              fixed-header
              :selected-id="formData.businessCategories[level - 1]"
              :hide-create="level > 1 && !formData.businessCategories[level - 2]"
              @selectionChange="(val) => selectionChangeHandler(val, level)"
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
                <business-category-detail
                  v-bind="props"
                  :title="getCategoryName(level)"
                ></business-category-detail>
              </template>
            </CommonTable>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import CommonList from "../common/list.vue";
import BusinessCategoryDetail from "./detail.vue";
export default {
  name: "business-category-list",
  props: {
    visible: Boolean,
  },
  mounted() {
    // window.replaceService.findBusinessCategoryRoot().then(root => {
    //   this.$set(this.conditions, 0, {
    //     pid: root.id,
    //   });
    // })
  },
  components: {
    CommonList,
    BusinessCategoryDetail,
  },
  watch: {
    // businessCategories: {
    //   deep: true,
    //   handler(newVal) {
    //     this.formData.businessCategories = newVal;
    //     console.log("businessCategories", newVal);
    //     for (let index in this.conditions) {
    //       if (newVal.length > index) {
    //         this.conditions[index].pid = newVal[index];
    //       } else {
    //         this.conditions[index] = null;
    //       }
    //     }
    //   },
    // },
    "formData.businessCategories": {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        console.log(newVal, oldVal);
      },
    },
  },
  computed: {
    // getConditions() {
    //   const conditions = [];
    //   for (let level = 1; level <= 3; level++) {
    //     conditions.push(
    //       level > 1 && !this.formData.businessCategories[level - 2]
    //         ? null
    //         : {
    //             pid:
    //               level == 1
    //                 ? null
    //                 : this.formData.businessCategories[level - 2],
    //           }
    //     );
    //   }
    //   return conditions;
    // },
  },
  methods: {
    onClose() {
      this.$emit("close", false);
    },
    getCategoryName(level) {
      return `${["一", "二", "三"][level - 1]}级业务类型`;
    },
    changeHandler() {
      this.$emit('change');
    },
    selectionChangeHandler(itemId, level) {
      if (itemId) {
        console.log("selectionChangeHandler", level, itemId);
        this.formData.businessCategories[level - 1] = itemId;
        this.conditions[level] = {
          pid: itemId,
        }
        // this.$set(this.conditions, level, {
        //   pid: val[0].id,
        // });
        for (let i = level + 1; i < 3; i++) {
          this.conditions[i] = null
          // this.$set(this.conditions, i, null);
        }
      } else {
        this.formData.businessCategories[level - 1] = null
        for (let i = level; i < 3; i++) {
          this.conditions[i] = null
          // this.$set(this.conditions, i, null);
        }
      }
    },
  },
  data() {
    return {
      formData: {
        businessCategories: [],
      },
      categoryHeaders: [
        // {
        //   title: "No.",
        //   key: "index",
        // },
        {
          title: "名称",
          key: "name",
          class: "nameClass",
          cellClass: "nameClass text-truncate ",
        },
        {
          title: "图标",
          key: "icon",
          class: "iconClass",
        },
        // {
        //   title: "操作",
        //   key: "actions",
        //   class: "actionsClass",
        //   align: "center",
        // },
      ],
      conditions: [{ pid: null }, null, null],
    };
  },
};
</script>

<style>
.nameClass {
  max-width: 142px;
}
.iconClass {
  min-width: 48px;
}
.actionsClass {
  min-width: 64px;
}
</style>
