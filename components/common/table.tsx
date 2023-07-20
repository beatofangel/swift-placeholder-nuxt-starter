import { Transition } from 'vue'
import { useToast } from "vue-toastification";
import {
  VCard,
  VCardTitle,
  VToolbar,
  VIcon,
  VSpacer,
  VTable,
  VRow,
  VBtn,
  VCol,
  VDivider,
  VCardActions,
  VDialog
} from "vuetify/components";
import Draggable from "vuedraggable";
import { ClientOnly } from '#components';

export interface Item extends Record<string, any> {
  id: string;
  name: string;
  icon: string;
  ordinal: number;
}

export interface Header extends Record<string, any> {
  title: string
  key: string
}

export default defineComponent({
  name: "CommonTable",
  props: {
    condition: {
      type: Object,
      default: () => null,
    },
    model: {
      type: String,
      required: true,
    },
    flat: Boolean,
    hideToolBar: Boolean,
    hideSelectBtn: Boolean,
    title: String,
    headers: Array<Header>,
    itemNames: Array,
    visible: Boolean,
    selectedId: String,
    hideCreate: Boolean,
    showSelect: Boolean,
    cascade: Boolean,
    noData: {
      type: String,
      default: "没有数据",
    },
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        if (val) {
          // this.visible && this.condition && window.commonService.find(this.model, this.condition).then(data => {
          this.visible &&
            this.condition &&
            useFetch(this.model, { query: this.condition })
              .then(({ data }) => {
                this.items = data.value as [];
                this.selected = this.selectedId
                  ? this.items.filter((item) => item.id == this.selectedId)
                  : [];
              })
              .catch((err) => {
                console.log(err);
                useToast().error(`${this.title}读取失败！`);
              });
        }
      },
    },
    condition: {
      deep: true,
      handler(newVal, oldVal) {
        // =====TODO 待测试=====
        if (newVal === oldVal) return;
        // =====================
        // if (!this.cascade) return
        console.log("condition", newVal, oldVal);
        this.selected.splice(0);
        if (newVal) {
          useFetch(this.model, { query: this.condition })
            .then(({ data }) => {
              this.items = data.value as [];
            })
            .catch((err) => {
              console.log(err);
              useToast().error(`${this.title}读取失败！`);
            });
        } else {
          this.items.splice(0);
        }
      },
    },
    selected(val) {
      this.$emit("selectionChange", val);
    },
  },
  computed: {
    tableHeight() {
      return "528px";
      // return window.innerHeight > 1000 ? '650px' : 'calc(70vh)'
    },
  },
  methods: {
    createNewItem() {
      this.item = {
        id: "",
        name: "",
        icon: "",
        ordinal: -1,
      };
      this.cascade && (this.item.pid = this.condition.pid);
      // this.itemNames.forEach(e=>{
      //   rst[e] = e == 'ordinal' ? (this.items.length > 0 ? this.items.map(i=>i.ordinal).sort((a,b)=>b-a)[0] + 1 : 1) : null
      // })
      return this.item;
    },
    onDragRow(event: any) {
      console.log('onDragRow')
      this.drag = true;
    },
    onDropRow(event: any) {
      console.log('onDropRow')
      this.drag = false;
      let targetArr = [] as Item[];
      this.items.forEach((item, index) => {
        const oriOrdinal = index + 1;
        if (oriOrdinal != item.ordinal) {
          item.ordinal = oriOrdinal;
          item.sort = true;
          targetArr.push(item);
        }
      });
      console.log("update range:", targetArr);
      // targetArr.length > 0 &&
      //   useFetch(this.model, { method: "POST", params: { items: targetArr } })
      //     .then(() => {
      //       useFetch(this.model, { query: this.condition })
      //         .then(({ data }) => {
      //           this.items = data.value as [];
      //         })
      //         .catch((err) => {
      //           console.log(err);
      //         });
      //       this.$emit("change");
      //       useToast().success(`${this.title}更新成功！`);
      //     })
      //     .catch((err) => {
      //       console.error(err);
      //       useToast().error(`${this.title}更新失败！`);
      //     });
    },
    onClose() {
      this.$emit("close", false);
    },
    showEdit(item?: Item) {
      this.item = item || this.createNewItem();
      this.dialog.showDetail = true;
    },
    handleDelete(item: Item) {
      // this.item = JSON.parse(JSON.stringify(item))
      // useDialog().$confirm({
      //   text: `确定要删除${this.title}${item["name"] ? `：${item["name"]}` : ""
      //     }？`,
      //   onOk: () => {
      //     const path = item.path;
      //     const ordinal = item.ordinal;
      //     item.delete = true;
      //     let targetArr = [item];
      //     for (const e of this.items) {
      //       if (e.ordinal > ordinal) {
      //         const moveUpItem = {} as Item;
      //         for (const key in e) {
      //           moveUpItem[key] = key == "ordinal" ? e.ordinal - 1 : e[key];
      //         }
      //         moveUpItem.sort = true;
      //         targetArr.push(moveUpItem);
      //       }
      //     }

      //     useFetch(this.model, { method: "POST", params: { items: targetArr } })
      //       .then(() => {
      //         useFetch(this.model, { query: this.condition }).then(
      //           ({ data }) => {
      //             this.items = data.value as [];
      //           }
      //         );
      //         this.$emit("change");
      //         useToast().success(`${this.title}删除成功！`);
      //       })
      //       .catch((err) => {
      //         console.error(err);
      //         useToast().error(`${this.title}删除失败！`);
      //       })
      //       .finally(() => {
      //         // this.item = null
      //       });
      //   },
      // });
    },
    handleSave(item: Item) {
      // useFetch(this.model, { method: "POST", params: { item } })
      //   .then(() => {
      //     this.dialog.showDetail = false;
      //     useFetch(this.model, { query: this.condition }).then(({ data }) => {
      //       this.items = data.value as [];
      //     });
      //     this.$emit("change");
      //     useToast().success(`${this.title}保存成功！`);
      //   })
      //   .catch((err: any) => {
      //     console.error(err);
      //     useToast().error(`${this.title}保存失败！`);
      //   });
    },
    handleSelect() {
      this.selected.length != 0 && this.$emit("select", this.selected[0].id);
    },
    handleCancel() {
      this.dialog.showDetail = false;
    },
  },
  setup(props, ctx) {
    const item = ref({
      id: "",
      name: "",
      icon: "",
      ordinal: -1,
      isEdit: true,
    } as Item);
    const items = ref([] as Item[]);
    const dialog = {
      showDetail: false,
    };
    const selected = ref([] as Item[]);
    const drag = ref(false);
    return {
      item,
      items,
      dialog,
      selected,
      drag,
    };
  },
  render() {
    return (
      <VCard flat={this.flat}>
        {this.hideToolBar && !!this.title && (
          <VCardTitle class="d-flex justify-center">
            <span class="text-h5 ml-1 mt-1">{this.title}一览</span>
          </VCardTitle>
        )}
        {!!this.title && (
          <VToolbar color="primary" theme="dark">
            <VIcon>mdi-format-list-bulleted</VIcon>
            <span class="text-h5 ml-1 mt-1">{this.title}一览</span>
            <VSpacer></VSpacer>
            <VBtn
              size="small"
              variant="plain"
              position="absolute"
              // @ts-ignore
              onClick={this.onClose}
            >
              <VIcon>mdi-close</VIcon>
            </VBtn>
          </VToolbar>
        )}
        <ClientOnly>
          <VTable>
            <thead>
              <tr>
                {this.headers?.map(({ title, key }) => {
                  return (
                    <th key={key}>
                      {title}
                    </th>
                  )
                })}
              </tr>
            </thead>
            {this.items.length > 0 && (
              this.items.length > 0 ? (
                <Draggable
                  modelValue={this.items}
                  animation="200"
                  ghost-class="ghost"
                  itemKey="name"
                  tag="tbody"
                  onStart={this.onDragRow}
                  onEnd={this.onDropRow}
                >
                  {{
                    item: ({ element: item, index }: { element: Item, index: number }) => {
                      const testtag = (
                        <Transition
                          name={!this.drag ? 'flip-list' : undefined}
                          type="transition"
                        >
                          <tr>
                            {
                              this.headers?.map(({ key, cellClass }) => {
                                return (
                                  key == "data-table-select" && (
                                    <td key={key}><VIcon
                                    // color=""
                                    // on-click=""
                                    ></VIcon></td>
                                  ) ||
                                  key == 'index' && (
                                    <td class="text-start" key={`item.${key}`} >{index + 1}</td>
                                  ) ||
                                  !['index', 'data-table-select', 'actions'].includes(key) && (
                                    <td class={`text-start ${cellClass || ''}`} key={`item.${key}`}>
                                      {
                                        this.$slots[`item.${key}`] ?? item[key]
                                      }
                                    </td>
                                  ) ||
                                  key == 'actions' && (
                                    <td class="text-center" key={`item.${key}`}>
                                      <VRow class="actions justify-center">
                                        <VIcon class="edit" on-click={this.showEdit({ ...item, isEdit: true })}>mdi-pencil</VIcon>
                                        <VIcon class="delete" on-click={this.handleDelete({ ...item, delete: true })}>mdi-delete</VIcon>                                  </VRow>
                                    </td>
                                  )
                                )
                              })
                            }
                          </tr>
                        </Transition>
                      )
                      return testtag
                    }
                  }}
                </Draggable>
              ) : (
                <tbody>
                  <tr class="v-data-table__empty-wrapper">
                    <td colspan={this.headers?.length}>
                      {this.noData}
                    </td>
                  </tr>
                </tbody>
              )
            )}
          </VTable></ClientOnly>
        <VDivider></VDivider>
        <VCardActions>
          <VSpacer></VSpacer>
          {!this.hideCreate && (
            <VBtn color="success" on-click={this.showEdit}></VBtn>
          )}
        </VCardActions>
      </VCard>
    );
  },
});
