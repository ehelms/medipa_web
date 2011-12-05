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

                var zoom = $("#zoom").attr("checked");
                if (zoom)
                    plot = $.plot(placeholder, data,
                                  $.extend(true, {}, options, {
                                      xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to }
                                  }));

                console.log(ranges);
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

        };

    return {
        init : init
    };

})();

$(document).ready(function(){

    MW.histogram.init();

});
