<!--
 - 账户页面 提供登录/注册功能
 -
 - @author 刘志栋
 - @since 2024/08/13
 -->
<script setup lang="ts">
  import * as accountApi from '@/assets/api/account'
  import { computed, ref, watch } from 'vue';
  import i18n from "@/assets/lang";
  import { md5 } from 'js-md5';
  import { useGlobalStore } from '@/stores/global';
  import router from '@/router';
  import FormButton from '@/views/ui/form/FormButton.vue';
  import FormInput from '@/views/ui/form/FormInput.vue';

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

  // 登录表单
  const loginForm = ref({
    account: '',
    password: ''
  });
  const loginFormError = ref({
    account: '',
    password: ''
  });
  const canLogin = computed(() => {
    return loginForm.value.account
      && loginForm.value.password
      && !loginFormError.value.account
      && !loginFormError.value.password;
  });
  // 监听登录表单变化 当值改变时清空错误信息
  watch(loginForm, (value) => {
    loginFormError.value.account = '';
    loginFormError.value.password = '';
  }, { deep: true });

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
    }).catch(err => {
      if (err.errCode === 102) {
        loginFormError.value.account = $t('account.loginError');
      }
    });
  }

  // 注册表单
  const registerForm = ref({
    account: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const registerFormError = ref({
    account: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  // 监听注册表单变化 检查是否有错误
  watch(registerForm, (value) => {
    // 检查手机号/邮箱格式
    if (value.account && !/^[1][3,4,5,7,8][0-9]{9}$/.test(value.account)
      && !/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value.account)) {
      registerFormError.value.account = $t('account.accountFormatError');
    } else {
      registerFormError.value.account = '';
    }
    // 检查密码是否一致
    if (value.confirmPassword && value.password !== value.confirmPassword) {
      registerFormError.value.confirmPassword = $t('account.passwordNotMatch');
    } else {
      registerFormError.value.confirmPassword = '';
    }
  }, { deep: true });
  const canRegis = computed(() => {
    return registerForm.value.account
      && registerForm.value.username
      && registerForm.value.password
      && registerForm.value.confirmPassword
      && !registerFormError.value.account
      && !registerFormError.value.username
      && !registerFormError.value.password
      && !registerFormError.value.confirmPassword;
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
      // 注册成功后自动登录
      loginForm.value.account = account;
      loginForm.value.password = password;
      login();
    }).catch(err => {
      if (err.errCode === 101) {
        registerFormError.value.account = $t('account.accountExist');
      }
    });
  }

  /**
    * 返回登录页
    */
  const goBack = () => {
    // 清空注册表单
    registerForm.value = {
      account: '',
      username: '',
      password: '',
      confirmPassword: ''
    };
    mode.value = 'login';
  }

</script>

<template>
  <div class="account-page-background">
    <!-- 登录 -->
    <div class="container login-div" v-if="mode === 'login'">
      <FormInput class="form-input" v-model="loginForm.account" :errorMsg="loginFormError.account"
        :placeholder="`${$t('account.phone')}/${$t('account.email')}`" />
      <FormInput class="form-input" type="password" v-model="loginForm.password" :errorMsg="loginFormError.password"
        :placeholder="$t('account.password')" @keyup.enter="login" />
      <div class="button-container">
        <FormButton type="primary" @click="login" :disabled="!canLogin">{{ $t('account.login') }}</FormButton>
        <FormButton type="default" @click="mode = 'register'">{{ $t('account.register') }}</FormButton>
      </div>
    </div>
    <!-- 注册 -->
    <div class="container register-div" v-else-if="mode === 'register'">
      <FormInput class="form-input" v-model="registerForm.account" :errorMsg="registerFormError.account"
        :placeholder="`${$t('account.phone')}/${$t('account.email')}`" />
      <FormInput class="form-input" v-model="registerForm.username" :errorMsg="registerFormError.username"
        :placeholder="$t('account.username')" />
      <FormInput class="form-input" type="password" v-model="registerForm.password"
        :errorMsg="registerFormError.password" :placeholder="$t('account.password')" />
      <FormInput class="form-input" type="password" v-model="registerForm.confirmPassword"
        :errorMsg="registerFormError.confirmPassword" :placeholder="$t('account.confirmPassword')" />
      <div class="button-container">
        <FormButton type="default" @click="goBack">{{ $t('common.back') }}</FormButton>
        <FormButton type="primary" @click="register" :disabled="!canRegis">
          {{ $t('account.register') }} & {{ $t('account.login') }}
        </FormButton>
      </div>
    </div>
    <!-- todo 密码找回 -->
    <div class="container forget-password-div" v-else-if="mode === 'forget-password'">
    </div>
  </div>
</template>

<style scoped lang="scss">

  // 页面背景
  .account-page-background {
    display: flex;
    justify-content: center;
    height: 100%;
    width: 100%;
    background-color: var(--login-page-background-color);
  }

  // 登录/注册框
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 15vh;
    height: 40vh;
    min-height: 400px;
    width: 40vw;
    min-width: 600px;
    background-color: var(--login-form-container-background-color);
    border: 1px solid var(--login-form-container-border-color);
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  // 输入框
  .form-input {
    margin-top: 10px;
  }

  // 按钮组
  .button-container {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 10px;
  }

</style>