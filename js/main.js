var msgq = new MessageQueue('#messages');

function loadImage(params, addTo, prepend) {
    var image = $('<div><a href="'+params.path+'" rel="images"><img style="opacity:0;" src="'+params.path+'" /></a></div>');
    $('img', image).load(function(){ $(this).animate({opacity: 1}, 500); });
    if (prepend) {
        $(addTo).prepend(image);
    } else {
        $(addTo).append(image);
    }
}

function setupNavigation() {
    
    $('#navigation').data('currindex', 0);
    
    $('#navigation .left').click(function() {
        var currindex = $('#navigation').data('currindex');
        var imagelist = $('#slideshow').data('imagelist');
        if (currindex > 0) {
            $('#slideshow div').remove();
            var i;
            for (i = currindex - 1; i >= currindex - 8; --i) {
                loadImage(imagelist[i], '#slideshow', true);
            }
            $('#navigation').data('currindex', currindex - 8);
            window.location.hash = '#page' + (currindex / 8);
        }
        return false;
    });
    
    $('#navigation .right').click(function() {
        var currindex = $('#navigation').data('currindex');
        var imagelist = $('#slideshow').data('imagelist');
        if (currindex + 8 < imagelist.length) {
            $('#slideshow div').remove();
            var i;
            for (i = currindex + 8; i < currindex + 16 && i < imagelist.length; ++i) {
                loadImage(imagelist[i], '#slideshow', false);
            }
            $('#navigation').data('currindex', currindex + 8);
            window.location.hash = '#page' + (currindex / 8 + 2);
        }
        return false;
    });
}

function loadImages() {
    $.get('/list', function(data) {
        if (!data || !data.images)
            // TODO: show message?
            return;
            
        var sortedlist = data.images.sort(function(a,b){
            return b.time-a.time;
        });
        $('#slideshow').data('imagelist', sortedlist);
        var i;
        for (i = 0; i < 8 && i < sortedlist.length; ++i) {
            if (i == 8) break;
            loadImage(sortedlist[i], '#slideshow', false);
        }
        window.location.hash = '';
    });
}



window.onpopstate = function(e) {
    //console.log(e.target);
};


$(function () {
    $('#slideshow a').live('click', function(){
        jQuery.fancybox({
            'autoDimensions': false,
            'width': 'auto',
            'height': 'auto',
            'href': $(this).attr('href')
        });
        return false;
    });

    loadImages();
    setupNavigation();

    // Get the users name
    if (!$.cookie('whoami')){
        $('#whoareyou').slideDown();
    }

    $('#whoareyou form').submit(function(){
        $.cookie('whoami', $('#username').val(), {expires: 365});
        $('#whoareyou').slideUp();
        return false;
    });

    $('#whoareyou form a').click(function(){
        $.cookie('whoami', 'anonymous', {expires: 365});
        $('#whoareyou').slideUp();
        return false;
    });

    $('#upload_menu').click(function(){
        $('#droparea').toggle();
        return false;
    });


    $('#latest_menu').click(function(){
        msgq.message('latest123', 'latest');
    });

    $('#random_menu').click(function(){
        msgq.message('random123', 'random');
    });

    $('#top_menu').click(function(){
        msgq.message('top123', 'top');
    });


    var droparea = document.getElementById('droparea');
    droparea.ondrop = function (e) {
        $('#droparea').hide();
        // TODO: Open a lightbox to handle the upload?
        uploadFiles(e.dataTransfer.files);
        return false;
    };

    droparea.ondragleave = function(e) {
        $('#droparea').hide();
        return false;
    };

    droparea.ondragover = function (e) {
        return false;
    };

    document.getElementById('slideshow').ondragover = function (e) {
        $('#droparea').show();
    };

});

function uploadFiles(fileList) {
    var i;
    for (i = 0; i < fileList.length; ++i) {
        var file = fileList[i];
        if (!file || !file.type || file.type.length < 5 || file.type.substr(0, 5) != 'image') {
            msgq.message('error' + new Date().getTime(), 'file type not supported');
            continue;
        }

        var ulId = '_ul' + i + '_' + new Date().getTime();
        var dlId = '_dl' + i + '_' + new Date().getTime();
        var handlers = {
            dl: {
                onload: (function(id, imgName) { return function(e) {
                    var resp = $.parseJSON(e.target.responseText);
                    if (resp.status == 'error') {
                        msgq.message(id, 'Error when uploading ' + imgName + ': ' + resp.message, 3000);
                        return;
                    }
                    loadImage(resp, '#slideshow', true);
                    $('#slideshow > div:last-child').remove();
                };})(dlId, file.fileName)
            },
            ul: {
                onprogress: (function(id, imgName) { return function (e) {
                    msgq.message(id, 'Uploading ' + imgName + ': ' + Math.round((e.loaded / e.total) * 100) + ' %');
                };})(ulId, file.fileName),
                onload: (function(id, imgName) { return function (e) {
                    msgq.message(id, imgName + ' uploaded', 3000);
                };})(ulId, file.fileName)
            }
        };

        var reader = new FileReader();
        reader.onloadend = (function (img, id, handlerObj) {
            return function (e) {
                console.log('done loading');
                var uploader = $.cookie('whoami') || 'anonymous';
                var afu = new AjaxFileUpload(handlerObj);
                afu.uploadFile(img, e.target.result, uploader);
            };
        })(file, ulId, handlers);
        reader.onprogress = (function (id) {
            return function (e) {
                console.log('Loading file: ' + Math.round((e.loaded / e.total) * 100) + ' %');
            };
        })(ulId);
        reader.readAsBinaryString(file);
    }
}
