// 获取所有函数名称，用于判断公式中是否包含函数
import {functionNames} from './valid';

/**
 * 树节点类
 */
export class TreeNode {
    constructor() {
        // 父节点
        this.parent = null;
        // 二叉树左节点
        this.leftChild = null;
        // 二叉树右节点
        this.rightChild = null;
        // 运算符
        this.operator = null;
        // 运算符左侧参数
        this.leftParam = null;
        // 运算符右侧参数
        this.rightParam = null;
    }

    setLeft(node) {
        if (node instanceof TreeNode) {
            this.setLeftChild(node);
        } else {
            this.leftParam = node;
        }
    }

    setRight(node) {
        if (node instanceof TreeNode) {
            this.setRightChild(node);
        } else {
            this.rightParam = node;
        }
    }

    noLeft() {
        return this.leftChild === null && this.leftParam === null;
    }

    noRight() {
        return this.rightChild === null && this.rightParam === null;
    }

    /**
     * 将节点设置为自己的左节点
     * @param node
     */
    setLeftChild(node) {
        this.leftChild = node;
        node.parent = this;
    }

    /**
     * 将节点设置为自己的右节点
     * @param node
     */
    setRightChild(node) {
        this.rightChild = node;
        node.parent = this;
    }

    /**
     * 从target节点夺取右节点作为自己的左节点
     * @param target
     */
    seizeRightChild(target) {
        if (target.rightChild) {
            this.setLeftChild(target.rightChild);
            target.rightChild = null;
        } else if (target.rightParam) {
            this.leftParam = target.rightParam;
            target.rightParam = null;
        }
    }
}

/**
 * 树节点集合类
 */
export class TreeNodeSet {
    constructor() {
        this.nodes = [];
    }

    addNode(node) {
        this.nodes.push(node);
    }

    getNodes() {
        return this.nodes;
    }
}

/**
 * 公式节点类
 */
export class FormulaNode {
    constructor() {
        this.formula = '';
        this.params = [];
    }
}

/**
 * 解析表达式为AST
 */
export function analyseExpressionToAST(expressionParts) {
    const nodeList = expressionParts.root.nodeList;
    const result = new TreeNodeSet();
    // 分割语句
    const sentenceList = [];
    let buffer = [];
    for (let i = 0; i < nodeList.length; i++) {
        const node = nodeList[i];
        if (node === ';') {
            sentenceList.push(buffer.splice(0));
        } else {
            buffer.push(node);
        }
    }
    if (buffer.length > 0) {
        sentenceList.push(buffer.splice(0));
    }
    // 解析语句
    sentenceList.forEach((sentence) => {
        // 组建单个节点
        let treeNode = new TreeNode();
        // 解析关键字
        const sentenceType = sentence[0];
        if (sentenceType === 'var' || sentenceType === 'ref' || sentenceType === 'global') {
            // todo 语法验证
            // 变量名
            const varName = sentence[1];
            // 变量定义语句
            const varDefine = sentence.slice(3);
            // 解析语句
            treeNode.operator = sentenceType;
            treeNode.setRight(assembleCalcNode(varDefine, expressionParts));
            treeNode.setLeft(varName);
        } else if (sentenceType === 'if') {
            // 解析if语句
            treeNode.operator = 'if';
            // 解析条件语句
            treeNode.setLeft(assembleCalcNode(sentence.slice(1), expressionParts));
            // 解析if语句块
            const ifSentence = [];
            let buffer = [];
            for (let i = 0; i < sentence.length; i++) {
                if (sentence[i] === 'then') {
                    ifSentence.push(buffer.splice(0));
                } else {
                    buffer.push(sentence[i]);
                }
            }
            if (buffer.length > 0) {
                ifSentence.push(buffer.splice(0));
            }
            treeNode.setRight(getTreeNode(expressionParts, ifSentence[0][0]));
        } else if (sentenceType === 'elseif') {

        } else if (sentenceType === 'else') {

        } else if (sentenceType === 'for') {

        } else if (sentence[1] === '=') {
            // 解析赋值表达式
            treeNode.operator = '=';
            treeNode.setLeft(sentence[0]);
            treeNode.setRight(assembleCalcNode(sentence.splice(2), expressionParts));
        }
        // 将节点加入集合
        result.addNode(treeNode);
    });
    return result;
}

/**
 * 获取树节点 表达式语句会被转化为TreeNode节点 语句组会被转化为TreeNodeSet节点
 * @param expressionParts
 * @param partKey
 * @returns {*|null|TreeNodeSet}
 */
function getTreeNode(expressionParts, partKey) {
    const currentPart = expressionParts[partKey];
    // 如果当前部分为数组 则返回节点集合
    if (currentPart.type === 'array') {
        const resultTreeSet = new TreeNodeSet();
        // 将节点送入递归 并将结果作为树节点的参数
        currentPart.nodeList.forEach((nodeList) => {
            resultTreeSet.addNode(assembleCalcNode(nodeList, expressionParts));
        });
        return resultTreeSet;
    }
    // 取指定的表达式部分
    return assembleCalcNode(currentPart.nodeList, expressionParts);
}

/**
 * 组装计算和逻辑判断节点
 * @param nodeList
 * @param expressionParts
 * @returns {*|null}
 */
function assembleCalcNode(nodeList, expressionParts) {
    // 组建单个节点
    let resultTreeNode = new TreeNode();
    // 临时存储运算符
    let operator = null;
    // 遍历节点
    for (let i = 0; i < nodeList.length; i++) {
        // 取当前节点 判断类型
        let node = nodeList[i];
        // 解析运算符
        if (['+', '-'].includes(node) || ['*', '/', '%'].includes(node)) {
            // 将运算符临时存储
            operator = node;
            continue;
        } else if (['>', '>=', '<', '<=', '=', '==', '!=', '<>'].includes(node)) {
            // 截取后续节点 向后找直到碰到逻辑关系符
            const rightNodeSet = [];
            while (i < nodeList.length - 1 && nodeList[i + 1] !== '&&' && nodeList[i + 1] !== '||') {
                rightNodeSet.push(nodeList[++i]);
            }
            // 递归解析 整理成树节点
            resultTreeNode = assembleCompareNode(resultTreeNode, operator, getTreeNode(rightNodeSet, expressionParts));
            resultTreeNode.operator = node;
            // 理论上此时不应当有运算符 但是为了避免公式配置错误时逻辑产生更复杂的错误数据 所以将运算符置空
            operator = null;
            continue;
        } else if (['&&', '||'].includes(node)) {
            // todo 处理逻辑关系符
            console.error('未知操作符 ', operator);
        } else if (functionNames.includes(node)) {
            // 当前节点为公式
            const formulaNode = new FormulaNode();
            formulaNode.formula = node;
            // 递归取得后续括号的内容作为参数
            if (i < nodeList.length) {
                i++;
                if (expressionParts[nodeList[i]]) {
                    const siblingNode = getTreeNode(expressionParts, nodeList[i]);
                    formulaNode.params = siblingNode instanceof TreeNodeSet ? [...siblingNode.getNodes()] : [siblingNode];
                }
            }
            node = formulaNode;
        } else if (expressionParts[node]) {
            // 当前节点为括号 则递归括号内的内容 并以此作为当前节点继续逻辑
            node = getTreeNode(expressionParts, node);
        }

        // 当前节点为引用或常量 则判断当前是否记录了操作符
        if (operator === null) {
            // 作为树节点的左节点
            resultTreeNode.setLeft(node);
        } else {
            // 根据操作符选取对应的组装方法
            if (['+', '-'].includes(operator)) {
                resultTreeNode = assembleAddSubNode(resultTreeNode, operator, node);
            } else if (['*', '/', '%'].includes(operator)) {
                resultTreeNode = assembleMulDivNode(resultTreeNode, operator, node);
            } else {
                console.error('未知操作符 ', operator);
            }
            operator = null;
        }
    }
    // 如果此时树节点没有右节点和operator 则证明此节点为引用或者常量 将左节点取出并返回
    if (resultTreeNode.noRight() && !resultTreeNode.operator) {
        return resultTreeNode.leftChild || resultTreeNode.leftParam;
    }
    return findRoot(resultTreeNode);
}

/**
 * 找到树的根节点
 * @param treeRoot
 * @returns {*}
 */
function findRoot(treeRoot) {
    while (treeRoot.parent) {
        treeRoot = treeRoot.parent;
    }
    return treeRoot;
}

/**
 * 组装加减计算节点
 */
function assembleAddSubNode(currentNode, operator, afterNode) {
    if (currentNode.noRight()) {
        currentNode.operator = operator;
        currentNode.setRight(afterNode);
        return currentNode;
    }
    // 拼接新的节点
    const newNode = new TreeNode();
    newNode.operator = operator;
    newNode.setLeft(currentNode);
    newNode.setRight(afterNode);
    return newNode;
}

/**
 * 组装乘除计算节点
 */
function assembleMulDivNode(currentNode, operator, afterNode) {
    if (currentNode.noRight()) {
        currentNode.operator = operator;
        currentNode.setRight(afterNode);
        return currentNode;
    }
    // 拼接新的节点
    const newNode = new TreeNode();
    newNode.operator = operator;
    newNode.setRight(afterNode);
    if (currentNode instanceof TreeNode) {
        // 如果当前运算符为乘除并且上一个节点的运算符也为乘除，则将上个节点作为新节点的左节点，并返回新节点
        if (currentNode.operator === '*' || currentNode.operator === '/' || currentNode.operator === '%') {
            newNode.setLeft(currentNode)
            return newNode;
        }
        // 乘除节点夺取前个节点的右节点作为自己的左节点 并将自己作为前个节点的右节点
        newNode.seizeRightChild(currentNode);
        currentNode.setRight(newNode);
        return currentNode;
    } else {
        newNode.setRight(currentNode);
        return newNode;
    }
}

/**
 * 组装比较计算节点
 */
function assembleCompareNode(currentNode, operator, afterNode) {
    if (currentNode.noRight()) {
        currentNode.operator = operator;
        currentNode.setRight(afterNode);
        return currentNode;
    }
    // 拼接新的节点
    const newNode = new TreeNode();
    newNode.operator = operator;
    newNode.setLeft(currentNode);
    newNode.setRight(afterNode);
    return newNode;
}
