package main

import (
	"io/ioutil"
	"log"
	"net/http"
)

func test(rw http.ResponseWriter, req *http.Request) {
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		panic(err)
	}
	log.Println(string(body))
}

func main() {
	http.Handle("/idscAutoUpdater/", http.StripPrefix("/idscAutoUpdater/", http.FileServer(http.Dir("static"))))

	log.Fatal(http.ListenAndServe(":80", nil))
}
