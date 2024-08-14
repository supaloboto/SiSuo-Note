package kanban

import (
	"server/http"

	"github.com/bytedance/sonic"
	"github.com/gin-gonic/gin"
)

func SetupRouter(router *gin.Engine) {
	// 获取看板列表接口
	router.GET("/kanban/list", getKanbanList)
	// 获取看板接口
	router.GET("/kanban/:kanbanId", getKanban)
	// 组件保存接口
	router.POST("/kanban/component/add", addComponent)
	router.POST("/kanban/component/update", updateComponent)
	router.POST("/kanban/component/delete", deleteComponent)
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
		X float32 `json:"x"`
		Y float32 `json:"y"`
	} `json:"pos"`
	// 组件大小
	Rect struct {
		Width  float32 `json:"width"`
		Height float32 `json:"height"`
	} `json:"rect"`
	// 组件数据
	Data map[string]any `json:"data"`
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

/**
 * 获取看板列表
 */
func getKanbanList(c *gin.Context) {
	// todo 获取看板列表
}

/**
 * 获取看板数据
 */
func getKanban(c *gin.Context) {
	kanbanId := c.Param("kanbanId")
	kanbanData := GetKanban(kanbanId)
	// 返回给客户端成功响应
	http.Success(c, kanbanData)
}

/**
 * 添加组件
 */
func addComponent(c *gin.Context) {
	param := http.GetBodyJson(c)
	kanbanId, _ := param.GetByPath("kanbanId").String()
	component := Component{}
	// 将组件信息转换为实体
	componentString, _ := param.GetByPath("component").Raw()
	sonic.UnmarshalString(componentString, &component)
	// 保存组件
	AddComponent(kanbanId, component)
	// 返回给客户端成功响应
	http.Success(c, nil)
}

/**
 * 更新组件
 */
func updateComponent(c *gin.Context) {
	param := http.GetBodyJson(c)
	kanbanId, _ := param.GetByPath("kanbanId").String()
	component := Component{}
	// 将组件信息转换为实体
	componentString, _ := param.GetByPath("component").Raw()
	sonic.UnmarshalString(componentString, &component)
	// 保存组件
	UpdateComponent(kanbanId, component)
	// 返回给客户端成功响应
	http.Success(c, nil)
}

/**
 * 删除组件
 */
func deleteComponent(c *gin.Context) {
	param := http.GetBodyJson(c)
	kanbanId, _ := param.GetByPath("kanbanId").String()
	componentId, _ := param.GetByPath("componentId").String()
	DeleteComponent(kanbanId, componentId)
	// 返回给客户端成功响应
	http.Success(c, nil)
}
