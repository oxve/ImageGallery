#!/usr/bin/python
import cgi, cgitb
cgitb.enable()
import json
import GalleryUtils

if __name__=="__main__":
    print 'Content-Type: application/json'
    print
    print json.dumps({'images': GalleryUtils.list_images()})
