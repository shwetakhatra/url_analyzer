package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BrokenLink struct {
	ID        string     `gorm:"type:char(36);primaryKey"`
	URLID     string     `gorm:"type:char(36);not null" json:"-"`
	URL       URL        `gorm:"foreignKey:URLID;references:ID" json:"-"`
	Link      string     `json:"link"`
	Status    int        `json:"status"`
	CreatedAt time.Time  `json:"-"`
	UpdatedAt time.Time  `json:"-"`
}

func (link *BrokenLink) BeforeCreate(tx *gorm.DB) (err error) {
	link.ID = uuid.New().String()
	return
}
