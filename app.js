var express = require("express");
var app = express();

app.set("view engine", "awfawf");

app.get("/", function(inRequest, inResponse, inNext)
{
	inResponse.send("root");
	inNext();
});


app.listen(3000);