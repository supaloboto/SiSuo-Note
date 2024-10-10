import { ASTCalcNodeFactory } from "./ast/calc";
import { ASTFuncNodeFactory } from "./ast/func";
import { Token } from "./tokenization.js";
import i18n from "@/assets/lang";

const $t = i18n.global.t;

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
    // 指向token
    private _token: Token | null = null;

    constructor(token: Token | null) {
        this._token = token;
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

    get token() {
        return this._token;
    }

    set token(value) {
        this._token = value;
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
 * 常量节点类 树节点的一种 用于存储常量
 */
export class ConstNode extends TreeNode {
    private _value: any;

    constructor(value: any, token: Token | null) {
        super(token);
        this._value = value;
    }

    get value() {
        return this._value;
    }
}

/**
 * 变量节点类 树节点的一种 用于存储变量信息
 */
export class VarNode extends TreeNode {
    private _name: string;

    constructor(name: string, token: Token | null) {
        super(token);
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
 * 数组节点类 树节点的一种 用于存储数组变量信息
 */
export class ArrayNode extends TreeNode {
    private _items: TreeNode[] = [];

    constructor(token: Token | null) {
        super(token);
    }

    get items() {
        return this._items;
    }
}

/**
 * 结构体节点类 树节点的一种 用于存储结构体变量信息
 */
export class StuctNode extends TreeNode {
    private _props: { [key: string]: TreeNode } = {};

    constructor(token: Token | null) {
        super(token);
    }

    get props() {
        return this._props;
    }
}

/**
 * 变量引用类 树节点的一种 用于存储变量引用信息
 * 当直接引用基础类型变量时 引用者可以直接与变量做link操作 但如果引用的是数组或结构体 则需要在link变量的基础上再添加对下标或属性名的引用参数
 */
export class PointerNode extends TreeNode {
    private _point_index: TreeNode | null = null;

    constructor(token: Token | null) {
        super(token);
    }

    pointTo(varNode: VarNode, index: TreeNode) {
        this.linkLeft(varNode);
        this._point_index = index;
    }

    get target(): VarNode {
        return this.leftChild as VarNode;
    }

    get index() {
        return this._point_index;
    }
}

/**
 * 函数节点类 树节点的一种 用于存储函数信息
 * operator为'function' _func为函数名 左节点为函数入参TreeNodeSet 右节点为函数体TreeNodeSet
 */
export class FuncNode extends TreeNode {
    private _func: string = '';

    constructor(token: Token | null) {
        super(token);
    }

    get func() {
        return this._func;
    }

    set func(value) {
        this._func = value;
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
        super(null);
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
        let currentSentence: Token[] = tokens.filter((token) => token.type !== 'comment');
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
        // =============== 解析语句开头关键字 ===============
        const sentenceType = sentence[0].content;
        if (sentenceType === 'var' || sentenceType === 'ref') {
            // ------------- 解析变量定义语句 -------------
            const treeNode = new TreeNode(sentence[0]);
            const varNode = new VarNode(sentence[1].content, sentence[1]);
            // 记录变量信息
            this.variables.push(varNode);
            // 变量定义语句左侧为变量名 右侧为计算节点
            treeNode.operator = sentenceType;
            treeNode.setLeft(varNode);
            treeNode.setRight(this.calcFactory.assembleCalcNode(sentence.slice(3)));
            return [treeNode, sentenceEnd];
        } else if (sentenceType === 'if' || sentenceType === 'elseif' || sentenceType === 'else') {
            // ------------- 解析if语句 -------------
            const ifNode = new TreeNode(sentence[0]);
            ifNode.operator = sentenceType;
            const condition = sentenceType === 'else' ? null : this.calcFactory.assembleCalcNode(sentence[1].children);
            const then = sentenceType === 'else' ?
                this.funcFactory.getFuncBodyAsNodeSet(sentence[1]) : this.funcFactory.getFuncBodyAsNodeSet(sentence[2]);
            ifNode.setLeft(condition);
            ifNode.setRight(then);
            // 语句结束于函数体闭合位置
            return sentenceType === 'else' ? [ifNode, 1] : [ifNode, 2];
        } else if (sentenceType === 'for') {
            // ------------- 解析for语句 -------------
            const forNode = new TreeNode(sentence[0]);
            forNode.operator = sentenceType;
            // 第一个括号为循环变量定义和值变化
            const condition: TreeNodeSet = this.funcFactory.getForiLoopConditionSet(sentence[1]);
            // 第二个括号为循环体
            const funcBody: TreeNode = this.funcFactory.getForiLoopBodyNode(sentence[2], condition.variables[0]);
            forNode.setLeft(condition);
            forNode.setRight(funcBody);
            // 语句结束于函数体闭合位置
            return [forNode, 2];
        } else if (sentenceType === 'while') {
            // ------------- 解析while语句 -------------
            const whileNode = new TreeNode(sentence[0]);
            whileNode.operator = sentenceType;
            // 第一个括号为循环条件
            const condition: TreeNode = this.calcFactory.assembleCalcNode(sentence[1].children)!;
            // 第二个括号为循环体
            const funcBody: TreeNode = this.funcFactory.getForiLoopBodyNode(sentence[2], null);
            whileNode.setLeft(condition);
            whileNode.setRight(funcBody);
            // 语句结束于函数体闭合位置
            return [whileNode, 2];
        } else if (sentenceType === 'break' || sentenceType === 'continue') {
            // ------------- 解析循环控制语句 -------------
            const treeNode = new TreeNode(sentence[0]);
            treeNode.operator = sentenceType;
            return [treeNode, sentenceEnd];
        } else if (sentenceType === 'function') {
            // ------------- 解析函数定义语句 -------------
            const funcNode = this.funcFactory.assembleFuncNode(sentence[2], sentence[3]);
            funcNode.operator = 'function';
            funcNode.func = sentence[1].content;
            // 记录函数信息
            this.functions.push(funcNode);
            // 语句结束于函数体闭合位置
            return [funcNode, 3];
        } else if (sentenceType === 'return') {
            // ------------- 解析返回语句 -------------
            const treeNode = new TreeNode(sentence[0]);
            treeNode.operator = 'return';
            treeNode.setLeft(this.calcFactory.assembleCalcNode(sentence.slice(1)));
            return [treeNode, sentenceEnd];
        }

        // =============== 关键字没有命中时 解析语句动作类型 ===============
        if (sentence[1].content === '=') {
            // ------------- 解析赋值语句 -------------
            const treeNode = new TreeNode(sentence[0]);
            treeNode.operator = '=';
            const varNode = this.getVarNode(sentence[0]);
            if (!varNode) {
                sentence[0].error = $t("script.error.undefined_variable") + sentence[0].content;
            } else {
                treeNode.linkLeft(varNode);
                treeNode.setRight(this.calcFactory.assembleCalcNode(sentence.slice(2)));
            }
            return [treeNode, sentenceEnd];
        } else if (['+=', '-=', '*=', '/=', '%='].includes(sentence[1].content)) {
            // ------------- 解析复合赋值语句 -------------
            const treeNode = new TreeNode(sentence[0]);
            treeNode.operator = '=';
            const varNode = this.getVarNode(sentence[0]);
            if (!varNode) {
                sentence[0].error = $t("script.error.undefined_variable") + sentence[0].content;
            } else {
                treeNode.linkLeft(varNode);
            }
            // 复合赋值语句右侧为计算节点
            const operatorToken = new Token('assist', sentence[1].content[0], sentence[1].start, sentence[1].end);
            const calcTokens = [sentence[0], operatorToken, ...sentence.slice(2)];
            const calcNode = this.calcFactory.assembleCalcNode(calcTokens);
            treeNode.setRight(calcNode);
            return [treeNode, sentenceEnd];
        } else if (sentence[1].type === 'bracket') {
            // ------------- 解析函数调用语句 -------------
            const treeNode = new TreeNode(sentence[0]);
            // 查找函数定义
            const funcNode = this.functions.find((node) => node.func === sentence[0].content);
            if (!funcNode) {
                treeNode.token!.error = $t("script.error.undefined_function") + sentence[0].content;
            }
            // 记录函数调用为AST节点
            treeNode.operator = sentence[0].content;
            treeNode.setRight(this.getAST(sentence[1].children));
            return [treeNode, sentenceEnd];
        }

        // =============== 未知语句类型 ===============
        sentence[0].error = $t("script.error.unknown_operator");
        return [new TreeNode(sentence[0]), sentenceEnd];
    }

    /**
     * 根据token获取变量节点
     */
    getVarNode(token: Token): VarNode | ArrayNode | StuctNode | PointerNode | undefined {
        const varName = token.content;
        // 获取变量或引用
        const getVarOrImport = (name: string): VarNode | undefined => {
            const varNode = name.startsWith('@') ? new VarNode(name, token) : this.variables.find((node) => node.name === name);
            if (!varNode) {
                return undefined;
            }
            return varNode as VarNode;
        }
        // 当token没有下级时 代表为基础变量或对象引用
        if (token.children.length === 0) {
            // 检查是否为对象引用
            if (varName.includes('.')) {
                const [pointerName, index] = varName.split('.');
                const pointer = getVarOrImport(pointerName);
                if (!pointer) {
                    return undefined;
                }
                const pointerNode = new PointerNode(token);
                pointerNode.pointTo(pointer, new ConstNode(index, null));
                return pointerNode;
            } else {
                return getVarOrImport(varName);
            }
        }
        // 当token有下级时按数组语法处理
        // 若token的content为空 代表为新建数组或对象
        if (!varName) {
            if (token.type === 'array') {
                return this.calcFactory.getArrayNode(token);
            }
            if (token.type === 'function') {
                return this.calcFactory.getStructNode(token)
            }
        }
        // 若token的content不为空 代表为数组引用 或以数组引用形式进行的对象引用
        const pointerNode = new PointerNode(token);
        const pointer = getVarOrImport(varName);
        if (!pointer) {
            return undefined;
        }
        pointerNode.pointTo(pointer, this.calcFactory.assembleCalcNode(token.children)!);
        return pointerNode;
    }

}
