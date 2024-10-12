<!--
 - Header - 用户设置菜单
 -
 - @author 刘志栋
 - @since 2024/10/10
 -->
<script setup lang="ts">
    import FormButton from '@/views/ui/form/FormButton.vue';
    import HeaderMenu from '../HeaderMenu.vue';
    import { useGlobalStore } from '@/stores/global';
    import router from '@/router';
    import i18n from "@/assets/lang";

    const $t = i18n.global.t;
    const globalStore = useGlobalStore();

    const logout = () => {
        // 清除localStorage中的用户信息
        localStorage.removeItem('loginUser');
        // 清除store中的用户信息
        globalStore.user = { id: null, account: null, name: null, token: null, wsSession: null };
        // 重定向到登录页
        router.push('/account');
    };

</script>

<template>
    <HeaderMenu class="user-menu">
        <!-- 用户名 -->
        <div class="user-name">{{ globalStore.user.name }}</div>
        <!-- 退出登录 -->
        <FormButton type="danger" @click="logout">{{ $t('account.logout') }}</FormButton>
    </HeaderMenu>
</template>

<style lang="scss" scoped>
    .user-menu {
        width: 200px;
        padding: 10px;
        text-align: center;
    }

    .user-name {
        font-size: 16px;
        margin-bottom: 10px;
    }
</style>
