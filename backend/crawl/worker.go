package crawl

import (
	"context"
	"log"
	"os"
	"sync"
	"time"

	"github.com/shwetakhatra/url-analyzer/database"
	"github.com/shwetakhatra/url-analyzer/models"
	"gorm.io/gorm"
)

const (
	concurrency  = 5
	pollInterval = 3 * time.Second
)

var Debug = os.Getenv("DEBUG") == "true"

func debugLog(format string, v ...interface{}) {
	if Debug {
		log.Printf(format, v...)
	}
}

func StartWorker(ctx context.Context) {
	ResetStuckURLs()
	
	var wg sync.WaitGroup
	urlCh := make(chan models.URL)

	for i := 1; i <= concurrency; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			for url := range urlCh {
				debugLog("[Worker %d] Started crawling: %s", workerID, url.URL)
				processURL(url)
				debugLog("[Worker %d] Finished crawling: %s", workerID, url.URL)
			}
		}(i)
	}

	go func() {
		for {
			select {
			case <-ctx.Done():
				debugLog("[Worker Manager] Context cancelled. Shutting down dispatcher...")
				close(urlCh)
				return
			default:
				var url models.URL
				err := database.DB.Where("status = ?", "queued").First(&url).Error
				if err != nil {
					if err != gorm.ErrRecordNotFound {
						debugLog("[DB] Error fetching queued URL: %v", err)
					}
					time.Sleep(pollInterval)
					continue
				}

				url.Status = "running"
				if err := database.DB.Save(&url).Error; err != nil {
					debugLog("[DB] Error updating URL status to 'running': %v", err)
					time.Sleep(pollInterval)
					continue
				}

				urlCh <- url
			}
		}
	}()

	go func() {
		<-ctx.Done()
		debugLog("[Worker Manager] Waiting for workers to finish...")
		wg.Wait()
		debugLog("[Worker Manager] All workers completed. Exiting.")
	}()
}

func processURL(url models.URL) {
	result, err := CrawlURL(url.URL, url.ID)
	if err != nil {
		url.Status = "error"
		url.Error = err.Error()
	} else {
		url.Status = "done"
		url.HTMLVersion = result.HTMLVersion
		url.Title = result.Title
		url.HasLoginForm = result.HasLoginForm
		url.H1Count = result.H1Count
		url.H2Count = result.H2Count
		url.InternalLinks = result.InternalLinks
		url.ExternalLinks = result.ExternalLinks
		url.BrokenLinks = result.BrokenLinkCount
	}

	if err := database.DB.Save(&url).Error; err != nil {
		debugLog("[DB] Error saving crawl result for %s: %v", url.URL, err)
	}
}
