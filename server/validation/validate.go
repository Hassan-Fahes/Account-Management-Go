package validation
import "strconv"

func ValidateLogin(username, password string) map[string]string {
	errorsMap := make(map[string]string)

	if username == "" {
		errorsMap["username"] = "username cannot be empty"
	} else if len(username) < 3 {
		errorsMap["username"] = "username must be at least 3 characters long"
	}

	if password == "" {
		errorsMap["password"] = "password cannot be empty"
	} else if len(password) < 8 {
		errorsMap["password"] = "password must be at least 8 characters long"
	}

	if len(errorsMap) > 0 {
		return errorsMap
	}
	return nil
}

func ValidateAccountInput(code string, name string, address string, mobile string, mainCurrency string) map[string]string {
	errorsMap := make(map[string]string)

	if code == "" {
		errorsMap["code"] = "code is required"
	} else if len(code) < 8 {
		errorsMap["code"] = "code must be at least 8 digits"
	} else if _, err := strconv.Atoi(code); err != nil {
		errorsMap["code"] = "code must be numeric"
	}

	if name == "" {
		errorsMap["name"] = "name is required"
	} else if len(name) < 3 {
		errorsMap["name"] = "name must be at least 3 characters long"
	}

	if address == "" {
		errorsMap["address"] = "address is required"
	} else if len(address) < 3 {
		errorsMap["address"] = "address must be at least 3 characters long"
	}

	if mobile == "" {
		errorsMap["mobile"] = "mobile is required"
	} else if len(mobile) < 8 {
		errorsMap["mobile"] = "mobile must be at least 8 digits"
	} else if _, err := strconv.Atoi(mobile); err != nil {
		errorsMap["mobile"] = "mobile must be numeric"
	}

	if mainCurrency != "USD" && mainCurrency != "LBP" {
		errorsMap["main_currency"] = "main_currency must be either 'USD' or 'LBP'"
	}

	if len(errorsMap) > 0 {
		return errorsMap
	}
	return nil
}

