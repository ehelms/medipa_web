var MW = MW || {};

MW.histogram = (function(){
    var init = function(){
            $.getJSON($('#placeholder').data('url'), function(data){
                setup_graph([{ data : data }]);
            });
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
            });

            placeholder.bind("plotunselected", function (event) {
                $("#selection").text("");
            });
            
            var plot = $.plot(placeholder, data, options);

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
        init : init
    };

})();

$(document).ready(function(){

    MW.histogram.init();

});
