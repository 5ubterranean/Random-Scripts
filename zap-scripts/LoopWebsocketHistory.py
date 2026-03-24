#Stand Alone script to loop through the Websocket history

from org.parosproxy.paros.control import Control
from org.zaproxy.zap.extension.websocket import WebSocketChannelDTO
from org.zaproxy.zap.extension.websocket import WebSocketMessageDTO
from org.zaproxy.zap.extension.websocket.ui import WebSocketMessagesPayloadFilter

extSock = Control.getSingleton().getExtensionLoader().getExtension("ExtensionWebSocket") 
channum = len(extSock.getChannels(WebSocketChannelDTO()))
filterSock = WebSocketMessagesPayloadFilter("string",False, True, False)
i = 1
while i <= channum:
    foundlist = extSock.getWebsocketMessages(WebSocketMessageDTO(),[],[i],0,5000,5000)
    #Add filter
    #foundlist = extHist.getWebsocketMessages(WebSocketMessageDTO(),[],[i],filterSock,0,5000,5000)
    i += 1
    for mess in foundlist:
        print(mess.payloadAsString.encode('ascii','ignore'))
