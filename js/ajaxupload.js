function AjaxFileUpload(handlers) {
    var xhr = new XMLHttpRequest();

    // attach event handlers for download
    xhr.addEventListener('abort', handlers.dl.onabort, false);
    xhr.addEventListener('error', handlers.dl.onerror, false);
    xhr.addEventListener('load', handlers.dl.onload, false);
    xhr.addEventListener('loadstart', handlers.dl.onloadstart, false);
    xhr.addEventListener('progress', handlers.dl.onprogress, false);
    xhr.addEventListener('readystatechange', handlers.dl.onreadystatechange, false);

    // attach event handlers for download
    xhr.upload.addEventListener('abort', handlers.ul.onabort, false);
    xhr.upload.addEventListener('error', handlers.ul.onerror, false);
    xhr.upload.addEventListener('load', handlers.ul.onload, false);
    xhr.upload.addEventListener('loadstart', handlers.ul.onloadstart, false);
    xhr.upload.addEventListener('progress', handlers.ul.onprogress, false);
    xhr.upload.addEventListener('readystatechange', handlers.ul.onreadystatechange, false);

    this.uploadFile = function(file, data, uploader) {
        trackEvent('image', 'upload', uploader);
        xhr.open('post', '/upload', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            'filedata': encode64(data),
            'metadata': {
                'name': file.fileName,
                'uploader': uploader
            }
        }));
    };
}
