<!--
 - 首页
 -
 - @author 刘志栋
 - @since 2024/08/16
 -->
<script setup lang="ts">
import { onMounted } from "vue";
import router from "@/router";

onMounted(() => {
    // todo 判断登录状态 跳转到登录页或文件页
    router.push({ path: "/account" });
});

</script>

<template>
    <div>
        <!-- 首页暂时不设计内容 -->
    </div>
</template>

<style scoped></style>