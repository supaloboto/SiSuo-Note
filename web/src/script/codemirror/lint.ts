import { linter, type Diagnostic } from "@codemirror/lint"
import tokenize, { Token } from "../tokenization";
import { tokenToAST } from "../ast";
/**
 * 脚本解析器Linter
 * 
 * @author 刘志栋
 * @since 2024/10/02
 */
export const logicLinter = linter(view => {
    // 诊断列表
    const diagnostics: Diagnostic[] = [];
    // 进行AST分析
    try {
        const doc = view.state.doc.toString();
        const tokenizeResult = tokenize(doc);
        tokenToAST(tokenizeResult);
        // 递归所有token 将其中出现问题的记录下来
        const recursive = (tokens: Token[]) => {
            tokens.forEach(token => {
                if (token.warning) {
                    diagnostics.push({
                        from: token.start,
                        to: token.end,
                        severity: "warning",
                        message: token.warning
                    })
                }
                if (token.error) {
                    diagnostics.push({
                        from: token.start,
                        to: token.end,
                        severity: "error",
                        message: token.error
                    })
                }
                if (token.children) {
                    recursive(token.children)
                }
            });
        }
        recursive(tokenizeResult);
    } catch (e) {
        //TODO 分辨解析过程中遇到的错误是否是值得关注的问题
        console.error(e);
    }
    // 返回诊断列表
    return diagnostics
})