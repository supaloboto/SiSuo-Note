<script setup lang="ts">
  import CodeMirror from "./CodeMirror.vue";
  import { ref } from "vue";
  import tokenize from "@/script/tokenization";
  import { tokenToAST } from "@/script/ast";
  import { TreeRender, Variable } from "@/script/logicTree";
  import { ExecutedVariable, Exec } from "@/script/exec";

  // 用户输入的脚本内容
  const scriptText = ref<string>(
    `// ======== 函数声明 和 if/else ========
// ref a = @num;
// var b = 2;
// function test(v1,v2){
//   if(v1==100){
//    return "一百";
//   }
//   if(v1>v2){
//    return "大";
//   }elseif(v1==v2){
//    return "等";
//   }else{
//    return "小";
//   }
//   return "???";
// }
// ref res = test(a,b);

// ======== for ========
// var a = 1;
// for(i=0;i<5;i+=1){
//   a += i;
// }

// ======== 数组和结构体 ========
// var a = ['A','B','C'];
// var b = {test:2};
// var c = a[b.test];`
  );
  // 输入
  const inputList = ref<ExecutedVariable[]>([]);
  // 输出
  const outputList = ref<ExecutedVariable[]>([]);

  /**
   * 重新整理输出物
   */
  const getOutput = () => {
    // 当用户输入为空时 清空全部内容
    if (!scriptText.value) {
      inputList.value = [];
      outputList.value = [];
      return;
    }

    // 字符串分割为词元
    const tokenizeResult = tokenize(scriptText.value);
    console.log('tokenization', tokenizeResult);
    // 将词元转化为AST 在返回的结果中找到树的根节点
    const ast = tokenToAST(tokenizeResult);
    console.log('ast', ast);
    // 将AST转换为可执行树
    const treeRender = new TreeRender(ast);
    treeRender.render();
    console.log('logic tree', treeRender);
    // 从可执行树中获取变量声明 整理逻辑输入变量
    const { inputs } = treeRender.logicRoot;
    // 保留之前的值 在重复运行时不会丢失
    const inputValues = {};
    inputList.value.forEach((item: ExecutedVariable) => {
      inputValues[item.name] = item.value;
    });
    inputList.value = inputs.map((item: Variable): ExecutedVariable => {
      const inputVar = new ExecutedVariable(item.name);
      if (inputValues[item.name] !== undefined) {
        inputVar.value = inputValues[item.name];
      }
      return inputVar;
    });
    // 整理输出物
    outputList.value = new Exec().getOutputs(treeRender.logicRoot, inputList.value as ExecutedVariable[]);
  }

</script>

<template>
  <div class="script-container">
    <!-- 脚本区域 -->
    <div class="script-editor">
      <h2>脚本</h2>
      <CodeMirror :height="800" :width="400" v-model="scriptText" />
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
          <input v-model="item.value" type="text" />
        </div>
        <h4>输出</h4>
        <div v-for="item in outputList" :key="item.name">
          <p>{{ item.name }} : {{ item.value }}</p>
        </div>
      </div>
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
