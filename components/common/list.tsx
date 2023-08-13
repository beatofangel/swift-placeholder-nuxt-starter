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
  VForm,
  VDialog
} from "vuetify/components";
import Draggable from "vuedraggable";
import { v4 as uuid, validate } from 'uuid';
import { useTheme } from 'vuetify'
import { FieldMeta } from 'vee-validate'
import './list.scss';

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
  // props: props,
  props: {
    api: {
      type: Object as PropType<{ get: string, post?: string, put?: string, delete?: string, sort?: string }>,
      required: true,
      default: () => ({
        get: '',
        post: '',
        put: '',
        delete: '',
        sort: ''
      })
    },
    flat: Boolean,
    hideTitle: Boolean,
    hideToolBar: Boolean,
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
    cascadedId: String,
    cascadedKey: {
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
    if (this.cascadedId) {
      this.loading = true
      $fetch(this.getApi)
      .then((data) => {
        this.items = data as [];
        this.resetForm({ values: { items: data as any } })
      })
      .catch((err) => {
        console.log(err);
        useToast().error(`${this.title}读取失败！`);
      }).finally(()=>{
        setTimeout(() => {
          this.loading = false
        }, 500);
      })
    }
  },
  watch: {
    cascadedId: {
      handler(newVal, oldVal) {
        if (newVal === oldVal) return;
        if (newVal) {
          // clear selection
          this.selected = null
          this.loading = true
          useFetch(this.getApi)
            .then(({ data, error }) => {
              if (error.value) {
                useToast().error(`${this.title}读取失败！\n${error.value.message}`);
              } else {
                this.items = data.value as [];
                this.resetForm({ values: { items: data.value as any } })
              }
              this.$emit('updateItems', this.items)
            }).finally(()=>{
              // setTimeout(() => {
              //   this.loading = false
              // }, 500);
            })
        } else {
          this.items.splice(0);
        }
      },
    },
    // footerFields: {
    //   handler(val) {
    //     val.length > 0 && console.log(val[0].value)
    //   },
    //   deep: true
    // },
    footerItems(val) {
      this.replaceFooterItems(val)
    }
    // selected(val) {
    //   this.$emit("selectionChange", val);
    // },
  },
  emits: {
    selectionChange: (selection?: Item) => true,
    close: (val: boolean) => true,
    change: (item?: Item) => true,
    appendItemCreate: (item: any) => true,
    updateItems: (items: Item[]) => true, // 通知items更新
  },
  computed: {
    tableHeight() {
      return "576px";
      // return window.innerHeight > 1000 ? '650px' : 'calc(70vh)'
    },
    footerItems() {
      if (this.appendItems && this.appendItems.length > 0) {
        const fItems = this.appendItems.filter(aItm=> !this.items.some(itm => validate(aItm.name!) && aItm.name === itm.id || itm.name === aItm.name))
        // this.replaceFooterItems(fItems)
        return fItems
      }
      // this.replaceFooterItems([])
      return []
    },
    getApi() {
      return this.api.get.replace('{1}', this.cascadedId!)
    },
    postApi() {
      return this.api.post!.replace('{1}', this.cascadedId!)
    },
    putApi() {
      return this.api.put!
    },
    deleteApi() {
      return this.api.delete!.replace('{1}', this.cascadedId!)
    },
    sortApi() {
      return this.api.sort!.replace('{1}', this.cascadedId!)
    }
  },
  methods: {
    createNewItem() {
      this.item = { id: undefined, name: undefined, ordinal: undefined, mode: EditMode.Create };
      this.cascade && (this.item[this.cascadedKey] = this.cascadedId);
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
          useFetch(this.sortApi, { method: "POST", body: targetItems })
            .then(({ error }) => {
              if (error.value) {
                useToast().error(`${this.title}排序失败！\n${error.value.message}`);
              } else {
                useFetch(this.getApi)
                  .then(({ data }) => {
                    this.items = data.value as [];
                    this.resetForm({ values: { items: data.value as any } })
                    const prevSelected = this.items.find(item => this.selected ? item.id == this.selected : false)
                    if (prevSelected) {
                      prevSelected.select = true
                    } else {
                      this.selected = null
                      this.$emit('selectionChange')
                    }
                    this.$emit('updateItems', this.items)
                  })
              }
            })
            .catch((err) => {
              console.error(err);
              useToast().error(`${this.title}排序失败！`);
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
      this.cascade && (this.item[this.cascadedKey] = this.cascadedId);
      useFetch(this.postApi, { method: 'POST', body: this.item }).then(({ data, error }) => {
        if (error.value) {
          useToast().error(`${this.title}保存失败！\n${error.value.message}`);
        } else {
          this.$emit('appendItemCreate', { ...(data.value as Record<string, any>), contentControls: this.item.contentControls })
          useToast().success(`${this.title}保存成功！`);
          useFetch(this.getApi).then(
            ({ data }) => {
              this.items = data.value as [];
              this.resetForm({ values: { items: data.value as any } })
              const prevSelected = this.items.find(item => this.selected ? item.id == this.selected : false)
              if (prevSelected) {
                prevSelected.select = true
              } else {
                this.selected = null
                this.$emit('selectionChange')
              }
              this.$emit('updateItems', this.items)
            })
          this.$emit("change");
        }
      })
    },
    handleDelete(item: Item) {
      console.log('handleDelete', item)
      this.item = JSON.parse(JSON.stringify(item))
      const text = [h('span', `确定要删除${this.title}${item.name ? `：${item.name}` : ""}？`)]
      // this.cascade && text.push(h('br'), h('span', { class: ['text-red'] }, `注意：此操作将会删除${item.name}下所有子项`))
      useDialog().$confirm({
        error: true,
        persistent: false,
        text: () => h('div', null, text),
        onOk: () => {
          // 删除+ (排序)
          useFetch(this.deleteApi.replace('{2}', this.item.id!), { method: 'DELETE', body: this.item })
            .then(({ data, error }) => {
              if (error.value) {
                useToast().error(`${this.title}删除失败！\n${error.value.message}`);
              } else {
                console.log('deleted', data.value)
                useToast().success(`${this.title}删除成功！`);
                this.$emit("change", { ...(data.value as Item), contentControls: this.item.contentControls, mode: EditMode.Delete });
                useFetch(this.getApi).then(
                  ({ data }) => {
                    this.items = data.value as [];
                    this.resetForm({ values: { items: data.value as any } })
                    const prevSelected = this.items.find(item => this.selected ? item.id == this.selected : false)
                    if (prevSelected) {
                      prevSelected.select = true
                    } else {
                      this.selected = null
                      this.$emit('selectionChange')
                    }
                    this.$emit('updateItems', this.items)
                  })
              }
            })
            .catch((err) => {
              console.error(err);
              useToast().error(`${this.title}删除失败！`);
            })
        },
      });
    },
    async handleSave(item: Item) {
      console.log('handleSave', item)
      let saved: unknown, error
      switch (item.mode) {
        case EditMode.Create:
          const { data: created, error: createdError } = await useFetch(this.postApi, { method: 'POST', body: item })
          error = createdError.value
          saved = created.value
          break
        case EditMode.Update:
          const { data: updated, error: updatedError } = await useFetch(this.putApi.replace('{1}', item.id!), { method: 'PUT', body: item })
          error = updatedError.value
          saved = updated.value
          break
        default:
          // dead code
          useToast().error(`${this.title}保存失败！`);
          return
      }
      if (error) {
        useToast().error(`${this.title}保存失败！\n${error.message}`);
      } else {
        useToast().success(`${this.title}保存成功！`);
        this.dialog.showDetail = false;
        this.$emit("change", saved as Item);
        useFetch(this.getApi).then(({ data }) => {
          this.items = data.value as [];
          this.resetForm({ values: { items: data.value as any } })
          const prevSelected = this.items.find(item => this.selected ? item.id == this.selected : false)
          if (prevSelected) {
            prevSelected.select = true
          } else {
            this.selected = null
            this.$emit('selectionChange')
          }
          this.$emit('updateItems', this.items)
        });
      }
    },
    async handleSaveAll() {
      alert('功能：全部保存\n状态：施工中...')
    },
    handleSelect(item: Item) {
      if (!item.select) {
        this.items.forEach(itm => itm.select = itm == item)
        this.selected = item.id
        this.$emit('selectionChange', item)
      }/*  else {
        this.selected = null
        this.$emit('selectionChange')
      } */
    },
    handleCancel() {
      console.log('handleCancel')
      this.dialog.showDetail = false;
    },
    isDirty(index: number) {
      const matchedKeys = []
      for (const key of Object.keys(this.fieldRefs)) {
        if (key.indexOf(`items[${index}].`) == 0) {
          matchedKeys.push(key)
        }
      }
      for (const key of matchedKeys) {
        if ((this.fieldRefs[key] as { meta: FieldMeta<any> }).meta.dirty) {
          return true
        }
      }
      return false
    }
  },
  setup(props, ctx) {
    const draggableCol = { title: '', key: 'data-table-draggable', style: "width: 21px;", class: "text-center px-0", cellClass: "px-0" } as Header
    // const selectableCol = { title: '', key: 'data-table-select', style: "min-width: 64px;", class: "text-center", cellClass: "text-center" } as Header
    const indexCol = { title: "No.", key: "index", style: "width: 64px;min-width: 64px;max-width: 64px;", class: "text-center", cellClass: "text-center" } as Header
    const actionCol = { title: "操作", key: "actions", class: "text-center", style: "width: 72px;min-width: 72px;" } as Header
    const item = ref({
      id: undefined, name: undefined, ordinal: undefined,
      isEdit: true,
    } as Item);
    const items = ref([] as Item[]);
    const dialog = ref({
      showDetail: false,
    });
    const loading = ref(false)
    const selected = ref();
    const drag = ref(false);

    const { resetForm, handleSubmit } = useForm()
    const formDirty = useIsFormDirty()
    const { fields } = useFieldArray('items')
    const { fields: footerFields, replace: replaceFooterItems } = useFieldArray('footerItems')
    const fieldRefs: Record<string, Element | ComponentPublicInstance | null | { meta: FieldMeta<any> }> = {}
    // ======================================
    // resetForm({ values: { items: items.value as any } })
    // ======================================


    const prependCols = ref([] as Header[])
    props.draggable && (prependCols.value.push(draggableCol))
    // props.showSelect && (prependCols.value.push(selectableCol))
    props.showIndex && (prependCols.value.push(indexCol))
    // if (props.draggable) {
    //   if (prependCols.value.length > 1) {
    //     prependCols.value[1].class += " pl-0"
    //     prependCols.value[1].cellClass += " pl-0"
    //     prependCols.value[1].style = "min-width: 48px;"
    //   }
    // }
    const innerHeaders = prependCols.value.concat(props.headers).concat([actionCol])
    return {
      loading,
      item,
      items,
      dialog,
      selected,
      drag,
      fields,
      footerFields,
      fieldRefs,
      innerHeaders,
      resetForm,
      formDirty,
      replaceFooterItems
    };
  },
  render() {
    const group = uuid()
    return (
      <VCard flat={this.flat} width="100%">
        {
          !this.hideTitle &&
          (<VCardTitle class="d-flex justify-center">
            <span class="text-h5 ml-1 mt-1">{this.title}</span>
          </VCardTitle>)
        }
        <VForm>
          { /* @ts-ignore */}
          <VTable theme='primary' style="width: 100%;" fixedHeader={this.fixedHeader} height={this.height ?? this.tableHeight}>
            <thead>
              <tr>
                {this.innerHeaders.map((header) => {
                  return (
                    <th key={header.key} class={header.class} style={header.style ?? ''}>
                      {header.key == 'data-table-select' ? '选择' : header.title}
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
                ghost-class={useTheme().current.value.dark ? "ghost-dark" : "ghost"}
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
                        <tr class={{ "bg-row-active": this.showSelect && this.selected === item.id }} onClick={() => this.showSelect && this.handleSelect(item)}>
                          {
                            this.innerHeaders.map(({ key, cellClass }) => {
                              return (
                                key == "data-table-draggable" && (
                                  <td style={{ cursor: 'move' }} class={cellClass} key={key}><VIcon color='grey' class="data-table-draggable" icon='mdi-drag-vertical'></VIcon></td>
                                ) ||
                                // key == "data-table-select" && (
                                //   <td class={cellClass} key={key}><VIcon
                                //     color={item.select ? 'primary' : ''}
                                //     icon={item.select ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'}
                                //     // @ts-ignore
                                //     onClick={() => this.handleSelect(item)}
                                //   ></VIcon></td>
                                // ) ||
                                key == 'index' && (
                                  <td class={cellClass} key={`item.${key}`} >{index + 1}</td>
                                ) ||
                                !['index', 'data-table-select', 'data-table-draggable', 'actions'].includes(key) && (
                                  <td class={[cellClass, 'card-input']} key={`item.${key}`}>
                                    {
                                      // @ts-ignore
                                      this.$slots[`item.${key}`] ? this.$slots[`item.${key}`]({ item, index, name: `items[${index}].${key}`, fieldRef: el => this.fieldRefs[`items[${index}].${key}`] = el, modelValue: this.fields.length > 0 ? this.fields[index].value[key] : '', onUpdateModelValue: ($v, siblings:Record<string, any>[]) => {
                                        // @ts-ignore
                                        this.fields[index].value[key] = $v;
                                        siblings && siblings.forEach(sibling => {
                                          Object.entries(sibling).forEach(([k, v])=>{
                                            // @ts-ignore
                                            this.fields[index].value[k]=v
                                          })
                                        })
                                      } }) : item[key]
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
                                                <VBtn
                                                  {...props}
                                                  icon="mdi-content-save"
                                                  color="primary"
                                                  variant="text"
                                                  size="mini"
                                                  disabled={!this.isDirty(index)}
                                                  class='mx-1'
                                                  // @ts-ignore
                                                  onClick={() => this.handleSave({ ...item, mode: EditMode.Update })}
                                                ></VBtn>
                                                // <VIcon
                                                //   {...props}
                                                //   color={this.isDirty(index) ? 'grey' : 'primary'}
                                                //   class='mx-1'
                                                //   // @ts-ignore
                                                //   onClick={this.isDirty(index) || (() => this.handleSave({ ...item, mode: EditMode.Update }))}
                                                // >mdi-content-save</VIcon>
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
                                                  onClick={withModifiers(() => this.showEdit({ ...item, isEdit: true }), ['stop'])}
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
                                                onClick={withModifiers(() => this.handleDelete({ ...item, delete: true }), ['stop'])}
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
                                // key == "data-table-select" && (
                                //   <td class={cellClass} key={key}><VIcon
                                //     color={item.select ? 'primary' : ''}
                                //     icon={item.select ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'}
                                //     // @ts-ignore
                                //     onClick={() => this.handleSelect(item)}
                                //   ></VIcon></td>
                                // ) ||
                                key == 'index' && (
                                  <td class={cellClass} key={`item.${key}`} >{index + this.items.length + 1}</td>
                                ) ||
                                !['index', 'data-table-select', 'data-table-draggable', 'actions'].includes(key) && (
                                  <td class={[cellClass, 'card-input']} key={`item.${key}`}>
                                    {
                                      // @ts-ignore
                                      this.$slots[`item.${key}`] ? this.$slots[`item.${key}`]({ item, index, disabled: !!item.id, name: `appendItems[${index}].${key}`, fieldRef: el => this.fieldRefs[`appendItems[${index}].${key}`] = el, modelValue: this.footerFields.length > 0 ? this.footerFields[index].value[key] : '', onUpdateModelValue: ($v, siblings:Record<string, any>[]) => {
                                        item[key] = $v
                                        // @ts-ignore
                                        this.footerFields[index].value[key] = $v;
                                        siblings && siblings.forEach(sibling => {
                                          Object.entries(sibling).forEach(([k, v])=>{
                                            // @ts-ignore
                                            this.footerFields[index].value[k]=v
                                          })
                                        })
                                      } }) : item[key]
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
                                              onClick={withModifiers(() => this.handleAppendCreate({ ...item, mode: EditMode.Create }), ['stop'])}
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
            {
              this.inlineEdit && this.items.length > 0 && (
                <VBtn
                  color="primary"
                  icon="mdi-content-save-all"
                  density="comfortable"
                  disabled={!this.formDirty}
                  // @ts-ignore
                  onClick={() => this.handleSaveAll()}
                ></VBtn>
              )
            }
            {
              !this.inlineEdit &&
                !this.hideCreate && !!this.cascadedId && (
                  <VBtn
                    color="success"
                    icon="mdi-plus"
                    density="comfortable"
                    // @ts-ignore
                    onClick={() => this.showEdit()}
                  >
                  </VBtn>
                )
            }
          </VCardActions>
        </VForm>
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
