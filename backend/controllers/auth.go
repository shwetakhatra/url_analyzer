package controllers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shwetakhatra/url-analyzer/database"
	"github.com/shwetakhatra/url-analyzer/models"
	"github.com/shwetakhatra/url-analyzer/utils"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func Register(c *gin.Context) {
    var body struct {
        Name     string `json:"name" binding:"required,min=2,max=50"`
        Email    string `json:"email" binding:"required,email"`
        Password string `json:"password" binding:"required,min=6,max=12"`
    }
    // Validate request body binding
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"errors": utils.FormatValidationErrors(err)})
        return
    }
    body.Name = strings.TrimSpace(body.Name)
    body.Email = strings.TrimSpace(strings.ToLower(body.Email)) // Sanitizing input
    body.Password = strings.TrimSpace(body.Password)
    if errorsMap := utils.ValidateStruct(body); errorsMap != nil {
        c.JSON(http.StatusBadRequest, gin.H{"errors": errorsMap})
        return
    }
    if !utils.IsStrongPassword(body.Password) {
        c.JSON(http.StatusInternalServerError, utils.ErrorResponse("password", "Password must contain uppercase, lowercase, number, and special character"))
        return
    }
    var existingUser models.User // Check if email already exists
    err := database.DB.Where("email = ?", body.Email).First(&existingUser).Error
    if err == nil {
        c.JSON(http.StatusInternalServerError, utils.ErrorResponse("email", "Email is already registered"))
        return
    } else if !errors.Is(err, gorm.ErrRecordNotFound) {
        c.JSON(http.StatusInternalServerError, utils.ErrorResponse("database", "Database error: " + err.Error()))
        return
    }
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost) // Hash password
    if err != nil {
        c.JSON(http.StatusInternalServerError, utils.ErrorResponse("server", "Failed to hash password"))
        return
    }
    // Create user
    user := models.User{
        Name:     body.Name,
        Email:    body.Email,
        Password: string(hashedPassword),
    }
    if err := database.DB.Create(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, utils.ErrorResponse("database", "Failed to create user: " + err.Error()))
        return
    }
    c.JSON(http.StatusOK, gin.H{
        "message": "User registered successfully",
        "user": gin.H{
            "id":    user.ID,
            "name":  user.Name,
            "email": user.Email,
        },
    })
}

func Login(c *gin.Context) {
    var body struct {
        Email    string `json:"email" binding:"required,email"`
        Password string `json:"password" binding:"required,min=6"`
    }
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"errors": utils.FormatValidationErrors(err)})
        return
    }
    var user models.User
    err := database.DB.Where("email = ?", body.Email).First(&user).Error
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            // Email not found
            c.JSON(http.StatusUnauthorized, utils.ErrorResponse("error", "Invalid credentials"))
            return
        }
        c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "Database error: " + err.Error()))
        return
    }
    // Compare stored hashed password with provided password
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password)); err != nil {
        c.JSON(http.StatusUnauthorized, utils.ErrorResponse("error", "Invalid credentials"))
        return
    }
    // Generate JWT token for the user
    token, err := utils.GenerateJWT(user.ID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, utils.ErrorResponse("error", "Failed to generate authentication token"))
        return
    }
    c.JSON(http.StatusOK, gin.H{"token": token})
}

