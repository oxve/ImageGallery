// This code was written by Tyler Akins and has been placed in the
// public domain.	 It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com
function encode64(input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0, res = '';
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
}
