<template>
  <el-config-provider :locale="locale">
    <div id="app">
      <router-view></router-view>
    </div>
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
.eln-operation-button {
  margin: 0 5px;
  font-size: 20px;
  cursor: pointer;
  &:hover {
    color: #409eff;
  }
}
</style>
