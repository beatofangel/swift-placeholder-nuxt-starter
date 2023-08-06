<template>
  <v-card>
    <v-toolbar class="pl-4 pr-1" color="primary">
      <v-icon start>{{ editIcon }}</v-icon>
      <span class="text-h5 ml-1 mt-1">{{ editTitle }}</span>
      <v-spacer></v-spacer>
      <v-hover v-slot:default="{ isHovering, props }">
        <v-btn v-bind="props" @click="onCancel" icon="mdi-close" density="comfortable" :color="isHovering ? 'red-lighten-2' : 'accent'">
        </v-btn>
      </v-hover>
    </v-toolbar>
    <v-form @submit.prevent="onSave">
      <v-card flat tile>
        <v-card-text>
          <v-row>
            <v-col>
              <v-tabs v-model="isUploadNewDoc.value.value" height="32" grow>
                <v-tab :value="true"><v-icon>mdi-file-upload</v-icon>上传模板</v-tab>
                <v-tab :value="false"><v-icon>mdi-file-link</v-icon>引用模板</v-tab>
              </v-tabs>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-window v-model="isUploadNewDoc.value.value">
                <v-window-item :value="true" class="pt-3">
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
                      <v-file-input
                        v-model="file.value.value"
                        label="文档"
                        :error-messages="file.errorMessage.value"
                        name="file"
                        accept=".docx"
                        placeholder="请选择文件"
                        @update:model-value="uploadHandler"
                        persistent-placeholder
                        prepend-icon=""
                        :prepend-inner-icon="$vuetify.icons.aliases?.file"
                      >
                        <template v-slot:loader>
                          <v-progress-linear v-if="0 < uploadProgress && uploadProgress < 100" v-model="uploadProgress" color="primary" height="10" striped>
                            <template v-slot:default="{ value }">
                              <strong>{{ Math.ceil(value) }}%</strong>
                            </template>
                          </v-progress-linear>
                        </template>
                        <template v-slot:append v-if="0 < uploadProgress && uploadProgress < 100">
                          <v-btn variant="text" density="comfortable" @click="pauseOrResumeUpload" :icon="processing.uploadPause ? 'mdi-play' : 'mdi-pause'" :color="processing.uploadPause ? 'success' : 'warning'">
                          </v-btn>
                          <v-btn variant="text" density="comfortable" @click="stopUpload" color="error" icon="mdi-trash-can">
                          </v-btn>
                        </template>
                      </v-file-input>
                    </v-col>
                  </v-row>
                </v-window-item>
                <v-window-item :value="false" class="pt-3">
                  <v-row>
                    <v-col>
                      <v-select
                        v-model="(refTplId.value.value as any)"
                        aria-autocomplete="none"
                        name="refTplId"
                        label="引用模板"
                        item-title="name"
                        item-value="id"
                        placeholder="请选择模板"
                        persistent-placeholder
                        :error-messages="refTplId.errorMessage.value"
                        :items="tplInUseItems"
                      >
                        <template v-slot:item="{ item, index, props }">
                          <v-list-item v-bind="props" :key="index">
                            <v-list-item-subtitle>
                              <span class="mr-1">已关联</span>
                              <v-chip v-for="(bcTplRel, index) in item.raw.businessCategories.slice(0,3)" :key="index" size="small" class="mx-1" label color="orange">
                                <v-icon start :icon="bcTplRel.businessCategory.icon"></v-icon>{{ bcTplRel.businessCategory.name }}
                              </v-chip>
                              <span class="ml-1" v-if="item.raw.businessCategories.length > 3">等 {{ item.raw.businessCategories.length }} 种业务</span>
                            </v-list-item-subtitle>
                          </v-list-item>
                        </template>
                      </v-select>
                    </v-col>
                  </v-row>
                </v-window-item>
              </v-window>
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
            :disabled="!isDirty"
            >确定</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { Item } from '@/components/common/list'
import * as yup from 'yup';
import { debounce, isEmpty } from 'lodash-es';
import * as tus from 'tus-js-client'
import { Template } from 'index';

const props = withDefaults(defineProps<{ bcId?: string, id?: string, name?: string, path?: string, ordinal?: number, version?: number, title?: string, mode: number }>(), {
  mode: EditMode.Create
})
const originName = props.name
const tplInUseItems = ref([] as Template[])
const uploadNewDoc = ref(true)
onMounted(() => {
  $fetch("/api/v1/templates", { query:
    {
      select: {
        id: true,
        name: true,
        path: true,
        businessCategories: {
          include: {
            businessCategory: {
              select: {
                name: true,
                icon: true
              }
            }
          }
        }
      },
      where: {
        businessCategories: {
          every: {
            bcId: {
              not: props.bcId
            }
          }
        }
      }
    }
  }).then((data) => {
    tplInUseItems.value = data as []
  })
})
const nameDuplicationCheck = debounce(async (name: string, resolve: any) => {
  // if (!isEmpty(name)) {
    const { data } = await useFetch("/api/v1/templates/count", { query: { name: { equals: name } } })
    const isValid = data.value == 0
    console.log('duplication', name, isValid)
  // }
  resolve(isValid)
  // return isValid
}, 500, { leading: false })
const formTplName = ref(props.name)
const formRefTplId = ref<string>()
const formTplFile = ref<File[]>([])
const { defineComponentBinds, handleSubmit, handleReset } = useForm({
  validationSchema: yup.object({
    name: yup.string().label('名称').when('isUploadNewDoc', {
      is: true,
      then(schema) {
        return schema.required().test('duplication',
          '${label} 已存在', function(value) {
            console.log(value)
            if (isEmpty(value) || originName === value) return true
            return new Promise(resolve => nameDuplicationCheck(value, resolve))
          }
        )
      }
    }),
    isUploadNewDoc: yup.boolean(),
    file: yup.mixed().label('文档').when('isUploadNewDoc', {
      is: true,
      then(schema) {
        return schema.test('documentRequired', yup.defaultLocale.mixed?.required!, (value: any) => !!props.id || value.length > 0)
          .test('fileSize', '文件大小不能超过5M', (value: any) => value.length == 0 || value[0].size <= 5242880)
      }
    }),
    refTplId: yup.string().label('引用模板').when('isUploadNewDoc', {
      is: false,
      then(schema) {
        return schema.required()
      }
    })
  }),
  initialValues: {
    name: formTplName.value,
    refTplId: formRefTplId.value,
    file: formTplFile.value,
    isUploadNewDoc: uploadNewDoc.value
  },
  validateOnMount: false,
  keepValuesOnUnmount: true
})
const name = useField('name')
const refTplId = useField('refTplId')
const file = useField<File[]>('file')
const isUploadNewDoc = useField('isUploadNewDoc')
// 必须置于useForm之后
// const isDirty = useIsFormDirty()
const isTplNameDirty = useIsFieldDirty('name')
const isRefTplIdDirty = useIsFieldDirty('refTplId')
const isTplFileDirty = useIsFieldDirty('file')
const isDirty = computed(() => {
  return isUploadNewDoc.value.value ? isTplNameDirty.value || isTplFileDirty.value : isRefTplIdDirty.value
})
// watch(() => isUploadNewDoc.value.value, (val) => {
//   // val ? resetField('file') : resetField('refTplId')
//   resetForm()
// })
// copy filename if name is empty
watch(() => file.value.value, (val) => {
  if (isEmpty(name.value.value) && val.length > 0) {
    const extIdx = val[0].name.lastIndexOf('.')
    name.value.value = extIdx != -1 ? val[0].name.substring(0, extIdx) : val[0].name
  }
}, {
  deep: true
})
const processing = ref({
  upload: false,
  uploadPause: false,
  submit: false
})
const largeFile = ref()
const uploadProgress = ref(0)
const uploadFilename = ref()
const largeFileGuid = ref()

const upload = ref({} as tus.Upload)
const uploadHandler = (files?: File[]) => {
  if (!files || files.length == 0) return
  processing.value.upload = true
  uploadProgress.value = 0
  uploadFilename.value = files[0].name
  // TODO after deploying to server with ssl, it should be removed.
  const headers = useRequestHeaders(['x-forwarded-proto'])
  headers['x-forwarded-proto'] = 'http'

  upload.value = new tus.Upload(files[0], {
    // https://nuxt.com/docs/api/composables/use-request-headers
    // headers: useRequestHeaders(['Authorization']),
    headers: headers,
    // Endpoint is the upload creation URL from your tus server
    endpoint: "/api/upload",
    // Retry delays will enable tus-js-client to automatically retry on errors
    retryDelays: [],
    // retryDelays: [0, 3000, 5000, 10000, 20000],
    removeFingerprintOnSuccess: true,
    // Attach additional meta data about the file for the server
    metadata: {
      filename: files[0].name,
      filetype: files[0].type
    },
    // onShouldRetry: function (err, retryAttempt, options) {
    onShouldRetry: function (err, retryAttempt, options) {

      var status = (err as tus.DetailedError).originalResponse ? (err as tus.DetailedError).originalResponse.getStatus() : 0
      // Do not retry if the status is a 403|500.
      switch(status) {
        case 403:
        case 500:
          return false
        default:
      }

      // For any other status code, we retry.
      return true
    },
    // Callback for errors which cannot be fixed using retries
    onError: function(error) {
      processing.value.upload = false
      console.error(error.message)
      stopUpload()
      console.log("Failed because: " + error)
    },
    // Callback for reporting upload progress
    onProgress: function(bytesUploaded, bytesTotal) {
      var percentage = (bytesUploaded / bytesTotal * 100).toFixed(1)
      uploadProgress.value = Number.parseInt(percentage)
      console.log(bytesUploaded, bytesTotal, percentage + "%")
    },
    // Callback for once the upload is completed
    onSuccess: function() {
      processing.value.upload = false
      if (upload.value.url) {
        const idx = upload.value.url.lastIndexOf('/')
        largeFileGuid.value = upload.value.url.substring(idx + 1)
        console.log("Download %s from %s", (upload.value.file as File).name, upload.value.url)
      }
    }
  })

  upload.value.findPreviousUploads().then((previousUploads) => {
    var chosenUpload = askToResumeUpload(previousUploads);
    if(chosenUpload) {
      upload.value.resumeFromPreviousUpload(chosenUpload);
    }
    // Start the upload
    upload.value.start()
  })
}
const pauseOrResumeUpload = () => {
  if (!upload.value) return
  processing.value.uploadPause ? upload.value.start() : upload.value.abort()
  processing.value.uploadPause = !processing.value.uploadPause
}
const stopUpload = () => {
  if (!upload.value) return
  upload.value.abort(true).then(() => {
    // self.$refs.largeFileUpload.reset()
    file.resetField()
    largeFile.value = null
    uploadProgress.value = 0
    processing.value.uploadPause = false
    processing.value.upload = false
    // handleReset()
  })
}
// TODO switch to useDialog()
const askToResumeUpload = (previousUploads: tus.PreviousUpload[]) => {
  if (previousUploads.length === 0) return null;

  let text = "You tried to upload this file previously at these times:\n\n";
  previousUploads.forEach((previousUpload, index) => {
    text += "[" + index + "] " + previousUpload.creationTime + "\n";
  });
  text += "\nEnter the corresponding number to resume an upload or press Cancel to start a new upload";

  // let answer = prompt(text);
  // var index = parseInt(answer, 10);

  // if (!isNaN(index) && previousUploads[index]) {
  //   return previousUploads[index];
  // }
}
// const onSubmit = handleSubmit((values, ctx) => {
//   console.log('ok', values)
//   processing.value.submit = true

//   // this.axios.post(`api/upload/submit/${largeFileGuid}`).then(response=>{
//   //   this.$toast.success(`文件保存：成功！`)
//   //   console.log(response)
//   // }).catch(error=>{
//   //   this.$toast.error(error.response.data.message)
//   // }).finally(() => {
//   //   procState.value.submit = false
//   // })

// }, ({ errors }) => {
//   console.log('error', errors)
// })


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
    bcId: props.bcId,
    // 更新时，保留旧id，通过newId判断是否是切换引用模板的情况
    id: props.mode === EditMode.Update ? props.id : values.isUploadNewDoc ? props.id : values.refTplId,
    newId: values.refTplId,
    name: values.name,
    path: values.file.length > 0 ? upload.value.url : null,
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
