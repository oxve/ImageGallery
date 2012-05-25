#!/usr/bin/python
import base64
import hashlib
import shelve
import time
import re
import MySQLdb
import MySQLdb.cursors
import ast
import json
import os

class Image(object):

    def __init__(self, data):
        if data.has_key('name'):
            self.name = data['name']
        else:
            self.name = 'placeholderkitten.jpeg'

        if data.has_key('uploader'):
            self.uploader = data['uploader']
        else:
            self.uploader = 'anonymous'

        if data.has_key('time'):
            self.time = data['time']
        else:
            self.time = time.time()
        
        if data.has_key('hash'):
            self.hashdigest = data['hash']


    # returns this in 'serialized' form, this data can be used in init    
    def getdict(self):
        ret = {}
        ret['path'] = self.urlpath
        ret['name'] = self.name
        ret['uploader'] = self.uploader
        ret['time'] = self.time
        ret['hash'] = self.hashdigest
        return ret

    # properties
    # name: the image filename
    def getname(self):
        return self.__name
    def setname(self, name):
        # todo: strip html unfriendly chars (only allow a-z, 0-9, _ and - ?)
        friendly_name = re.sub('[^a-zA-Z0-9\._\-]', '_', name)
        self.__name = friendly_name
    name = property(getname, setname)

    # urlpath: path to image used when displaying image on page
    def geturlpath(self):
        return 'images/' + self.name
    urlpath = property(geturlpath)

    # filepath: relative path to image on disk
    def getfilepath(self):
        return '../images/' + self.name
    filepath = property(getfilepath)

    # uploader: name of uploader
    def getuploader(self):
        return self.__uploader
    def setuploader(self, uploader):
        self.__uploader = uploader
    uploader = property(getuploader, setuploader)

    # time: date and time of upload
    def gettime(self):
        return self.__time
    def settime(self, time):
        self.__time = time
    time = property(gettime, settime)
    
    # hashdigest: sha224 hash digest of the image data
    def gethashdigest(self):
        return self.__hashdigest
    def sethashdigest(self, hashdigest):
        self.__hashdigest = hashdigest
    hashdigest = property(gethashdigest, sethashdigest)



#utility methods

def upload_image(data, metadata):

    rawdata = base64.b64decode(data)
    hashdigest = hashlib.sha224(rawdata).hexdigest()
    image = get_image(hashdigest)
    if image_exists(hashdigest):
       return {'status': 'error', 'message': 'duplicate image', 'path': image.urlpath}
    metadata['hash'] = hashdigest
    image = Image(metadata)

    # need to shorten image name if it's too long, assign a default name
    if len(image.name) > 50:
        image.name = 'kitten' + image.name[image.name.rfind('.'):]

    # check if there is an other image with the same name
    while os.path.exists(image.filepath):
        image.name = (str(time.time()) % 10) + image.name

    # all is good, save image to disk and list
    with open(image.filepath, 'wb') as imagefile:
        imagefile.write(rawdata)
    save_to_list(image)
    return {'status': 'ok', 'path': image.urlpath, 'uploader': image.uploader, 'time': image.time}


# TODO: create database wrapper class
def list_images():
    db = MySQLdb.connect(user='imagegalleryuser',passwd='imagegalleryuser',db='imagegallery',cursorclass=MySQLdb.cursors.DictCursor)
    c = db.cursor()
    res = []
    for _ in range(c.execute('select * from images')):
        row = c.fetchone()
        res.append(Image(row).getdict())
    db.close()
    return res
    

def save_to_list(image):
    db = MySQLdb.connect(user='imagegalleryuser',passwd='imagegalleryuser',db='imagegallery')
    c = db.cursor()
    # todo: check if image hash already exists in db (extra security measure)
    if c.execute('select * from images where hash = %s', (image.hashdigest)) == 0:
        c.execute('insert into images (hash, name, time, uploader) values (%s, %s, %s, %s)', (image.hashdigest, image.name, image.time, image.uploader))
        db.commit()
    db.close()

def get_image(digest):
    db = MySQLdb.connect(user='imagegalleryuser',passwd='imagegalleryuser',db='imagegallery',cursorclass=MySQLdb.cursors.DictCursor)
    c = db.cursor()
    if c.execute('select * from images where hash = %s', (digest)) == 1:
        ret = Image(c.fetchone())
    else:
        ret = None
    db.close()
    return ret

def image_exists(digest):
    db = MySQLdb.connect(user='imagegalleryuser',passwd='imagegalleryuser',db='imagegallery',cursorclass=MySQLdb.cursors.DictCursor)
    c = db.cursor()
    ret = c.execute('select * from images where hash = %s', (digest)) == 1
    db.close()
    return ret

