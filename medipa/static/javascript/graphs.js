var MW = MW || {};

MW.histogram = (function(){
    var plot = undefined,
        init = function(){
            $.getJSON($('#placeholder').data('url'), function(data){
                setup_graph([{ data : data }]);
            });
        },
        get_values = function(){
           var obj = plot.getSelection();
           if (obj) {
               return [Math.floor(obj.xaxis.from), Math.ceil(obj.xaxis.to)];
           }
           else {
               return undefined;
           }
        },
        setup_graph = function(data){
            var options = {
                series: {
                    points: { show: true }
                },
                legend: { show: false },
                xaxis: { tickDecimals: 0 },
                yaxis: { min: 0 },
                selection: { mode: "x" }
            };

            var placeholder = $("#placeholder");

            placeholder.bind("plotselected", function (event, ranges) {
                $("#selection").text(ranges.xaxis.from.toFixed(1) + " to " + ranges.xaxis.to.toFixed(1));
                MW.highlight_list.set_current(Math.floor(ranges.xaxis.from), Math.ceil(ranges.xaxis.to));
            });

            placeholder.bind("plotunselected", function (event) {
                $("#selection").text("");
                MW.highlight_list.unset_current();
            });
            
            plot = $.plot(placeholder, data, options);

            $("#clearSelection").click(function () {
                plot.clearSelection();
            });

            $("#setSelection").click(function () {
                plot.setSelection({ xaxis: { from: 0, to: 280 } });
            });

            $('#zoom_histogram').on('click', function(){
                var ranges = plot.getSelection(),
                    points = data[0].data,
                    max = 0, i = 0;

                for(i = Math.floor(ranges.xaxis.from); Math.floor(ranges.xaxis.from) <= i && i <= Math.ceil(ranges.xaxis.to); i += 1){
                    max =  points[i][1] > max ? points[i][1] : max;
                }

                plot = $.plot(placeholder, data,
                              $.extend(true, {}, options, {
                                  xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to },
                                  yaxis: { min: 0, max: max + 10 }
                              }));
            });

            $('#zoom_reset').on('click', function(){
                plot = $.plot(placeholder, data,
                              $.extend(true, {}, options, {
                                  xaxis: { min: 0, max: data[0].data.length }
                              }));
            });

        };

    return {
        init : init,
        get_values: get_values

    };

})();

$(document).ready(function(){

    MW.histogram.init();

});
