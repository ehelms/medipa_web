var MW = MW || {};


MW.defaults = {
  opacity:opacity,
  brightness: brightness,
  highlight: "[]",
  cut : JSON.stringify({x_min: 0, x_max: 1, y_min:0, y_max:1, z_min:0, z_max:1})

};

MW.configuration = (function(){
    var save = function(url){
            var to_send = {},
                name = $('#configuration_name').val();



            close_alerts();

            $.each(MW.defaults, function(key, value){
               if($.bbq.getState(key) === undefined){
                 var new_h = {};
                 new_h[key] = value;
                 $.bbq.pushState(new_h)
               }
            });


            to_send['config'] = $.param.fragment();
            to_send['name'] = name;

            $.post(url, to_send).success(function(data){
                var image_id = $('#image_name').data('id');

                if( data['saved'] === true ){
                    $('#configuration_alert_success').show();
                    $('#configuration_table').prepend(config_row(name, image_id));
                } else {
                    $('#configuration_alert_error_message').html(data.message);
                    $('#configuration_alert_error').show();
                }
            });
        },
        load = function(url){
            close_alerts();
            
            $.get(url).success(function(data){
                $.bbq.pushState(data);
                $('#view_configurations').trigger('click');
                MW.hash_change();
            });
        },
        close_alerts = function(){
            $('#configuration_alert_error').hide();
            $('#configuration_alert_success').hide();
        },
        config_row = function(name, image_name){
            var html = '<tr><td>' + name + '</td>' +
                    '<td><button class="config_link btn" data-url="/image/' + 
                    image_name + '/configuration/' + name + 
                    '/" >Load Configuration</a></td></tr>';

            return html;
        };

    return {
        save    : save,
        load    : load
    }
})(jQuery);


MW.init_configuration = function(){
    $('#save_configuration').click(function(){
        MW.configuration.save($(this).data('url'));
    });

    $('.config_link').live('click', function(){
        MW.configuration.load($(this).data('url'));
        MW.hash_change();
    });
};
