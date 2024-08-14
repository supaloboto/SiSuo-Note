package kanban

import (
	"server/mongo"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetKanbanList() {
	// todo 获取看板列表
}

func GetKanban(kanbanId string) Kanban {
	// 查询看板信息
	document, searchErr := mongo.GetDocument("kanban", bson.M{"kanbanId": kanbanId})
	if searchErr != nil {
		// todo 错误处理
	}
	kanbanData := Kanban{}
	decodeErr := document.Decode(&kanbanData)
	if decodeErr != nil {
		// todo 错误处理
	}
	// // 返回示例数据
	// KanbanData := Kanban{
	// 	KanbanId: kanbanId,
	// 	ComponentList: []Component{
	// 		{
	// 			CompType: "note",
	// 			Id:       "1",
	// 			Pos: struct {
	// 				X int `json:"x"`
	// 				Y int `json:"y"`
	// 			}{
	// 				X: -100,
	// 				Y: -100,
	// 			},
	// 			Rect: struct {
	// 				Width  int `json:"width"`
	// 				Height int `json:"height"`
	// 			}{
	// 				Width:  200,
	// 				Height: 200,
	// 			},
	// 			Data: struct {
	// 				Title   string `json:"title"`
	// 				Content string `json:"content"`
	// 			}{
	// 				Title:   "hello world",
	// 				Content: "this is a text component",
	// 			},
	// 		},
	// 	},
	// }
	return kanbanData
}

func AddComponent(kanbanId string, component Component) {
	// 根据KanbanId过滤看板文档
	filter := bson.M{"kanbanId": kanbanId}
	// 添加组件
	update := bson.M{"$push": bson.M{"componentList": component}}
	_, updateErr := mongo.UpdateDocument("kanban", filter, update)
	if updateErr != nil {
		// todo 错误处理
	}
}

func UpdateComponent(kanbanId string, component Component) {
	// 根据KanbanId过滤看板文档
	filter := bson.M{"kanbanId": kanbanId}
	// 更新组件列表中的指定组件
	update := bson.M{"$set": bson.M{"componentList.$[elem]": component}}
	updateOptions := options.Update()
	updateOptions.SetArrayFilters(options.ArrayFilters{
		Filters: []interface{}{bson.M{"elem.id": component.Id}},
	})
	_, updateErr := mongo.UpdateDocument("kanban", filter, update, updateOptions)
	if updateErr != nil {
		// todo 错误处理
	}
}

func DeleteComponent(kanbanId string, componentId string) {
	// 根据KanbanId过滤看板文档
	filter := bson.M{"kanbanId": kanbanId}
	// 删除组件列表中的指定组件
	update := bson.M{"$pull": bson.M{"componentList": bson.M{"id": componentId}}}
	_, updateErr := mongo.UpdateDocument("kanban", filter, update)
	if updateErr != nil {
		// todo 错误处理
	}
}
