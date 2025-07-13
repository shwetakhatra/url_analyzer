package crawl

import (
	"log"
	"time"

	"github.com/shwetakhatra/url-analyzer/database"
	"github.com/shwetakhatra/url-analyzer/models"
)

// resets URLs stuck in "running" state for more than 10 minutes
func ResetStuckURLs() {
	cutoff := time.Now().Add(-10 * time.Minute)
	result := database.DB.
		Model(&models.URL{}).
		Where("status = ? AND updated_at < ?", "running", cutoff).
		Update("status", "queued")
	if result.Error != nil {
		log.Printf("[ResetWorker] Failed to reset stuck URLs: %v", result.Error)
	} else if result.RowsAffected > 0 {
		log.Printf("[ResetWorker] Reset %d stuck URLs to 'queued'", result.RowsAffected)
	} else {
		log.Println("[ResetWorker] No stuck URLs found")
	}
}
