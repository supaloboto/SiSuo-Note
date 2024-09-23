import { ConstNode, TreeNode, TreeNodeSet, VarNode, type ASTAnalyser } from "../ast";
import { Token } from "../tokenization";

/**
 * AST计算节点工厂
 *
 * @author 刘志栋
 * @since 2024/09/16
 */
export class ASTCalcNodeFactory {
    private analyser: ASTAnalyser;

    constructor(analyser: ASTAnalyser) {
        this.analyser = analyser;
    }

    /**
     * 组装计算和逻辑判断节点
     */
    assembleCalcNode(tokens: Token[]): TreeNode | null {
        // 组建单个节点
        let resultTreeNode = new TreeNode();
        // 判断是否为函数调用 若为函数调用则拼装函数节点
        const funcNode = this.analyser.functions.find((node) => node.func === tokens[0].content);
        if (funcNode && tokens[1].type === 'bracket') {
            const funcCallNode = new TreeNode();
            funcCallNode.operator = tokens[0].content;
            // 整理函数的入参 将括号内容按逗号或分号分割 然后将分割结果整理为节点集合
            const argTokenTable: Token[][] = [[]];
            tokens[1].children.forEach((arg) => {
                if (arg.content === ',' || arg.content === ';') {
                    argTokenTable.push([]);
                } else {
                    argTokenTable.slice(-1)[0].push(arg);
                }
            });
            const args = new TreeNodeSet();
            argTokenTable.forEach((argTokenList) => {
                const argNode = this.assembleCalcNode(argTokenList);
                if (argNode) {
                    args.addNode(argNode);
                }
            });
            funcCallNode.setRight(args);
            // 根据语句是否已经结束判断是否需要继续拼装
            if (tokens.length == 2) {
                return funcCallNode;
            }
            // 将当前函数节点作为左节点 跳过已经消费了的token 继续拼装
            resultTreeNode.setLeft(funcCallNode);
            tokens.splice(0, 2);
        }
        // 运算符缓冲 因为运算符起作用的方式受到前后节点关系的影响 所以需要延迟生效
        let currentOperator: string | null = null;
        // 当遇到引用或者常量时 将其存储为节点的动作
        const updateResultNode = (node: TreeNode) => {
            // 判断当前是否记录了运算符
            if (currentOperator === null) {
                // 作为树节点的左节点
                resultTreeNode.setLeft(node);
            } else {
                // 根据运算符选取对应的组装方法 将当前节点和运算符组装成新的节点
                if (['+', '-'].includes(currentOperator)) {
                    resultTreeNode = this.assembleAddSubNode(resultTreeNode, currentOperator, node);
                } else if (['*', '/', '%'].includes(currentOperator)) {
                    resultTreeNode = this.assembleMulDivNode(resultTreeNode, currentOperator, node);
                } else {
                    console.error('未知操作符 ', currentOperator);
                }
                // 运算符生效后清空
                currentOperator = null;
            }
        };
        // 遍历节点
        for (let i = 0; i < tokens.length; i++) {
            // 取当前节点 判断类型
            let token = tokens[i];
            // 解析运算符
            if (['+', '-'].includes(token.content) || ['*', '/', '%'].includes(token.content)) {
                // 存储运算符
                currentOperator = token.content;
            } else if (['>', '>=', '<', '<=', '=', '==', '!=', '<>'].includes(token.content)) {
                // 比较运算符 比较运算符的两边一定作为此运算符的左右两侧节点 因此此时将当前运算符清空 就地整理节点
                // 按正常语法 此时的运算符本来也应当是null
                currentOperator = null;
                // 截取后续节点 向后找直到碰到逻辑关系符
                const rightNodeSet: Token[] = [];
                while (i < tokens.length - 1 && tokens[i + 1].content !== '&&' && tokens[i + 1].content !== '||') {
                    rightNodeSet.push(tokens[++i]);
                }
                // 递归解析 整理成树节点
                const afterNode = this.assembleCalcNode(rightNodeSet);
                if (!afterNode) {
                    //TODO 错误处理
                    console.error('解析错误1', rightNodeSet);
                    return null;
                }
                resultTreeNode = this.assembleCompareNode(resultTreeNode, token.content, afterNode);
                resultTreeNode.operator = token.content;
            } else if (['&&', '||'].includes(token.content)) {
                //TODO 处理逻辑关系符

            } else if (token.type === 'bracket') {
                // 当前节点为括号 则递归括号内的内容
                const siblingNode = this.assembleCalcNode(token.children);
                if (!siblingNode) {
                    //TODO 错误处理
                    console.error('解析错误3', token);
                    return null;
                }
                updateResultNode(siblingNode);
            } else {
                // 当前节点为变量或者常量
                const varNode = token.content.startsWith('@') ? new VarNode(token.content) : this.analyser.variables.find((node) => node.name === token.content);
                if (varNode) {
                    updateResultNode(varNode);
                } else {
                    updateResultNode(new ConstNode(token.content));
                }
            }
        }
        // 当循环结束后 若此时树节点没有右节点和operator 则证明此节点为引用或者常量 将左节点取出并返回
        if (resultTreeNode.noRight && !resultTreeNode.operator) {
            return resultTreeNode.leftChild;
        }
        return this.findRoot(resultTreeNode);
    }

    /**
     * 找到树的根节点
     * @param treeRoot
     * @returns {*}
     */
    findRoot(treeRoot: TreeNode) {
        while (treeRoot.parent) {
            treeRoot = treeRoot.parent;
        }
        return treeRoot;
    }

    /**
     * 组装加减计算节点
     */
    assembleAddSubNode(currentNode: TreeNode, operator: string, afterNode: TreeNode) {
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
    assembleMulDivNode(currentNode: TreeNode, operator: string, afterNode: TreeNode) {
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
    assembleCompareNode(currentNode: TreeNode, operator: string, afterNode: TreeNode): TreeNode {
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
}