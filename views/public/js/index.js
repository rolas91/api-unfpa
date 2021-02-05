$(document).ready(function(){
    $('#showp1').on('click', function() {
        $('#showp1').attr('src', function(index, attr) {
            return attr == '/static/img/eye.png' ? '/static/img/invisible.png' : '/static/img/eye.png';
        })
        $('#pass1').attr('type', function(index, attr) {
          return attr == 'text' ? 'password' : 'text';
        })
    });
    $('#showp2').on('click', function() {
        $('#showp2').attr('src', function(index, attr) {
            return attr == '/static/img/eye.png' ? '/static/img/invisible.png' : '/static/img/eye.png';
        })
        $('#pass2').attr('type', function(index, attr) {
          return attr == 'text' ? 'password' : 'text';
        })
    });
});

