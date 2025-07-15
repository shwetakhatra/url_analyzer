package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID       string `gorm:"primaryKey;type:char(36)"`
	Name     string `gorm:"size:100"`
	Email    string `gorm:"unique"`
	Password string
}

func (user *User) BeforeCreate(tx *gorm.DB) (err error) {
	user.ID = uuid.New().String()
	return
}