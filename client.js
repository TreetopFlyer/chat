var net = require("net");
var client = net.connect({port:4000}, function()
{
	console.log("client: connected");
	client.write("hi server");
});
client.on("data", function(inData)
{
	console.log("client heard:", inData.toString());
	client.end();
});