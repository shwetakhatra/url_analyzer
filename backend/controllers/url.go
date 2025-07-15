package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/shwetakhatra/url-analyzer/database"
	"github.com/shwetakhatra/url-analyzer/models"
	"github.com/shwetakhatra/url-analyzer/utils"
	"gorm.io/gorm"
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
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "could not save URL"))
		return
	}
	c.JSON(http.StatusCreated, url)
}

func GetAllURLs(c *gin.Context) {
	user, err := utils.GetValidUser(c)
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

	query := database.DB.
		Model(&models.URL{}).
		Where("user_id = ?", user.ID).
		Preload("BrokenLinkDetail", func(db *gorm.DB) *gorm.DB {
			return db.Select("link", "status", "url_id")
		})
	if search != "" {
		query = query.Where("url LIKE ?", "%"+search+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Count total matching records (without pagination)
	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "failed to count URLs"))
		return
	}

	// Fetch paginated results
	if err := query.Offset(offset).Limit(limit).Find(&urls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "failed to fetch URLs"))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"urls": urls,
		"total": total,
	})
}

func GetURLByID(c *gin.Context) {
	user, err := utils.GetValidUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("error", err.Error()))
		return
	}
	id := c.Param("id")
	var url models.URL
	if err := database.DB.Where("id = ? AND user_id = ?", id, user.ID).First(&url).Error; err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("error", "url not found"))
		return
	}
	c.JSON(http.StatusOK, url)
}

func DeleteURLs(c *gin.Context) {
	user, err := utils.GetValidUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("error", err.Error()))
		return
	}
	var body struct {
		IDs []string `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || len(body.IDs) == 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("error", "invalid or empty ID list"))
		return
	}
	var urls []models.URL
	if err := database.DB.
		Where("id IN ? AND user_id = ?", body.IDs, user.ID).
		Find(&urls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "failed to fetch URLs"))
		return
	}
	if len(urls) == 0 {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("error", "no matching URLs found for user"))
		return
	}
	idsToDelete := make([]string, len(urls))
	for i, url := range urls {
		idsToDelete[i] = url.ID
	}
	if err := database.DB.Where("url_id IN ?", idsToDelete).Delete(&models.BrokenLink{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "failed to delete broken links"))
		return
	}
	if err := database.DB.Delete(&models.URL{}, idsToDelete).Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "failed to delete URLs"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "URLs and related broken links deleted successfully"})
}

func RequeueURLs(c *gin.Context) {
	_, err := utils.GetValidUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("error", err.Error()))
		return
	}
	var body struct {
		IDs []string `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || len(body.IDs) == 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("error", "invalid or empty ID list"))
		return
	}
	if err := database.DB.Model(&models.URL{}).
		Where("id IN ?", body.IDs).
		Update("status", "queued").Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "failed to requeue URLs"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "URLs requeued for analysis"})
}

func StopURLs(c *gin.Context) {
	_, err := utils.GetValidUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("error", err.Error()))
		return
	}
	var body struct {
		IDs []string `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || len(body.IDs) == 0 {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("error", "invalid or empty ID list"))
		return
	}
	if err := database.DB.Model(&models.URL{}).
		Where("id IN ? AND status = ?", body.IDs, "running").
		Update("status", "stopped").Error; err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "failed to stop URLs"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Running URLs stopped successfully"})
}

