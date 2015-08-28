var net = require("net");
var crypto = require("crypto");

var Connection = {};
Connection.Instances = [];
Connection.Create = function()
{
	var obj = {};
	
	Connection.Instances.push(obj);
	
	return obj;
};

var serverTcp = net.createServer(function(inConnection)
{
	inConnection.Name = "";
	
	inConnection.HandlerDataHandshake = function(inData)
	{
		//no need to parse the whole header, just pluck the Sec-WebSocket-Key value
		var httpHeader = inData.toString();
		var key = "Sec-WebSocket-Key: ";
		var delimeter = "\r\n";
		var start = httpHeader.indexOf(key) + key.length;
		var end = httpHeader.indexOf(delimeter, start);
		var hash = httpHeader.substring(start, end);
		
		var SHAHasher = crypto.createHash("sha1");
		SHAHasher.update(hash);
		SHAHasher.update("258EAFA5-E914-47DA-95CA-C5AB0DC85B11");

		var output = "";
		output += "HTTP/1.1 101 Switching Protocols\r\n";
		output += "Upgrade: websocket\r\n";
		output += "Connection: Upgrade\r\n";
		output += "Sec-WebSocket-Accept: "+SHAHasher.digest("base64")+"\r\n";
		output += "\r\n";
		
		inConnection.write(output);
		
		//now switch to the other handler, no need for handshake stuff after this
		inConnection.HandlerData = inConnection.HandlerDataMessage;		
	};
	inConnection.HandlerDataMessage = function(inData)
	{
		// this is for <128 character messages
		var blitFlag = inData[1] & 0x80;
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
		console.log(message.toString());
	};
	inConnection.HandlerData = inConnection.HandlerDataHandshake;
	
	
	inConnection.on("error", function(inError)
	{
		console.log(inError);
	});
	inConnection.on("data", function(inData)
	{
		inConnection.HandlerData(inData);
	});
	inConnection.on("end", function()
	{
		console.log("connection closed");
	});
});
serverTcp.listen(4000);