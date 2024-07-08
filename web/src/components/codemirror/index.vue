<template>
  <div class="page" :style="{height: height, width: width}">
    <el-button @click="handleRun" class="addRow">运行</el-button>
    <el-button @click="handleCopy" class="addRow">复制结果</el-button>
    <div class="container">
      <div class="codemirror">
        <codemirror ref="codeInputArea" v-model="code"
                    placeholder="输入代码..."
                    :style="{ height: '400px' }"
                    :autofocus="true"
                    :indent-with-tab="true"
                    :tab-size="2"
                    :extensions="extensions"/>
      </div>
      <div class="outputAndConsole">
        <div class="show">
          <div class="label">运行结果：</div>
          <div class="result">
            <codemirror ref="codeExecResultArea" v-model="runResult"/>
          </div>
        </div>
        <div class="consoleShow">
          <div class="label">控制台：</div>
          <div class="result">
            <codemirror ref="consoleArea" v-model="consoleContent"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {Codemirror} from 'vue-codemirror';
import {javascript} from "@codemirror/lang-javascript";
import {oneDark} from '@codemirror/theme-one-dark'
import {ref} from "vue";
import {copyText} from "@/assets/js/utils";

const props = defineProps({
  // 高度
  height: {
    type: String,
    default: '100%',
  },
  // 宽度
  width: {
    type: String,
    default: '100%',
  },
});

// 启用插件 js语言支持 黑色主题
const extensions = ref([javascript(), oneDark]);

// 代码输入区域ref
const codeInputArea = ref();


// 运行结果区域ref
const codeExecResultArea = ref();

// 控制台区域ref
const consoleArea = ref();


// 代码
const code = ref('');
// 配置
// const options = ref({
//   // 自动缩进
//   smartIndent: true,
//   indentUnit: 4,
//   // 缩进单元格为 4 个空格
//   tabSize: 8,
//   //编辑器的编程语言，比如：'javascript'
//   mode: 'javascript',
//   // 主题，使用主体需要引入相应的 css 文件
//   // theme: 'dracula',
//   // 是否显示行数
//   line: true,
//   // 高度自适应
//   viewportMargin: Infinity,
//   highlightDifferences: true,
//   autofocus: true,
//   // 只读
//   readOnly: false,
//   showCursorWhenSelecting: true,
//   firstLineNumber: 1,
//   // 括号匹配
//   matchBrackets: true,
//   // 换行
//   lineWrapping: true
// })

// 运行结果
const runResult = ref('');
//控制台结果
const consoleContent = ref('');

/**
 * 运行
 */
const handleRun = () => {
  // 运行结果
  let output = "";
  // 控制台内容
  let consoleValue = "";
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  // 重写 console.log, console.warn 和 console.error 函数
  console.log = function (...args) {
    args.forEach((arg) => (consoleValue += `${JSON.stringify(arg)}\n`));
    originalConsoleLog.apply(console, args);
  };
  console.warn = function (...args) {
    args.forEach((arg) => (consoleValue += `Warning: ${JSON.stringify(arg)}\n`));
    originalConsoleWarn.apply(console, args);
  };
  console.error = function (...args) {
    args.forEach((arg) => (consoleValue += `Error: ${JSON.stringify(arg)}\n`));
    originalConsoleError.apply(console, args);
  };
  try {
    if (code.value !== '' && code.value !== undefined && code.value.includes("return")) {
      let result = new Function(code.value)();
      output += `${JSON.stringify(result)}`
    } else {
      eval(code.value);
    }
  } catch (err) {
    output += `Error: ${err.message}`;
  }

  // 恢复原始的 console 方法
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
  runResult.value = output;
  consoleContent.value = consoleValue;
}
/**
 * 复制
 */
const handleCopy = async () => {
  if (runResult.value) copyText(runResult.value);
}


const log = (payload, evt) => {
  console.log(payload)
}
// Status is available at all times via Codemirror EditorView
// const getCodemirrorStates = () => {
//   const state = view.value.state
//   const ranges = state.selection.ranges
//   const selected = ranges.reduce((r, range) => r + range.to - range.from, 0)
//   const cursor = ranges[0].anchor
//   const length = state.doc.length
//   const lines = state.doc.lines
//   // more state info ...
//   // return ...
// }

</script>


<style scoped>
.page {
  overflow: hidden;
}

.container {
  display: flex;
  height: calc(100% - 4rem);
}

.codemirror {
  width: calc(50% - 2rem);
  padding: 1rem;
  background-color: #d2d2d2;
}

.outputAndConsole {
  width: calc(50% - 2rem);
  padding: 1rem;
  background-color: #d2d2d2;
  display: grid;
  grid-template-rows: 1fr 1fr;
  align-items: center;
}

.show {
  height: 100%;
  width: calc(100% - 2rem);
  border: 1px solid #ccc;
  border-right: 0.5rem;
}

.show .label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.show .result {
  height: 80%;
}

.consoleShow {
  height: 100%;
  width: calc(100% - 2rem);
  border: 1px solid #ccc;
  border-right: 0.5rem;
}

.consoleShow .label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.consoleShow .result {
  height: 80%;
}
</style>
<style>
.CodeMirror-wrap pre.CodeMirror-line, .CodeMirror-wrap pre.CodeMirror-line-like {
  word-wrap: break-word;
  white-space: pre-wrap;
  word-break: normal;
  padding-left: 30px !important;
}
</style>
