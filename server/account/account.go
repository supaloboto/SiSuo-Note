package account

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"server/http"
)

func SetupRouter(router *gin.Engine) {
	// 注册接口
	router.POST("/account/register", register)
	// 登录接口
	router.POST("/account/login", login)
	// 登出接口 需要认证用户信息
	router.POST("/account/logout", logout)
}

// User 用户数据 结构体
type User struct {
	// 账户
	Account string
	// 用户名
	UserName string
	// 密码
	Password string
}

// Users 当前登录用户列表
var Users = make(map[string]interface{})

/**
 * 注册接口
 */
func register(c *gin.Context) {
	// 解析参数
	var json struct {
		Account  string `json:"account" binding:"required"`
		UserName string `json:"userName" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	http.BindJson(c, &json)
	// 打印用户信息
	fmt.Println("Registering Account:", json.Account, " UserName:", json.UserName, " Password:", json.Password)
	// todo 验证用户信息是否合规
	// todo 判断用户是否存在
	userExist := false
	if userExist {
		// 用户已存在
		//c.String(http.StatusOK, "RegisAccountExist")
		http.Error(c, 101, "RegisAccountExist")
	} else {
		// todo 保存用户信息到数据库
		// 返回
		http.Success(c, "")
	}
}

/**
 * 登录接口
 */
func login(c *gin.Context) {
	// 账户验证异常时的错误处理
	defer func() {
		if r := recover(); r != nil {
			http.Error(c, 102, r.(string))
		}
	}()
	// 解析参数
	var json struct {
		Account  string `json:"account" binding:"required"`
		UserName string `json:"userName" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	http.BindJson(c, &json)
	// todo 查询用户信息
	// 记录用户信息
	user := User{
		Account:  json.Account,
		UserName: json.Account, // fixme 临时使用账户名
		Password: json.Password,
	}
	// 检查用户信息
	authorize := authorize(user)
	if authorize {
		Users[user.Account] = user
		http.Success(c, user)
	} else {
		panic("LoginFail2")
	}
}

/**
 * 登出接口
 */
func logout(c *gin.Context) {

}