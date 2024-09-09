import type { ExpressionSplit } from "./expressionSplit";

/**
 * AST抽象语法树
 * 
 * @author 刘志栋
 * @since 2024-09-08
 */

// 内置函数
//TODO 待完善
const buildInFunctions: string[] = ['SUM', 'AVG'];

/**
 * 树节点类
 */
export class TreeNode {
    // 父节点
    private _parent: TreeNode | null = null;
    // 二叉树左节点
    private _leftChild: TreeNode | null = null;
    // 二叉树右节点
    private _rightChild: TreeNode | null = null;
    // 运算符
    private _operator: string | null = null;

    constructor() {
    }

    get parent() {
        return this._parent;
    }

    set parent(value) {
        this._parent = value;
    }

    get leftChild() {
        return this._leftChild;
    }

    set leftChild(value) {
        this._leftChild = value;
    }

    get rightChild() {
        return this._rightChild;
    }

    set rightChild(value) {
        this._rightChild = value;
    }

    get operator() {
        return this._operator;
    }

    set operator(value) {
        this._operator = value;
    }

    // 判断是否无左节点
    get noLeft() {
        return this.leftChild === null;
    }

    // 判断是否无右节点
    get noRight() {
        return this.rightChild === null;
    }

    /**
     * 将节点设置为自己的左节点
     */
    setLeft(node: TreeNode | null) {
        if (node) {
            this.leftChild = node;
            node.parent = this;
        } else if (this.leftChild) {
            // 如果传入的节点为空 则将自己的左节点置空 并断开联系
            this.leftChild.parent = null;
            this.leftChild = null;
        }
    }

    /**
     * 将节点设置为自己的右节点
     */
    setRight(node: TreeNode | null) {
        if (node) {
            this.rightChild = node;
            node.parent = this;
        } else if (this.rightChild) {
            // 如果传入的节点为空 则将自己的右节点置空 并断开联系
            this.rightChild.parent = null;
            this.rightChild = null;
        }
    }

    /**
     * 从target节点夺取右节点作为自己的左节点
     */
    seizeRightChild(target: TreeNode) {
        if (target.rightChild) {
            this.setLeft(target.rightChild);
            target.rightChild = null;
        }
    }
}

/**
 * 树节点集合类 树节点的一种 用于存储多个节点
 */
export class TreeNodeSet extends TreeNode {
    private nodes: TreeNode[] = [];

    constructor() {
        super();
    }

    addNode(node: TreeNode) {
        this.nodes.push(node);
    }

    getNodes() {
        return this.nodes;
    }
}

/**
 * 公式节点类 树节点的一种 用于存储公式信息
 */
export class FormulaNode extends TreeNode {
    private _formula: string = '';
    private _params: TreeNode[] = [];

    constructor() {
        super();
    }

    get formula() {
        return this._formula;
    }

    set formula(value) {
        this._formula = value;
    }

    get params() {
        return this._params;
    }

    set params(value) {
        this._params = value;
    }
}

/**
 * 变量节点类 树节点的一种 用于存储变量信息(也可能是常量信息,AST中无法区分它们)
 */
export class VarNode extends TreeNode {
    private _name: any;

    constructor(name: any) {
        super();
        this._name = name;
    }

    get name() {
        return this._name;
    }
}

/**
 * 解析表达式为AST
 */
export function analyseExpressionToAST(expressionParts: ExpressionSplit): TreeNodeSet {
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
            const varDefine: string[] = sentence.slice(3);
            // 记录语句为AST节点
            treeNode.operator = sentenceType;
            treeNode.setLeft(new VarNode(varName));
            treeNode.setRight(assembleCalcNode(expressionParts, varDefine));
        } else if (sentenceType === 'if') {
            // 解析if语句
            treeNode.operator = 'if';
            // 解析条件语句
            treeNode.setLeft(assembleCalcNode(expressionParts, sentence.slice(1)));
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
            // 记录赋值表达式为AST节点
            treeNode.operator = '=';
            treeNode.setLeft(new VarNode(sentence[0]));
            treeNode.setRight(assembleCalcNode(expressionParts, sentence.splice(2)));
        }
        // 将节点加入集合
        result.addNode(treeNode);
    });
    return result;
}

/**
 * 获取树节点 表达式语句会被转化为TreeNode节点 语句组会被转化为TreeNodeSet节点
 * @param expressionParts 表达式切割结果
 * @param partKey 表达式部分的key
 * @returns {*|null|TreeNodeSet}
 */
function getTreeNode(expressionParts: ExpressionSplit, partKey: string): TreeNode | TreeNodeSet | null {
    const currentPart = expressionParts[partKey];
    // 如果当前部分为数组 则返回节点集合
    if (currentPart.type === 'array') {
        const resultTreeSet = new TreeNodeSet();
        // 将节点送入递归 并将结果作为树节点的参数
        currentPart.nodeList.forEach((node) => {
            const treeNode = assembleCalcNode(expressionParts, [node]);
            if (treeNode) {
                resultTreeSet.addNode(treeNode);
            }
        });
        return resultTreeSet;
    }
    // 取指定的表达式部分
    return assembleCalcNode(expressionParts, currentPart.nodeList);
}

/**
 * 组装计算和逻辑判断节点
 * @param expressionParts
 * @param nodeList
 * @returns {*|null}
 */
function assembleCalcNode(expressionParts: ExpressionSplit, nodeList: string[]): TreeNode | null {
    // 组建单个节点
    let resultTreeNode = new TreeNode();
    // 运算符缓冲 因为运算符起作用的方式收到前后节点关系的影响 所以需要延迟生效
    let currentOperator: string | null = null;
    // 将遇到引用或者常量时 将其存储为节点的动作
    const updateResultNode = (node: TreeNode) => {
        // 判断当前是否记录了运算符
        if (currentOperator === null) {
            // 作为树节点的左节点
            resultTreeNode.setLeft(node);
        } else {
            // 根据运算符选取对应的组装方法 将当前节点和运算符组装成新的节点
            if (['+', '-'].includes(currentOperator)) {
                resultTreeNode = assembleAddSubNode(resultTreeNode, currentOperator, node);
            } else if (['*', '/', '%'].includes(currentOperator)) {
                resultTreeNode = assembleMulDivNode(resultTreeNode, currentOperator, node);
            } else {
                console.error('未知操作符 ', currentOperator);
            }
            // 运算符生效后清空
            currentOperator = null;
        }
    };
    // 遍历节点
    for (let i = 0; i < nodeList.length; i++) {
        // 取当前节点 判断类型
        let node = nodeList[i];
        // 解析运算符
        if (['+', '-'].includes(node) || ['*', '/', '%'].includes(node)) {
            // 存储运算符
            currentOperator = node;
        } else if (['>', '>=', '<', '<=', '=', '==', '!=', '<>'].includes(node)) {
            // 比较运算符 比较运算符的两边一定作为此运算符的左右两侧节点 因此此时将当前运算符清空 就地整理节点
            // 按正常语法 此时的运算符本来也应当是null
            currentOperator = null;
            // 截取后续节点 向后找直到碰到逻辑关系符
            const rightNodeSet: string[] = [];
            while (i < nodeList.length - 1 && nodeList[i + 1] !== '&&' && nodeList[i + 1] !== '||') {
                rightNodeSet.push(nodeList[++i]);
            }
            // 递归解析 整理成树节点
            const afterNode = assembleCalcNode(expressionParts, rightNodeSet);
            if (!afterNode) {
                //TODO 错误处理
                console.error('解析错误1', rightNodeSet);
                return null;
            }
            resultTreeNode = assembleCompareNode(resultTreeNode, node, afterNode);
            resultTreeNode.operator = node;
        } else if (['&&', '||'].includes(node)) {
            //TODO 处理逻辑关系符

        } else if (buildInFunctions.includes(node)) {
            // 当前节点为公式
            const formulaNode = new FormulaNode();
            formulaNode.formula = node;
            // 递归取得后续括号的内容作为参数
            if (i < nodeList.length) {
                i++;
                if (expressionParts[nodeList[i]]) {
                    const siblingNode = getTreeNode(expressionParts, nodeList[i]);
                    formulaNode.params = siblingNode === null ? [] : (siblingNode instanceof TreeNodeSet ? [...siblingNode.getNodes()] : [siblingNode]);
                }
            }
            updateResultNode(formulaNode);
        } else if (expressionParts[node]) {
            // 当前节点为括号 则递归括号内的内容
            const siblingNode = getTreeNode(expressionParts, node);
            if (!siblingNode) {
                //TODO 错误处理
                console.error('解析错误3', node);
                return null;
            }
            updateResultNode(siblingNode);
        }
    }
    // 当循环结束后 若此时树节点没有右节点和operator 则证明此节点为引用或者常量 将左节点取出并返回
    if (resultTreeNode.noRight && !resultTreeNode.operator) {
        return resultTreeNode.leftChild;
    }
    return findRoot(resultTreeNode);
}

/**
 * 找到树的根节点
 * @param treeRoot
 * @returns {*}
 */
function findRoot(treeRoot: TreeNode) {
    while (treeRoot.parent) {
        treeRoot = treeRoot.parent;
    }
    return treeRoot;
}

/**
 * 组装加减计算节点
 */
function assembleAddSubNode(currentNode: TreeNode, operator: string, afterNode: TreeNode) {
    if (currentNode.noRight) {
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
function assembleMulDivNode(currentNode: TreeNode, operator: string, afterNode: TreeNode) {
    if (currentNode.noRight) {
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
function assembleCompareNode(currentNode: TreeNode, operator: string, afterNode: TreeNode) {
    if (currentNode.noRight) {
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
