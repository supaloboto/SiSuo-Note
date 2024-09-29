/**
 * 表达式分割方法 将原始表达式分割为词元 用于形成语法树
 *
 * @author 刘志栋
 * @since 2024/09/16
 */

import { deepCopy } from "@/assets/utils/copy";

/**
 * 词元类
 */
export class Token {
    // 类型
    type: string;
    // 内容
    content: string;
    // 位置
    start: {
        row: number;
        col: number;
    }
    end: {
        row: number;
        col: number;
    };
    // 子集
    children: Token[] = [];

    constructor(type: string, content: string, start: { row: number, col: number }, end: { row: number, col: number }) {
        this.type = type;
        this.content = content;
        this.start = start;
        this.end = end;
    }
}

/**
 * 分割表达式字符串为词元集合
 * @param expressionStr
 */
export default function tokenize(expressionStr: string): Token[] {
    // 将表达式完全切割
    const tokens: Token[] = cutIntoPieces(expressionStr);
    // 整理括号 将括号配对 整理内容 提取为单独的子集 并整理最后的结果
    const result: Token[] = [];
    // 遍历字符节点集合
    for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
        const token = tokens[tokenIndex];
        if (bracketTypeMap[token.content]) {
            // 当发现括号时 递归查找括号内的内容 并将内容收束为词元的子集
            const [bracketToken, endPos] = findPairBracket(tokens, bracketTypeMap[token.content], tokenIndex + 1);
            // 方括号判断是否需要和前一个Token合并 比如a[0]这种情况
            const lastToken = result.length > 0 ? result[result.length - 1] : null;
            if (bracketTypeMap[token.content].name === 'array' && lastToken && lastToken.type === 'element') {
                // 取上一个Token的content和start 然后替换上个Token
                bracketToken.content = lastToken.content;
                bracketToken.start = lastToken.start;
                result[result.length - 1] = bracketToken;
            } else {
                result.push(bracketToken);
            }
            // 更新游标位置
            tokenIndex = endPos;
        } else {
            // 不是括号则直接加入根集合
            result.push(token);
        }
    }
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
 * 将表达式字符串切割为基础词元(方法名/变量/操作符)集合
 * @param expressionStr 表达式字符串
 * @returns {Token[]} 返回切割后的词元集合
 */
function cutIntoPieces(expressionStr: string): Token[] {
    // 结果
    const resultStrSet: Token[] = [];
    // 字符缓冲区
    const charBuffer: string[] = [];
    // 字符位置游标
    const cursor: { start: { row: number, col: number }, end: { row: number, col: number } } = { start: { row: 0, col: 0 }, end: { row: 0, col: 0 } };
    // 打断缓冲区累积过程 将缓冲区内容存入结果集
    const saveBuffer = (type: string = 'element') => {
        if (charBuffer.length > 0) {
            const bufferStr = charBuffer.splice(0).join('');
            const bufferToken = new Token(type, bufferStr, deepCopy(cursor.start), deepCopy(cursor.end));
            resultStrSet.push(bufferToken);
        }
        // 更新游标位置
        cursor.start.row = cursor.end.row;
        cursor.start.col = cursor.end.col;
    };
    // 保存操作符到结果集
    const saveOperator = (char: string, type: string = 'operator') => {
        // 移动游标以选中字符
        cursor.end.col += char.length;
        // 保存字符
        const bufferToken = new Token(type, char, deepCopy(cursor.start), deepCopy(cursor.end));
        resultStrSet.push(bufferToken);
        // 更新游标位置
        cursor.start.row = cursor.end.row;
        cursor.start.col = cursor.end.col;
    }
    // 光标向右移动
    const cursorMoveRight = (step: number = 1) => {
        cursor.start.row = cursor.end.row;
        cursor.start.col = cursor.end.col + step;
        cursor.end.col = cursor.end.col + step;
    }
    // 按字符遍历
    for (let charIndex = 0; charIndex < expressionStr.length; charIndex++) {
        const char = expressionStr[charIndex];
        switch (char) {
            /**=========== 断句符号 ===========**/
            case '\n':
                // 如果碰到回车符 则行数加一 列数归零
                cursor.start.row += 1;
                cursor.end.row = cursor.start.row;
                cursor.start.col = 0;
                cursor.end.col = 0;
                break;
            case ',': case '，': case ':': case '：': case ';': case '；':
                // 有分隔语义作用的符号 直接存入结果集
                saveBuffer();
                if (char === '，' || char === ',') {
                    saveOperator(',', 'split');
                } else if (char === '；' || char === ';') {
                    saveOperator(';', 'end');
                }
                cursorMoveRight();
                break;
            case ' ':
                // 遇到空格则将当前缓冲区内容加入结果集
                saveBuffer();
                // 跳过空格
                cursorMoveRight();
                break;

            /**=========== 括号和引号 ===========**/
            case '"': case '\'': case '“':
                // 截取至引号闭合位置
                cursor.end.col++;
                //TODO 处理引号内包含回车的情况
                const [str, childEndPos] = cutToChar(getRestExpression(charIndex, expressionStr), char === '“' ? '”' : char);
                charIndex += childEndPos + 1;
                // 引号内的内容作为一个整体 加入结果集
                const content = charBuffer.splice(0).join('') + str;
                const posStart = deepCopy(cursor.start);
                const posEnd = {
                    row: cursor.end.row,
                    col: cursor.end.col + childEndPos + 1
                };
                const token = new Token('quote', content, posStart, posEnd);
                resultStrSet.push(token);
                // 更新位置
                cursor.start.row = posEnd.row;
                cursor.start.col = posEnd.col;
                cursor.end.col = posEnd.col;
                break;
            case '(': case ')':
                // 如果碰到括号 则为数学算式中的括号或函数调用 此时直接存入结果集 括号的具体处理在字符串分割完成后进行
                if (charBuffer.length > 0) {
                    saveBuffer();
                }
                saveOperator(char);
                break;
            case '[': case ']':
                if (charBuffer.length > 0) {
                    saveBuffer();
                }
                saveOperator(char);
                // // 如果碰到方括号 则判断是否为数组或结构体引用
                // if (char === '[' && charBuffer.length > 0) {
                //     // 缓冲区有内容 则此内容应为变量名 与方括号拼接为数组引用
                //     // 截取至方括号闭合位置
                //     cursor.end.col++;
                //     const [str, childEndPos] = cutToChar(getRestExpression(charIndex, expressionStr), ']');
                //     charIndex += childEndPos + 1;
                //     // 方括号内的内容作为一个整体 加入结果集
                //     const content = charBuffer.splice(0).join('') + '[' + str + ']';
                //     const posStart = deepCopy(cursor.start);
                //     const posEnd = {
                //         row: cursor.end.row,
                //         col: cursor.end.col + childEndPos + 1
                //     };
                //     const token = new Token('array', content, posStart, posEnd);
                //     resultStrSet.push(token);
                //     // 更新位置
                //     cursor.start.row = posEnd.row;
                //     cursor.start.col = posEnd.col;
                //     cursor.end.col = posEnd.col;
                // } else {
                //     // 不是数组或结构体引用 则直接存入结果集 括号的具体处理在字符串分割完成后进行
                //     if (charBuffer.length > 0) {
                //         saveBuffer();
                //     }
                //     saveOperator(char);
                // }
                break;
            case '{': case '}':
                // 如果碰到花括号 则为函数体或结构体 此时直接存入结果集 括号的具体处理在字符串分割完成后进行
                if (charBuffer.length > 0) {
                    saveBuffer();
                }
                saveOperator(char);
                break;

            /**=========== 操作符 ===========**/
            case '+': case '-': case '*': case '/': case '%':
                // 数学操作符可能和后一个操作符拼接为一个操作
                if (charIndex < expressionStr.length - 1 && expressionStr[charIndex + 1] === '=') {
                    saveBuffer();
                    charIndex++;
                    cursor.end.col++;
                    saveOperator(`${char}=`, 'operator');
                    break;
                } else if (charIndex < expressionStr.length - 1 && (char === '+' || char === '-') && expressionStr[charIndex + 1] === char) {
                    saveBuffer();
                    charIndex++;
                    cursor.end.col++;
                    saveOperator(`${char}${char}`, 'operator');
                    break;
                } else {
                    // 单纯的数学操作符直接存入结果集
                    saveBuffer();
                    saveOperator(char, 'operator');
                    break;
                }
            case '<': case '>': case '=': case '!':
                // 逻辑类字符 可能和后续的'='字符拼接为一个操作 或者出现'<>'的情况
                if (charIndex < expressionStr.length - 1 && expressionStr[charIndex + 1] === '=') {
                    saveBuffer();
                    charIndex++;
                    cursor.end.col++;
                    saveOperator(`${char}=`, 'operator');
                } else if (charIndex < expressionStr.length - 1 && char === '<' && expressionStr[charIndex + 1] === '>') {
                    saveBuffer();
                    charIndex++;
                    cursor.end.col++;
                    saveOperator('<>', 'operator');
                } else {
                    saveBuffer();
                    saveOperator(char, 'operator');
                }
                break;
            case '&': case '|':
                // 逻辑类字符 如果后面一个字符与自己相同则拼接为一个操作
                if (charIndex < expressionStr.length - 1 && expressionStr[charIndex + 1] === char) {
                    saveBuffer();
                    charIndex++;
                    cursor.end.col++;
                    saveOperator(`${char}${char}`, 'operator');
                } else {
                    saveBuffer();
                    saveOperator(char, 'operator');
                }
                break;

            /**=========== 一般字符 ===========**/
            default:
                // 未碰到特殊字符 则加入缓冲区
                charBuffer.push(char);
                cursor.end.col++;
        }
    }
    // 清空缓冲区
    saveBuffer();
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
 * @param tokens 词元数组
 * @param bracketType 括号类型
 * @param startPos 开始位置
 * @returns 返回整理后的Token集合 和括号结束位置的token索引
 */
function findPairBracket(tokens: Token[], bracketType: { name: string, end: string }, startPos: number): [Token, number] {
    // 子节点的序号
    let childIndex = 1;
    // 子集内容
    const tokenChildren: Token[] = [];
    // 遍历词元集合
    for (let i = startPos; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.content === bracketType.end) {
            // 如果匹配了目标括号结束字符 则整理此括号的Token并返回 将积攒的内容整理为Token的子集
            const tokenType = bracketType.name;
            const tokenStart = {
                row: tokenChildren.length > 0 ? tokenChildren[0].start.row : token.start.row,
                col: tokenChildren.length > 0 ? tokenChildren[0].start.col : token.start.col - 1,
            }
            const tokenEnd = {
                row: token.end.row,
                col: token.end.col,
            }
            const resultToken = new Token(tokenType, '', tokenStart, tokenEnd);
            resultToken.children = tokenChildren;
            return [resultToken, i];
        } else if (bracketTypeMap[token.content]) {
            // 如果发现括号 则递归查找次级括号
            const [child, subEndPos] = findPairBracket(tokens, bracketTypeMap[token.content], i + 1);
            // 方括号判断是否需要和前一个Token合并 比如a[0]这种情况
            const lastToken = tokenChildren.length > 0 ? tokenChildren[tokenChildren.length - 1] : null;
            if (bracketType.name === 'array' && lastToken && lastToken.type === 'element') {
                // 取上一个Token的content和start 然后替换上个Token
                child.content = lastToken.content;
                child.start = lastToken.start;
                tokenChildren[tokenChildren.length - 1] = child;
            } else {
                tokenChildren.push(child);
            }
            // 跳过被次级括号包裹的内容
            i = subEndPos;
        } else {
            tokenChildren.push(token);
        }
    }
    // 如果遍历结束了 但是没有找到结束括号 则抛出异常
    throw new Error('括号未闭合');
};
