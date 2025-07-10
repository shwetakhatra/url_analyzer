package main

import (
	"fmt"

	"github.com/shwetakhatra/url-analyzer/controllers"
	"github.com/shwetakhatra/url-analyzer/database"

	"github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()
    database.Connect()

    fmt.Println("Starting Gin backend...")

    r.POST("/auth/register", controllers.Register)
    r.POST("/auth/login", controllers.Login)

    r.Run(":8080")
}
