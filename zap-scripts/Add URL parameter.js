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

//Proxy script to add a URL parameter to every request that is part of the context
var HtmlParameter = Java.type("org.parosproxy.paros.network.HtmlParameter");
var TreeSet = Java.type("java.util.TreeSet");
var Model = Java.type("org.parosproxy.paros.model.Model");

function proxyRequest(msg) {
    var currsession = model.getSession()
    var currcontext = currsession.getContext(1)
    //Check if the current request is in the context
    if (currcontext.isInContext(msg.getRequestHeader().getURI().toString())){
        //Get current parameters
        var originalParams = msg.getParameters(HtmlParameter.Type.url);
        var params = new HtmlParameter(HtmlParameter.Type.url, "param_name","value");
        let paramSet = new TreeSet();
        if (originalParams.length > 0) {
            var i = 0;
            while ( i < originalParams.length){
                paramSet.add(originalParams[i]);
                i = i + 1
            }
        }
        paramSet.add(params);
        msg.setGetParams(paramSet);
    }
    // Debugging can be done using println like this
    //print('proxyRequest called for url=' + msg.getRequestHeader().getURI().toString());
    
    return true
}

/**
 * This function allows interaction with proxy responses (i.e.: inbound from the server to the browser/client).
 * 
 * @param msg - the HTTP response being proxied. This is an HttpMessage object.
 */
function proxyResponse(msg) {
    // Debugging can be done using println like this
    //print('proxyResponse called for url=' + msg.getRequestHeader().getURI().toString())
    return true
}
