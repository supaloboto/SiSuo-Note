import { TreeNodeSet, FuncNode, TreeNode, VarNode, ConstNode, PointerNode, ArrayNode, StuctNode } from "./ast";

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

    addInput(input: Variable) {
        if (this._inputs.map(d => d.name).indexOf(input.name) === -1) {
            this._inputs.push(input);
        } else {
            // 替换已经声明的变量
            const index = this._inputs.findIndex(d => d.name === input.name);
            this._inputs[index] = input;
        }
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
 * 逻辑分支节点 处理if/else
 */
export class Branch extends LogicNode {
    // 条件列表
    private _conditions: LogicNode[];
    // 分支列表 每个元素都是一个函数调用节点 下标与条件列表对应
    private _branches: LogicNode[];

    constructor() {
        super();
        this._conditions = [];
        this._branches = [];
    }

    get conditions() {
        return this._conditions;
    }

    get branches() {
        return this._branches;
    }
}

/**
 * 循环节点 处理for/while
 */
export class Loop extends LogicNode {
    // 循环类型
    private _type: 'for' | 'while';
    // 循环条件
    private _condition: Calc | null = null;
    // 游标量
    private _cursor: Variable | null = null;
    // 游标变化
    private _cursorChange: LogicNode | null = null;

    constructor(type: 'for' | 'while') {
        super();
        this._type = type;
    }

    get type() {
        return this._type;
    }

    get condition() {
        return this._condition;
    }

    set condition(value) {
        this._condition = value;
    }

    get cursor() {
        return this._cursor;
    }

    set cursor(value) {
        this._cursor = value;
    }

    get cursorChange() {
        return this._cursorChange;
    }

    set cursorChange(value) {
        this._cursorChange = value;
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
 * 数组
 */
export class VarArray extends LogicNode {
    private _items: LogicNode[] = [];

    constructor() {
        super();
    }

    get items() {
        return this._items;
    }
}

/**
 * 结构体
 */
export class Struct extends LogicNode {
    private _props: { [key: string]: LogicNode } = {};

    constructor() {
        super();
    }

    get props() {
        return this._props;
    }
}

/**
 * 变量引用
 */
export class Pointer extends LogicNode {
    private _point_to: Variable | null = null;
    private _point_index: LogicNode | null = null;

    constructor() {
        super();
    }

    get target() {
        return this._point_to;
    }

    set target(variable) {
        this._point_to = variable;
    }

    get index() {
        return this._point_index;
    }

    set index(value) {
        this._point_index = value;
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
            // 对连续的逻辑分支节点进行特殊处理 将连续的if/elseif/else节点整合为一个节点
            if (node.operator === 'elseif' || node.operator === 'else') {
                const newBrancdLogicNode = this.astNodeToLogicNode(node) as Branch;
                // 如果是连续的逻辑分支节点 则将上一个逻辑分支节点取出
                const lastNode = this._logicRoot.execNodes[this._logicRoot.execNodes.length - 1] as Branch;
                // 将当前节点的条件和分支添加到上一个逻辑分支节点中
                lastNode.conditions.push(newBrancdLogicNode.conditions[0]);
                lastNode.branches.push(newBrancdLogicNode.branches[0]);
            } else {
                // 其他情况下逻辑节点直接添加到根节点
                this._logicRoot.execNodes.push(this.astNodeToLogicNode(node));
            }
        });
    }

    /**
     * 将AST树节点转换为逻辑树节点
     */
    astNodeToLogicNode(astTreeNode: TreeNode): LogicNode {
        // ============== 根据ast节点类型进行处理 ==============
        if (astTreeNode instanceof TreeNodeSet) {
            // -------------- 递归处理树节点集合 --------------
            const subTreeRender = new TreeRender(astTreeNode);
            // 使下级逻辑树可以使用当前节点的变量和方法
            subTreeRender._logicRoot.variables.push(...this._logicRoot.variables);
            subTreeRender._logicRoot.inputs.push(...this._logicRoot.inputs);
            subTreeRender.render();
            // 从下级逻辑树取得引用变量
            if (subTreeRender._logicRoot.inputs.length > 0) {
                subTreeRender._logicRoot.inputs.forEach((input) => this._logicRoot.addInput(input));
            }
            return subTreeRender._logicRoot;
        } else if (astTreeNode instanceof VarNode) {
            // -------------- 处理基础变量节点 --------------
            return this.transVariable(astTreeNode);
        } else if (astTreeNode instanceof PointerNode) {
            // -------------- 处理变量引用节点 --------------
            const astPointer = astTreeNode as PointerNode;
            const pointer = new Pointer();
            pointer.target = this.transVariable(astPointer.target);
            pointer.index = this.astNodeToLogicNode(astTreeNode.index as TreeNode);
            return pointer;
        } else if (astTreeNode instanceof ArrayNode) {
            // -------------- 处理数组节点 --------------
            const astArray = astTreeNode as ArrayNode;
            const array = new VarArray();
            astArray.items.forEach((item) => {
                array.items.push(this.astNodeToLogicNode(item));
            });
            return array;
        } else if (astTreeNode instanceof StuctNode) {
            // -------------- 处理结构体节点 --------------
            const astStruct = astTreeNode as StuctNode;
            const struct = new Struct();
            for (const key in astStruct.props) {
                struct.props[key] = this.astNodeToLogicNode(astStruct.props[key]);
            }
            return struct;
        } else if (astTreeNode instanceof ConstNode) {
            // -------------- 处理常量节点 --------------
            return new Constant(astTreeNode.value);
        }

        // ============== 如果节点类型为一般节点 则根据操作符进行处理 ==============
        if (!astTreeNode.operator) {
            //TODO 未知操作节点
            console.error('未知操作节点', astTreeNode);
            throw new Error('未知操作节点');
        }
        if (astTreeNode.operator === 'var' || astTreeNode.operator === 'ref') {
            // -------------- 处理变量声明节点 --------------
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
        } else if (astTreeNode.operator === 'if' || astTreeNode.operator === 'elseif' || astTreeNode.operator === 'else') {
            // -------------- 处理if节点 --------------
            const ifNode = new Branch();
            // 处理条件
            const condition = astTreeNode.operator === 'else' ? new Constant(true) : this.astNodeToLogicNode(astTreeNode.leftChild as TreeNode);
            // 处理then
            const thenBranchNode = new FuncNode(null);
            thenBranchNode.linkRight(astTreeNode.rightChild as TreeNodeSet);
            const thenBranch = this.transFuncCall(new TreeNode(null), thenBranchNode);
            // 记录条件和分支
            ifNode.conditions.push(condition);
            ifNode.branches.push(thenBranch);
            return ifNode;
        } else if (astTreeNode.operator === 'for') {
            // -------------- 处理for节点 --------------
            const loopNode = new Loop('for');
            // 取出循环变量定义 条件 值变化语句
            const loopParams = astTreeNode.leftChild as TreeNodeSet;
            // 处理游标变量
            const cursorAST = loopParams.getNodes()[0] as TreeNode;
            const cursor = new Variable(
                (cursorAST.leftChild as VarNode).name,
                'var',
                cursorAST.rightChild ? this.astNodeToLogicNode(cursorAST.rightChild) : new Constant(null)
            );
            loopNode.cursor = cursor;
            // 临时添加进变量列表 以方便后续拼接
            this._logicRoot.variables.push(cursor);
            // 处理条件
            loopNode.condition = this.transCalc(loopParams.getNodes()[1] as TreeNode);
            // 处理游标变化
            const cursorChange = this.astNodeToLogicNode(loopParams.getNodes()[2] as TreeNode);
            loopNode.cursorChange = cursorChange;
            // 处理循环体 循环体相当于一次函数调用
            const loopBodyAST = astTreeNode.rightChild as TreeNode;
            const loopBodyNode = this.transFuncCall(loopBodyAST, loopBodyAST.leftChild as FuncNode);
            loopNode.execNodes.push(loopBodyNode);
            // 去掉临时添加的变量
            this._logicRoot.variables.pop();
            // 返回
            return loopNode;
        } else if (astTreeNode.operator === 'while') {
            // -------------- 处理while节点 --------------
            const loopNode = new Loop('while');
            // 处理条件
            loopNode.condition = this.transCalc(astTreeNode.leftChild as TreeNode);
            // 处理循环体 循环体相当于一次函数调用
            const loopBodyAST = astTreeNode.rightChild as TreeNode;
            const loopBodyNode = this.transFuncCall(loopBodyAST, loopBodyAST.leftChild as FuncNode);
            loopNode.execNodes.push(loopBodyNode);
            // 返回
            return loopNode;
        }
        // ============== 判断节点的操作是否是方法调用 如果在可用方法中没有找到此方法 则认为是数学计算 ==============
        //TODO 处理内置方法
        const funcNode = this._context.functions.find(d => d.func === astTreeNode.operator) as FuncNode;
        if (!funcNode) {
            return this.transCalc(astTreeNode);
        }
        return this.transFuncCall(astTreeNode, funcNode);
    }

    /**
     * 将AST变量声明节点转换为逻辑节点
     */
    private transVariable(node: VarNode): Variable {
        // 处理入参或常量节点
        const variable = node.name;
        if (variable.startsWith('@')) {
            // 如果是要求外界输入的变量 则生成变量节点 值先为空
            const refer = new Variable(variable, 'import', new Constant(null));
            // 记录使用到了此参数
            if (this._logicRoot.inputs.map(d => d.name).indexOf(variable) === -1) {
                this._logicRoot.addInput(refer);
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
     * 将AST数学计算节点转换为逻辑节点
     */
    private transCalc(node: TreeNode): Calc {
        // 处理数学计算
        const calc = new Calc();
        calc.func = node.operator!;
        if (node.leftChild) {
            calc.params.push(this.astNodeToLogicNode(node.leftChild));
        }
        if (node.rightChild) {
            calc.params.push(this.astNodeToLogicNode(node.rightChild));
        }
        return calc;
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
                    const paramToArg = new TreeNode(null);
                    paramToArg.operator = 'var';
                    paramToArg.setLeft(new VarNode(param.name, node.token));
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
        // 从下级逻辑树取得引用变量
        if (subTreeRender._logicRoot.inputs.length > 0) {
            subTreeRender._logicRoot.inputs.forEach((input) => this._logicRoot.addInput(input));
        }
        return subTreeRender.logicRoot;
    }

}
