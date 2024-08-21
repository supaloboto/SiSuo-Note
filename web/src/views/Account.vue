<!--
 - 账户页面 提供登录/注册功能
 -
 - @author 刘志栋
 - @since 2024/08/13
 -->
<script setup lang="ts">
import * as accountApi from '@/assets/api/account'
import { ref } from 'vue';
import i18n from "@/assets/lang";
import { md5 } from 'js-md5';
import { useGlobalStore } from '@/stores/global';
import router from '@/router';

const $t = i18n.global.t;
const globalStore = useGlobalStore();
// 页面状态
const mode = ref('login');

/**
 * 密码加密方法
 * @param password 密码
 */
const passwdEncrypt = (password: string) => {
  return md5(password);
}

// todo 有token时验证身份 跳过登录页

// 登录表单
const loginForm = ref({
  account: '',
  password: ''
});
/**
 * 登录方法
 */
const login = () => {
  const { account, password } = loginForm.value;
  accountApi.login({
    account,
    password: passwdEncrypt(password)
  }).then(res => {
    // 记录用户信息
    globalStore.user.id = res.userId;
    globalStore.user.account = res.account;
    globalStore.user.name = res.username;
    globalStore.user.token = res.token;
    // 跳转到文件列表页
    router.push({ path: '/filemanage' });
  });
}

// 注册表单
const registerForm = ref({
  account: '',
  username: '',
  password: '',
  confirmPassword: ''
});
/**
 * 注册方法
 */
const register = () => {
  const { account, username, password } = registerForm.value;
  accountApi.register({
    account,
    username,
    password: passwdEncrypt(password)
  }).then(res => {
    console.log('register success', res);
  });
}

</script>

<template>
  <div>
    <!-- 登录 -->
    <div class="login-div" v-if="mode === 'login'">
      <input v-model="loginForm.account" :placeholder="`${$t('account.phone')}/${$t('account.email')}`" />
      <input v-model="loginForm.password" :placeholder="$t('account.password')" />
      <button @click="login">{{ $t('account.login') }}</button>
      <button @click="mode = 'register'">{{ $t('account.register') }}</button>
    </div>
    <!-- 注册 -->
    <div class="register-div" v-else-if="mode === 'register'">
      <input v-model="registerForm.account" :placeholder="`${$t('account.phone')}/${$t('account.email')}`" />
      <input v-model="registerForm.username" :placeholder="$t('account.username')" />
      <input v-model="registerForm.password" :placeholder="$t('account.password')" />
      <input v-model="registerForm.confirmPassword" :placeholder="$t('account.confirmPassword')" />
      <button @click="register">{{ $t('account.register') }}</button>
    </div>
    <!-- todo 密码找回 -->
    <div class="forget-password-div" v-else-if="mode === 'forget-password'">
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-div,
.register-div,
.forget-password-div {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

button:active {
  background-color: #004080;
}

button:focus {
  outline: none;
}

div {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  width: 80vw;
  background-color: #f5f5f5;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.input-field {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.button-container {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}

.button:hover {
  background-color: #0056b3;
}

.button:active {
  background-color: #004080;
}

.button:focus {
  outline: none;
}

</style>