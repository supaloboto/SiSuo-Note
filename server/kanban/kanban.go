package kanban

import (
	"log"
	"server/http"

	"github.com/gin-gonic/gin"
)

func SetupRouter(router *gin.Engine) {
	// 获取看板列表接口
	router.GET("/kanban/list", getKanbanList)
	// 获取看板接口
	router.GET("/kanban/:kanbanId", getKanban)
	// 组件保存接口
	router.POST("/kanban/component/save", saveComponent)
}

/**
 * 组件信息实体
 */
type Component struct {
	// 组件类型
	CompType string `json:"compType"`
	// 组件ID
	Id string `json:"id"`
	// 组件位置
	Pos struct {
		X int `json:"x"`
		Y int `json:"y"`
	} `json:"pos"`
	// 组件大小
	Rect struct {
		Width  int `json:"width"`
		Height int `json:"height"`
	} `json:"rect"`
	// 组件数据
	Data interface{} `json:"data"`
}

/**
 * 看板信息实体
 */
type Kanban struct {
	// 看板ID
	KanbanId string `json:"kanbanId"`
	// 组件列表
	ComponentList []Component `json:"componentList"`
}

func getKanbanList(c *gin.Context) {
	// todo 获取看板列表
}

func getKanban(c *gin.Context) {
	// 获取看板数据
	kanbanId := c.Param("kanbanId")
	kanbanData := GetKanban(kanbanId)
	// 返回看板数据
	http.Success(c, kanbanData)
}

/**
 * 保存组件信息
 */
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
