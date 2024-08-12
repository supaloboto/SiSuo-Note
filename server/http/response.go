package http

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func Success(c *gin.Context, data any) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}

func Error(c *gin.Context, code int, msg string) {
	c.JSON(http.StatusOK, gin.H{
		"success": false,
		"errCode": code,
		"errMsg":  msg,
	})
}
