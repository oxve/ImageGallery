function MessageQueue(messageContainer) {
    this._mc = messageContainer;
    this._rm = function(el) {
        $(el).animate({opacity: 0}, 'fast').slideUp('fast', function(){$(this).remove();});
    };
}

MessageQueue.prototype.message = function(id, msg, timeout) {
    var t = this;
    var element = $('#'+id, t._mc);
    if (element.length != 1) {
        // TODO: add a remove button
        element = $('<div id="'+id+'"></div>');
        // TODO: Fancy animation
        $(t._mc).append(element);
    }
    element.html(msg);

    var timer = element.data('timer');
    if (timer) {
        clearTimeout(timer);
    }
    element.data('timer', setTimeout((function(el){return function(){t._rm(el);};})(element), timeout || 2000));

    // TODO: (Maybe) Cancel timeout on mouse hover
}
