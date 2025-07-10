package utils

import (
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
}

// Checks if the password includes all complexity requirements
func IsStrongPassword(pw string) bool {
	var (
		hasUpper  = regexp.MustCompile(`[A-Z]`).MatchString
		hasLower  = regexp.MustCompile(`[a-z]`).MatchString
		hasNumber = regexp.MustCompile(`[0-9]`).MatchString
		hasSymbol = regexp.MustCompile(`[\W_]`).MatchString
	)
	return hasUpper(pw) && hasLower(pw) && hasNumber(pw) && hasSymbol(pw)
}

// ValidateStruct validates a struct and returns a map of field -> error messages
func ValidateStruct(s interface{}) map[string]string {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}
	return FormatValidationErrors(err)
}

// Converts validator.ValidationErrors into a user-friendly map
func FormatValidationErrors(err error) map[string]string {
	errors := make(map[string]string)
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, fieldErr := range validationErrors {
			fieldName := strings.ToLower(fieldErr.Field())
			fieldValue := fieldErr.Value()
			var msg string
			switch fieldErr.Tag() {
			case "required":
				msg = fieldName + " is required"
			case "email":
				msg = "email must be a valid email" // default message when the validator.v10 tag "email" fails
				if !emailRegex.MatchString(fieldValue.(string)) {
					msg = "email format is invalid" // custom regex-based message
				}
			case "min":
				msg = fieldName + " must be at least " + fieldErr.Param() + " characters"
			case "max":
				msg = fieldName + " must be at most " + fieldErr.Param() + " characters"
			case "len":
				msg = fieldName + " must be exactly " + fieldErr.Param() + " characters long"
			default:
				msg = fieldName + " is not valid"
			}

			errors[fieldName] = msg
		}
	} else {
		errors["error"] = err.Error()
	}
	return errors
}

// Returns a formatted error map for a given field and message
func ErrorResponse(field, message string) gin.H {
	return gin.H{"errors": gin.H{field: message}}
}
