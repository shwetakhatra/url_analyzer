package crawl

import (
	"bufio"
	"errors"
	"net/http"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/shwetakhatra/url-analyzer/database"
	"github.com/shwetakhatra/url-analyzer/models"
)

type CrawlResult struct {
	HTMLVersion     string
	Title           string
	H1Count         int
	H2Count         int
	InternalLinks   int
	ExternalLinks   int
	BrokenLinkCount int
	HasLoginForm    bool
}

func CrawlURL(rawURL string, urlID string) (*CrawlResult, error) {
	resp, err := http.Get(rawURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, errors.New("bad response from server")
	}

	buffered := bufio.NewReader(resp.Body)
	peeked, err := buffered.Peek(4096)
	if err != nil {
		return nil, err
	}

	htmlVersion := detectHTMLVersion(string(peeked))
	doc, err := goquery.NewDocumentFromReader(buffered)
	if err != nil {
		return nil, err
	}

	result := &CrawlResult{
		HTMLVersion: htmlVersion,
		Title:       doc.Find("title").Text(),
		H1Count:     doc.Find("h1").Length(),
		H2Count:     doc.Find("h2").Length(),
		HasLoginForm: doc.Find(`input[type="password"]`).Length() > 0,
	}

	internal, external, broken := 0, 0, 0
	base := resp.Request.URL.Hostname()

	doc.Find("a[href]").Each(func(i int, s *goquery.Selection) {
		href, _ := s.Attr("href")
		if strings.HasPrefix(href, "http") {
			if strings.Contains(href, base) {
				internal++
			} else {
				external++
			}
			if status, ok := getLinkStatus(href); !ok {
				broken++
				brokenLink := models.BrokenLink{
					URLID:  urlID,
					Link:   href,
					Status: status,
				}
				database.DB.Create(&brokenLink)
			}
		}
	})

	result.InternalLinks = internal
	result.ExternalLinks = external
	result.BrokenLinkCount = broken

	return result, nil
}

func getLinkStatus(link string) (int, bool) {
	resp, err := http.Head(link)
	if err != nil {
		return 0, false
	}
	defer resp.Body.Close()
	return resp.StatusCode, resp.StatusCode < 400
}


func detectHTMLVersion(content string) string {
	content = strings.ToLower(content)
	doctypes := map[string]string{
		"<!doctype html>":                                                        "HTML5",
		"<!doctype html public \"-//w3c//dtd html 4.01 transitional//en\"":      "HTML 4.01 Transitional",
		"<!doctype html public \"-//w3c//dtd html 4.01 strict//en\"":            "HTML 4.01 Strict",
		"<!doctype html public \"-//w3c//dtd html 4.01 frameset//en\"":          "HTML 4.01 Frameset",
		"<!doctype html public \"-//w3c//dtd xhtml 1.0 transitional//en\"":      "XHTML 1.0 Transitional",
		"<!doctype html public \"-//w3c//dtd xhtml 1.0 strict//en\"":            "XHTML 1.0 Strict",
		"<!doctype html public \"-//w3c//dtd xhtml 1.0 frameset//en\"":          "XHTML 1.0 Frameset",
	}
	for prefix, version := range doctypes {
		if strings.HasPrefix(content, prefix) {
			return version
		}
	}
	return "Unknown"
}
