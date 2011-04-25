function open_popup(array, index) {
    var url = array[index].path;
    var title = get_title(array[index], index + 1, array.length);
    var remove_popup = function(callback) {
        $('.popup').animate({opacity: 0}, {
            'duration': 'fast', 
            'complete': function() {
                $('.popup').remove();
                $(window).unbind('click');
                $(window).unbind('resize', resize_popup_image);
                $(window).unbind('keydown');
                if (typeof callback == 'function') {
                    callback();
                }
            }
        });
    };
    this.currindex = index;
    var show_next = function() {
        if (currindex < array.length) {
            open_popup(array, currindex+1);
            if ((currindex) % 8 === 0) {
                window.location.hash = 'page' + (currindex / 8 + 1);
            }
        }
        return false;
    };
    var show_prev = function() {
        if (currindex > 0) {
            open_popup(array, currindex-1);
            if ((currindex+1) % 8 === 0) {
                window.location.hash = 'page' + ((currindex+1) / 8);
            }
        }
        return false;
    };
    
    var open_image = function() {
        image = new Image();
        image.onload = function() {
            $(image).data('width', image.width);
            $(image).data('height', image.height);
            $(image).data('ratio', image.width / image.height);

            var imginfo = $('<div/>').html(title);

            var nav_f = $('<a href="#" class="next">next</a>').click(show_next);
            var nav_b = $('<a href="#" class="prev">previous</a>').click(show_prev);
            var navholder = $('<div/>').append(nav_b, nav_f);
            
            $('body').append($('<div class="popup"/>').append(image, imginfo, navholder));
            resize_popup_image();

            $(window).resize(resize_popup_image);
            $(window).click(remove_popup);
            $(window).keydown(function(e){
                if (e.keyCode === 37) {
                    show_prev();
                } else if (e.keyCode === 39) {
                    show_next();
                } else if (e.keyCode === 27) {
                    remove_popup();
                }
            });
        };
        image.src = url;
    };
    
    if ($('.popup').length > 0) {
        remove_popup(open_image);
    } else {
        open_image();
    }
}

function resize_popup_image() {
    var holder = $('.popup');
    var image = $('img', holder);
    var w = image.data('width'), h = image.data('height'), ratio = image.data('ratio');

    if (w > ($(window).width() * 0.8)) {
        w = $(window).width() * 0.8;
        h = w / ratio;
    }
    if (h > ($(window).height() * 0.8)) {
        h = $(window).height() * 0.8;
        w = h * ratio;
    }
    image.width(w);
    image.height(h);
    holder.css('margin', (-h/2)+'px 0 0 '+(-w/2)+'px');
}

function get_title(image, index, total) {
    var d = new Date(image.time*1000);
    var dateStr = d.getDate() + '/' + d.getMonth() + ' ' + d.getFullYear();
    return 'Uploaded ' + dateStr + ' by ' + (image.uploader || 'anonymous') + ' (' + index + ' of ' + total + ')';
}