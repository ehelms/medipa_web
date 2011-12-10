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



MW.hash_change = function(){    
    var state = $.deparam.fragment();
    setSize(parseFloat(state.size));
    setOpacity(parseFloat(state.opacity));
    setBrightness(parseFloat(state.brightness));
    MW.loadRotation();    
    
    
};

MW.colors = (function(){
    var current,
    current_color = function(){
        return [current.val("r"), current.val("g"), current.val("b"), current.val("a")]
    },
    set_current_color = function(color){
        current = color;
        MW.highlight_list.set_current_color(current_color());
    };


    return {
        current_color: current_color,
        set_current_color: set_current_color
    }

})();


MW.highlight_list = (function(){
   var list = [],
       current = undefined;
   var redraw = function(){
       var array = [];
       if(current){ array.push(current)};
       MW.redraw_colors(array);
   },
   set_current = function(from, to){
     current = new_obj(MW.colors.current_color(), from, to);
     redraw();
   },
   set_current_color = function(color){
    if(current){
        current.color = color;
        redraw();
    }       
   }
   unset_current = function(){
       current = undefined;
       redraw();
   }
   new_obj = function(color, from, to){
    return {color:color, to:to, from:from};
   }

   return {
       set_current: set_current,
       set_current_color: set_current_color,
       unset_current: unset_current
   }

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
        $('.alert-message').hide();
        if( $('#view_configurations').html() === 'Open Configurations' ){
            $('#view_configurations').html('Close Configurations');
        } else {
            $('#view_configurations').html('Open Configurations');
        }
        $('#configurationContainer').slideToggle('fast');
    });
    
    var initial_color = new $.jPicker.Color({ ahex: '99330099' });

    $("#picker").jPicker({
        'images':{clientPath:"/static/images/"},
        'window':{alphaSupport: true, expandable: true},
        'color': {mode:"a", active: initial_color}},
        function(color){
            MW.colors.set_current_color(color);
        });
    MW.colors.set_current_color(initial_color);

    $("#highlight_selected").click(function(){

    });

        
});
