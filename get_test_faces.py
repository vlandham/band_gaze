import os
import json
import urllib.request
import http.client, urllib.request, urllib.parse, urllib.error, base64

import time

M_KEY = '7223b90581904d7b834d2319e5087a2d'

input_file = 'data/gaze_test.json'

headers = {
    # Request headers
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': M_KEY,
}


def get_url(face):
    return face["url"]


def get_faces(artist):
    url = get_url(artist)
    print(url)
    if not url:
        print("ERROR: NO URL")
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


def save_data(data, filename):
    with open(filename, 'w') as outfile:
        json.dump(data, outfile)


faces = import_data(input_file)

for face in faces:
    face['faces'] = get_faces(face)
    time.sleep(5)


save_data(faces, 'data/test_faces_with_faces.json')

print('done!')
