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
import * as tus from 'tus-js-client'
import { Result } from 'server/utils/http';

const props = withDefaults(defineProps<{ bcId?: string, id?: string, name?: string, path?: string, ordinal?: number, version?: number, title?: string, mode: number }>(), {
  mode: EditMode.Create
})
const originName = props.name
const nameDuplicationCheck = debounce(async (name: string, resolve: any) => {
  // if (!isEmpty(name)) {
    const { data } = await useFetch("/api/v1/templates/count", { query: { name: { equals: name } } })
    const isValid = data.value == 0
    console.log('duplication', name, isValid)
  // }
  resolve(isValid)
  // return isValid
}, 500, { leading: false })
const formData = ref({
  name: props.name || '',
  file: [] as File[],
  version: props.version
})
const { defineComponentBinds, handleSubmit, handleReset } = useForm({
  validationSchema: yup.object({
    name: yup.string().label('名称').required().test('duplication',
      '${label} 已存在', function(value) {
        console.log(value)
        if (isEmpty(value) || originName === value) return true
        return new Promise(resolve => nameDuplicationCheck(value, resolve))
      }),
    file: yup.mixed().label('文档').test('documentRequired', yup.defaultLocale.mixed?.required!, (value: any) => !!props.id || value.length > 0).test('fileSize', '文件大小不能超过5M', (value: any) => value.length == 0 || value[0].size <= 5242880) // 5M
  }),
  initialValues: {
    name: formData.value.name,
    file: formData.value.file
  },
  validateOnMount: false,
  keepValuesOnUnmount: true
})
const name = useField('name')
const file = useField<File[]>('file')
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
const onSubmit = handleSubmit((values, ctx) => {
  console.log('ok', values)
  processing.value.submit = true

  // this.axios.post(`api/upload/submit/${largeFileGuid}`).then(response=>{
  //   this.$toast.success(`文件保存：成功！`)
  //   console.log(response)
  // }).catch(error=>{
  //   this.$toast.error(error.response.data.message)
  // }).finally(() => {
  //   procState.value.submit = false
  // })

}, ({ errors }) => {
  console.log('error', errors)
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
    bcId: props.bcId,
    id: props.id,
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
