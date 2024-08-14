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

func SaveComponent(kanbanId string, component Component) {
	// 根据KanbanId过滤看板文档
	filter := bson.M{"kanbanId": kanbanId}
	// 更新组件列表中的指定组件
	update := bson.M{"$set": bson.M{"componentList.$[elem]": component}}
	updateOptions := options.Update()
	updateOptions.SetArrayFilters(options.ArrayFilters{
		Filters: []interface{}{bson.M{"elem.id": component.Id}},
	})
	updateResult, updateErr := mongo.UpdateDocument("kanban", filter, update, updateOptions)
	if updateErr != nil {
		// todo 错误处理
	}
	// 如果更新失败
	if updateResult.ModifiedCount == 0 {
		// 添加新组件
		update = bson.M{"$push": bson.M{"componentList": component}}
		_, insertErr := mongo.UpdateDocument("kanban", filter, update)
		if insertErr != nil {
			// todo 错误处理
		}
	}
}
