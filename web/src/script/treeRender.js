import {TreeNodeSet, FormulaNode, TreeNode} from "./ast";

/**
 * 语句执行节点
 */
export class ExecNode {
    constructor() {
        this.nodeType = 'execElement';
        this.steps = [];
    }
}

/**
 * 变量
 */
export class Variable {
    constructor() {
        this.nodeType = 'variableElement';
        this.name = '';
        this.value = null;
        this.type = '';
    }
}

/**
 * 入参引用
 */
export class Param {
    constructor() {
        this.nodeType = 'paramElement';
        this.name = '';
    }
}

/**
 * 计算节点
 */
export class Calc {
    constructor() {
        this.nodeType = 'calcElement';
        this.func = '';
        this.params = [];
    }
}

/**
 * 常量节点
 */
export class Constant {
    constructor() {
        this.nodeType = 'constantElement';
        this.value = null;
    }
}

/**
 * 树节点整理类
 */
class TreeRender {
    constructor() {
        // 入参
        this.params = [];
        // 变量声明
        this.defines = [];
        // 执行逻辑
        this.execNodes = [];
    }

    render(astTreeNode) {
        const self = this;
        // 处理单个节点的方法
        const transNode = (node) => {
            if (typeof node === 'string') {
                // 处理入参或常量节点
                if (node.startsWith('@') || self.defines.map(d => d.name).indexOf(node) > -1) {
                    const param = new Param();
                    param.name = node;
                    // 记录入参
                    if (self.params.map(p => p.name).indexOf(node) === -1) {
                        self.params.push(param);
                    }
                    return param;
                } else {
                    const constant = new Constant();
                    constant.value = node;
                    return constant;
                }
            } else if (node instanceof TreeNode) {
                // 处理计算节点
                const calc = new Calc();
                calc.func = node.operator;
                if (node.leftChild) {
                    calc.params.push(transNode(node.leftChild));
                } else if (node.leftParam) {
                    calc.params.push(transNode(node.leftParam));
                }
                if (node.rightChild) {
                    calc.params.push(transNode(node.rightChild));
                } else if (node.rightParam) {
                    calc.params.push(transNode(node.rightParam));
                }
                return calc;
            }
        }
        // 递归处理树节点
        if (astTreeNode instanceof TreeNodeSet) {
            astTreeNode.getNodes().forEach((node) => {
                self.render(node);
            });
        } else if (astTreeNode instanceof TreeNode) {
            // 处理变量声明
            if (astTreeNode.operator === 'var' || astTreeNode.operator === 'ref' || astTreeNode.operator === 'global') {
                const variable = new Variable();
                self.defines.push(variable);
                variable.name = astTreeNode.leftParam;
                variable.type = astTreeNode.operator;
                if (astTreeNode.rightParam) {
                    variable.value = astTreeNode.rightParam;
                } else if (astTreeNode.rightChild) {
                    variable.value = transNode(astTreeNode.rightChild);
                }
            } else {
                self.execNodes.push(transNode(astTreeNode));
            }
        } else if (astTreeNode instanceof FormulaNode) {
            // 处理公式节点
            const calcNode = new Calc();
            calcNode.func = astTreeNode.formula;
            astTreeNode.params.forEach((param) => {
                calcNode.params.push(transNode(param));
            });
            self.execNodes.push(calcNode);
        }
    }
}

/**
 * 遍历AST 整理执行逻辑
 */
export function getExecutableTree(astTreeNode) {
    const treeRender = new TreeRender();
    treeRender.render(astTreeNode);
    return {
        params: treeRender.params,
        defines: treeRender.defines,
        execNodes: treeRender.execNodes,
    };
}
