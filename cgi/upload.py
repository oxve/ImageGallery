#!/usr/bin/python
import cgi, cgitb
cgitb.enable()

import json
import os
import GalleryUtils
import sys
import traceback

if __name__=="__main__":
    print 'Content-Type: application/json'
    print

    try:
        post = json.loads(sys.stdin.read(int(os.environ['CONTENT_LENGTH'])))
        ret = GalleryUtils.upload_image(post['filedata'], post['metadata'])
        print json.dumps(ret)
    except Exception as ex:
        print json.dumps({'status': 'error', 'message': 'server error: ' + str(ex), 'stacktrace': traceback.format_exc()})
