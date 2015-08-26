var express = require("express");
var handlebars = require("express-handlebars");


var app = express();
app.engine("html", handlebars());
app.set("view engine", "html");
app.set("views", __dirname+"/views");
app.use("/files", express(__dirname+"files"));
app.get("/", function(inRequest, inResponse, inNext)
{
	inResponse.render("index", {title:"cHat"});
});


app.listen(3000);