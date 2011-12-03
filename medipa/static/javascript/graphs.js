var MW = MW || {};

MW.histogram = (function(){
    var data = [
            {
                label: "United States",
                data: [[1990, 18.9], [1991, 18.7], [1992, 18.4], [1993, 19.3], [1994, 19.5], [1995, 19.3], [1996, 19.4], [1997, 20.2], [1998, 19.8], [1999, 19.9], [2000, 20.4], [2001, 20.1], [2002, 20.0], [2003, 19.8], [2004, 20.4]]
            },
        ],

        init = function(){
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
                plot.setSelection({ xaxis: { from: 1994, to: 1995 } });
            });

        };

    return {
        init : init
    };

})();

$(document).ready(function(){

    MW.histogram.init();

});
