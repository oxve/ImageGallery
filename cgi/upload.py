#!/opt/local/bin/python
import cgi#, cgitb
#cgitb.enable()

import json
import shelve
import base64
import hashlib
import time
import sys
import os

# Constants
imagespath = '../images/'

if __name__=="__main__":
    print 'Content-Type: application/json'
#    print 'Content-Type: text/html'
    print
    db = shelve.open('imagestore.db')

    try:
        image = json.loads(sys.stdin.read(int(os.environ['CONTENT_LENGTH'])))
        ## TODO: Check if the posted data really is an image
        imagedata = base64.b64decode(image['data'])
        
        hashdigest = hashlib.sha224(imagedata).hexdigest()
        if db.has_key(hashdigest):
            print json.dumps({'status': 'error', 'message': 'duplicate image', 'path': db[hashdigest]})
        else:
            with open(imagespath + image['name'], 'wb') as newimage:
                newimage.write(imagedata)
            db[hashdigest] = 'images/' + image['name']
            print json.dumps({'status': 'ok', 'path': 'images/' + image['name']})
            if db.has_key('imagelist'):
                images = db['imagelist']
                images.insert(0, {'path': '/images/' + image['name'], 'time': time.time(), 'uploader': image['uploader']})
                db['imagelist'] = images
    except Exception as ex:
        print json.dumps({'status': 'error', 'message': 'server error: ' + str(ex)})

    db.close()
