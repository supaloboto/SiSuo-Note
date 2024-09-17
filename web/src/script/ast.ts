import { ASTCalcNodeFactory } from "./ast/calc";
import { Token } from "./tokenization.js";

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
 * 函数节点类 树节点的一种 用于存储函数信息
 * 当为函数调用时 operator为空 _func为函数名 右节点为函数入参 (以后可以考虑实现左节点为对象)
 * 当为函数定义时 operator为func _func为函数名 右节点为函数体 _params为函数形参
 */
export class FuncNode extends TreeNode {
    private _func: string = '';
    // 函数的入参
    private _params: TreeNodeSet = new TreeNodeSet();

    constructor() {
        super();
    }

    get func() {
        return this._func;
    }

    set func(value) {
        this._func = value;
    }

    get params() {
        return this._params;
    }

    set params(value: TreeNodeSet) {
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
    functions: FuncNode[] = [];
    // 节点工厂
    calcFactory: ASTCalcNodeFactory;

    constructor() {
        this.calcFactory = new ASTCalcNodeFactory(this);
    }

    getAST(tokens: Token[]): TreeNodeSet {
        const result = new TreeNodeSet();
        // 分割语句
        const sentenceList: Token[][] = [];
        let buffer: Token[] = [];
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            // 以分号断句
            if (token.content === ';') {
                sentenceList.push(buffer.splice(0));
            } else {
                buffer.push(token);
            }
        }
        if (buffer.length > 0) {
            sentenceList.push(buffer.splice(0));
        }
        // 解析语句为AST节点
        sentenceList.forEach((sentence) => {
            result.addNode(this.getNode(sentence));
        });
        return result;
    }

    getNode(sentence: Token[]): TreeNode {
        // 解析语句开头关键字
        const sentenceType = sentence[0].content;
        if (sentenceType === 'var' || sentenceType === 'ref') {
            // 解析变量定义语句
            const treeNode = new TreeNode();
            // 变量名
            const varName = sentence[1];
            // 变量定义语句
            const varDefine: Token[] = sentence.slice(3);
            // 记录语句为AST节点
            treeNode.operator = sentenceType;
            const varNode = new VarNode(varName);
            treeNode.setLeft(varNode);
            treeNode.setRight(this.calcFactory.assembleCalcNode(varDefine));
            // 记录变量信息
            this.variables.push(varNode);
            return treeNode;
        } else if (sentenceType === 'if') {
            //TODO 解析if语句
        } else if (sentenceType === 'elseif') {

        } else if (sentenceType === 'else') {

        } else if (sentenceType === 'for') {

        } else if (sentenceType === 'function') {
            // 解析函数定义语句
            const funcNode = new FuncNode();
            funcNode.operator = 'function';
            funcNode.func = sentence[1].content;
            //TODO 入参
            funcNode.params = this.getAST(sentence[2].children);
            // 函数体
            funcNode.setRight(this.getAST(sentence[3].children));
            // 记录函数信息
            this.functions.push(funcNode);
            return funcNode;
        } else if (sentenceType === 'return') {
            //TODO 解析返回语句
            const treeNode = new TreeNode();
            treeNode.operator = 'return';
            treeNode.setLeft(this.calcFactory.assembleCalcNode(sentence.slice(1)));
            return treeNode;
        }

        // 关键字没有命中时 解析语句动作类型
        if (sentence[1].content === '=') {
            // 解析赋值语句
            const treeNode = new TreeNode();
            treeNode.operator = '=';
            treeNode.setLeft(new VarNode(sentence[0]));
            treeNode.setRight(this.calcFactory.assembleCalcNode(sentence.splice(2)));
            return treeNode;
        } else if (sentence[1].type === 'bracket') {
            // 解析函数调用语句 
            const treeNode = new TreeNode();
            // 查找函数定义
            const funcNode = this.functions.find((node) => node.func === sentence[0].content);
            if (!funcNode) {
                //TODO 内置函数集合
                throw new Error('未定义的函数 ' + sentence[0]);
            }
            // 记录函数调用为AST节点
            treeNode.operator = funcNode.func;
            //TODO 入参
            treeNode.setRight(this.getAST(sentence[1].children));
            return treeNode;
        }

        // 未知语句类型
        throw new Error('未知语句类型 ' + sentence);
    }

}
