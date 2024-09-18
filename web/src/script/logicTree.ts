import { TreeNodeSet, FuncNode, TreeNode, VarNode, ConstNode } from "./ast";

/**
 * 将AST树转换为可执行逻辑节点树
 * 
 * @author 刘志栋
 * @since 2024-09-08
 */

/**
 * 节点基类
 */
export class LogicNode {
    // 局部变量
    private _variables: Variable[] = [];
    // 引用变量
    private _inputs: Variable[] = [];
    // 执行逻辑
    private _execNodes: LogicNode[] = [];

    constructor() {
    }

    get variables() {
        return this._variables;
    }

    get inputs() {
        return this._inputs;
    }

    get execNodes() {
        return this._execNodes;
    }
}

/**
 * 计算节点
 */
export class Calc extends LogicNode {
    // 计算方法
    private _func: string;
    // 参数
    private _params: LogicNode[];

    constructor() {
        super();
        this._func = '';
        this._params = [];
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
}

/**
 * 常量节点
 */
export class Constant extends LogicNode {
    // 常量值
    private _value: any;

    constructor(value: any) {
        super();
        this._value = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }
}

/**
 * 变量节点
 */
export class Variable extends LogicNode {
    // 变量名
    private _name: string;
    // 变量值
    private _value: LogicNode;
    // 变量类型
    private _type: 'ref' | 'var' | 'import';

    constructor(name: string, type: 'ref' | 'var' | 'import', value: LogicNode) {
        super();
        this._name = name;
        this._value = value;
        this._type = type;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }
}

/**
 * 树节点整理类
 */
export class TreeRender {
    private _logicRoot: LogicNode;

    constructor(astTreeNodeSet: TreeNodeSet) {
        // 初始化逻辑根节点
        this._logicRoot = new LogicNode();
        // 遍历AST树节点集合 渲染逻辑树
        astTreeNodeSet.getNodes().forEach((node) => {
            this._logicRoot.execNodes.push(this.astNodeToLogicNode(node));
        });
    }

    get logicRoot() {
        return this._logicRoot;
    }

    /**
     * 将AST树节点转换为逻辑树节点
     */
    astNodeToLogicNode(astTreeNode: TreeNode): LogicNode {
        // 根据ast节点类型进行处理
        if (astTreeNode instanceof TreeNodeSet) {
            // 递归处理树节点集合
            return new TreeRender(astTreeNode)._logicRoot;
        } else if (astTreeNode instanceof VarNode) {
            // 处理变量引用节点
            return this.transVariable(astTreeNode);
        } else if (astTreeNode.operator === 'var' || astTreeNode.operator === 'ref') {
            // 处理变量声明节点
            const variableNode = new Variable(
                (astTreeNode.leftChild as VarNode).name,
                astTreeNode.operator,
                astTreeNode.rightChild ? this.astNodeToLogicNode(astTreeNode.rightChild) : new Constant(null)
            );
            // 记录变量
            this._logicRoot.variables.push(variableNode);
            return variableNode;
        } else if (astTreeNode instanceof ConstNode) {
            // 处理常量节点
            return new Constant(astTreeNode.value);
        }
        // 处理普通节点
        return this.transNode(astTreeNode);
    }

    /**
     * 将AST变量声明节点转换为逻辑节点
     */
    private transVariable(node: VarNode): LogicNode {
        // 处理入参或常量节点
        const variable = node.name;
        if (variable.startsWith('@')) {
            // 如果是要求外界输入的变量 则生成变量节点 值先为空
            const refer = new Variable(variable, 'import', new Constant(null));
            // 记录使用到了此参数
            if (this._logicRoot.inputs.map(d => d.name).indexOf(variable) === -1) {
                this._logicRoot.inputs.push(refer);
            }
            return refer;
        } else if (this._logicRoot.variables.map(d => d.name).indexOf(variable) > -1) {
            // 如果是函数内部变量 则直接返回
            return this._logicRoot.variables.find(d => d.name === variable) as Variable;
        }
        //TODO 处理未定义变量
        throw new Error(`未定义变量:${node.name}`);
    }

    /**
     * 将AST普通节点转换为逻辑节点
     */
    private transNode(node: TreeNode): LogicNode {
        // // 判断节点的操作是否是方法调用
        // //TODO 处理内置方法
        // if (functions.map(d => d.name).indexOf(node.operator) > -1) {
        //     // 处理方法调用节点
        //     const func = functions.find(d => d.name === node.operator) as FuncNode;
        //     const calc = new Calc();
        //     calc.func = func.name;
        //     // 处理参数
        //     node.children.forEach((child) => {
        //         calc.params.push(this.transNode(child, variables, functions));
        //     });
        //     return calc;
        // }



        // 处理方法调用节点
        const calc = new Calc();
        if (!node.operator) {
            //TODO 未知操作节点
            throw new Error('未知操作节点');
        }
        calc.func = node.operator;
        if (node.leftChild) {
            calc.params.push(this.astNodeToLogicNode(node.leftChild));
        }
        if (node.rightChild) {
            calc.params.push(this.astNodeToLogicNode(node.rightChild));
        }

        return calc;
    }

}
