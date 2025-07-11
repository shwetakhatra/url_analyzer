package models

import "time"

type URL struct {
	ID               uint   `gorm:"primaryKey"`
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
	UserID           uint
	BrokenLinkDetail []BrokenLink `gorm:"foreignKey:URLID"`
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

