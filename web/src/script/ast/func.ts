import { ASTAnalyser, FuncNode, TreeNodeSet, VarNode } from "../ast";
import type { Token } from "../tokenization";

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

}