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
                  aria-autocomplete="none"
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
              <v-text-field name="path" v-model="path.value.value" :error-messages="file.errorMessage.value"></v-text-field>
              <v-file-input label="文档" name="file" accept=".docx" placeholder="请选择文件" persistent-placeholder></v-file-input>
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
import { Item } from '@/components/common/table'
import * as yup from 'yup';
import { debounce, isEmpty } from 'lodash-es';

const props = withDefaults(defineProps<{ id?: string, name?: string, path?: string, ordinal?: number, version?: number, title?: string, mode: number }>(), {
  mode: EditMode.Create
})
const nameDuplicationCheck = debounce(async (name: string, resolve: any) => {
  // if (!isEmpty(name)) {
    const { data } = await useFetch("/api/templates", { query: { count: true, name } })
    const isValid = data.value == 0
    console.log('duplication', name, isValid)
  // }
  resolve(isValid)
  // return isValid
}, 500, { leading: false })
const formData = ref({
  name: props.name || '',
  path: props.path || '',
  file: [] as File[],
  version: props.version
})
const { defineComponentBinds, handleSubmit } = useForm({
  validationSchema: yup.object().shape({
    name: yup.string().label('名称').required().test('duplication',
      '${label} 已存在', function(value) {
        if (isEmpty(value)) return true
        return new Promise(resolve => nameDuplicationCheck(value, resolve))
      }),
    file: yup.mixed().label('文档').required().test('fileSize', "File Size is too large", (value: any) => value[0].size <= 4096)
  }),
  initialValues: {
    name: formData.value.name,
    path: formData.value.path,
    file: formData.value.file
  },
  validateOnMount: false
})
const name = useField('name')
const path = useField('path')
const file = useField('file')
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
    id: props.id,
    name: values.name,
    path: values.path,
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
