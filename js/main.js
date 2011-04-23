var msgq = new MessageQueue('#messages');

function formatDate(d) {
    return d.getDate() + '/' + d.getMonth() + ' ' + d.getFullYear();
}

function loadImage(params, addTo, prepend) {
    var image = $('<div/>').append(
        $('<a />')
            .attr('href', params.path)
            .attr('rel', 'gallery')
            .attr('title', 'Uploaded '+formatDate(new Date(params.time*1000))+' by '+(params.uploader||'anonymous'))
            .append($('<img />')
                .attr('src', params.path)
                .css({opacity: 0})));
    
    $('img', image).load(function(){ $(this).animate({opacity: 1}, 500); });
    $('a', image).fancybox({
        'autoDimensions': false,
        'width': 'auto',
        'height': 'auto',
        'href': $(this).attr('href'),
        'showCloseButton': false,
        'titlePosition': 'inside',
        'titleFormat': function(title, arr, i, opts) {
            var currindex = $('#navigation').data('currindex');
            var total = $('#slideshow').data('imagelist').length;
            var el = $('<div/>')
                .attr('id', 'image-title')
                .append($('<span/>')
                    .append($('<a/>')
                        .attr('href', 'javascript:;')
                        .click($.fancybox.close)
                        .append($('<img/>')
                            .attr('src', '/js/fancybox/close.gif'))))
                .append((title&&title.length?'<div><b>'+title+'</b></div>':'')+'Image '+(currindex+i+1)+' of '+total);
            return el;
        }
    });

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
            trackEvent('navigation', 'visit_page', 'page_'+(currindex / 8));
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
            trackEvent('navigation', 'visit_page', 'page_'+(currindex / 8 + 2));
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
                    loadImage(resp, '#slideshow', true);
                    $('#slideshow > div:last-child').remove();
                };})(dlId, file.fileName)
            },
            ul: {
                onprogress: (function(id, imgName) { return function (e) {
                    msgq.message(id, 'Uploading ' + imgName + ': ' + Math.round((e.loaded / e.total) * 100) + ' %', 'info');
                };})(ulId, file.fileName),
                onload: (function(id, imgName) { return function (e) {
                    msgq.message(id, imgName + ' uploaded', 'info', 3000);
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
