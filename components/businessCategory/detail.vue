<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <v-icon>{{ isEdit ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
      <span class="text-h5 ml-1 mt-1">{{ `${isEdit ? '编辑' : '新增'}${title}` }}</span>
      <v-spacer></v-spacer>
      <v-btn @click="onCancel" fab plain small>
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <validation-observer ref="observer" v-slot="{ invalid }">
      <v-form @submit.prevent="onSave">
        <v-card flat tile>
          <v-card-text>
            <!-- <v-row>
              <v-col>
                <v-text-field
                  disabled
                  v-model="formData.id"
                  label="ID"
                  persistent-placeholder
                  outlined
                >
                </v-text-field>
              </v-col>
            </v-row> -->
            <v-row>
              <v-col>
                <validation-provider
                  name="名称"
                  :rules="rules.name"
                  v-slot="{ errors }"
                >
                  <v-text-field
                    v-model="formData.name"
                    label="名称"
                    :placeholder="`请输入${title}名称`"
                    :error-messages="errors[0]"
                    persistent-placeholder
                    outlined
                  >
                  </v-text-field>
                </validation-provider>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <validation-provider
                  name="图标"
                  :rules="rules.icon"
                  v-slot="{ errors }"
                >
                  <v-icon-picker
                    v-model="formData.icon"
                    prefix="mdi-"
                    label="图标"
                    placeholder="请输入图标名称"
                    :error-messages="errors[0]"
                    persistent-placeholder
                    outlined
                  ></v-icon-picker>
                </validation-provider>
              </v-col>
            </v-row>
            <v-row v-if="!isEdit">
              <v-col>
                <validation-provider
                  name="模板"
                  :rules="rules.templates"
                  v-slot="{ errors }"
                >
                  <v-select
                    v-model="templates"
                    :items="candidateTemplates"
                    multiple
                    menu-props="offsetY"
                    label="模板 *仅列出无主模板以供选择，无主模板通常在删除既有业务类型时产生。"
                    placeholder="请选择模板"
                    :error-messages="errors[0]"
                    persistent-placeholder
                    outlined
                  >
                    <template v-slot:selection="{ item }">
                      <v-chip label>{{ item.text }}</v-chip>
                    </template>
                    <template v-slot:prepend-item>
                      <v-list-item
                        ripple
                        @mousedown.prevent
                        @click="toggle"
                      >
                        <v-list-item-action>
                          <v-icon :color="templates.length > 0 ? 'primary' : ''">
                            {{ selectAllIcon }}
                          </v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                          全选
                        </v-list-item-content>
                      </v-list-item>
                      <v-divider class="mt-2"></v-divider>
                    </template>
                  </v-select>
                </validation-provider>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="px-4">
            <v-spacer></v-spacer>
            <v-btn @click="onCancel" text>取消</v-btn>
            <v-btn
              type="submit"
              :loading="processing.submit"
              :disabled="invalid"
              color="primary"
              >确定</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-form>
    </validation-observer>
  </v-card>
</template>

<script>
import VIconPicker from '../VIconPicker.vue'
export default {
  components: { VIconPicker },
  props: {
    id: String,
    pid: String,
    name: String,
    icon: String,
    ordinal: Number,
    title: String,
    isEdit: Boolean,
    visible: Boolean
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        this.$set(this.formData, 'id', val)
      }
    },
    pid: {
      immediate: true,
      handler(val) {
        this.$set(this.formData, 'pid', val)
      }
    },
    name: {
      immediate: true,
      handler(val) {
        this.$set(this.formData, 'name', val)
      }
    },
    icon: {
      immediate: true,
      handler(val) {
        this.$set(this.formData, 'icon', val ? val.substring(4) : null)
      }
    },
    ordinal: {
      immediate: true,
      handler(val) {
        this.$set(this.formData, 'ordinal', val)
      }
    },
    visible: {
      immediate: true,
      handler(val) {
        val || this.$refs.observer.reset()
        if (!this.isEdit && val) {
          console.log('findOwnerlessTemplate')
          window.replaceService.findOwnerlessTemplate().then(data => {
            this.candidateTemplates = data
          })
        }
      }
    }
  },
  computed: {
    // formData: {
    //   get() {
    //     return {
    //       id: this.id,
    //       name: this.name,
    //       icon: this.icon ? this.icon.substring(4) : null,
    //       ordinal: this.ordinal,
    //       templates: []
    //     }
    //   },
    //   // set(newVal) {
    //   //   this.$emit('input', newVal.id)
    //   //   this.$emit('input', newVal.name)
    //   //   this.$emit('input', newVal.icon)
    //   //   this.$emit('input', newVal.ordinal)
    //   // }
    // },
    selectAllIcon () {
      if (this.templates.length > 0 && this.templates.length == this.candidateTemplates.length) return 'mdi-close-box'
      if (this.templates.length > 0 && this.templates.length < this.candidateTemplates.length) return 'mdi-minus-box'
      return 'mdi-checkbox-blank-outline'
    }
  },
  methods: {
    onCancel() {
      this.$emit('cancel', false)
    },
    onSave() {
      this.$emit('save', {
        id: this.formData.id,
        pid: this.formData.pid,
        name: this.formData.name,
        icon: `mdi-${this.formData.icon}`,
        ordinal: this.formData.ordinal,
        templates: this.templates,
        insert: !this.isEdit,
      })
    },
    toggle() {
      this.$nextTick(() => {
        if (this.templates.length > 0 && this.templates.length == this.candidateTemplates.length) {
          this.templates.splice(0)
        } else {
          this.templates = this.candidateTemplates.slice()
        }
      })
    }
  },
  data() {
    return {
      rules: {
        name: { requiredInput: true },
        icon: { requiredInput: true },
        templates: { required: false }
      },
      processing: {
        submit: false
      },
      candidateTemplates: [],
      formData: {},
      templates: []
    }
  }
}
</script>

<style>

</style>
