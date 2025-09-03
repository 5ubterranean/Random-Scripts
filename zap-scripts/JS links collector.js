// Targeted scripts can only be invoked by you, the user, e.g. via a right-click option on the Sites or History tabs
//This is just a rewriten version of https://github.com/GerbenJavado/LinkFinder, the regex was taken from there
//Invoke the script from a node on the Site Tree

/**
 * A function which will be invoked against a specific "targeted" message.
 *
 * @param msg - the HTTP message being acted upon. This is an HttpMessage object.
 */

function invokeWith(msg) {
	// Debugging can be done using println like this
	//print('invokeWith called for url=' + msg.getRequestHeader().getURI().toString()); 
    nodeId = msg.getHistoryRef().getHistoryId();
    siteNode = model.getSession().getSiteTree().getSiteNode(nodeId);
    listChildren(siteNode, 0);
}

//Function from example script Traverse sites tree
function listChildren(node, level) {
    var j;
    for (j=0;j<node.getChildCount();j++) {
        if (node.getChildAt(j).getChildCount() == 0) {
            nodeHR = node.getChildAt(j).getHistoryReference();
            //Only check if the file is javascript
            if (nodeHR.getHttpMessage().getResponseHeader().isJavaScript()) {
                extractLinks(nodeHR.getHttpMessage());
            }
        }
        listChildren(node.getChildAt(j), level+1);
    }
}

function extractLinks(nodeMsg) {
    content = nodeMsg.getResponseBody().toString();
    content = content.replaceAll(";",";\r\n").replaceAll(",",",\r\n")
    const regexStr = /(?:"|')(((?:[a-zA-Z]{1,10}:\/\/|\/\/)[^"'/]{1,}\.[a-zA-Z]{2,}[^"']{0,})|((?:\/|\.\.\/|\.\/)[^"'><,;| *()(%%$^\/\\\[\]][^"'><,;|()]{1,})|([a-zA-Z0-9_\-/]{1,}\/[a-zA-Z0-9_\-/.]{1,}\.(?:[a-zA-Z]{1,4}|action)(?:[\?|#][^"']{0,}|))|([a-zA-Z0-9_\-/]{1,}\/[a-zA-Z0-9_\-/]{3,}(?:[\?|#][^"']{0,}|))|([a-zA-Z0-9_\-]{1,}\.(?:php|asp|aspx|jsp|json|action|html|js|txt|xml)(?:[\?|#][^"']{0,}|)))(?:"|')/g;
    const matches = [];
    let match;

    while ((match = regexStr.exec(content)) !== null) {
        if (matches.indexOf(match[1]) == -1) {
            matches.push(match[1]); // Capture the full matched string
        }
    }
    if (matches.length > 0) {
        print("Links found on " + nodeMsg.getRequestHeader().getURI().toString() + ":");
        for (i = 0; i < matches.length; i++) {
            print(matches[i]);
        }
    }

}
