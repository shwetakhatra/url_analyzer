package utils

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/shwetakhatra/url-analyzer/database"
	"github.com/shwetakhatra/url-analyzer/models"
)

func GetValidUser(c *gin.Context) (models.User, error) {
	userID, exists := c.Get("userID")
	if !exists {
		return models.User{}, errors.New("user ID not found in context")
	}

	var user models.User
	if err := database.DB.First(&user, "id = ?", userID.(string)).Error; err != nil {
		return models.User{}, errors.New("user does not exist")
	}
	return user, nil
}
