var AjaxFileUpload = {};

// Default event handlers
AjaxFileUpload.dl = {
  onabort: function(e) {},
  onerror: function(e) {},
  onload: function(e) {},
  onloadstart: function(e) {},
  onprogress: function(e) {},
  onreadystatechange: function(e) {}
};

AjaxFileUpload.ul = {
  onabort: function(e) {},
  onerror: function(e) {},
  onload: function (e) {},
  onloadstart: function(e) {},
  onprogress: function (e) {},
  onreadystatechange: function(e) {}
};

AjaxFileUpload.uploadFile = function(file, data, uploader) {
  var afu = AjaxFileUpload;

  /* Utils */
  
  // This code was written by Tyler Akins and has been placed in the
  // public domain.  It would be nice if you left this header intact.
  // Base64 code from Tyler Akins -- http://rumkin.com
  var encode64 = function (input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var res = '';
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
  
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
  
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
  
      res += keyStr.charAt(enc1);
      res += keyStr.charAt(enc2);
      res += keyStr.charAt(enc3);
      res += keyStr.charAt(enc4);
    }
    return res;
  };

  var xhr = new XMLHttpRequest();

  // attach event handlers for download
  xhr.addEventListener('abort', afu.dl.onabort, false);
  xhr.addEventListener('error', afu.dl.onerror, false);
  xhr.addEventListener('load', afu.dl.onload, false);
  xhr.addEventListener('loadstart', afu.dl.onloadstart, false);
  xhr.addEventListener('progress', afu.dl.onprogress, false);
  xhr.addEventListener('readystatechange', afu.dl.onreadystatechange, false);

  // attach event handlers for download
  xhr.upload.addEventListener('abort', afu.ul.onabort, false);
  xhr.upload.addEventListener('error', afu.ul.onerror, false);
  xhr.upload.addEventListener('load', afu.ul.onload, false);
  xhr.upload.addEventListener('loadstart', afu.ul.onloadstart, false);
  xhr.upload.addEventListener('progress', afu.ul.onprogress, false);
  xhr.upload.addEventListener('readystatechange', afu.ul.onreadystatechange, false);

  xhr.open('post', '/upload', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send('filename='+file.fileName+'&filedata='+encodeURIComponent(encode64(data))+'&uploader='+uploader);
};
