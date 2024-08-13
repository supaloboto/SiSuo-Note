package kanban

func GetKanbanList() {
	// todo 获取看板列表
}

func GetKanban(kanbanId string) Kanban {
	// 返回示例数据
	KanbanData := Kanban{
		KanbanId: kanbanId,
		ComponentList: []Component{
			{
				CompType: "note",
				Id:       "1",
				Pos: struct {
					X int `json:"x"`
					Y int `json:"y"`
				}{
					X: -100,
					Y: -100,
				},
				Rect: struct {
					Width  int `json:"width"`
					Height int `json:"height"`
				}{
					Width:  200,
					Height: 200,
				},
				Data: struct {
					Title   string `json:"title"`
					Content string `json:"content"`
				}{
					Title:   "hello world",
					Content: "this is a text component",
				},
			},
		},
	}
	return KanbanData
}

func SaveComponent() {
	// todo 保存组件信息
}
