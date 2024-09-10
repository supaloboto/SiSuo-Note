<script setup lang="ts">
  import Codemirror from "codemirror-editor-vue3";
  import { javascript } from "@codemirror/lang-javascript";
  import { ref, watch } from "vue";
  import expressionSplit from "@/script/expressionSplit";
  import { analyseExpressionToAST, TreeNode, TreeNodeSet } from "@/script/ast";
  import { Constant, TreeRender, Variable } from "@/script/logicTree";
  import { getOutputs } from "@/script/exec";

  // 用户输入的脚本内容
  const scriptTextCodeMirror = ref<any>(null);
  const scriptText = ref<string>();
  // 字符串分割结果
  const splitResultCodeMirror = ref<any>(null);
  const splitResultStr = ref<string>('');
  // AST内容
  const astCodeMirror = ref<any>(null);
  const astStr = ref<string>('');
  // 执行内容
  const renderedTree = ref<TreeRender>(null);
  const renderedTreeCodeMirror = ref<any>(null);
  const renderedTreeStr = ref<string>('');
  // 输入
  const inputList = ref<Variable[]>([]);
  // 输出
  const outputList = ref<Variable[]>([]);

  // 清理AST 删除节点上的父节点属性 避免序列化时循环引用
  const cleanAST = (node: TreeNode) => {
    if (!node) {
      return null;
    }
    node.parent = null;
    if (node.leftChild) {
      cleanAST(node.leftChild);
    }
    if (node.rightChild) {
      cleanAST(node.rightChild);
    }
    if (node instanceof TreeNodeSet) {
      Array.from((node as TreeNodeSet).getNodes()).forEach(cleanAST);
    }
  }

  /**
   * 重新整理输出物
   */
  const getOutput = () => {
    // 当用户输入为空时 清空全部内容
    if (!scriptText.value) {
      splitResultStr.value = '';
      astStr.value = '';
      renderedTreeStr.value = '';
      renderedTree.value = null;
      inputList.value = [];
      outputList.value = [];
      return;
    }
    // 去除表达式中的回车字符
    let expression = scriptText.value.replace(/\n/g, '');
    // 字符串分割
    const expressionParts = expressionSplit(expression);
    splitResultStr.value = JSON.stringify(expressionParts, null, 2);
    // 解析算式 在返回的结果中找到树的根节点
    const ast = analyseExpressionToAST(expressionParts);
    // 展示AST内容之前先做整理 去掉节点的parent属性 避免序列化时循环引用
    cleanAST(ast);
    astStr.value = JSON.stringify(ast, null, 2);
    // 将AST转换为可执行树
    const treeRender = new TreeRender();
    treeRender.render(ast);
    renderedTree.value = treeRender;
    renderedTreeStr.value = JSON.stringify(renderedTree.value, null, 2);
    // 从可执行树中获取变量声明 整理入参
    const { params } = renderedTree.value;
    inputList.value = params.map((item: Variable): Variable => {
      return new Variable(item.name, 'import', new Constant(''));
    });
    // 整理输出物
    outputList.value = getOutputs(renderedTree.value.defines as Variable[], inputList.value as Variable[]);
  }

  // // 当用户输入时尝试解析脚本
  // watch(scriptText, () => {
  //   // 整理输出物
  //   getOutput();
  // }, { immediate: true });

</script>

<template>
  <div class="script-container">
    <!-- 脚本区域 -->
    <div class="script-editor">
      <h2>脚本</h2>
      <codemirror ref="scriptTextCodeMirror" v-model:value="scriptText" :style="{ height: '800px', width: '420px' }"
        :autofocus="true" :indent-with-tab="true" :tab-size="2" />
    </div>
    <!-- 分割线 -->
    <div class="split">
    </div>
    <!-- 运行结果区域 -->
    <div class="exec-div">
      <button @click="getOutput">run script</button>
      <h2>运行效果</h2>
      <div style="min-height:100px">
        <h4>输入</h4>
        <div v-for="item in inputList" :key="item.name">
          <span>{{ item.name }} : </span>
          <input v-model="(item.value as Constant).value" type="text" />
        </div>
        <h4>输出</h4>
        <div v-for="item in outputList" :key="item.name">
          <span>{{ item.name }} : </span>
          <input v-model="(item.value as Constant).value" type="text" />
        </div>
      </div>
      <h2>字符串分割结果</h2>
      <codemirror ref="splitResultCodeMirror" v-model:value="splitResultStr" :style="{ height: '200px' }"
        :autofocus="true" :indent-with-tab="true" :tab-size="2" :extensions="[javascript()]" />
      <h2>AST</h2>
      <codemirror ref="astCodeMirror" v-model:value="astStr" :style="{ height: '600px' }" :autofocus="true"
        :indent-with-tab="true" :tab-size="2" :extensions="[javascript()]" />
      <h2>执行内容</h2>
      <codemirror ref="renderedTreeCodeMirror" v-model:value="renderedTreeStr" :style="{ height: '600px' }"
        :autofocus="true" :indent-with-tab="true" :tab-size="2" :extensions="[javascript()]" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .script-container {
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
