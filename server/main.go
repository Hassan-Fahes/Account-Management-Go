package main

import (
	"log"
	"net/http"

	"account/server/db"
	"account/server/routes"
	"account/server/routes/middleware"
)

func main() {
	db.Connect()
	defer db.Disconnect()

	
	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		middleware.EnableCors(w , r)
		routes.LoginHandler(w, r)
	})
	http.HandleFunc("/isLogin", func(w http.ResponseWriter, r *http.Request) {
		middleware.EnableCors(w , r)
		routes.IsLoginHandler(w, r)
	})
	http.HandleFunc("/getAccount", func(w http.ResponseWriter, r *http.Request) {
		middleware.EnableCors(w , r)
		routes.GetAccounts(w, r)
	})

	http.HandleFunc("/addAccount" , func(w http.ResponseWriter , r *http.Request) {
		middleware.EnableCors(w , r) 
		routes.AddAccount(w , r)
	})

	http.HandleFunc("/deleteAccount" , func(w http.ResponseWriter , r *http.Request) {
		middleware.EnableCors(w , r) 
		routes.DeleteAccount(w , r)
	})

	http.HandleFunc("/updateAccount" , func(w http.ResponseWriter , r *http.Request) {
		middleware.EnableCors(w , r) 
		routes.UpdateAccount(w , r)
	})

	log.Println("Server is running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
