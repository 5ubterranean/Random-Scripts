//Stand Alone script to loop through the Websocket history

var Control = Java.type("org.parosproxy.paros.control.Control");
var WebSocketChannelDTO = Java.type("org.zaproxy.zap.extension.websocket.WebSocketChannelDTO");
var WebSocketMessageDTO = Java.type("org.zaproxy.zap.extension.websocket.WebSocketMessageDTO");
var WebSocketMessagesPayloadFilter = Java.type("org.zaproxy.zap.extension.websocket.ui.WebSocketMessagesPayloadFilter");

var extSock = Control.getSingleton().getExtensionLoader().getExtension("ExtensionWebSocket");
var channum = extSock.getChannels(new WebSocketChannelDTO).length;
var filterSock = new WebSocketMessagesPayloadFilter("string", false, true, false);
for (i = 1; i <= channum; i++) {
    var foundlist = extSock.getWebsocketMessages(new WebSocketMessageDTO(),[],[i],0,5000,5000);
    //Add filter
    //var foundlist = extSock.getWebsocketMessages(new WebSocketMessageDTO(),[],[i],filterSock,0,5000,5000);
    for (j = 0; j < foundlist.length; j++) {
        print(foundlist[j].payloadAsString);
        }
    }
