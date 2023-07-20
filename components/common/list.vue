<template>
  <v-card :flat="flat">
    <v-card-title v-if="hideToolBar && !!title" class="d-flex justify-center">
      <span class="text-h5 ml-1 mt-1">{{ title }}列表</span>
    </v-card-title>
    <v-toolbar v-else-if="!!title" color="primary" dark>
      <v-icon>mdi-format-list-bulleted</v-icon>
      <span class="text-h5 ml-1 mt-1">{{ title }}列表</span>
      <v-spacer></v-spacer>
      <v-btn @click="onClose" fab plain small>
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-table>
      <thead>
        <tr>
          <th v-for="{ title, key } in headers" :key="key">{{ title }}</th>
        </tr>
      </thead>
      <draggable v-if="items.length > 0" v-model="items" :animation="200" :group="`${title}List`"
        :disabled="items.length == 0" ghostClass="ghost" item-key="name" tag="tbody" @start="onDragRow" @end="onDropRow">
        <template #item="{ element: item, index }">
          <transition :name="!drag ? 'flip-list' : null" type="transition">
            <tr>
              <template v-for="{ key, value, cellClass } in headers">
                <td v-if="key == 'data-table-select'" :key="key">
                  <v-icon :color="isSelected(item) ? 'primary' : ''" @click="select(item, !isSelected(item))">{{
                    isSelected(item) ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}</v-icon>
                </td>
                <td v-if="key == 'index'" class="text-start" :key="`item.${key}`">
                  {{ index + 1 }}
                </td>
                <td v-if="!['index', 'data-table-select', 'actions'].includes(key)"
                  :class="`text-start ${cellClass || ''}`" :key="`item.${key}`">
                  <slot v-if="$scopedSlots[`item.${key}`]" :name="`item.${key}`" v-bind:item="item" v-on="$scopedSlots[`item.${key}`]"></slot>
                  <template v-else>{{ item[value] }}</template>
                </td>
                <td v-if="key == 'actions'" class="text-center" :key="`item.${key}`">
                  <v-row class="actions justify-center">
                    <v-icon class="edit" @click="showEdit({ ...item, isEdit: true })">mdi-pencil</v-icon>
                    <v-icon class="delete" @click="handleDelete({ ...item, delete: true })">mdi-delete</v-icon>
                  </v-row>
                </td>
              </template>
            </tr>
          </transition>
        </template>
      </draggable>
      <tbody v-else>
        <tr class="v-data-table__empty-wrapper">
          <td :colspan="headers.length">
            {{ noData }}
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-divider></v-divider>
    <v-card-actions>
      <!-- <v-btn v-if="showSelect && !hideSelectBtn" color="primary" :disabled="items.length == 0 || selected.length == 0" @click="handleSelect">选择</v-btn> -->
      <v-spacer></v-spacer>
      <v-btn v-if="!hideCreate" color="success" @click="showEdit()"><v-icon>mdi-plus</v-icon></v-btn>
    </v-card-actions>
    <v-dialog width="500" v-model="dialog.showDetail">
      <slot v-bind="item" :title="title" :visible="dialog.showDetail" :cancel="handleCancel" :save="handleSave"></slot>
    </v-dialog>
    <!-- <confirm-dialog
      v-model="dialog.showConfirm"
      :message="`确定要删除该${title}？`"
      @confirm="handleDelete({ ...item, delete: true})"
    ></confirm-dialog> -->
    <!-- <v-dialog width="500" v-model="dialog.showConfirm">
      <v-card>
        <v-card-title class="text-h5">{{ `确定要删除该${this.title}？` }}</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog.showConfirm = false">取消</v-btn>
          <v-btn color="error" @click="handleDelete({ ...item, delete: true})">确定</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog> -->
  </v-card>
</template>

<script>
import draggable from "vuedraggable";
import { useToast } from 'vue-toastification'
import { VDataTable } from 'vuetify/labs/VDataTable'
// import ConfirmDialog from "./ConfirmDialog.vue"
export default {
  props: {
    condition: {
      type: Object,
      default: () => null
    },
    model: {
      type: String,
      required: true
    },
    flat: Boolean,
    hideToolBar: Boolean,
    hideSelectBtn: Boolean,
    title: String,
    headers: Array,
    itemNames: Array,
    visible: Boolean,
    selectedId: String,
    hideCreate: Boolean,
    showSelect: Boolean,
    cascade: Boolean,
    noData: {
      type: String,
      default: '没有数据'
    },
    interceptor: {
      type: Object,
      default: () => {
        return {
          save: () => Promise.resolve(true),
          delete: () => Promise.resolve(true)
        }
      }
    },
  },
  components: {
    draggable,
    VDataTable,
    // ConfirmDialog
  },
  mounted() {
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        if (val) {
          // this.visible && this.condition && window.commonService.find(this.model, this.condition).then(data => {
          this.visible && this.condition && useFetch(this.model, { query: this.condition }).then(({ data }) => {
            this.items = data.value
            this.selected = this.selectedId ? this.items.filter(item => item.id == this.selectedId) : []
            // this.$set(this, 'selected', this.selectedId ? this.items.filter(item=>item.id==this.selectedId) : [])
          }).catch(err => {
            console.log(err)
            useToast().error(`${this.title}读取失败！`);
          })
        }
      }
    },
    condition: {
      deep: true,
      handler(newVal, oldVal) {
        // =====TODO 待测试=====
        if (newVal === oldVal) return
        // =====================
        // if (!this.cascade) return
        console.log("condition", newVal, oldVal)
        this.$set(this, 'selected', [])
        if (newVal) {
          useFetch(this.model, { query: this.condition }).then(({ data }) => {
            // window.commonService.find(this.model, this.condition).then(data => {
            this.items = data.value
          }).catch(err => {
            console.log(err)
            useToast().error(`${this.title}读取失败！`);
          })
        } else {
          this.items = []
        }
      }
    },
    selected(val) {
      this.$emit('selectionChange', val)
    }
  },
  computed: {
    tableHeight() {
      return '528px'
      // return window.innerHeight > 1000 ? '650px' : 'calc(70vh)'
    },
  },
  methods: {
    createNewItem() {
      const rst = {}
      this.cascade && (rst.pid = this.condition.pid)
      // this.itemNames.forEach(e=>{
      //   rst[e] = e == 'ordinal' ? (this.items.length > 0 ? this.items.map(i=>i.ordinal).sort((a,b)=>b-a)[0] + 1 : 1) : null
      // })
      return rst
    },
    onDragRow() {
      this.drag = true
    },
    onDropRow() {
      this.drag = false
      let targetArr = []
      this.items.forEach((item, index) => {
        const oriOrdinal = index + 1
        if (oriOrdinal != item.ordinal) {
          item.ordinal = oriOrdinal
          item.sort = true
          targetArr.push(item)
        }
      })
      console.log('update range:', targetArr)
      targetArr.length > 0 && window.commonService.bulkSave(this.model, ...targetArr).then(() => {
        window.commonService.find(this.model, this.condition).then(data => {
          this.items = data
        }).catch(err => {
          console.log(err)
        })
        this.$emit('change')
        // useToast().success(`${this.title}更新成功！`)
      }).catch(err => {
        console.error(err)
        useToast().error(`${this.title}更新失败！`)
      })
    },
    onClose() {
      this.$emit('close', false)
    },
    showEdit(item) {
      this.item = item || this.createNewItem()
      this.dialog.showDetail = true
    },
    // showConfirm(item) {
    //   this.item = JSON.parse(JSON.stringify(item))
    //   this.dialog.showConfirm = true
    // },
    handleDelete(item) {
      // this.item = JSON.parse(JSON.stringify(item))
      this.$dialog.confirm({
        text: `确定要删除${this.title}${item['name'] ? `：${item['name']}` : ''}？`
      }).then(res => {
        if (res) {
          const path = item.path
          const ordinal = item.ordinal
          item.delete = true
          let targetArr = [item]
          for (const e of this.items) {
            if (e.ordinal > ordinal) {
              const moveUpItem = {}
              for (const key in e) {
                moveUpItem[key] = key == 'ordinal' ? (e.ordinal - 1) : e[key]
              }
              moveUpItem.sort = true
              targetArr.push(moveUpItem)
            }
          }

          window.commonService.bulkSave(this.model, ...targetArr).then(() => {
            // this.dialog.showDetail = false
            window.commonService.find(this.model, this.condition).then(data => {
              this.items = data
            })
            this.$emit('change')
            useToast().success(`${this.title}删除成功！`)
          }).catch(err => {
            console.error(err)
            useToast().error(`${this.title}删除失败！`)
          }).finally(() => {
            this.interceptor.delete(path)
            this.dialog.showConfirm = false
            this.item = null
          })
        }
      })
    },
    handleSave(item) {
      this.interceptor.save(item).then(preResult => {
        for (const key in preResult) {
          item[key] && (item[key] = preResult[key])
        }
        window.commonService.save(this.model, item).then(() => {
          this.dialog.showDetail = false
          window.commonService.find(this.model, this.condition).then(data => {
            this.items = data
          })
          this.$emit('change')
          useToast().success(`${this.title}保存成功！`)
        }).catch(err => {
          console.error(err)
          useToast().error(`${this.title}保存失败！`)
        })
      })
    },
    handleSelect() {
      this.selected.length != 0 && this.$emit('select', this.selected[0].id)
    },
    handleCancel() {
      this.dialog.showDetail = false
    }
  },
  data() {
    return {
      item: {
        id: '',
        name: '',
        icon: null,
        ordinal: 0,
        isEdit: true,
      },
      items: [],
      dialog: {
        showDetail: false,
        showConfirm: false,
      },
      selected: [],
      drag: false
    }
  }
}
</script>

<style scoped>
:deep(.v-data-table__wrapper > table > tbody > tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) .rearrange:enabled) {
  color: var(--v-accent-base) !important;
}

:deep(.v-data-table__wrapper > table > tbody > tr:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) .rearrange:enabled) {
  color: var(--color, transparent) !important;
}

:deep(.v-data-table__wrapper > table > tbody > tr:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) .rearrange:disabled) {
  color: var(--color, transparent) !important;
}

:deep(.v-data-table__wrapper > table > tbody > tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) .rearrange:hover:enabled) {
  color: var(--v-primary-base) !important;
}

:deep(.v-data-table__wrapper > table > tbody > tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) .divider) {
  border-color: var(--v-secondary-lighten5) !important;
}

:deep(.v-data-table__wrapper > table > tbody > tr:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) .divider) {
  border-color: var(--color, transparent) !important;
}

:deep(.v-data-table__wrapper > table > tbody > tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) .edit) {
  color: var(--v-primary-lighten2) !important;
}

:deep(.v-data-table__wrapper > table > tbody > tr:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) .edit) {
  color: var(--color, transparent) !important;
}

:deep(.v-data-table__wrapper > table > tbody > tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) .edit:hover) {
  color: var(--v-primary-base) !important;
}

:deep(.v-data-table__wrapper > table > tbody > tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) .delete) {
  color: var(--v-error-lighten2) !important;
}

:deep(.v-data-table__wrapper > table > tbody > tr:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) .delete) {
  color: var(--color, transparent) !important;
}

:deep(.v-data-table__wrapper > table > tbody > tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) .delete:hover) {
  color: var(--v-error-base) !important;
}

:deep(.v-data-table__wrapper > table > tbody > tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) .actions) {
  color: var(--v-error-lighten2) !important;
}

:deep(.v-data-table__wrapper > table > tbody > tr:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) .actions) {
  color: var(--color, transparent) !important;
}
</style>
