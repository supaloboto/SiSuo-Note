import { ASTCalcNodeFactory } from "./ast/calc";
import { ASTFuncNodeFactory } from "./ast/func";
import { Token } from "./tokenization.js";

/**
 * AST抽象语法树
 * 
 * @author 刘志栋
 * @since 2024-09-08
 */

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
     * 将节点设置为自己的左节点 并维护父子关系
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
     * 将节点设置为自己的右节点 并维护父子关系
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

    /**
     * 链接左节点 仅表达引用关系 不维护父子关系
     */
    linkLeft(node: TreeNode) {
        this.leftChild = node;
    }

    /**
     * 链接右节点 仅表达引用关系 不维护父子关系
     */
    linkRight(node: TreeNode) {
        this.rightChild = node;
    }

}

/**
 * 函数节点类 树节点的一种 用于存储函数信息
 * operator为'function' _func为函数名 左节点为函数入参TreeNodeSet 右节点为函数体TreeNodeSet
 */
export class FuncNode extends TreeNode {
    private _func: string = '';

    constructor() {
        super();
    }

    get func() {
        return this._func;
    }

    set func(value) {
        this._func = value;
    }
}

/**
 * 变量节点类 树节点的一种 用于存储变量信息
 */
export class VarNode extends TreeNode {
    private _name: string;

    constructor(name: string) {
        super();
        this._name = name;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }
}

/**
 * 常量节点类 树节点的一种 用于存储常量
 */
export class ConstNode extends TreeNode {
    private _value: any;

    constructor(value: any) {
        super();
        this._value = value;
    }

    get value() {
        return this._value;
    }
}

/**
 * 树节点集合类 树节点的一种 用于存储多个节点
 */
export class TreeNodeSet extends TreeNode {
    private nodes: TreeNode[] = [];
    // 局部变量集合
    private _variables: VarNode[] = [];
    // 局部方法集合 
    private _functions: FuncNode[] = [];

    constructor() {
        super();
    }

    addNode(node: TreeNode) {
        this.nodes.push(node);
    }

    getNodes() {
        return this.nodes;
    }

    get variables() {
        return this._variables;
    }

    set variables(value) {
        this._variables = value;
    }

    get functions() {
        return this._functions;
    }

    set functions(value) {
        this._functions = value;
    }
}

/**
 * 解析表达式为AST
 */
export function tokenToAST(tokens: Token[]): TreeNodeSet {
    return new ASTAnalyser().getAST(tokens);
}

/*
 * AST解析器
 */
export class ASTAnalyser {
    // 语法树内部变量集合
    variables: VarNode[] = [];
    // 语法树内部方法集合
    //TODO 内置函数集合
    functions: FuncNode[] = [];
    // 节点工厂
    calcFactory: ASTCalcNodeFactory;
    funcFactory: ASTFuncNodeFactory;

    constructor() {
        this.calcFactory = new ASTCalcNodeFactory(this);
        this.funcFactory = new ASTFuncNodeFactory(this);
    }

    /**
     * 添加可用变量 当结构体嵌套时外部结构可能会向内部结构传递变量
     */
    addVariables(varNodes: VarNode[]) {
        this.variables.push(...varNodes);
    }

    /**
     * 添加可用方法 当结构体嵌套时外部结构可能会向内部结构传递方法
     */
    addFunctions(funcNodes: FuncNode[]) {
        this.functions.push(...funcNodes);
    }

    getAST(tokens: Token[]): TreeNodeSet {
        const result = new TreeNodeSet();
        // 解析语句为AST节点
        let currentSentence: Token[] = tokens;
        while (currentSentence.length > 0) {
            // 将语句传入解析器
            const [treeNode, sentenceEnd] = this.getNode(currentSentence);
            result.addNode(treeNode);
            // 解析下一条语句
            currentSentence = currentSentence.slice(sentenceEnd + 1);
        }
        // 赋予局部变量和方法集合
        result.variables = this.variables;
        result.functions = this.functions;
        return result;
    }

    /**
     * 解析语句为AST节点
     * @returns [AST节点, 当前语句结束位置]
     */
    getNode(fullSentence: Token[]): [TreeNode, number] {
        // 按分号分割语句
        let sentenceEnd = fullSentence.findIndex((token) => token.content === ';');
        if (sentenceEnd === -1) {
            sentenceEnd = fullSentence.length;
        }
        const sentence = fullSentence.slice(0, sentenceEnd);
        // 解析语句开头关键字
        const sentenceType = sentence[0].content;
        if (sentenceType === 'var' || sentenceType === 'ref') {
            // 解析变量定义语句
            const treeNode = new TreeNode();
            const varNode = new VarNode(sentence[1].content);
            // 记录变量信息
            this.variables.push(varNode);
            // 变量定义语句左侧为变量名 右侧为计算节点
            treeNode.operator = sentenceType;
            treeNode.setLeft(varNode);
            treeNode.setRight(this.calcFactory.assembleCalcNode(sentence.slice(3)));
            return [treeNode, sentenceEnd];
        } else if (sentenceType === 'if') {
            //TODO 解析if语句
        } else if (sentenceType === 'elseif') {

        } else if (sentenceType === 'else') {

        } else if (sentenceType === 'for') {

        } else if (sentenceType === 'function') {
            // 解析函数定义语句
            const funcNode = this.funcFactory.assembleFuncNode(sentence[2], sentence[3]);
            funcNode.operator = 'function';
            funcNode.func = sentence[1].content;
            // 记录函数信息
            this.functions.push(funcNode);
            // 语句结束于函数体闭合位置
            return [funcNode, 3];
        } else if (sentenceType === 'return') {
            //TODO 解析返回语句
            const treeNode = new TreeNode();
            treeNode.operator = 'return';
            treeNode.setLeft(this.calcFactory.assembleCalcNode(sentence.slice(1)));
            return [treeNode, sentenceEnd];
        }

        // 关键字没有命中时 解析语句动作类型
        if (sentence[1].content === '=') {
            // 解析赋值语句
            const treeNode = new TreeNode();
            treeNode.operator = '=';
            const varNode = this.variables.find((node) => node.name === sentence[0].content);
            //TODO 处理变量找不到时的情况
            if (!varNode) {
                throw new Error('未定义的变量 ' + sentence[0]);
            }
            treeNode.linkLeft(varNode);
            treeNode.setRight(this.calcFactory.assembleCalcNode(sentence.splice(2)));
            return [treeNode, sentenceEnd];
        } else if (sentence[1].type === 'bracket') {
            // 解析函数调用语句 
            const treeNode = new TreeNode();
            // 查找函数定义
            const funcNode = this.functions.find((node) => node.func === sentence[0].content);
            if (!funcNode) {
                throw new Error('未定义的函数 ' + sentence[0]);
            }
            // 记录函数调用为AST节点
            treeNode.operator = funcNode.func;
            //TODO 入参
            treeNode.setRight(this.getAST(sentence[1].children));
            return [treeNode, sentenceEnd];
        }

        // 未知语句类型
        throw new Error('未知语句类型 ' + sentence);
    }

}
