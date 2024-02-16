"""
This script loops through the history table - change it to do whatever you want to do :)

Standalone scripts have no template.
They are only evaluated when you run them.
""" 

from org.parosproxy.paros.extension.history import ExtensionHistory
from org.parosproxy.paros.model import Model
import re

extHist = control.getExtensionLoader().getExtension(ExtensionHistory.NAME)
#Gets default context
currmodel = Model()
currsession = model.getSession()
currcontext = currsession.getContext(1)
if (extHist != None):
  i = 1
  hr = extHist.getHistoryReference(i)
  lastRef = extHist.getLastHistoryId()
  list = []
  while i < lastRef:
    #Only searches comments on sites that are in scope
    if hr != None and currcontext.isInContext(hr):
      url = hr.getHttpMessage().getRequestHeader().getURI().toString()
      body = hr.getHttpMessage().getResponseBody().toString()
      regex = '(?<![:])\/\/.*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->'
      matches = re.findall(regex,body)
      for match in matches:
        match = match.strip()
        if match not in list and len(match) < 500:
          list.append(match)
          print(match)
    i += 1
    hr = extHist.getHistoryReference(i)
  print('Found ' + str(len(list)) + ' comments')
