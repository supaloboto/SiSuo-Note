package kanban

import (
	"server/restful"

	"github.com/bytedance/sonic"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func SetupRouter(router *gin.Engine) {
	// 看板管理接口
	router.GET("/kanban/list", getKanbanList)
	router.GET("/kanban/:kanbanId", getKanban)
	router.POST("/kanban/add", addKanban)
	router.POST("/kanban/update", updateKanban)
	router.POST("/kanban/delete", deleteKanban)
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
	CompType string `json:"compType" bson:"compType"`
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
	// 组件连线
	Links []struct {
		// 连线ID
		Id string `json:"id"`
		// 连线起始组件ID
		CompId string `json:"compId"`
		// 连线终止组件ID
		TargetCompId string `json:"targetCompId"`
		// 连线起始点
		StartPos struct {
			X      float32 `json:"x"`
			Y      float32 `json:"y"`
			Direct string  `json:"direct"`
		} `json:"startPos"`
		// 连线终止点
		EndPos struct {
			X      float32 `json:"x"`
			Y      float32 `json:"y"`
			Direct string  `json:"direct"`
		} `json:"endPos"`
	} `json:"links"`
}

/**
 * 看板信息实体
 */
type Kanban struct {
	// 看板ID
	KanbanId string `json:"kanbanId" bson:"kanbanId"`
	// 用户ID
	UserId string `json:"userId" bson:"userId"`
	// 看板标题
	Title string `json:"title" bson:"title"`
	// 组件列表
	ComponentList []Component `json:"componentList" bson:"componentList"`
}

/**
 * 获取看板列表
 */
func getKanbanList(c *gin.Context) {
	// 获取用户ID
	userId := c.Query("userId")
	// 获取看板列表
	kanbanList := GetKanbanList(userId)
	// 返回给客户端成功响应
	restful.Success(c, kanbanList)
}

/**
 * 添加看板
 */
func addKanban(c *gin.Context) {
	param := restful.GetBodyJson(c)
	// 将看板信息转换为实体
	kanban := Kanban{}
	kanbanString, _ := param.GetByPath("kanban").Raw()
	sonic.UnmarshalString(kanbanString, &kanban)
	// 生成看板ID
	kanban.KanbanId = uuid.New().String()
	// 保存看板
	AddKanban(kanban)
	// 返回给客户端成功响应
	restful.Success(c, nil)
}

/**
 * 更新看板 目前只支持更新看板标题
 */
func updateKanban(c *gin.Context) {
	param := restful.GetBodyJson(c)
	// 将看板信息转换为实体
	kanban := Kanban{}
	kanbanString, _ := param.GetByPath("kanban").Raw()
	sonic.UnmarshalString(kanbanString, &kanban)
	// 更新看板标题
	UpdateKanbanTitle(kanban.KanbanId, kanban.Title)
	// 返回给客户端成功响应
	restful.Success(c, nil)
}

/**
 * 删除看板
 */
func deleteKanban(c *gin.Context) {
	param := restful.GetBodyJson(c)
	kanbanId, _ := param.GetByPath("kanbanId").String()
	// 删除看板
	DeleteKanban(kanbanId)
	// 返回给客户端成功响应
	restful.Success(c, nil)
}

/**
 * 获取看板数据
 */
func getKanban(c *gin.Context) {
	kanbanId := c.Param("kanbanId")
	kanbanData := GetKanban(kanbanId)
	// 返回给客户端成功响应
	restful.Success(c, kanbanData)
}

/**
 * 添加组件
 */
func addComponent(c *gin.Context) {
	param := restful.GetBodyJson(c)
	kanbanId, _ := param.GetByPath("kanbanId").String()
	component := Component{}
	// 将组件信息转换为实体
	componentString, _ := param.GetByPath("component").Raw()
	sonic.UnmarshalString(componentString, &component)
	// 保存组件
	AddComponent(kanbanId, component)
	// 返回给客户端成功响应
	restful.Success(c, nil)
}

/**
 * 更新组件
 */
func updateComponent(c *gin.Context) {
	param := restful.GetBodyJson(c)
	kanbanId, _ := param.GetByPath("kanbanId").String()
	component := Component{}
	// 将组件信息转换为实体
	componentString, _ := param.GetByPath("component").Raw()
	sonic.UnmarshalString(componentString, &component)
	// 保存组件
	UpdateComponent(kanbanId, component)
	// 返回给客户端成功响应
	restful.Success(c, nil)
}

/**
 * 删除组件
 */
func deleteComponent(c *gin.Context) {
	param := restful.GetBodyJson(c)
	kanbanId, _ := param.GetByPath("kanbanId").String()
	componentId, _ := param.GetByPath("componentId").String()
	DeleteComponent(kanbanId, componentId)
	// 返回给客户端成功响应
	restful.Success(c, nil)
}
