package models

import "time"

type BrokenLink struct {
	ID        uint      `gorm:"primaryKey"`
	URLID     uint
	Link      string
	Status    int
	CreatedAt time.Time
	UpdatedAt time.Time
}
