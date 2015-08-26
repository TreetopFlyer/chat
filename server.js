var net = require("net");
var crypto = require("crypto");
function ParseHeader(inHeaderString)
{
	var parts = inHeaderString.split("\r\n");
	var pieces = [];
	var i;
	var output = {};
	var colonIndex;
	var key, value;
	for(i=0; i<parts.length; i++)
	{
		colonIndex = parts[i].indexOf(": ");
		if(colonIndex != -1)
		{
			key = parts[i].substring(0, colonIndex);
			value = parts[i].substring(colonIndex+2);
			output[key] = value;
		}
	}
	return output;
};
var serverTcp = net.createServer(function(inConnection)
{
	inConnection.FirstTime = true;
	inConnection.Name = "";
	inConnection.on("error", function(inError){
		console.log(inError);
	});
	inConnection.on("data", function(inData)
	{
		console.log(inConnection.FirstTime);
		if(inConnection.FirstTime)
		{
			inConnection.FirstTime = false;
			console.log("i see a new client");
			var obj = ParseHeader(inData.toString());

			SHAHasher = crypto.createHash("sha1");
			SHAHasher.update(obj["Sec-WebSocket-Key"]);
			SHAHasher.update("258EAFA5-E914-47DA-95CA-C5AB0DC85B11");

			var output = "";
			output += "HTTP/1.1 101 Switching Protocols"+"\r\n";
			output += "Upgrade: websocket"+"\r\n";
			output += "Connection: Upgrade"+"\r\n";
			output += "Sec-WebSocket-Accept: "+SHAHasher.digest("base64")+"\r\n";
			output += ""+"\r\n";
			
			inConnection.write(output);
		}
		else
		{
			// this is for <128 character messages
			var blitFlag = inData[1] & 0x80; // this is a flag, not the actual mask
			var length = inData[1] & 0x7f;
			var blit = inData.slice(2, 6);
			var message = inData.slice(6, 6+length);
			var i;
			if(blitFlag === 128)
			{
				for(i=0; i<message.length; i++)
				{
					message[i] = message[i] ^ blit[i%4];
				}
			}
		}
	});
	inConnection.on("end", function()
	{
		console.log("connection closed");
	});
});
serverTcp.listen(4000);