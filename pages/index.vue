<template>
  <v-container class="fill-height" fluid>
    <v-card class="mx-auto" color="transparent" flat width="100%">
      <v-card-text>
        <v-row>
          <v-col>
            <div class="text-xl-h1 text-lg-h2 text-md-h2 text-h3 d-flex justify-center text-grey-lighten-5">Welcome to Lawyer Pioneer!</div>
          </v-col>
        </v-row>
        <v-row style="height: 50px;">
          <v-col>
            <v-spacer></v-spacer>
          </v-col>
        </v-row>
        <v-row v-if="status === 'unauthenticated'">
          <v-col class="d-flex justify-center">
            <v-btn class="mx-6" size="large" color="success">注&nbsp;册</v-btn>
            <v-btn class="mx-6" size="large" @click="navigateTo('/login')">登&nbsp;录</v-btn>
          </v-col>
        </v-row>
        <v-row style="height: 50px;">
          <v-col>
            <v-spacer></v-spacer>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
  <CommonFooter></CommonFooter>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false,
  icon: 'mdi-home',
  index: -1
})

const { status } = useAuth()
</script>

<style scoped>
.v-container::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100dvw;
  height: 100dvh;
  filter: blur(4px);
  background-image: url("/background-2.jpg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
