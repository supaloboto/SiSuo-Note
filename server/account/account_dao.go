package account

import (
	"server/mongo"

	"go.mongodb.org/mongo-driver/bson"
)

/**
 * 获取账户信息
 */
func GetUserByAccount(account string) User {
	// 查询账户信息
	document, searchErr := mongo.GetDocument("account", bson.M{"account": account})
	if document == nil || searchErr != nil {
		// todo 错误处理
		return User{}
	} else {
		user := User{}
		decodeErr := document.Decode(&user)
		if decodeErr != nil {
			// todo 错误处理
		}
		return user
	}
}

/**
 * 添加账户
 */
func AddAccount(user User) {
	// 保存账户信息到数据库
	insertErr := mongo.InsertDocument("account", user)
	if insertErr != nil {
		// todo 错误处理
	}
}
