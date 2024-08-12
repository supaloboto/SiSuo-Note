package kanban

import (
	"github.com/gin-gonic/gin"
	"log"
	"server/http"
)

func SetupRouter(router *gin.Engine) {
	// 组件保存接口
	router.POST("/kanban/component/save", saveComponent)
}

func saveComponent(c *gin.Context) {
	param := http.GetBodyJson(c)
	if raw, err := param.Raw(); err != nil {
		// todo 处理错误
		log.Panic(err)
	} else {
		// todo 保存组件信息
		log.Println(raw)
	}
}
