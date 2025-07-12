package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/shwetakhatra/url-analyzer/database"
	"github.com/shwetakhatra/url-analyzer/models"
	"github.com/shwetakhatra/url-analyzer/utils"
)

type CreateURLRequest struct {
	URL string `json:"url" binding:"required,url"`
}

func CreateURL(c *gin.Context) {
	var input CreateURLRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("error", "Invalid URL format"))
		return
	}
	user, err := utils.GetValidUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("error", err.Error()))
		return
	}
	url := models.URL{
		URL:    input.URL,
		Status: "queued",
		UserID: user.ID,
	}
	if err := database.DB.Create(&url).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "Could not save URL"))
		return
	}
	c.JSON(http.StatusCreated, url)
}


func GetAllURLs(c *gin.Context) {
	_, err := utils.GetValidUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("error", err.Error()))
		return
	}
	var urls []models.URL
	search := c.Query("search")
	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.URL{})
	if search != "" {
		query = query.Where("url LIKE ?", "%"+search+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if err := query.Offset(offset).Limit(limit).Find(&urls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "Failed to fetch URLs"))
		return
	}
	c.JSON(http.StatusOK, urls)
}

func GetURLByID(c *gin.Context) {
	_, err := utils.GetValidUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("error", err.Error()))
		return
	}
	id := c.Param("id")
	var url models.URL
	if err := database.DB.First(&url, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "URL not found"))
		return
	}
	c.JSON(http.StatusOK, url)
}

func DeleteURLs(c *gin.Context) {
	_, err := utils.GetValidUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("error", err.Error()))
		return
	}
	var body struct {
		IDs []uint `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || len(body.IDs) == 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("error", "Invalid or empty ID list"))
		return
	}
	if err := database.DB.Delete(&models.URL{}, body.IDs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "Failed to delete URLs"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "URLs deleted successfully"})
}

func RequeueURLs(c *gin.Context) {
	_, err := utils.GetValidUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("error", err.Error()))
		return
	}
	var body struct {
		IDs []uint `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || len(body.IDs) == 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("error", "Invalid or empty ID list"))
		return
	}
	if err := database.DB.Model(&models.URL{}).
		Where("id IN ?", body.IDs).
		Update("status", "queued").Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "Failed to requeue URLs"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "URLs requeued for analysis"})
}

