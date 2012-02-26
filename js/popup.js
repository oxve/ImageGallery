function open_popup(array, index) {
    var title = get_title(array[index], index + 1, array.length);
    var hide_popup = function(callback) {
        $('.popup, .popup-bg').animate({opacity: 0}, {
            'duration': 'fast', 
            'complete': function() {
                $('.popup').hide();
                $('.popup-bg').hide();
                $(window).unbind('click');
                $(window).unbind('resize', resize_popup_image);
                $(window).unbind('keydown');
                if (typeof callback == 'function') {
                    callback();
                }
            }
        });
    };

    var open_image = function() {
        var url = array[index].path;
        $('.popup-bg').show().css('opacity', 0.5);
        image = new Image();
        image.onload = function() {

            $(image).data('width', image.width);
            $(image).data('height', image.height);
            $(image).data('ratio', image.width / image.height);

            var popup = $('.popup');
            popup.html('').show();
            var imginfo = $('<span class="info" />').html(title);
            $('.popup').append(image, imginfo).css('opacity', 1);
            resize_popup_image();

        };
        image.src = url;
    };

    var show_next = function() {
        if (index < array.length) {
            index = index + 1;
            open_image();
            if ((index) % 8 === 0) {
                window.location.hash = 'page' + (index / 8 + 1);
            }
        }
        return false;
    };
    var show_prev = function() {
        if (index > 0) {
            index = index - 1;
            open_image();
            if ((index+1) % 8 === 0) {
                window.location.hash = 'page' + ((index+1) / 8);
            }
        }
        return false;
    };

    $(window).resize(resize_popup_image);
    $(window).click(hide_popup);
    $(window).keydown(function(e){
        if (e.keyCode === 37) {
            show_prev();
        } else if (e.keyCode === 39) {
            show_next();
        } else if (e.keyCode === 27) {
            hide_popup();
        }
    });

    open_image();
}


function resize_popup_image() {
    var holder = $('.popup');
    var image = $('img', holder);
    var ratio = image.data('ratio');
    var h = image.data('height'), w = image.data('width');

    if (w > ($(window).width() * 0.9)) {
        w = $(window).width() * 0.9;
        h = w / ratio;
    }
    if (h > ($(window).height() * 0.9)) {
        h = $(window).height() * 0.9;
        w = h * ratio
    }

    image.width(w);
    image.height(h);
    holder.width(Math.max(w + 6, $('.popup .info').width()));
    holder.height(h+20);
    holder.css('margin', (-(h+14+6)/2)+'px 0 0 '+(-(w+6)/2)+'px');
}

function get_title(image, index, total) {
    var d = new Date(image.time*1000);
    var dateStr = d.getDate() + '/' + (d.getMonth() + 1) + ' ' + d.getFullYear();
    return 'Uploaded ' + dateStr + ' by ' + (image.uploader || 'anonymous') + ' (' + index + ' of ' + total + ')';
}