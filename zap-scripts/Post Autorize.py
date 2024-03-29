"""
This script loops through the history table - change it to do whatever you want to do :)

Standalone scripts have no template.
They are only evaluated when you run them.
""" 

from org.parosproxy.paros.control import Control
from org.parosproxy.paros.extension.history import ExtensionHistory
from org.parosproxy.paros.network import HttpSender
from org.parosproxy.paros.model import Model
from org.parosproxy.paros.model import HistoryReference
from org.zaproxy.zap.extension.alert import ExtensionAlert
from org.parosproxy.paros.core.scanner import Alert


lookfor = "<value that will be replaced>"
replacewith = "<new value to set>"

def repeatRequest(ori,newreq):
  #Creating the HttpSender constructor
  sender = HttpSender(HttpSender.MANUAL_REQUEST_INITIATOR)

  #Defining alert, AFAIK scripts do not have a Plugin Id so we set a random one
  alert = Alert(5000, Alert.RISK_HIGH, Alert.CONFIDENCE_MEDIUM, "Insecure Direct Object Reference")
  alert.setDescription("It is possible to access to information belonging to another user without being authenticated as that user.")
  alert.setSolution("The server has to validate that the data being accessed belongs to the current user that is logged on the site, if it isn't it should deny the asccess.")
  alert.setCweId(639)
  alert.setWascId(2)
  alert.setMessage(newreq)
  alert.setUri(newreq.getRequestHeader().getURI().toString())
  alert.setReference("https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html")

  #Sending the Request
  try:
    sender.sendAndReceive(newreq)
    #Get our current session
    Msess = Model.getSingleton().getSession()
    #Creating a constructor giving our current session as input, TYPE_ZAP_USER History Reference so the history shows it as a manual request, and the cloned HTTPMessage
    href = HistoryReference(Msess, HistoryReference.TYPE_ZAP_USER, newreq)
    #Adding the request to the History by poiting the History Reference created
    Control.getSingleton().getExtensionLoader().getExtension(ExtensionHistory.NAME).addHistory(href)
    if newreq.getResponseHeader().getStatusCode() == ori.getResponseHeader().getStatusCode():
      control.getExtensionLoader().getExtension(ExtensionAlert.NAME).alertFound(alert, href)
  except Exception:
      print (Exception)

extHist = Control.getSingleton().getExtensionLoader().getExtension(ExtensionHistory.NAME) 
if (extHist != None):
  i=1
  # Loop through the history table, printing out the history id and the URL
  hr = extHist.getHistoryReference(i)
  while (hr != None):
    #url = hr.getHttpMessage().getRequestHeader().getURI().toString()
    #print('Got History record id ' + str(hr.getHistoryId()) + ' URL=' + url) 
    
    #Only evaluate requests generated by the browser
    if hr.getHistoryType() == 1:
      msg = hr.getHttpMessage()
      #Set variable containing all the headers
      msgHeaders = msg.getRequestHeader().getHeaders()
      msgPath = msg.getRequestHeader().getURI().getPath()
      msgQuery = msg.getRequestHeader().getURI().getQuery()
      msgMethod = msg.getRequestHeader().getMethod()

      #It shouldn't be possible but first we evaluate if the request contains any header
      if msgHeaders:
        #Create a variable that will change if there is any header changed
        HeadChanged = 0
        #cloning the request so we don't modify the headers on the original request
        newreq = msg.cloneRequest()
        for Header in newreq.getRequestHeader().getHeaders():
          #looking for the value to be changed
          if Header.getValue().find(lookfor) != -1:
            #Setting the header with a new one where the value is replaced, notice we need two arguments, header name and its value
            newreq.getRequestHeader().setHeader(Header.getName(),Header.getValue().replace(lookfor,replacewith))
            HeadChanged += 1
        #Checking if any header was changed
        if HeadChanged > 0:
          print ("Replacing Headers")
          #Send request
          repeatRequest(msg,newreq)

      #Replacing in Path
      if msgPath:
        if msgPath.find(lookfor) != -1:
          print ("Replacing in Path")
          #Cloning request
          newreq = msg.cloneRequest()
          newpath = newreq.getRequestHeader().getURI().getPath().replace(lookfor,replacewith)
          newreq.getRequestHeader().getURI().setPath(newpath)
          #Send request
          repeatRequest(msg,newreq)

      #Replacing Query
      if msgQuery:
        if msgQuery.find(lookfor) != -1:
          print ("Replacing Query")
          #Cloning Request
          newreq = msg.cloneRequest()
          newquery = newreq.getRequestHeader().getURI().getQuery().replace(lookfor,replacewith)
          newreq.getRequestHeader().getURI().setQuery(newquery)
          #Send request
          repeatRequest(msg,newreq)

      #Replacing Body
      if msgMethod == "POST" or msgMethod == "PUT":
        if msg.getRequestBody():
          if msg.getRequestBody().toString().find(lookfor) != -1:
            print ("Replacing Body")
            #Cloning Request
            newreq = msg.cloneRequest()
            newbody = str(newreq.getRequestBody()).replace(lookfor,replacewith)
            newreq.setRequestBody(newbody)
            newreq.getRequestHeader().setContentLength(len(newbody))
            #Send request
            repeatRequest(msg,newreq)	

    i += 1
    hr = extHist.getHistoryReference(i)

