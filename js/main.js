var msgq = new MessageQueue('#messages');

function formatDate(d) {
    return d.getDate() + '/' + d.getMonth() + ' ' + d.getFullYear();
}

function loadImage(params, addTo, prepend) {
    var image = $('<div/>').append(
        $('<a />')
            .attr('href', params.path)
            .attr('title', 'Uploaded '+formatDate(new Date(params.time*1000))+' by '+(params.uploader||'anonymous'))
            .append($('<img />')
                .attr('src', params.path)
                .css({opacity: 0})));
    
    $('img', image).load(function(){ $(this).animate({opacity: 1}, 500); });
    
    $('a', image).click(function() {
        var index = parseInt(window.location.hash.substring(5) || 1) - 1;
        open_popup($('#slideshow').data('imagelist'), index*8 + $(this).parent().index());
        return false;
    });

    if (prepend) {
        $(addTo).prepend(image);
    } else {
        $(addTo).append(image);
    }
}

function setupNavigation() {
    $('#navigation .left').click(function() {
        var page;
        if (window.location.hash.indexOf('#page') === 0) {
            page = parseInt(window.location.hash.substring(5)) - 1;
        } else {
            page = 0;
        }
        var currindex = page * 8;
        var imagelist = $('#slideshow').data('imagelist');
        if (currindex > 0) {
            $('#slideshow div').remove();
            for (var i = currindex - 1; i >= currindex - 8; --i) {
                loadImage(imagelist[i], '#slideshow', true);
            }
            window.location.hash = 'page' + (currindex / 8);
        }
        return false;
    });
    
    $('#navigation .right').click(function() {
        var page;
        if (window.location.hash.indexOf('#page') === 0) {
            page = parseInt(window.location.hash.substring(5)) - 1;
        } else {
            page = 0;
        }
        var currindex = page * 8;
        var imagelist = $('#slideshow').data('imagelist');
        if (currindex + 8 < imagelist.length) {
            $('#slideshow div').remove();
            for (var i = currindex + 8; i < currindex + 16 && i < imagelist.length; ++i) {
                loadImage(imagelist[i], '#slideshow', false);
            }
            window.location.hash = 'page' + (currindex / 8 + 2);
        }
        return false;
    });
    
    window.location.hash = '';
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
    });
}

window.onpopstate = function(e) {
    var imagelist = $('#slideshow').data('imagelist');
    var page;
    
    if (!imagelist) return;
    
    if (window.location.hash.indexOf('#page') === 0) {
        page = parseInt(window.location.hash.substring(5)) - 1;
    } else {
        page = 0;
    }
    $('#slideshow div').remove();
    for (var i = page * 8; i < page * 8 + 8 && i < imagelist.length; ++i) {
        loadImage(imagelist[i], '#slideshow', false);
    }
    trackEvent('navigation', 'visit_page', 'page_'+(page+1));
};


$(function () {
    trackEvent('navigation', 'visit_page', 'page_1');

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
        msgq.message('latest123', 'latest', 'info');
    });

    $('#random_menu').click(function(){
        msgq.message('random123', 'random', 'info');
    });

    $('#top_menu').click(function(){
        msgq.message('top123', 'top', 'info');
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

    droparea.ondragover = function(e) {
        return false;
    };

    document.getElementById('slideshow').ondragover = function(e) {
        $('#droparea').show();
    };

});

function uploadFiles(fileList) {
    for (var i = 0; i < fileList.length; ++i) {
        var file = fileList[i];
        if (!file || !file.type || file.type.length < 5 || file.type.substr(0, 5) != 'image') {
            msgq.message('error' + new Date().getTime(), 'file type not supported', 'error');
            continue;
        }

        var ulId = '_ul' + i + '_' + new Date().getTime();
        var dlId = '_dl' + i + '_' + new Date().getTime();
        var handlers = {
            dl: {
                onload: (function(id, imgName) { return function(e) {
                    var resp = $.parseJSON(e.target.responseText);
                    if (resp.status == 'error') {
                        msgq.message(id, 'Error when uploading ' + imgName + ': ' + resp.message, 'warning', 3000);
                        return;
                    }
                    var imagelist = $('#slideshow').data('imagelist');
                    imagelist.splice(0, 0, resp);
                    $('#slideshow').data('imagelist', imagelist);
                    loadImage(resp, '#slideshow', true);
                    $('#slideshow > div:last-child').remove();
                };})(dlId, file.name || file.fileName)
            },
            ul: {
                onprogress: (function(id, imgName) { return function (e) {
                    msgq.message(id, 'Uploading ' + imgName + ': ' + Math.round((e.loaded / e.total) * 100) + ' %', 'info');
                };})(ulId, file.name || file.fileName),
                onload: (function(id, imgName) { return function (e) {
                    msgq.message(id, imgName + ' uploaded', 'info', 3000);
                };})(ulId, file.name || file.fileName)
            }
        };

        var reader = new FileReader();
        reader.onloadend = (function (img, id, handlerObj) {
            return function (e) {
                var uploader = $.cookie('whoami') || 'anonymous';
                var afu = new AjaxFileUpload(handlerObj);
                afu.uploadFile(e.target.result, {uploader: uploader, name: img.name || img.fileName);
            };
        })(file, ulId, handlers);
        reader.onprogress = (function (id) {
            return function (e) { };
        })(ulId);
        reader.readAsBinaryString(file);
    }
}
