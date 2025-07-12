package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type URL struct {
	ID               string       `gorm:"primaryKey;type:char(36)"`
	URL              string
	Status           string
	Title            string
	HTMLVersion      string
	H1Count          int
	H2Count          int
	H3Count          int
	H4Count          int
	H5Count          int
	H6Count          int
	InternalLinks    int
	ExternalLinks    int
	BrokenLinks      int
	HasLoginForm     bool
	Error          	 string
	UserID           string       `gorm:"type:char(36);not null"`
	User             User         `gorm:"foreignKey:UserID;references:ID"`
	BrokenLinkDetail []BrokenLink `gorm:"foreignKey:URLID"`
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

func (url *URL) BeforeCreate(tx *gorm.DB) (err error) {
	url.ID = uuid.New().String()
	return
}