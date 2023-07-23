<template>
  <v-card>
    <v-toolbar class="pl-4" color="primary">
      <v-icon>{{ isEdit ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
      <span class="text-h5 ml-1 mt-1">{{ `${isEdit ? '编辑' : '新建'} - ${title}` }}</span>
      <v-spacer></v-spacer>
      <v-btn @click="onCancel" icon size="small">
        <v-icon color="error">mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-form @submit.prevent="onSave">
      <v-card flat tile>
        <v-card-text>
          <v-row>
            <v-col>
                <v-text-field
                  v-model="name.value.value"
                  name="name"
                  label="名称"
                  :placeholder="`请输入${title}名称`"
                  persistent-placeholder
                  :error-messages="name.errorMessage.value"
                >
                </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-icon-picker
                v-model="(icon.value.value as string)"
                name="icon"
                prefix="mdi-"
                label="图标"
                placeholder="请输入图标名称"
                persistent-placeholder
                  :error-messages="icon.errorMessage.value"
              ></v-icon-picker>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-4">
          <v-spacer></v-spacer>
          <v-btn @click="onCancel" variant="text">取消</v-btn>
          <v-btn
            type="submit"
            :loading="processing.submit"
            color="primary"
            variant="elevated"
            >确定</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import VIconPicker from '../VIconPicker.vue'
import { Item } from 'components/common/table'
import * as yup from 'yup';
const props = defineProps({
  id: String,
  name: String,
  icon: String,
  ordinal: Number,
  title: String,
  version: Number,
  isEdit: Boolean,
})
const { defineComponentBinds, handleSubmit } = useForm({
  validationSchema: yup.object({
    name: yup.string().required(),
    icon: yup.string().required()
  })
})
const formData = ref({
  name: props.name || '',
  icon: props.icon ? props.icon.substring(4) : '',
  version: props.version
})
const name = useField('name', undefined, { initialValue: formData.value.name })
const icon = useField('icon', undefined, { initialValue: formData.value.icon })
const processing = ref({
  submit: false
})
const isEdit = ref(props.isEdit ?? false)
const emits = defineEmits({
  'save': (item: Item) => true,
  'cancel': (val: boolean) => true,
  // "update:modelValue": (val: boolean) => true,
})
const onSave = handleSubmit((values, ctx) => {
  console.log(values, ctx)
  emits('save', {
    // id: this.formData.id,
    // pid: this.formData.pid,
    name: values.name,
    icon: `mdi-${values.icon}`,
    // ordinal: this.formData.ordinal,
    insert: !isEdit.value,
  } as Item)
}, (ctx) => {
  console.log(ctx.errors)
})
const onCancel = () => {
  // emits('update:modelValue', false)
  emits('cancel', false)
}
</script>

<style>

</style>
