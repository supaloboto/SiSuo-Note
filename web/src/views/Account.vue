<!--
 - 账户页面 提供登录/注册功能
 -
 - @author 刘志栋
 - @since 2024/08/13
 -->
<script setup lang="ts">
import * as accountApi from '@/assets/api/account'

const login = () => {
  accountApi.login({
    account: 'admin',
    password: 'adminPasswd'
  }).then(res => {
    console.log('login success', res)
  })
}
</script>

<template>
  <div>
    <button @click="login">Login</button>
  </div>
</template>

<style scoped lang="scss">

</style>
