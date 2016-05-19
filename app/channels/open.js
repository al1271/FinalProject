var email = 'james2doyle@gmail.com';
var subject = 'js email';
$('button').click(function() {

    var mailto_link = 'mailto:' + email + '?subject=' + subject + '&body=' "wow";

    win = window.open(mailto_link, 'emailWindow');
    if (win && win.open && !win.closed) win.close();

});