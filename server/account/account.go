package account

import (
	"server/restful"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
	// 用户ID
	UserId string `json:"userId"`
	// 账户
	Account string `json:"account"`
	// 用户名
	Username string `json:"username"`
	// 密码
	Password string `json:"password"`
	// token
	Token string `json:"token"`
	// ws-session
	WsSession string `json:"wsSession"`
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
		UserName string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	restful.BindJson(c, &json)
	// 用户信息
	user := User{
		Account:  json.Account,
		Username: json.UserName,
		Password: json.Password,
	}
	// 判断用户是否存在
	existUser := GetUserByAccount(user.Account)
	if existUser != nil {
		// 用户已存在
		restful.Error(c, 101, "RegisAccountExist")
	} else {
		// 生成UUID
		user.UserId = uuid.New().String()
		// 保存用户信息到数据库
		AddAccount(user)
		// 返回
		restful.Success(c, "")
	}
}

/**
 * 登录接口
 */
func login(c *gin.Context) {
	// 账户验证异常时的错误处理
	defer func() {
		if r := recover(); r != nil {
			restful.Error(c, 102, r.(string))
		}
	}()
	// 解析参数
	var json struct {
		Account  string `json:"account" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	restful.BindJson(c, &json)
	// 查询用户信息
	user := GetUserByAccount(json.Account)
	if user == nil {
		panic("LoginFail1")
	}
	// 检查用户信息
	pass := user.Password == json.Password
	if pass {
		// todo 生成token
		token := uuid.New().String()
		user.Token = token
		// 记录用户
		Users[user.Token] = user
		restful.Success(c, user)
	} else {
		panic("LoginFail2")
	}
}

/**
 * 登出接口
 */
func logout(c *gin.Context) {

}
