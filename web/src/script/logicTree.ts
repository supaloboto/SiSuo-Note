import { TreeNodeSet, FuncNode, TreeNode, VarNode } from "./ast";

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
    constructor() {
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
    // 变量声明
    private _defines: Variable[] = [];
    // 用到的传入参数
    private _params: Variable[] = [];
    // 执行逻辑
    private _execNodes: LogicNode[] = [];

    constructor() {
    }

    get params() {
        return this._params;
    }

    get defines() {
        return this._defines;
    }

    get execNodes() {
        return this._execNodes;
    }

    /**
     * 渲染树节点 将AST树转换为可执行逻辑
     */
    render(astTreeNode: TreeNode) {
        // 处理单个节点的方法
        const transNode = (node: TreeNode): LogicNode => {
            if (node instanceof VarNode) {
                // 处理入参或常量节点
                const variable = node.name;
                if (variable.startsWith('@')) {
                    // 如果是要求外界输入的变量 则生成变量节点 值先为空
                    const refer = new Variable(variable, 'import', new Constant(null));
                    // 记录使用到了此参数
                    this._params.push(refer);
                    return refer;
                } else if (this._defines.map(d => d.name).indexOf(variable) > -1) {
                    // 如果是由函数内部定义的变量 则直接返回
                    return this._defines.find(d => d.name === variable) as Variable;
                } else {
                    // 常量
                    return new Constant(node.name);
                }
            }
            // 处理计算节点
            const calc = new Calc();
            if (!node.operator) {
                //TODO 未知操作节点
                throw new Error('未知操作节点');
            }
            calc.func = node.operator;
            if (node.leftChild) {
                calc.params.push(transNode(node.leftChild));
            }
            if (node.rightChild) {
                calc.params.push(transNode(node.rightChild));
            }
            return calc;
        }
        // 根据ast节点类型进行处理
        if (astTreeNode instanceof TreeNodeSet) {
            // 递归处理树节点集合
            astTreeNode.getNodes().forEach((node) => {
                this.render(node);
            });
            return;
        } else if (astTreeNode instanceof FuncNode) {
            // 处理函数节点
            const calcNode = new Calc();
            calcNode.func = astTreeNode.func;
            astTreeNode.params.getNodes().forEach((param) => {
                calcNode.params.push(transNode(param));
            });
            this._execNodes.push(calcNode);
            return;
        } else if (astTreeNode.operator === 'var' || astTreeNode.operator === 'ref') {
            // 处理变量声明节点
            const variable = new Variable(
                (astTreeNode.leftChild as VarNode).name,
                astTreeNode.operator,
                astTreeNode.rightChild ? transNode(astTreeNode.rightChild) : new Constant(null)
            );
            this._defines.push(variable);
            return;
        }
        // 处理普通节点
        this._execNodes.push(transNode(astTreeNode));
    }
}
