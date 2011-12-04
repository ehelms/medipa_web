var MW = MW || {};

MW.renderer = (function(){
    var set_dimensions = function(width, height){
            $('#webgl_canvas').width(width);
            $('#webgl_canvas').height(height);
        },
        fullscreen = function(exit){
            var width = $(window).width(),
                height = $(window).height();
            
            if( exit ){
                resize();
            } else {
                width = width - 40;
                height = height - $('.topbar').height() - $('.page-header').height() - 60;
                
                set_dimensions(width, height);
            }
        },
        resize = function(){
            var width = $(window).width(),
                height = $(window).height();

            width = width - $('#controls-container').width() - 100;
            height = height - $('.topbar').height() - $('.page-header').height() - 60;
         
            set_dimensions(width, height);   
        },
        init = function(){
            resize();

            $(window).resize(resize);
        };

    return {
        init        : init,
        fullscreen  : fullscreen
    };

})();

$(document).ready(function(){

    MW.renderer.init();

    $('#view_fullscreen').on('click', function(){
        if( $(this).html() === 'Exit Fullscreen' ){
            MW.renderer.fullscreen(true);
            $(this).html('View Fullscreen');
            $('#controls-container').show();
        } else {
            MW.renderer.fullscreen(false);
            $(this).html('Exit Fullscreen');
            $('#controls-container').hide();
        }
    });

    $('#view_configurations').on('click', function(){
        if( $('#view_configurations').html() === 'Open Configurations' ){
            $('#view_configurations').html('Close Configurations');
        } else {
            $('#view_configurations').html('Open Configurations');
        }
        $('#configurationContainer').slideToggle('fast');
    });
});
