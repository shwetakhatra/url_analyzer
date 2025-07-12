package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BrokenLink struct {
	ID        string     `gorm:"type:char(36);primaryKey" json:"id"`
	URLID     string     `gorm:"type:char(36);not null" json:"url_id"`
	URL       URL        `gorm:"foreignKey:URLID;references:ID"`
	Link      string
	Status    int
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (link *BrokenLink) BeforeCreate(tx *gorm.DB) (err error) {
	link.ID = uuid.New().String()
	return
}
