import cgi#, cgitb
#cgitb.enable()
import os
import adodbapi
import hashlib
import shelve

print 'Content-Type: text/plain'
print


oldpath = 'C:\\Python\\playground\\Images\\'

filedir = 'C:\\Python\\playground\\new\\'
files = os.listdir(filedir)
objstore = shelve.open('objectstore.db')

for fname in files:
  imagepath = filedir + fname
  with open(imagepath, 'rb') as image:
    imagedata = image.read()
    digest = hashlib.sha224(imagedata).hexdigest()
    #print digest, imagepath
    if objstore.has_key(digest): # key exists
      print 'image exists:', objstore[digest], '(dobbelganger:', imagepath, ')'
    else:
      objstore[digest] = imagepath
      #print 'saving image to objstore:', digest, imagepath

#db = adodbapi.connect('Provider=sqloledb;Data Source=exstac-pc\sqlexpress;Initial Catalog=ImageGallery;User Id=galleryuser;Password=galleryuser;')
#db = adodbapi.connect('Provider=sqloledb;Data Source=exstac-pc\sqlexpress;Initial Catalog=oldGallery;User Id=galleryuser;Password=galleryuser;')
#c = db.cursor()

#c.execute('insert into Image (hash, name, description, created) values(\'hej1\', \'hej2\', \'hej3\', \'2010-03-25 00:00:00.000\')')
#conn.commit()

#c.execute('select * from Image')
#i = 0
#while (1):
  #image = c.fetchone()
  #if image == None: break
  #oldpath = 'C:\\Python\\playground\\Images\\'+image[1][1:][:-1]+'.'+image[3]
  #os.
  #if os.path.isfile(oldpath):
  #  with open(oldpath, 'rb') as old:
  #    with open('C:/Python/playground/new/'+image[2], 'wb') as new:
  #      new.write(old.read())
  #else:
  #  print 'missing', oldpath
  #print image[1][1:][:-1]+'.'+image[3], image[2]
#c.close()
