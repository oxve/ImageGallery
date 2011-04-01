#!/opt/local/bin/python
import cgi
import json
import shelve
import base64
import hashlib
import time

# Constants
imagespath = '../images/'

if __name__=="__main__":
    print 'Content-Type: application/json'
    print
    db = shelve.open('imagestore.db')
    form = cgi.FieldStorage()
    # check if the post includes the required data
    if not (form.has_key('filename') and form.has_key('filedata') and form.has_key('uploader')):
        print json.dumps({'status': 'error', 'message': 'upload info not complete'})
        exit(0)

    ## TODO: Check if the posted data really is an image
    filename = form['filename'].value
    filedata = base64.b64decode(form['filedata'].value)
    uploader = form['uploader'].value
    hashdigest = hashlib.sha224(filedata).hexdigest()
    if db.has_key(hashdigest):
        print json.dumps({'status': 'error', 'message': 'duplicate image', 'path': db[hashdigest]})
    else:
        with open(imagespath + filename, 'wb') as newimage:
            newimage.write(filedata)
        db[hashdigest] = 'images/' + filename
        print json.dumps({'status': 'ok', 'path': 'images/' + filename})
        if db.has_key('imagelist'):
            images = db['imagelist']
            images.insert(0, {'path': '/images/' + filename, 'time': time.time(), 'uploader': uploader})
            db['imagelist'] = images
    db.close()
