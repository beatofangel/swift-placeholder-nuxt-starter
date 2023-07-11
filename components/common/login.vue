<template>
  <v-card class="d-flex flex-row align-self-center mx-auto" :width="width" :height="height" :min-height="minHeight"
    :min-width="minWidth">
    <v-card width="600" class="d-flex align-center rounded-r-0 word-cloud-container" flat>
    </v-card>
    <v-card width="400" class="rounded-l-0" flat>
      <v-card-title class="d-flex justify-center mt-8 text-h5">用户登录</v-card-title>
      <v-card-text>
        <v-form @submit.prevent.self="handleLogin">
          <v-row class="my-0">
            <v-col>
              <v-tabs v-model="tab" height="32" grow>
                <v-tab value="cellphone"><v-icon>mdi-cellphone</v-icon>验证码</v-tab>
                <v-tab value="email"><v-icon>mdi-email</v-icon>邮箱</v-tab>
                <v-tab value="account"><v-icon>mdi-account</v-icon>账号/密码</v-tab>
              </v-tabs>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-window v-model="tab">
                <v-window-item value="cellphone" class="pt-3">
                  <v-row>
                    <v-col>
                      <v-text-field label="手机号" v-model="formData.cellphone" density="comfortable" hint="※未注册手机验证后自动登录"
                        persistent-hint prepend-inner-icon="mdi-cellphone"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class="d-flex justify-space-between">
                      <!-- <v-otp-input length="6" dense> </v-otp-input> -->
                      <v-text-field label="验证码" name="smsCode" style="max-width: 240px;" class="mr-2"
                        density="comfortable" prepend-inner-icon="mdi-key-variant"></v-text-field>
                      <a href="#" v-if="countdown < 0" @click="getSmsCaptcha"
                        class="text-nowrap mx-auto my-auto">获取短信验证码</a>
                      <v-progress-circular v-else size="48" :rotate="0" :width="5" :model-value="progress"
                        :color="progressColor" class="mx-auto">
                        {{ countdown }}
                      </v-progress-circular>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-btn type="submit" color="primary" :disabled="!formData.agree" block>登录</v-btn>
                    </v-col>
                  </v-row>
                </v-window-item>
                <v-window-item value="email" class="pt-3">
                  <v-row>
                    <v-col>
                      <v-text-field label="邮箱" v-model="formData.email" density="comfortable" hint="※未注册邮箱验证后自动登录"
                        persistent-hint prepend-inner-icon="mdi-email"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-btn type="submit" color="primary" :disabled="!formData.agree" block>发送验证邮件</v-btn>
                    </v-col>
                  </v-row>
                </v-window-item>
                <v-window-item value="account" class="pt-3">
                  <v-row>
                    <v-col>
                      <v-text-field label="账号" v-model="formData.username" density="comfortable" hint="※未注册手机/邮箱验证后自动登录"
                        persistent-hint prepend-inner-icon="mdi-account"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-text-field label="密码" type="password" v-model="formData.password" density="comfortable"
                        prepend-inner-icon="mdi-lock"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-btn type="submit" color="primary" :disabled="!formData.agree" block>登录</v-btn>
                    </v-col>
                  </v-row>
                </v-window-item>
              </v-window>
            </v-col>
          </v-row>
        </v-form>
        <v-row class="my-4">
          <v-col class="mt-2 pr-0"><v-divider></v-divider></v-col>
          <v-col class="d-flex justify-center px-0 text-caption">授权登录</v-col>
          <v-col class="mt-2 pl-0"><v-divider></v-divider></v-col>
        </v-row>
        <v-row class="d-flex justify-center my-4">
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon="mdi-wechat" variant="text" density="compact" class="mx-4" size="large"
                color="green accent-4" disabled>
              </v-btn>
            </template>
            微信
          </v-tooltip>
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon="mdi-qqchat" variant="text" density="compact" class="mx-4" size="large"
                color="blue lighten-2" disabled>
              </v-btn>
            </template>
            QQ
          </v-tooltip>
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon="mdi-sina-weibo" variant="text" density="compact" class="mx-4" size="large"
                color="deep-orange darken-4" @click="handleLoginWithWeibo">
              </v-btn>
            </template>
            微博
          </v-tooltip>
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon="mdi-github" variant="text" density="compact" class="mx-4" size="large"
                color="black" @click="handleLoginWithGithub">
              </v-btn>
            </template>
            github
          </v-tooltip>
        </v-row>
        <v-row dense>
          <v-col class="d-flex justify-center text-caption">
            <v-checkbox color="primary" true-icon="mdi-checkbox-outline" hide-details :ripple="false"
              v-model="formData.agree" density="compact">
              <template v-slot:label>
                <div class="agree-eula-and-privacy-policy">
                  我同意
                  <a class="text-primary">《最终用户许可协议》<span class="text-red">*</span></a>
                  及
                  <a class="text-primary">《隐私条款》<span class="text-red">**</span></a>
                </div>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col class="ml-6">
            <div class="agree-eula-and-privacy-policy"><span class="text-red pr-1">*&ensp;</span><a href="#"
                class="text-primary">《最终用户许可协议》<v-icon size="16">mdi-open-in-new</v-icon></a></div>
            <div class="agree-eula-and-privacy-policy"><span class="text-red pr-1">**</span><a href="#"
                class="text-primary">《隐私条款》<v-icon size="16">mdi-open-in-new</v-icon></a></div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-card>
</template>

<script>
import * as d3 from "d3";
import cloud from "d3-cloud";
export default {
  props: {
    width: {
      type: [String, Number],
      default: "100%",
    },
    height: {
      type: [String, Number],
      default: "100%",
    },
    minHeight: {
      type: [String, Number],
      default: 550,
    },
    minWidth: {
      tpe: [String, Number],
      default: 800,
    },
    words: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    progress() {
      // return Math.floor((60 - this.countdown) * 100 / 60);
      return Math.floor(this.countdown * 100 / 60);
    },
    progressColor() {
      return `${this.countdown > 30
        ? "primary"
        : this.countdown > 10
          ? "warning"
          : "error"
        }`;
    },
  },
  mounted() {
    const noData = this.words.length == 0
    // this.getWordCloud(noData)
    // this.timer = setInterval(() => { this.getWordCloud(noData) }, 10000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    async handleLoginWithGithub() {
      const { getCsrfToken } = useAuth()
      const { loginCallbackUrl } = useRuntimeConfig().public
      return await useAuth().signIn('github', { csrfToken: await getCsrfToken(), callbackUrl: useRoute().redirectedFrom?.fullPath || loginCallbackUrl }).then((value) => {
        console.log(value)
      })
    },
    async handleLoginWithWeibo() {
      return await useAuth().signIn('weibo').then((value) => {
        console.log(value)
      })
    },
    async handleLoginWithSmsCaptcha() {
      // TODO
    },
    async handleLoginWithEmail() {
      const { getCsrfToken } = useAuth()
      await useAuth().signIn('email', { csrfToken: await getCsrfToken(), email: this.formData.email })
    },
    async handleLoginWithCredentials() {
      return await useAuth().signIn('credentials', { username: this.formData.username, password: this.formData.password }).then(() => {
        clearInterval(this.timer)
      })
    },
    handleLogin() {
      switch (this.tab) {
        case 'cellphone':
          this.handleLoginWithSmsCaptcha()
          break;
        case 'email':
          this.handleLoginWithEmail()
          break;
        case 'account':
          this.handleLoginWithCredentials()
      }
    },
    async getWordCloud(noData = true) {
      if (noData) {
        const site = ['https://tenapi.cn/resou/', 'https://tenapi.cn/douyinresou/', 'https://tenapi.cn/baiduhot/'][~~(Math.random() * 3)]
        console.log(site)
        const { data, error } = await useFetch(site) // TODO 使用ipc请求数据，避免cors问题
        if (!error.value && data.value) {
          const data2 = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
          const newList = data2.list.normalize('hot', [10, 40])
          console.log(newList)
          this.myWords = newList.map(e => {
            return { text: e.name, size: e.hot }
          })
        }
      } else {
        this.myWords = this.words.slice()
      }
      this.layout = cloud()
        .size([this.wordCloudCanvasWidth, this.wordCloudCanvasHeight])
        .words(this.myWords)
        .padding(5)
        .rotate(function () {
          // return ~~(Math.random() * 2) * 90;
          return (~~(Math.random() * 13) - 6) * 10
        })
        .font("Impact")
        .fontSize(function (d) {
          return d.size;
        })
        .on("end", this.draw);

      // this.layout.canvas()().getContext("2d", {
      //   willReadFrequently: true,
      // })
      this.fill = d3.scaleOrdinal(d3.schemeCategory10)
      this.layout.start()
    },
    getSmsCaptcha() {
      // send request
      this.countdown = 60;
      const t = setInterval(() => {
        this.countdown -= 1;
        if (this.countdown < 0) {
          clearInterval(t);
          return;
        }
      }, 1000);
    },
    draw(words) {
      let randomColor = (d, i) => this.fill(i)
      d3.select(".word-cloud-container>svg").remove()
      d3.select(".word-cloud-container")
        .append("svg")
        .attr("width", this.layout.size()[0])
        .attr("height", this.layout.size()[1])
        .append("g")
        .attr('transform', `translate(${this.wordCloudCanvasWidth / 2},${this.wordCloudCanvasHeight / 2})`)
        .attr(
          "transform",
          "translate(" + this.layout.size()[0] / 2 + "," + this.layout.size()[1] / 2 + ")"
        )
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", function (d) {
          return d.size + "px";
        })
        .style("font-family", "Impact")
        .style("fill", randomColor)
        .attr('text-anchor', 'middle')
        .attr('transform', d => {
          return `translate(${[d.x, d.y]})rotate(${d.rotate})`
        })
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function (d) {
          return d.text;
        });
    },
  },
  data() {
    return {
      formData: {
        cellphone: null,
        smsCaptcha: null,
        email: null,
        username: null,
        password: null,
        agree: true,
      },
      tab: null,
      // tab: 'email',
      countdown: -1,
      layout: null,
      timer: null,
      myWords: [],
      fill: null,
      wordCloudCanvasWidth: 600,
      wordCloudCanvasHeight: 500,
    };
  },
};
</script>

<style scoped>
.agree-eula-and-privacy-policy {
  font-size: 12px;
}

.agree-eula-and-privacy-policy.v-icon::after {
  background-color: transparent !important;
}</style>
