<template>
  <el-config-provider :locale="locale">
    <router-view></router-view>
  </el-config-provider>
</template>

<script>
import zhCn from 'element-plus/lib/locale/lang/zh-cn'

export default {
  name: "App",
  data() {
    return {};
  },
  created() {
  },
  mounted() {
  },
  computed: {},
  methods: {},
  setup() {
    return {
      locale: zhCn,
    }
  },
};
</script>

<style lang="scss">
/* 全局样式 */
html {
  height: 100%;
  display: flex;
}

body {
  display: flex;
  flex: 1;
}

#app {
  display: flex;
  flex: 1;
}
</style>
