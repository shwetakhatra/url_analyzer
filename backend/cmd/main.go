package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/shwetakhatra/url-analyzer/controllers"
	"github.com/shwetakhatra/url-analyzer/crawl"
	"github.com/shwetakhatra/url-analyzer/database"
	"github.com/shwetakhatra/url-analyzer/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
    err := r.SetTrustedProxies([]string{"127.0.0.1"})
    if err != nil {
        log.Fatalf("Failed to set trusted proxies: %v", err)
    }

	database.Connect()

	ctx, cancel := context.WithCancel(context.Background())
	crawl.StartWorker(ctx)

	r.POST("/auth/register", controllers.Register)
	r.POST("/auth/login", controllers.Login)

	auth := r.Group("/api")
	auth.Use(middleware.AuthMiddleware())
	{
		auth.POST("/urls", controllers.CreateURL)
		auth.GET("/urls", controllers.GetAllURLs)
		auth.GET("/urls/:id", controllers.GetURLByID)
		auth.DELETE("/urls", controllers.DeleteURLs)
		auth.PUT("/urls/requeue", controllers.RequeueURLs)
	}

	go func() {
		if err := r.Run(":8080"); err != nil {
			log.Fatalf("Failed to run server: %v", err)
		}
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	<-sigCh
	log.Println("Shutdown signal received")
	cancel()

	time.Sleep(5 * time.Second)
	log.Println("Server exiting")
}
