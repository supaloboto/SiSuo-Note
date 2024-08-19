package restful

import (
	"io"

	"github.com/bytedance/sonic"
	"github.com/bytedance/sonic/ast"
	"github.com/gin-gonic/gin"
)

func BindJson(c *gin.Context, i interface{}) {
	// 读取请求体
	body, bodyReadErr := io.ReadAll(c.Request.Body)
	if bodyReadErr != nil {
		// todo 更换错误码机制
		panic("bodyReadError")
	}
	// 解析请求体为JSON对象
	jsonParseErr := sonic.Unmarshal(body, &i)
	if jsonParseErr != nil {
		// todo 更换错误码机制
		panic("bodyReadError")
	}
}

func GetBodyJson(c *gin.Context) ast.Node {
	// 读取请求体
	body, bodyReadErr := io.ReadAll(c.Request.Body)
	if bodyReadErr != nil {
		// todo 更换错误码机制
		panic("bodyReadError")
	}
	// 转化为sonic ast对象
	root, err := sonic.GetFromString(string(body))
	if err != nil {
		// todo 更换错误码机制
		panic("bodyReadError")
	}
	return root
}
