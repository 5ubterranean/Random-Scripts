// The proxyRequest and proxyResponse functions will be called for all requests  and responses made via ZAP, 
// excluding some of the automated tools
// If they return 'false' then the corresponding request / response will be dropped. 
// You can use msg.setForceIntercept(true) in either method to force a breakpoint

// Note that new proxy scripts will initially be disabled
// Right click the script in the Scripts tree and select "enable"  

/**
 * This function allows interaction with proxy requests (i.e.: outbound from the browser/client to the server).
 * 
 * @param msg - the HTTP request being proxied. This is an HttpMessage object.
 */

//Importing the packages
var HttpSender = Java.type("org.parosproxy.paros.network.HttpSender")
var Model = Java.type("org.parosproxy.paros.model.Model")
var HistoryReference = Java.type("org.parosproxy.paros.model.HistoryReference")
var Control = Java.type("org.parosproxy.paros.control.Control")
var ExtensionHistory = Java.type("org.parosproxy.paros.extension.history.ExtensionHistory")
var ExtensionAlert = Java.type("org.zaproxy.zap.extension.alert.ExtensionAlert")
var Alert = Java.type("org.parosproxy.paros.core.scanner.Alert")

var lookfor = "<value that will be replaced>"
var replacewith = "<new value to set>"

function proxyRequest(msg) {
	// Debugging can be done using println like this
	//print('proxyRequest called for url=' + msg.getRequestHeader().getURI().toString())
	
	return true
}

/**
 * This function allows interaction with proxy responses (i.e.: inbound from the server to the browser/client).
 * 
 * @param msg - the HTTP response being proxied. This is an HttpMessage object.
 */
function proxyResponse(msg) {
	//Set variable containing all the headers
	var msgHeaders = msg.getRequestHeader().getHeaders()
	var msgPath = msg.getRequestHeader().getURI().getPath()
	var msgQuery = msg.getRequestHeader().getURI().getQuery()
	var msgMethod = msg.getRequestHeader().getMethod()
	// Debugging can be done using println like this
	//print('proxyResponse called for url=' + msg.getRequestHeader().getURI().toString())
	//It shouldn't be possible but first we evaluate if the request contains any header
	if (msgHeaders){
		//Create a variable that will change if there is any header changed
		var HeadChanged = 0
		//cloning the request so we don't modify the headers on the original request
		var newreq = msg.cloneRequest()
		newreq.getRequestHeader().getHeaders().forEach((Header) => {
			//looking for the value to be changed
			if (Header.getValue().search(lookfor) != -1){
				//Setting the header with a new one where the value is replaced, notice we need two arguments, header name and its value
				newreq.getRequestHeader().setHeader(Header.getName(),Header.getValue().replace(lookfor,replacewith))
				HeadChanged += 1
			}
		})
		//Checking if any header was changed
		if (HeadChanged > 0){
			print ("Replacing Headers")
			repeatRequest(msg,newreq)
		}
	}

	//Replacing in Path
	if (msgPath){
		if (msgPath.search(lookfor) != -1){
			print ("Replacing in Path")
			//Cloning request
			var newreq = msg.cloneRequest()
			var newpath = newreq.getRequestHeader().getURI().getPath().replace(lookfor,replacewith)
			newreq.getRequestHeader().getURI().setPath(newpath)
			//Send request
			repeatRequest(msg,newreq)
		}	
     }

	 //Replacing Query
	 if (msgQuery){
		if (msgQuery.search(lookfor) != -1){
			print ("Replacing Query")
			//Cloning Request
			var newreq = msg.cloneRequest()
			var newquery = newreq.getRequestHeader().getURI().getQuery().replace(lookfor,replacewith)
			newreq.getRequestHeader().getURI().setQuery(newquery)
			//Send request
			repeatRequest(msg,newreq)
		}
	 }

	//Replacing Body
	if (msgMethod == "POST" || msgMethod == "PUT"){
		if (msg.getRequestBody()){
			if (msg.getRequestBody().toString().search(lookfor) != -1){
				print ("Replacing Body")
				//Cloning Request
				var newreq = msg.cloneRequest()
				var newbody = newreq.getRequestBody().toString().replace(lookfor,replacewith)
				newreq.setRequestBody(newbody)
				newreq.getRequestHeader().setContentLength(newbody.length())
				//Send request
				repeatRequest(msg,newreq)	
			}
		}
	}

	return true
}

function repeatRequest(ori,newreq){

	//Creating the HttpSender constructor
	var sender = new HttpSender(HttpSender.MANUAL_REQUEST_INITIATOR)
	
	//Defining alert, AFAIK scripts do not have a Plugin Id so we set a random one
	var alert = new Alert(5000, Alert.RISK_HIGH, Alert.CONFIDENCE_MEDIUM, "Insecure Direct Object Reference")
	alert.setDescription("It is possible to access to information belonging to another user without being authenticated as that user.")
	alert.setSolution("The server has to validate that the data being accessed belongs to the current user that is logged on the site, if it isn't it should deny the asccess.")
	alert.setCweId(639)
	alert.setWascId(2)
	alert.setMessage(newreq)
	alert.setUri(newreq.getRequestHeader().getURI().toString())
	alert.setReference("https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html")

	//Sending the Request
	try{
		sender.sendAndReceive(newreq)
		//Get our current session
		Msess = Model.getSingleton().getSession()
		//Creating a constructor giving our current session as input, TYPE_ZAP_USER History Reference so the history shows it as a manual request, and the cloned HTTPMessage
		var href = new HistoryReference(Msess, HistoryReference.TYPE_ZAP_USER, newreq)
		//Adding the request to the History by poiting the History Reference created
		Control.getSingleton().getExtensionLoader().getExtension(ExtensionHistory.NAME).addHistory(href)
		if (newreq.getResponseHeader().getStatusCode() == ori.getResponseHeader().getStatusCode()){
			control.getExtensionLoader().getExtension(ExtensionAlert.NAME).alertFound(alert, href)
		}
	} catch (error)
	{
		print (error)
	}
}
