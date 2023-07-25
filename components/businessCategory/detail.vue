<template>
  <v-card>
    <v-toolbar class="pl-4" color="primary">
      <v-icon>{{ editIcon }}</v-icon>
      <span class="text-h5 ml-1 mt-1">{{ editTitle }}</span>
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
// import type { BusinessCategory } from '@prisma/client';
import VIconPicker from '../VIconPicker.vue'
import { Item } from '@/components/common/table'
import * as yup from 'yup';

// const props = withDefaults(defineProps<Pick<BusinessCategory, 'id' | 'pid' | 'name' | 'icon' | 'ordinal' | 'version'> & { id: string, pid: string | null, name: string, icon: string | null, ordinal: number, version: number, title: string | null, mode: EditMode }>(), {
//   mode: EditMode.Create
// })
const props = withDefaults(defineProps<{ id?: string, pid?: string, name?: string, icon?: string, ordinal?: number, version?: number, title?: string, mode: number }>(), {
  mode: EditMode.Create
})
// const props = defineProps({
//   pid: String,
//   id: String,
//   name: String,
//   icon: String,
//   ordinal: Number,
//   title: String,
//   version: Number,
//   mode: Number
// })
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
const editIcon = computed(() => {
  return props.mode == EditMode.Create ?
    'mdi-plus' :
    props.mode == EditMode.Update ?
      'mdi-pencil' :
      Error('Unexpected edit mode!')
})
const editTitle = computed(() => {
  return props.mode == EditMode.Create ?
    `新建 - ${props.title}` :
    props.mode == EditMode.Update ?
      `编辑 - ${props.title}` :
      Error('Unexpected edit mode!')
})
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
    pid: props.pid,
    id: props.id,
    name: values.name,
    icon: `mdi-${values.icon}`,
    ordinal: props.ordinal ?? 0,
    version: props.version,
    mode: props.mode
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
