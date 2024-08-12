package account

func authorize(user User) bool {
	if user.Account == "admin" {
		panic("LoginFail1")
		return false
	}
	return true
}
