var MW = MW || {};

MW.configuration = (function(){
    var save = function(url){
            var config = $.deparam.fragment();

            $.post(url, config).success(function(data){
                console.log('success');
            });
        },
        load = function(url){
            $.get(url).success(function(data){
                $.bbq.pushState(data);
            });
        };

    return {
        save    : save,
        load    : load
    };
})(jQuery);


MW.init_configuration = function(){
    $('#save_configuration').click(function(){
        MW.configuration.save($(this).data('url'));
    });

    $('.config_link').click(function(){
        MW.configuration.load($(this).data('url'));
    });

};
