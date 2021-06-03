from sys import displayhook
import xml.etree.ElementTree as ET
import urllib.request
import xmltodict #install pip install xmltodict
import json

import requests
from bs4 import BeautifulSoup
 
 
url = 'https://www.ecb.europa.eu/home/html/rss.en.html'
reqs = requests.get(url)
soup = BeautifulSoup(reqs.text, 'html.parser')
 
urls = []
for link in soup.find_all('a'):
    if link.get('href',None) :
        if '/rss/fxref' in link.get('href'):
            urls.append('https://www.ecb.europa.eu'+link.get('href'))

record_data = {}
for url in urls:
    response = urllib.request.urlopen(url).read()
    # tree = ET.fromstring(response)

    # print(tree)
    # for docTitle in tree.findall('item'):
    #     print(docTitle.text)

    # file = urllib.request.urlopen(url)
    # data = file.read()
    # file.close()

    data = xmltodict.parse(response)
    data = dict(data)
    for item in data['rdf:RDF']['item'] :
        item = dict(item)
        statstics = dict(item['cb:statistics'])
        exchangeRate= dict(statstics['cb:exchangeRate'])
        cbValue = dict(exchangeRate['cb:value'])
        date = item['dc:date'].split("T")[0]
        cbBase = dict(exchangeRate['cb:baseCurrency'])
        if record_data.get(date,None) is None:
            record_data[date] = {
                'Date': date,
                'base': cbBase['#text']
            }
        record_data[date][exchangeRate['cb:targetCurrency']] = cbValue['#text']
print(record_data)
print(record_data.values())