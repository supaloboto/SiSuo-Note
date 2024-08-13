package account

func authorize(user User) bool {
	if user.Account == "testUser" {
		panic("LoginFail1")
		return false
	}
	return true
}
