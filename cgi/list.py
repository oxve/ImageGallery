#!/opt/local/bin/python
import json
import shelve
import os
import hashlib
from operator import itemgetter

# Constants
imagespath = '../images/'

if __name__=="__main__":
    print 'Content-Type: application/json'
    #print 'Content-Type: text/plain'
    print
    db = shelve.open('imagestore.db')
    if db.has_key('imagelist'):
        print json.dumps({'images': db['imagelist']})
    else:
        images = []
        for fname in os.listdir(imagespath):
            with open(imagespath + fname, 'rb') as image:
                hashdigest = hashlib.sha224(image.read()).hexdigest()
                db[hashdigest] = '/images/' + fname
            images.append({'path': '/images/' + fname, 'time': os.path.getctime(imagespath + fname)})
            images = sorted(images, key=itemgetter('time'), reverse=True)
        db['imagelist'] = images
        print json.dumps({'images': images})
    db.close()