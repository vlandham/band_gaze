import os
import json
import urllib.request
import http.client, urllib.request, urllib.parse, urllib.error, base64

import time

M_KEY = '7223b90581904d7b834d2319e5087a2d'

input_file = 'data/interesting_artist_details.json'

headers = {
    # Request headers
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': M_KEY,
}


def get_url(artist):
    url = None
    if len(artist['images']) > 0:
        url = artist['images'][0]['url']
    return url


def get_faces(artist):
    url = get_url(artist)
    print(url)
    if not url:
        return {}

    params = urllib.parse.urlencode({
        # Request parameters
        'returnFaceId': 'true',
        'returnFaceLandmarks': 'true',
        'returnFaceAttributes': 'age,gender,headPose,glasses,smile,facialHair',
    })

    data = {}
    body = {"url": url}

    try:
        conn = http.client.HTTPSConnection('westus.api.cognitive.microsoft.com')
        conn.request("POST", "/face/v1.0/detect?%s" % params, json.dumps(body), headers)
        response = conn.getresponse()
        data = response.read().decode('utf-8')
        #print(data)
        conn.close()
    except Exception as e:
        print("[Errno {0}] {1}".format(e.errno, e.strerror))
    return json.loads(data)


def import_data(filename):
    data = []
    with open(filename) as json_data:
        data = json.load(json_data)
    return data

inCats = import_data(input_file)

total_artists = 0
for cat in inCats:
    print(cat['name'] + ' -- artist details: ' + str(len(cat['artist_details'])) + ' uniq artists: ' + str(len(cat['uniq_artists'])))
    total_artists += len(cat['artist_details'])
print("total artists: " + str(total_artists))

def save_data(data):
    with open('data/faces.json', 'w') as outfile:
        json.dump(data, outfile)


index = 0
for cat in inCats:
    for artist in cat['artist_details']:
        artist['faces'] = get_faces(artist)
        print(artist['faces'])

        index += 1
        if (index % 10) == 0:
            print('saving')
            print(str(index))
            save_data(inCats)
        time.sleep(3)



print('done!')
