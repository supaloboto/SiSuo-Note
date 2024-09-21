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
    private _context: TreeNodeSet;

    constructor(astContext: TreeNodeSet) {
        // 初始化逻辑根节点
        this._logicRoot = new LogicNode();
        // 遍历AST树节点集合 渲染逻辑树
        this._context = astContext;
    }

    get logicRoot() {
        return this._logicRoot;
    }

    /**
     * 渲染逻辑树
     */
    render() {
        this._context.getNodes().forEach((node) => {
            // 越过函数声明节点 函数声明节点在函数被调用的地方处理
            if (node instanceof FuncNode) {
                return;
            }
            this._logicRoot.execNodes.push(this.astNodeToLogicNode(node));
        });
    }

    /**
     * 将AST树节点转换为逻辑树节点
     */
    astNodeToLogicNode(astTreeNode: TreeNode): LogicNode {
        // 根据ast节点类型进行处理
        if (astTreeNode instanceof TreeNodeSet) {
            // 递归处理树节点集合
            const subTreeRender = new TreeRender(astTreeNode);
            // 使下级逻辑树可以使用当前节点的变量和方法
            subTreeRender._logicRoot.variables.push(...this._logicRoot.variables);
            subTreeRender._logicRoot.inputs.push(...this._logicRoot.inputs);
            subTreeRender.render();
            return subTreeRender._logicRoot;
        } else if (astTreeNode instanceof VarNode) {
            // 处理变量引用节点
            return this.transVariable(astTreeNode);
        } else if (astTreeNode instanceof ConstNode) {
            // 处理常量节点
            return new Constant(astTreeNode.value);
        } else if (astTreeNode.operator === 'var' || astTreeNode.operator === 'ref') {
            // 处理变量声明节点
            const variableNode = new Variable(
                (astTreeNode.leftChild as VarNode).name,
                astTreeNode.operator,
                astTreeNode.rightChild ? this.astNodeToLogicNode(astTreeNode.rightChild) : new Constant(null)
            );
            // 记录变量
            if (this._logicRoot.variables.map(d => d.name).indexOf(variableNode.name) === -1) {
                this._logicRoot.variables.push(variableNode);
            } else {
                // 替换已经声明的变量 这种情况出现在函数调用时 若函数内部有变量和外部变量同名 则会被替换
                const index = this._logicRoot.variables.findIndex(d => d.name === variableNode.name);
                this._logicRoot.variables[index] = variableNode;
            }
            return variableNode;
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
     * 将AST数据操作节点转换为逻辑节点
     */
    private transNode(node: TreeNode): LogicNode {
        if (!node.operator) {
            //TODO 未知操作节点
            console.error('未知操作节点', node);
            throw new Error('未知操作节点');
        }
        // 判断节点的操作是否是方法调用 如果在可用方法中没有找到此方法 则认为是数学计算
        //TODO 处理内置方法
        const funcNode = this._context.functions.find(d => d.func === node.operator) as FuncNode;
        if (!funcNode) {
            // 处理数学计算
            const calc = new Calc();
            calc.func = node.operator;
            if (node.leftChild) {
                calc.params.push(this.astNodeToLogicNode(node.leftChild));
            }
            if (node.rightChild) {
                calc.params.push(this.astNodeToLogicNode(node.rightChild));
            }
            return calc;
        }
        return this.transFuncCall(node, funcNode);
    }

    /**
     * 将AST函数调用节点转换为逻辑节点
     */
    private transFuncCall(callNode: TreeNode, funcNode: FuncNode): LogicNode {
        // 处理方法调用
        const funcBody: TreeNodeSet = funcNode.rightChild as TreeNodeSet;
        // 取函数的形参和实参
        const params: TreeNodeSet | null = funcNode.leftChild ? funcNode.leftChild as TreeNodeSet : null;
        const args: TreeNodeSet | null = callNode.rightChild ? callNode.rightChild as TreeNodeSet : null;
        //TODO 处理参数不匹配的情况
        if ((!params && args) || (params && !args)) {
            console.error('参数不匹配:方法', funcNode.func, '形参', params, '实参', args);
            throw new Error('参数不匹配');
        }
        // 构建下级逻辑树
        const subTreeRender = new TreeRender(funcBody);
        // 修改下级逻辑树的上下文
        if (params && args) {
            const subContext = new TreeNodeSet();
            params.getNodes().forEach((node: TreeNode, index: number) => {
                // 形参
                const param = node as VarNode;
                // 实参
                const arg = args.getNodes()[index] as VarNode;
                //TODO 处理变量没有找到的情况
                const varialbleToChange = subTreeRender._context.variables.find(d => d.name === param.name);
                if (varialbleToChange) {
                    // 为形参添加变量声明过程 使形参化为实参
                    const paramToArg = new TreeNode();
                    paramToArg.operator = 'var';
                    paramToArg.setLeft(new VarNode(param.name));
                    paramToArg.setRight(arg);
                    subContext.addNode(paramToArg);
                }
            });
            subContext.variables = subTreeRender._context.variables;
            subContext.functions = subTreeRender._context.functions;
            subTreeRender._context.getNodes().forEach((node: TreeNode) => subContext.addNode(node));
            subTreeRender._context = subContext;
        }
        // 使下级逻辑树可以使用当前节点的变量和方法
        subTreeRender._logicRoot.variables.push(...this._logicRoot.variables);
        subTreeRender._logicRoot.inputs.push(...this._logicRoot.inputs);
        // 构建函数节点
        subTreeRender.render();
        return subTreeRender.logicRoot;
    }

}
