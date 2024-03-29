var MW = MW || {};


MW.defaults = {
  opacity:opacity,
  brightness: brightness,
  highlight: "[]",
  size: distance,
  cut : JSON.stringify(cubeVectorToArray())

};

MW.configuration = (function(){
    var save = function(url){
            var to_send = {},
                name = $('#configuration_name').val(),
                comment = $('#configuration_comment').val();



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
            to_send['comment'] = comment;

            $.post(url, to_send).success(function(data){
                var image_id = $('#image_name').data('id');

                if( data['saved'] === true ){
                    $('#configuration_alert_success').show();
                    $('#configuration_table').prepend(config_row(name, comment, image_id));
                    $('#configuration_name').val("");
                    $('#configuration_comment').val("");                                        
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
        delete_config = function(url){

            $.ajax({
                url     : url,
                type  : 'delete'
            }).success(function(data){
                var image_id = $('#image_name').data('id');

                close_alerts();

                if( data['deleted'] === true ){
                    $('#config_' + data['config_id']).remove();
                } else {
                    $('#configuration_alert_error_message').html(data.message);
                    $('#configuration_alert_error').show();
                }
            });
            
        },
        close_alerts = function(){
            $('#configuration_alert_error').hide();
            $('#configuration_alert_success').hide();
        },
        config_row = function(name, comment, image_name){
            var html = '<tr id="config_' + name  + '"><td>' + name + '</td>' +
                    '<td>' + comment + '</td>' +
                    '<td><button class="config_link btn success" data-url="/image/' + 
                    image_name + '/configuration/' + name + 
                    '/" >Load</a></td>' + 
                    '<td><button class="config_delete_link btn danger" data-url="/image/' + 
                    image_name + '/configuration/' + 
                    name + '/">Delete</a></td></tr>';

            return html;
        };

    return {
        save    : save,
        load    : load,
        delete_config : delete_config
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
    
    $('.config_delete_link').live('click', function(){
        MW.configuration.delete_config($(this).data('url'));
    });
};
