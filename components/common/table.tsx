import { Transition, defineComponent, ref } from 'vue'
import { useToast } from "vue-toastification";
import { useFetch } from "#app"
import {
  VCard,
  VCardTitle,
  VToolbar,
  VTooltip,
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
import { v4 as uuid, validate } from 'uuid';
import './table.scss';
import { Result } from 'server/utils/http';

export interface Item extends Record<string, any> {
  id: string | undefined;
  name: string | undefined;
  ordinal?: number;
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
    hideTitle: Boolean,
    hideToolBar: Boolean,
    hideSelectBtn: Boolean,
    title: String,
    headers: {
      type: Array<Header>,
      required: true
    },
    // itemNames: Array,
    visible: Boolean,
    // selectedId: String,
    hideCreate: Boolean,
    showSelect: Boolean,
    cascade: Boolean,
    cascadedId: {
      type: String,
      default: 'pid'
    },
    draggable: Boolean,
    showIndex: Boolean,
    fixedHeader: Boolean,
    height: [String, Number],
    noData: {
      type: String,
      default: "暂无数据",
    },
    appendItems: {
      type: Array<Item>,
      default: () => null,
    },
    inlineEdit: Boolean
  },
  mounted() {
    this.condition &&
      $fetch(this.api, { query: this.condition })
        .then((data) => {
          const result = data as Result
          if (result.success) {
            this.items = result.data as [];
          } else {
            useToast().error(`${this.title}读取失败！\n${result.errorMessage}`);
          }
          // this.selected = this.selectedId
        })
        .catch((err) => {
          console.log(err);
          useToast().error(`${this.title}读取失败！`);
        });
  },
  watch: {
    // visible: {
    //   immediate: true,
    //   handler(val) {
    //     if (val) {
    //       // this.visible && this.condition && window.commonService.find(this.api, this.condition).then(data => {
    //       this.visible &&
    //         this.condition &&
    //         $fetch(this.api, { query: this.condition })
    //           .then((data) => {
    //             this.items = data as [];
    //             // this.selected = this.selectedId
    //           })
    //           .catch((err) => {
    //             console.log(err);
    //             useToast().error(`${this.title}读取失败！`);
    //           });
    //     }
    //   },
    // },
    condition: {
      deep: true,
      handler(newVal, oldVal) {
        // =====TODO 待测试=====
        if (newVal === oldVal) return;
        // =====================
        // if (!this.cascade) return
        // console.log("condition", newVal, oldVal);
        // this.selected = null;
        if (newVal) {
          useFetch(this.api, { query: this.condition })
            .then(({ data }) => {
              const result = data.value as Result
              if (result.success) {
                this.items = result.data as [];
              } else {
                useToast().error(`${this.title}读取失败！\n${result.errorMessage}`);
              }
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
    selectionChange: (selection?: Item) => true,
    close: (val: boolean) => true,
    change: (item?: Item) => true,
    appendItemCreate: (item: any) => true,
  },
  computed: {
    tableHeight() {
      return "576px";
      // return window.innerHeight > 1000 ? '650px' : 'calc(70vh)'
    },
    footerItems() {
      if (this.appendItems && this.appendItems.length > 0) {
        return this.appendItems.filter(aItm=> !this.items.some(itm => validate(aItm.name!) && aItm.name === itm.id || itm.name === aItm.name))
      }
      return []
    }
    // selectedLength() {
    //   return this.selections.length
    // },
    // selections() {
    //   return this.items.filter(item => item.select)
    // },
  },
  methods: {
    createNewItem() {
      this.item = { id: undefined, name: undefined, ordinal: undefined, mode: EditMode.Create };
      this.cascade && (this.item[this.cascadedId] = this.condition[this.cascadedId]);
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
      if (event.newIndex != event.oldIndex) {
        let targetItems = [] as Item[];
        this.items.forEach((item, index) => {
          const oriOrdinal = index;
          if (oriOrdinal != item.ordinal) {
            item.ordinal = oriOrdinal;
            item.mode = EditMode.Update;
            targetItems.push(item);
          }
        });
        console.log("update range:", targetItems);
        // 排序
        targetItems.length > 0 &&
          useFetch(this.api, { method: "POST", body: targetItems })
            .then(({ data, error }) => {
              if (error.value) {
                useToast().error(`${this.title}更新失败！`);
              } else {
                useFetch(this.api, { query: this.condition })
                  .then(({ data }) => {
                    const result = data.value as Result
                    if (result.success) {
                      this.items = result.data as [];
                      const prevSelected = this.items.find(item => this.selected ? item.id == this.selected : false)
                      if (prevSelected) {
                        prevSelected.select = true
                      } else {
                        this.selected = null
                        this.$emit('selectionChange')
                      }
                    } else {
                      console.error(result.errorMessage)
                    }
                  })
                  .catch((err) => {
                    console.error(err);
                  });
                // useToast().success(`${this.title}更新成功！`); // do not prompt
              }
            })
            .catch((err) => {
              console.error(err);
              useToast().error(`${this.title}更新失败！`);
            });
      }
    },
    onClose() {
      this.$emit("close", false);
    },
    showEdit(item?: Item) {
      this.item = item ? Object.assign({ mode: EditMode.Update }, item) : this.createNewItem();
      this.dialog.showDetail = true;
    },
    handleAppendCreate(item: Item) {
      console.log('handleAppendCreate', item)
      this.item = JSON.parse(JSON.stringify(item))
      this.cascade && (this.item[this.cascadedId] = this.condition[this.cascadedId]);
      useFetch(this.api, { method: 'POST', body: this.item }).then(({ data, error }) => {
        if (error.value) {
          useToast().error(`${this.title}保存失败！`);
        } else {
          const result = data.value as Result
          if (result.success) {
            this.$emit('appendItemCreate', { ...(result.data as Record<string, any>), contentControls: this.item.contentControls })
            useFetch(this.api, { query: this.condition }).then(
              ({ data }) => {
                const result = data.value as Result
                if (result.success) {
                  this.items = result.data as [];
                  const prevSelected = this.items.find(item => this.selected ? item.id == this.selected : false)
                  if (prevSelected) {
                    prevSelected.select = true
                  } else {
                    this.selected = null
                    this.$emit('selectionChange')
                  }
                } else {
                  console.error(result.errorMessage)
                }
              })
              .catch((err) => {
                console.error(err);
                useToast().error(`${this.title}更新失败！`);
              });;
            this.$emit("change");
            useToast().success(`${this.title}保存成功！`);
          } else {
            useToast().error(`${this.title}保存失败！\n${result.errorMessage}`);
          }
        }
      })
    },
    handleDelete(item: Item) {
      console.log('handleDelete', item)
      this.item = JSON.parse(JSON.stringify(item))
      const text = [h('span', `确定要删除${this.title}${item.name ? `：${item.name}` : ""}？`)]
      this.cascade && text.push(h('br'), h('span', { class: ['text-red'] }, `注意：此操作将会删除${item.name}下所有子项`))
      useDialog().$warning({
        text: () => h('div', null, text),
        onOk: () => {
          const ordinal = item.ordinal;
          this.item.mode = EditMode.Delete
          let targetArr = [];
          for (const e of this.items) {
            if (e.ordinal! > ordinal!) {
              const moveUpItem = {} as Item;
              for (const key in e) {
                moveUpItem[key] = key == "ordinal" ? e.ordinal! - 1 : e[key];
              }
              moveUpItem.mode = EditMode.Update
              // moveUpItem.sort = true;
              targetArr.push(moveUpItem);
            }
          }

          // 删除+ (排序)
          const method = targetArr.length == 0 ? 'DELETE' : 'POST'
          const params = targetArr.length == 0 ? this.item : targetArr.concat(this.item)
          useFetch(this.api, { method: method, body: params })
            .then(({ data, error }) => {
              if (error.value) {
                useToast().error(`${this.title}删除失败！`);
              } else {
                useFetch(this.api, { query: this.condition }).then(
                  ({ data }) => {
                    const result2 = data.value as Result
                    if (result2.success) {
                      this.items = result2.data as [];
                      // first item selected if exists
                      // if (this.items.length > 0) {
                      //   this.items[0].select = true
                      const prevSelected = this.items.find(item => this.selected ? item.id == this.selected : false)
                      if (prevSelected) {
                        prevSelected.select = true
                      } else {
                        this.selected = null
                        this.$emit('selectionChange')
                      }
                      // }
                    } else {
                      console.error(result2.errorMessage)
                    }
                  })
                  .catch((err) => {
                    console.error(err);
                    useToast().error(`${this.title}删除失败！`);
                  });
                this.$emit("change", this.item);
                useToast().success(`${this.title}删除成功！`);
              }
            })
            .catch((err) => {
              console.error(err);
              useToast().error(`${this.title}删除失败！`);
            })
        },
      });
    },
    handleSave(item: Item) {
      console.log('handleSave', item)
      const method = item.mode == EditMode.Create ? 'POST' : item.mode == EditMode.Update ? 'PUT' : null
      method && useFetch(this.api, { method: method, body: item })
        .then(({ data, error }) => {
          if (error.value) {
            useToast().error(`${this.title}保存失败！`);
          } else {
            const result = data.value as Result
            if (result.success) {
              console.log(result.data)
              useToast().success(`${this.title}保存成功！`);
              this.dialog.showDetail = false;
              useFetch(this.api, { query: this.condition }).then(({ data }) => {
                const result2 = data.value as Result
                if (result2.success) {
                  this.items = result2.data as [];
                  const prevSelected = this.items.find(item => this.selected ? item.id == this.selected : false)
                  if (prevSelected) {
                    prevSelected.select = true
                  } else {
                    this.selected = null
                    this.$emit('selectionChange')
                  }
                  this.$emit("change", result.data as Item);
                } else {
                  console.error(result2.errorMessage)
                }
              });
            } else {
              useToast().error(`${this.title}保存失败！\n${result.errorMessage}`);
            }
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
        this.items.forEach(itm => itm.select = itm == item)
        this.selected = item.id
        this.$emit('selectionChange', item)
      } else {
        this.selected = null
        this.$emit('selectionChange')
      }
      // this.selected.length != 0 && this.$emit("select", this.selected[0].id);
    },
    handleCancel() {
      console.log('handleCancel')
      this.dialog.showDetail = false;
    },
  },
  setup(props, ctx) {
    const draggableCol = { title: '', key: 'data-table-draggable', style: "min-width: 21px;", class: "px-0", cellClass: "px-0" } as Header
    const selectableCol = { title: '', key: 'data-table-select', style: "min-width: 64px;", class: "text-center", cellClass: "text-center" } as Header
    const indexCol = { title: "No.", key: "index", style: "min-width: 64px", class: "text-center", cellClass: "text-center" } as Header
    const actionCol = { title: "操作", key: "actions", class: "text-center", style: "min-width: 72px;" } as Header
    const item = ref({
      id: undefined, name: undefined, ordinal: undefined,
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
    if (props.draggable) {
      if (prependCols.value.length > 1) {
        prependCols.value[1].class += " pl-0"
        prependCols.value[1].cellClass += " pl-0"
        prependCols.value[1].style = "min-width: 48px;"
      }
    }
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
          !this.hideTitle &&
          (<VCardTitle class="d-flex justify-center">
            <span class="text-h5 ml-1 mt-1">{this.title}</span>
          </VCardTitle>)
        }
        { /* @ts-ignore */}
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
                      {/* <tr class={[{'draggable-hover': this.draggable && !this.drag}, {'draggable-drag': this.drag}]}> */}
                      <tr>
                        {
                          this.innerHeaders.map(({ key, cellClass }) => {
                            return (
                              key == "data-table-draggable" && (
                                <td style={{ cursor: 'move' }} class={cellClass} key={key}><VIcon color='grey' class="data-table-draggable" icon='mdi-drag-vertical'></VIcon></td>
                              ) ||
                              key == "data-table-select" && (
                                <td class={cellClass} key={key}><VIcon
                                  color={item.select ? 'primary' : ''}
                                  icon={item.select ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'}
                                  // @ts-ignore
                                  onClick={() => this.handleSelect(item)}
                                ></VIcon></td>
                              ) ||
                              key == 'index' && (
                                <td class={cellClass} key={`item.${key}`} >{index + 1}</td>
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
                                <td class={cellClass} key={`item.${key}`}>
                                  <VRow class="actions justify-center">
                                    { this.inlineEdit ?
                                      <VTooltip text='保存'>
                                        {{
                                          activator: ({ props }) => {
                                            return (
                                              <VIcon
                                                {...props}
                                                color='primary'
                                                class='mx-1'
                                                // @ts-ignore
                                                onClick={() => this.handleSave({ ...item, mode: EditMode.Update })}
                                              >mdi-content-save-edit</VIcon>
                                            )
                                          },
                                        }}
                                      </VTooltip> :
                                      <VTooltip text='编辑'>
                                        {{
                                          activator: ({ props }) => {
                                            return (
                                              <VIcon
                                                {...props}
                                                color='primary'
                                                class='mx-1'
                                                // @ts-ignore
                                                onClick={() => this.showEdit({ ...item, isEdit: true })}
                                              >mdi-pencil</VIcon>
                                            )
                                          },
                                        }}
                                      </VTooltip>
                                    }
                                    <VTooltip text='删除'>
                                      {{
                                        activator: ({ props }) => {
                                          return (
                                            <VIcon
                                              {...props}
                                              color='red-lighten-2'
                                              class='mx-1'
                                              // @ts-ignore
                                              onClick={() => this.handleDelete({ ...item, delete: true })}
                                            >mdi-delete</VIcon>
                                          )
                                        }
                                      }}
                                    </VTooltip>
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
                },
                footer: () => {
                  return this.items.length == 0 && this.footerItems.length == 0 ? (
                    <tr class="v-data-table__empty-wrapper">
                      <td class="text-center" colspan={this.innerHeaders.length}>
                        <span class="text-grey">{this.noData}</span>
                      </td>
                    </tr>
                  ) : this.footerItems.map((item, index) => {
                    return (
                      <tr class={['bg-orange-lighten-5']}>
                        {
                          this.innerHeaders.map(({ key, cellClass }) => {
                            return (
                              key == "data-table-draggable" && (
                                <td class={cellClass} key={key}><VIcon color='grey' class="data-table-draggable" icon='mdi-blank'></VIcon></td>
                              ) ||
                              key == "data-table-select" && (
                                <td class={cellClass} key={key}><VIcon
                                  color={item.select ? 'primary' : ''}
                                  icon={item.select ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'}
                                  // @ts-ignore
                                  onClick={() => this.handleSelect(item)}
                                ></VIcon></td>
                              ) ||
                              key == 'index' && (
                                <td class={cellClass} key={`item.${key}`} >{index + this.items.length + 1}</td>
                              ) ||
                              !['index', 'data-table-select', 'data-table-draggable', 'actions'].includes(key) && (
                                <td class={cellClass} key={`item.${key}`}>
                                  {
                                    // @ts-ignore
                                    this.$slots[`item.${key}`] ? this.$slots[`item.${key}`]({ item, disabled: !!item.id }) : item[key]
                                  }
                                </td>
                              ) ||
                              key == 'actions' && (
                                <td class={cellClass} key={`item.${key}`}>
                                  <VRow class="actions justify-center">
                                  <VTooltip text={item.id ? '绑定' : '添加'}>
                                    {{
                                      activator: ({ props }) => {
                                        return (
                                          <VIcon
                                            {...props}
                                            color={item.id ? 'primary' : 'success'}
                                            class='mx-1'
                                            icon={item.id ? 'mdi-link-variant-plus' : 'mdi-plus'}
                                            // @ts-ignore
                                            onClick={() => this.handleAppendCreate({ ...item, mode: EditMode.Create })}
                                          ></VIcon>
                                        )
                                      },
                                    }}
                                  </VTooltip>
                                  </VRow>
                                </td>
                              )
                            )
                          })
                        }
                      </tr>
                    )
                  })
                }
              }}
            </Draggable>
          }
        </VTable>
        <VDivider></VDivider>
        <VCardActions>
          <VSpacer></VSpacer>
          {!this.hideCreate && !!this.condition && (
            <VBtn
              color="success"
              icon="mdi-plus"
              density="comfortable"
              // @ts-ignore
              onClick={() => this.showEdit()}
            >
            </VBtn>
          )}
        </VCardActions>
        {
          this.$slots['editor'] && <VDialog width="500" modelValue={this.dialog.showDetail} persistent>
            {
              this.$slots['editor']({ ...this.item, mode: this.item.mode, title: this.title, onCancel: this.handleCancel, onSave: this.handleSave })
            }
          </VDialog>
        }
      </VCard>
    );
  },
});
