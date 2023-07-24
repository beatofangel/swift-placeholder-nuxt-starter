import { Transition, defineComponent, ref } from 'vue'
import { useToast } from "vue-toastification";
import { useFetch } from "#app"
import {
  VCard,
  VCardTitle,
  VToolbar,
  VIcon,
  VSpacer,
  VTable,
  VRow,
  VBtn,
  VDivider,
  VCardActions,
  VHover,
  VDialog
} from "vuetify/components";
import Draggable from "vuedraggable";
import { ClientOnly } from '#components';
import { v4 as uuid } from 'uuid';
import './table.scss';

export interface Item extends Record<string, any> {
  id?: string;
  name?: string;
  icon?: string;
  ordinal?: number;
  select?: boolean;
}

export interface Header extends Record<string, any> {
  title: string
  key: string
}

export default defineComponent({
  props: {
    condition: {
      type: Object,
      default: () => { },
    },
    api: {
      type: String,
      required: true,
    },
    flat: Boolean,
    hideToolBar: Boolean,
    hideSelectBtn: Boolean,
    title: String,
    headers: {
      type: Array<Header>,
      required: true
    },
    // itemNames: Array,
    visible: Boolean,
    selectedId: String,
    hideCreate: Boolean,
    showSelect: Boolean,
    cascade: Boolean,
    draggable: Boolean,
    showIndex: Boolean,
    fixedHeader: Boolean,
    height: [String, Number],
    noData: {
      type: String,
      default: "暂无数据",
    },
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        if (val) {
          // this.visible && this.condition && window.commonService.find(this.api, this.condition).then(data => {
          this.visible &&
            this.condition &&
            $fetch(this.api, { query: this.condition })
              .then((data) => {
                this.items = data as [];
                this.selected = this.selectedId
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
        this.selected = null;
        if (newVal) {
          useFetch(this.api, { query: this.condition })
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
    // selected(val) {
    //   this.$emit("selectionChange", val);
    // },
  },
  emits: {
    selectionChange: (selection?: string) => true,
    close: (val: boolean) => true,
    change: () => true,
  },
  computed: {
    tableHeight() {
      return "576px";
      // return window.innerHeight > 1000 ? '650px' : 'calc(70vh)'
    },
    selectedLength() {
      return this.selections.length
    },
    selections() {
      return this.items.filter(item => item.select)
    }
  },
  methods: {
    createNewItem() {
      this.item = {};
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
      if (event.newIndex != event.oldIndex) {
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
        this.items.sort((a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0))
        // targetArr.length > 0 &&
        //   useFetch(this.api, { method: "POST", params: { items: targetArr } })
        //     .then(() => {
        //       useFetch(this.api, { query: this.condition })
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
      }
    },
    onClose() {
      this.$emit("close", false);
    },
    showEdit(item?: Item) {
      this.item = item || this.createNewItem();
      this.dialog.showDetail = true;
    },
    handleDelete(item: Item) {
      console.log('handleDelete', item)
      this.item = JSON.parse(JSON.stringify(item))
      useDialog().$warning({
        text: `确定要删除${this.title}${item.name ? `：${item.name}` : ""
          }？`,
        onOk: () => {
          // const path = item.path;
          // const ordinal = item.ordinal;
          // item.delete = true;
          // let targetArr = [item];
          // for (const e of this.items) {
          //   if (e.ordinal > ordinal) {
          //     const moveUpItem = {} as Item;
          //     for (const key in e) {
          //       moveUpItem[key] = key == "ordinal" ? e.ordinal - 1 : e[key];
          //     }
          //     moveUpItem.sort = true;
          //     targetArr.push(moveUpItem);
          //   }
          // }

          // useFetch(this.api, { method: "POST", params: { items: targetArr } })
          //   .then(() => {
          //     useFetch(this.api, { query: this.condition }).then(
          //       ({ data }) => {
          //         this.items = data.value as [];
          //       }
          //     );
          //     this.$emit("change");
          //     useToast().success(`${this.title}删除成功！`);
          //   })
          //   .catch((err) => {
          //     console.error(err);
          //     useToast().error(`${this.title}删除失败！`);
          //   })
          //   .finally(() => {
          //     // this.item = null
          //   });
        },
      });
    },
    handleSave(item: Item) {
      console.log('handleSave', item)
      useFetch(this.api, { method: "POST", body: item })
        .then(({ data, error }) => {
          if (error.value) {
            useToast().error(`${this.title}保存失败！`);
          } else {
            console.log(data.value)
            this.$emit("change");
            useToast().success(`${this.title}保存成功！`);
            this.dialog.showDetail = false;
            useFetch(this.api, { query: this.condition }).then(({ data }) => {
              this.items = data.value as [];
            });
          }
        })
        .catch((err: any) => {
          console.error(err);
          useToast().error(`${this.title}保存失败！`);
        })
    },
    // handleSelectAll() {
    //   const toggleSelect = this.items.length != this.selectedLength
    //   this.items.forEach(item => item.select = toggleSelect)
    // },
    handleSelect(item: Item) {
      // item.select = !item.select
      if (!item.select) {
        this.items.forEach(itm=>itm.select = itm==item)
        this.$emit('selectionChange', item.id)
      }
      // this.selected.length != 0 && this.$emit("select", this.selected[0].id);
    },
    handleCancel() {
      console.log('handleCancel')
      this.dialog.showDetail = false;
    },
  },
  setup(props, ctx) {
    const indexCol = { title: "No.", key: "index", style: "min-width: 64px", class: "text-center" } as Header
    const draggableCol = { title: '', key: 'data-table-draggable', style: "min-width: 21px;", class: "px-0", cellClass: "px-0" } as Header
    const selectableCol = { title: '', key: 'data-table-select', style: "min-width: 64px;", class: "text-center" } as Header
    const actionCol = { title: "操作", key: "actions", class: "actionsClass text-center", align: "center", style: "min-width: 72px;" } as Header
    const item = ref({
      isEdit: true,
    } as Item);
    const items = ref([] as Item[]);
    const dialog = ref({
      showDetail: false,
    });
    const selected = ref();
    const drag = ref(false);
    const prependCols = ref([] as Header[])
    props.draggable && (prependCols.value.push(draggableCol))
    props.showSelect && (prependCols.value.push(selectableCol))
    props.showIndex && (prependCols.value.push(indexCol))
    const innerHeaders = prependCols.value.concat(props.headers).concat([actionCol])
    return {
      item,
      items,
      dialog,
      selected,
      drag,
      innerHeaders
    };
  },
  render() {
    const group = uuid()
    return (
      <VCard flat={this.flat}>
        {
          !!this.title &&
          this.hideToolBar ? (
            <VCardTitle class="d-flex justify-center">
              <span class="text-h5 ml-1 mt-1">{this.title}</span>
            </VCardTitle>
          ) : (
            <VToolbar color="primary" theme="dark">
              <VIcon>mdi-format-list-bulleted</VIcon>
              <span class="text-h5 ml-1 mt-1">{this.title}</span>
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
          )
        }
        { /* @ts-ignore */ }
        {/* <ClientOnly> */}
          <VTable theme='primary' fixedHeader={this.fixedHeader} height={this.height ?? this.tableHeight}>
            <thead>
              <tr>
                {this.innerHeaders.map((header) => {
                  return (
                    <th key={header.key} class={header.class} style={header.style ?? ''}>
                      {header.key == 'data-table-select' ? (
                        // <VIcon
                        //   color={this.selectedLength > 0 ? 'primary' : ''}
                        //   icon={this.selectedLength == this.items.length ? 'mdi-radiobox-marked' : this.selectedLength == 0 ? 'mdi-radiobox-blank' : 'mdi-checkbox-intermediate'}
                        //   // @ts-ignore
                        //   onClick={this.handleSelectAll}
                        // ></VIcon>
                        '选择'
                      ) : header.title}

                    </th>
                  )
                })}
              </tr>
            </thead>
            {
              this.items.length > 0 ? (
                // @ts-ignore
                <Draggable
                  modelValue={this.items}
                  group={group}
                  animation="200"
                  ghost-class="ghost"
                  handle=".data-table-draggable"
                  itemKey="name"
                  tag="tbody"
                  onStart={this.onDragRow}
                  onEnd={this.onDropRow}
                  onUpdate:modelValue={(v: any) => { this.items = v }}
                >
                  {{
                    item: ({ element: item, index }: { element: Item, index: number }) => {
                      const testtag = (
                        // @ts-ignore
                        <Transition
                          name={!this.drag ? 'flip-list' : undefined}
                          type="transition"
                        >
                          <tr>
                            {
                              this.innerHeaders.map(({ key, cellClass }) => {
                                return (
                                  key == "data-table-draggable" && (
                                    <td style={{ cursor: 'move' }} class={cellClass} key={key}><VIcon color='grey' class="data-table-draggable">mdi-drag-vertical</VIcon></td>
                                  ) ||
                                  key == "data-table-select" && (
                                    <td class="text-center" key={key}><VIcon
                                      color={item.select ? 'primary' : ''}
                                      icon={item.select ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'}
                                      // @ts-ignore
                                      onClick={() => this.handleSelect(item)}
                                    ></VIcon></td>
                                  ) ||
                                  key == 'index' && (
                                    <td class="text-center" key={`item.${key}`} >{index + 1}</td>
                                  ) ||
                                  !['index', 'data-table-select', 'data-table-draggable', 'actions'].includes(key) && (
                                    <td class={cellClass} key={`item.${key}`}>
                                      {
                                        // @ts-ignore
                                        this.$slots[`item.${key}`] ? this.$slots[`item.${key}`]({ item }) : item[key]
                                      }
                                    </td>
                                  ) ||
                                  key == 'actions' && (
                                    <td class="text-center" key={`item.${key}`}>
                                      <VRow class="actions justify-center">
                                        <VIcon
                                          color='primary'
                                          class='mx-1'
                                          // @ts-ignore
                                          onClick={()=>this.showEdit({ ...item, isEdit: true })}
                                        >mdi-pencil</VIcon>
                                        <VIcon
                                          color='error'
                                          class='mx-1'
                                          // @ts-ignore
                                          onClick={()=>this.handleDelete({ ...item, delete: true })}
                                        >mdi-delete</VIcon>
                                      </VRow>
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
                    <td class="text-center" colspan={this.innerHeaders.length}>
                      <span class="text-grey">{this.noData}</span>
                    </td>
                  </tr>
                </tbody>
              )
            }
          </VTable>
        {/* </ClientOnly> */}
        <VDivider></VDivider>
        <VCardActions>
          <VSpacer></VSpacer>
          {!this.hideCreate && !!this.condition && (
            <VBtn
              color="success"
              // @ts-ignore
              onClick={() => this.showEdit()}
            >
              <VIcon color="success">mdi-plus</VIcon>
            </VBtn>
          )}
        </VCardActions>
        {
          this.$slots['editor'] && <VDialog width="500" modelValue={this.dialog.showDetail} persistent>
            {
              this.$slots['editor']({ ...this.item, isEdit: this.item.isEdit, onCancel: this.handleCancel, onSave: this.handleSave })
            }
          </VDialog>
        }
      </VCard>
    );
  },
});
