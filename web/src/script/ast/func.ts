import { ASTAnalyser, FuncNode, TreeNode, TreeNodeSet, VarNode } from "../ast";
import { Token } from "../tokenization";

/**
 * AST函数节点工厂
 *
 * @author 刘志栋
 * @since 2024/09/16
 */
export class ASTFuncNodeFactory {
    private analyser: ASTAnalyser;

    constructor(analyser: ASTAnalyser) {
        this.analyser = analyser;
    }

    /**
     * 整理函数节点
     */
    assembleFuncNode(params: Token | null, body: Token): FuncNode {
        const funcNode = new FuncNode();
        // 入参 存储于函数节点的左子节点
        const paramNodes: VarNode[] = [];
        funcNode.leftChild = new TreeNodeSet();
        if (params) {
            params.children.forEach((param) => {
                if (param.content === ',' || param.content === ';') {
                    return;
                }
                const paramNode = new VarNode(param.content);
                paramNodes.push(paramNode);
                (funcNode.leftChild as TreeNodeSet).addNode(paramNode);
            });
        }
        // 函数体 新建一个AST解析器用于解析函数体
        const childAnalyser = new ASTAnalyser();
        childAnalyser.addVariables(paramNodes);
        childAnalyser.addFunctions([funcNode]);
        // 将外层的变量和函数传递给内层
        childAnalyser.addVariables(this.analyser.variables);
        childAnalyser.addFunctions(this.analyser.functions);
        // 整理函数体 存储于函数节点的右子节点
        funcNode.setRight(childAnalyser.getAST(body.children));
        return funcNode;
    }

    /**
     * 整理函数体节点 作为TreeNodeSet返回 用于if或for等情况
     */
    getFuncBodyAsNodeSet(funcBody: Token): TreeNodeSet {
        // 函数体 新建一个AST解析器用于解析函数体
        const childAnalyser = new ASTAnalyser();
        // 将外层的变量和函数传递给内层
        childAnalyser.addVariables(this.analyser.variables);
        childAnalyser.addFunctions(this.analyser.functions);
        // 整理函数体
        return childAnalyser.getAST(funcBody.children);
    }

    /**
     * 整理for循环的条件节点 作为TreeNodeSet返回
     */
    getForiLoopConditionSet(condition: Token): TreeNodeSet {
        const result = new TreeNodeSet();
        const tokens: Token[][] = [[]];
        // 按分号分割tokens 变为三行
        condition.children.forEach((token) => {
            if (token.content === ';') {
                tokens.push([]);
            } else {
                tokens[tokens.length - 1].push(token);
            }
        });
        // 第一行是初始化变量 i = 0
        const cursorDefineToken = tokens[0];
        const cursorVar: TreeNode = new TreeNode();
        cursorVar.operator = 'var';
        cursorVar.setLeft(new VarNode(cursorDefineToken[0].content));
        cursorVar.setRight(this.analyser.calcFactory.assembleCalcNode(cursorDefineToken.slice(2)));
        result.addNode(cursorVar);
        // 将变量存入变量表
        result.variables.push(cursorVar.leftChild as VarNode);
        // 临时添加进变量列表 以方便后续拼接
        this.analyser.variables.push(cursorVar.leftChild as VarNode);
        // 第二行是循环条件 i < n
        const cursorConditionToken = tokens[1];
        const cursorCondition = this.analyser.calcFactory.assembleCalcNode(cursorConditionToken);
        result.addNode(cursorCondition!);
        // 第三行是循环变量变化 i+=1 / i = i + 1
        const cursorChangeToken = tokens[2];
        const cursorChange: TreeNode = new TreeNode();
        cursorChange.operator = '=';
        cursorChange.linkLeft(cursorVar.leftChild as VarNode);
        if (cursorChangeToken[1].content != '=') {
            // 若使用复核运算符 则添加辅助token用于拼接计算节点
            const operatorToken = new Token('assist', cursorChangeToken[1].content[0], cursorChangeToken[1].start, cursorChangeToken[1].end);
            const calcTokens = [cursorChangeToken[0], operatorToken, ...cursorChangeToken.slice(2)];
            cursorChange.setRight(this.analyser.calcFactory.assembleCalcNode(calcTokens));
        } else {
            cursorChange.setRight(this.analyser.calcFactory.assembleCalcNode(cursorChangeToken.slice(2)));
        }
        result.addNode(cursorChange);
        // 去掉临时添加的变量
        this.analyser.variables.pop();
        // 返回 注意返回的TreeNodeSet的变量表中包含了一个新的变量
        return result;
    }

    /**
     * 整理for/while循环的循环逻辑 作为一次函数调用返回
     */
    getForiLoopBodyNode(funcBody: Token, cursorVar: VarNode | null): TreeNode {
        // 整理函数节点
        const funcNode = new FuncNode();
        funcNode.leftChild = new TreeNodeSet();
        // 函数体 新建一个AST解析器用于解析函数体
        const childAnalyser = new ASTAnalyser();
        if (cursorVar) {
            (funcNode.leftChild as TreeNodeSet).addNode(cursorVar);
            childAnalyser.addVariables([cursorVar]);
        }
        // 将外层的变量和函数传递给内层
        childAnalyser.addVariables(this.analyser.variables);
        childAnalyser.addFunctions(this.analyser.functions);
        // 整理函数体 存储于函数节点的右子节点
        funcNode.setRight(childAnalyser.getAST(funcBody.children));
        // 整理参数节点
        const argsNode = new TreeNodeSet();
        if (cursorVar) {
            argsNode.addNode(cursorVar);
        }
        // 整理函数调用节点
        const callNode = new TreeNode();
        callNode.setRight(argsNode);
        callNode.setLeft(funcNode);
        return callNode;
    }

}