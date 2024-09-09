/**
 * 表达式分割方法 将原始表达式分割为字符串数组 用于形成语法树
 *
 * @author 刘志栋
 * @since 2024/09/08
 */

/**
 * 表达式分割结果
 */
export class ExpressionSplit {
    [key: string]: { nodeList: string[], type: string };
}

/**
 * 分割表达式字符串
 * @param expressionStr
 */
export default function splitExpressStr(expressionStr: string) {
    console.log('expressionStr ', expressionStr);
    // 将表达式完全切割
    const splits = cutIntoPieces(expressionStr);
    console.log('expressionStr split ', splits);
    // 整理括号 将括号配对 整理内容 提取为单独的子集 并整理最后的结果
    const result: ExpressionSplit = {
        root: { nodeList: [], type: 'root' },
    };
    const rootBracket = [];
    let bracketIndex = 1;
    // 遍历字符节点集合
    for (let splitIndex = 0; splitIndex < splits.length; splitIndex++) {
        const split = splits[splitIndex];
        if (bracketTypeMap[split]) {
            // 当发现括号时 递归查找括号内的内容 并将内容收束为一个子集
            const [brackets, endPos] = findPairBracket(splits, bracketTypeMap[split], splitIndex + 1, '1', bracketIndex++);
            splitIndex = endPos;
            brackets.forEach((bracket) => {
                result[bracket.name] = {
                    nodeList: bracket.nodeList,
                    // 从括号名称中取括号类型
                    type: bracket.name.split('#')[0],
                }
            });
            // 递归结束后所有括号中的第一个 就是第一层的括号
            rootBracket.push(brackets[0].name);
        } else {
            // 不是括号则直接加入根集合
            rootBracket.push(split);
        }
    }
    result.root.nodeList = rootBracket;
    // 处理所有层级中的逗号 如果该层级有逗号则将此层级转化为数组
    Object.keys(result).forEach((key) => {
        const nodeList = result[key].nodeList;
        if (nodeList.includes(',')) {
            result[key].nodeList = cutToArray(nodeList, ',');
            result[key].type = 'array';
        } else {
            result[key].type = 'element';
        }
    });
    console.log('expressionStr split with brackets sorted ', result);
    return result;
}

/**
 * 从指定位置开始截取表达式剩下的部分
 * @param startIndex 开始位置
 * @param expression 表达式
 * @returns {string} 返回剩下的部分
 */
function getRestExpression(startIndex: number, expression: string): string {
    return expression.substring(startIndex + 1);
}

/**
 * 将传入的表达式切割到指定字符的位置
 * @param expression 表达式
 * @param targetChar 目标字符
 * @returns {(string|number)[]} 返回切割后的字符串和目标字符的位置
 */
function cutToChar(expression: string, targetChar: string): [string, number] {
    let charIndex = 0;
    for (; charIndex < expression.length; charIndex++) {
        if (expression[charIndex] === targetChar) {
            break;
        }
    }
    return [expression.substring(0, charIndex), charIndex];
}

/**
 * 将表达式字符串切割为元素(方法名/变量/操作符)集合
 * @param expressionStr 表达式字符串
 * @returns {string[]} 返回切割后的元素集合
 */
function cutIntoPieces(expressionStr: string): string[] {
    // 结果
    const resultStrSet = [];
    // 字符缓冲区
    const charBuffer: string[] = [];
    // 打断缓冲区累积过程 先将缓冲区内容存入结果集 再将当前字符也存入结果集
    const saveBufferAndThisChar = (char: string) => {
        if (charBuffer.length > 0) {
            resultStrSet.push(charBuffer.splice(0).join(''));
        }
        resultStrSet.push(char);
    };
    // 按字符遍历
    for (let charIndex = 0; charIndex < expressionStr.length; charIndex++) {
        const char = expressionStr[charIndex];
        if (char === '(' || char === ')' || char === '[' || char === ']' || char === '{' || char === '}') {
            // 如果碰到括号类字符 则直接存入结果集
            saveBufferAndThisChar(char);
        } else if (char === '+' || char === '-' || char === '*' || char === '/' || char === '%') {
            // 如果碰到数学操作符 则直接存入结果集
            saveBufferAndThisChar(char);
        } else if (char === '<' || char === '>' || char === '=' || char === '!') {
            // 逻辑类字符 可能和后续的'='字符拼接为一个操作 或者出现'<>'的情况
            if (charIndex < expressionStr.length - 1 && expressionStr[charIndex + 1] === '=') {
                saveBufferAndThisChar(`${char}=`);
                charIndex += 1;
            } else if (charIndex < expressionStr.length - 1 && char === '<' && expressionStr[charIndex + 1] === '>') {
                saveBufferAndThisChar('<>');
                charIndex += 1;
            } else {
                saveBufferAndThisChar(char);
            }
        } else if (char === '&' || char === '|') {
            // 逻辑类字符 如果后面一个字符与自己相同则拼接为一个操作
            if (charIndex < expressionStr.length - 1 && expressionStr[charIndex + 1] === char) {
                saveBufferAndThisChar(`${char}${char}`);
                charIndex += 1;
            } else {
                saveBufferAndThisChar(char);
            }
        } else if (char === ',' || char === '，' || char === ';' || char === '；') {
            // 有分隔语义作用的符号 直接存入结果集
            saveBufferAndThisChar(char);
        } else if (char === '"' || char === '\'' || char === '“') {
            // 截取至引号闭合位置
            const [str, childEndPos] = cutToChar(getRestExpression(charIndex, expressionStr), char === '“' ? '”' : char);
            // 引号内的内容作为一个整体 加入结果集
            resultStrSet.push(charBuffer.splice(0).join('') + char + str + char);
            charIndex += childEndPos + 1;
        } else if (char === ' ') {
            // 遇到空格则将当前缓冲区内容加入结果集
            if (charBuffer.length > 0) {
                resultStrSet.push(charBuffer.splice(0).join(''));
            }
        } else {
            // 未碰到特殊字符 则加入缓冲区
            charBuffer.push(char);
        }
    }
    // 缓冲区有内容则加入结果集
    if (charBuffer.length > 0) {
        resultStrSet.push(charBuffer.splice(0).join(''));
    }
    // 返回结果集
    return resultStrSet;
}

// 定义括号类型和对应的结束括号
const bracketTypeMap: { [key: string]: { name: string; end: string } } = {
    '(': { name: 'bracket', end: ')' },
    '[': { name: 'array', end: ']' },
    '{': { name: 'function', end: '}' },
};

/**
 * 整理配对括号的方法
 * @param splits 表达式切割后的字符串数组
 * @param bracketType 括号类型
 * @param startPos 开始位置
 * @param parentCode 父节点代码
 * @param childCode 子节点代码
 * @returns 返回整理后的括号集合和结束位置
 */
function findPairBracket(splits: string[], bracketType: { name: string, end: string }, startPos: number, parentCode: string, childCode: number): [{ name: string, nodeList: string[] }[], number] {
    const result = [];
    // 遍历结束位置
    let endPos = startPos;
    // 子节点的序号
    let childIndex = 1;
    // 创建内容堆栈
    const bracketStack = [];
    // 遍历字符节点集合
    for (let splitIndex = startPos; splitIndex < splits.length; splitIndex++) {
        const split = splits[splitIndex];
        if (split === bracketType.end) {
            // 如果匹配了目标括号结束字符 则进行收束
            result.unshift({
                name: `${bracketType.name}#${parentCode}-${childCode}`,
                nodeList: bracketStack.splice(0),
            });
            endPos = splitIndex;
            break;
        } else if (bracketTypeMap[split]) {
            // 如果发现括号 则递归查找次级括号
            const [subBrackets, subEndPos] = findPairBracket(splits, bracketTypeMap[split], splitIndex + 1, `${parentCode}-${childCode}`, childIndex++);
            result.push(...subBrackets);
            bracketStack.push(subBrackets[0].name);
            splitIndex = subEndPos;
        } else {
            bracketStack.push(split);
        }
    }
    return [result, endPos];
};

/**
 * 将括号内的内容切割为数组
 * @param bracketNodeList 括号内的节点集合
 * @param splitter 分隔符
 */
const cutToArray = (bracketNodeList: string[], splitter: string): string[] => {
    const result: string[] = [];
    const buffer = [];
    for (let charIndex = 0; charIndex < bracketNodeList.length; charIndex++) {
        const char = bracketNodeList[charIndex];
        if (char === splitter) {
            result.push(buffer.splice(0).join(''));
        } else {
            buffer.push(char);
        }
    }
    if (buffer.length > 0) {
        result.push(buffer.splice(0).join(''));
    }
    return result;
}
