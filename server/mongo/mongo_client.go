package mongo

import (
	"context"
	"sync"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	client *mongo.Client
	mu     sync.Mutex
)

// 单例模式 获取MongoDB连接
func getClient() *mongo.Client {
	if client == nil {
		// 加锁保证只有一个实例
		mu.Lock()
		defer mu.Unlock()
		client, _ = connect()
	}
	return client
}

// 建立MongoDB连接
func connect() (*mongo.Client, error) {
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		return nil, err
	}
	// 检查连接
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		return nil, err
	}
	return client, nil
}

// InsertDocument inserts a document into the specified collection in MongoDB.
func InsertDocument(collectionName string, document interface{}) error {
	// Access the specified collection
	collection := getClient().Database("sisuo").Collection(collectionName)

	// Insert the document
	_, err := collection.InsertOne(context.TODO(), document)
	if err != nil {
		return err
	}

	return nil
}

func GetDocument(collectionName string, filter interface{}) (*mongo.SingleResult, error) {
	// Access the specified collection
	collection := getClient().Database("sisuo").Collection(collectionName)

	// Find the document
	result := collection.FindOne(context.TODO(), filter)
	if result.Err() != nil {
		return nil, result.Err()
	}

	return result, nil
}

func UpdateDocument(collectionName string, filter interface{}, update interface{}, opts ...*options.UpdateOptions) (*mongo.UpdateResult, error) {
	collection := getClient().Database("sisuo").Collection(collectionName)
	return collection.UpdateOne(context.TODO(), filter, update, opts...)
}

func DeleteDocument(collectionName string, filter interface{}) error {
	// Access the specified collection
	collection := getClient().Database("sisuo").Collection(collectionName)

	// Delete the document
	_, err := collection.DeleteOne(context.TODO(), filter)
	if err != nil {
		return err
	}
	return nil
}
