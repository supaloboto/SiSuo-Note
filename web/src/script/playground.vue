<script setup lang="ts">
  import Codemirror from "codemirror-editor-vue3";
  import { javascript } from "@codemirror/lang-javascript";
  import { computed, ref, watch } from "vue";
  import expressionSplit from "@/script/expressionSplit";
  import { analyseExpressionToAST } from "@/script/ast";
  import { getExecutableTree } from "@/script/treeRender";
  import { getValueRefs } from "@/script/exec";

  // 用户输入
  const inputRef = ref(null);
  const input = ref(localStorage.getItem("scriptTestStr"));
  // 字符串分割结果
  const splitResultRef = ref(null);
  const splitResult = ref('');
  // AST
  const astRef = ref(null);
  const ast = ref('');
  // 执行内容
  const resultRef = ref(null);
  const result = ref('');
  const execTree = ref(null);
  // 输入
  const inputList = ref([]);
  // 输出
  const outputList = ref([]);

  // 清理AST 删除节点上不需要的属性
  const cleanAST = (node) => {
    if (!node) {
      return;
    }
    // 删除父级 避免序列化时循环引用
    delete node.parent;
    // 左节点
    if (node.leftChild) {
      cleanAST(node.leftChild);
    } else {
      delete node.leftChild;
    }
    if (node.leftParam === null) {
      delete node.leftParam;
    }
    // 右节点
    if (node.rightChild) {
      cleanAST(node.rightChild);
    } else {
      delete node.rightChild;
    }
    if (node.rightParam === null) {
      delete node.rightParam;
    }
    // 子节点
    if (node.nodes) {
      node.nodes.forEach(cleanAST);
    } else {
      delete node.nodes;
    }
  }

  // 执行方法
  const exec = () => {
    // 处理值声明
    const { defines, params } = execTree.value;
    outputList.value = getValueRefs(defines, inputList.value);
  }

  // 当用户输入时尝试解析脚本
  watch(input, (scriptStr) => {
    localStorage.setItem("scriptTestStr", scriptStr);
    try {
      if (!scriptStr) {
        result.value = '';
      }
      // 去除表达式中的回车字符
      let expression = scriptStr.replace(/\n/g, '');
      // 字符串分割
      const expressionParts = expressionSplit(expression);
      splitResult.value = JSON.stringify(expressionParts, null, 2);
      // 解析算式 在返回的结果中找到树的根节点
      const tree = analyseExpressionToAST(expressionParts);
      // 抹除所有不需要展示的属性
      cleanAST(tree);
      ast.value = JSON.stringify(tree, null, 2);
      // 将AST转换为可执行树
      execTree.value = getExecutableTree(tree);
      result.value = JSON.stringify(execTree.value, null, 2);
      // 从可执行树中获取变量声明 整理入参
      const { defines, params } = execTree.value;
      const defineNames = defines.map(d => d.name);
      inputList.value = params.filter(p => defineNames.indexOf(p.name) === -1);
      // 执行脚本
      exec();
    } catch (e) {
      console.error(e);
    }
  }, { immediate: true });

</script>

<template>
  <div class="script-playground">
    <!-- 脚本区域 -->
    <div class="script-editor">
      <h2>脚本</h2>
      <codemirror ref="inputRef" v-model="input" :style="{ height: '800px', width: '420px' }" :autofocus="true"
        :indent-with-tab="true" :tab-size="2" />
    </div>
    <!-- 分割线 -->
    <div class="split">
    </div>
    <!-- 运行结果区域 -->
    <div class="exec-div">
      <h2>字符串分割结果</h2>
      <codemirror ref="splitResultRef" v-model="splitResult" :style="{ height: '200px' }" :autofocus="true"
        :indent-with-tab="true" :tab-size="2" :extensions="[javascript()]" />
      <h2>AST</h2>
      <codemirror ref="astRef" v-model="ast" :style="{ height: '600px' }" :autofocus="true" :indent-with-tab="true"
        :tab-size="2" :extensions="[javascript()]" />
      <h2>执行内容</h2>
      <codemirror ref="resultRef" v-model="result" :style="{ height: '600px' }" :autofocus="true"
        :indent-with-tab="true" :tab-size="2" :extensions="[javascript()]" />
      <h2>运行效果</h2>
      <div style="min-height:600px">
        <h4>输入</h4>
        <div v-for="item in inputList" :key="item.name">
          <span>{{ item.name }} : </span>
          <input v-model="item.value" type="text" />
        </div>
        <h4>运行计算</h4>
        <button @click="exec">run script</button>
        <h4>输出</h4>
        <div v-for="item in outputList" :key="item.name">
          <span>{{ item.name }} : </span>
          <input v-model="item.refObj" type="text" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .script-playground {
    overflow: auto;
    height: 100%;
    width: 100%;
  }

  .script-editor {
    position: fixed;
    margin-left: 5px;
  }

  .split {
    position: relative;
    float: left;
    margin-left: 50%;
    width: 1px;
    height: 100%;
    background-color: #d0d0d0;
  }

  .exec-div {
    height: 100%;
    width: 49%;
    margin-left: 51%;
    overflow: auto;
  }
</style>
