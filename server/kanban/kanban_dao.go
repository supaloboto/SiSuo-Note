package kanban

import (
	"context"
	"server/mongo"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

/**
 * 获取看板列表
 */
func GetKanbanList(userId string) []Kanban {
	// 根据UserId过滤看板文档
	// 去除组件列表字段
	projection := bson.M{"componentList": 0}
	option := options.Find().SetProjection(projection)
	documentListCursor, searchErr := mongo.GetDocumentList("kanban", bson.M{"userId": userId}, option)
	if searchErr != nil {
		// todo 错误处理
	}
	kanbanList := []Kanban{}
	for documentListCursor.Next(context.TODO()) {
		kanbanData := Kanban{}
		decodeErr := documentListCursor.Decode(&kanbanData)
		if decodeErr != nil {
			// todo 错误处理
		}
		kanbanList = append(kanbanList, kanbanData)
	}
	return kanbanList
}

/**
 * 添加看板
 */
func AddKanban(kanban Kanban) {
	insertErr := mongo.InsertDocument("kanban", kanban)
	if insertErr != nil {
		// todo 错误处理
	}
}

/**
 * 更新看板标题
 */
func UpdateKanbanTitle(kanbanId string, newTitle string) {
	// 根据KanbanId过滤看板文档
	filter := bson.M{"kanbanId": kanbanId}
	// 更新看板信息
	update := bson.M{"$set": bson.M{"title": newTitle}}
	_, updateErr := mongo.UpdateDocument("kanban", filter, update)
	if updateErr != nil {
		// todo 错误处理
	}
}

/**
 * 删除看板
 */
func DeleteKanban(kanbanId string) {
	// 根据KanbanId过滤看板文档
	filter := bson.M{"kanbanId": kanbanId}
	deleteErr := mongo.DeleteDocument("kanban", filter)
	if deleteErr != nil {
		// todo 错误处理
	}
}

/**
 * 查询看板信息
 */
func GetKanban(kanbanId string) Kanban {
	document, searchErr := mongo.GetDocument("kanban", bson.M{"kanbanId": kanbanId})
	if searchErr != nil {
		// todo 错误处理
	}
	kanbanData := Kanban{}
	decodeErr := document.Decode(&kanbanData)
	if decodeErr != nil {
		// todo 错误处理
	}
	return kanbanData
}

/**
 * 添加组件
 */
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

/**
 * 更新组件
 */
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

/**
 * 删除组件
 */
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
