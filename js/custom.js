var margins = { top: 20, right: 50, left: 100, bottom: 75 },
    parse_date = d3.time.format("%m/%Y").parse,
    height = 400 - margins.top - margins.bottom;

localStorage.clear();
localStorage.setItem('path', 'all_by_state/US.csv');
localStorage.setItem('month', '01');

d3.select('#state').on('change', function() {
    var selected_state_name = this.options[this.selectedIndex].innerHTML;
    var state = d3.select(this);
    var state_val = state.property("value");
    var path = 'all_by_state/' + state_val + '.csv';

    var month_val = localStorage.getItem('month');
    var month = (month_val) ? month_val : '01';

    d3.selectAll(".selected_state").text(selected_state_name);
    state.property("value", "");

    localStorage.setItem('path', path);
    localStorage.setItem('state', state_val);

    render();
});

d3.select('#month').on('change', function() {
    var selected_month_name = this.options[this.selectedIndex].innerHTML;
    var month = d3.select(this);
    var month_val = month.property("value");

    localStorage.setItem('month', month_val);

    d3.selectAll(".selected_month").text(selected_month_name);
    month.property("value", "");

    render();
});

var render = _.throttle(function() {
    d3.selectAll('.charts').classed('hide', true);
    d3.selectAll('#load').classed('hide', false);
    d3.selectAll(".svg").remove();

    var precip_colors = ['#543005','#8c510a','#bf812d','#dfc27d','#f6e8c3','#f5f5f5','#c7eae5','#80cdc1','#35978f','#01665e','#003c30'];
    var temp_colors = ['#a50026','#d73027','#f46d43','#fdae61','#fee090','#ffffbf','#e0f3f8','#abd9e9','#74add1','#4575b4','#313695'].reverse();
    var path = localStorage.getItem('path');
    var month = localStorage.getItem('month');
    var width = window.innerWidth - 100 - margins.right - margins.left;

    d3.csv(path, function(data) {
        data.forEach(function(d) {
            d.date = d.month + '/' + d.year;
            d.value = +d.value;
            d.anomaly = +d.anomaly;
        });

        /* Sorting & Grouping Data */
        var avgs = avgValues(data);

        // Sort by year & type plus min max values
        var sorted = _.sortByOrder(data, ['year', 'month'], ['asc', 'asc']);

        var drought_filtered = dataFilter(sorted, 'drought', false, false);
        var max_filtered = dataFilter(sorted, 'max', false, false);
        var min_filtered = dataFilter(sorted, 'min', false, false);
        var precip_filtered =  dataFilter(sorted, 'precip', false, false);
        var temp_filtered = dataFilter(sorted, 'temp', false, false);

        var drought_max_min_value = maxMin(drought_filtered, 'value');
        var max_max_min_value = maxMin(max_filtered, 'value');
        var min_max_min_value = maxMin(min_filtered, 'value');
        var precip_max_min_value = maxMin(precip_filtered, 'value');
        var temp_max_min_value = maxMin(temp_filtered, 'value');

        var drought_max_min_anomaly = maxMin(drought_filtered, 'anomaly');
        var max_max_min_anomaly = maxMin(max_filtered, 'anomaly');
        var min_max_min_anomaly = maxMin(min_filtered, 'anomaly');
        var precip_max_min_anomaly = maxMin(precip_filtered, 'anomaly');
        var temp_max_min_anomaly = maxMin(temp_filtered, 'anomaly');

        // Sort by month and type plus min max values
        var month_sorted =  _.sortByOrder(data, ['month', 'year'], ['asc', 'asc']);

        var month_drought_filtered = dataFilter(month_sorted, 'drought', month, avgs);
        var month_max_filtered = dataFilter(month_sorted, 'max', month, avgs);
        var month_min_filtered = dataFilter(month_sorted, 'min', month, avgs);
        var month_precip_filtered =  dataFilter(month_sorted, 'precip', month, avgs);
        var month_temp_filtered = dataFilter(month_sorted, 'temp', month, avgs);

        var month_drought_max_min_value = maxMin(month_drought_filtered, 'value');
        var month_max_max_min_value = maxMin(month_max_filtered, 'value');
        var month_min_max_min_value = maxMin(month_min_filtered, 'value');
        var month_precip_max_min_value = maxMin(month_precip_filtered, 'value');
        var month_temp_max_min_value = maxMin(month_temp_filtered, 'value');

        var month_drought_max_min_anomaly = maxMin(month_drought_filtered, 'anomaly');
        var month_max_max_min_anomaly = maxMin(month_max_filtered, 'anomaly');
        var month_min_max_min_anomaly = maxMin(month_min_filtered, 'anomaly');
        var month_precip_max_min_anomaly = maxMin(month_precip_filtered, 'anomaly');
        var month_temp_max_min_anomaly = maxMin(month_temp_filtered, 'anomaly');

        /* Bisect data */
        var bisectDate = d3.bisector(function(d) { return parse_date(d.date); }).right;

        /* Scales */
        var xScale = d3.time.scale()
            .domain(d3.extent(data, function(d) { return parse_date(d.date); }))
            .range([0, width]);

        var drought_yScale = yScale(drought_filtered, height);
        var max_yScale = yScale(max_filtered, height);
        var min_yScale = yScale(min_filtered, height);
        var precip_yScale = yScale(precip_filtered, height);
        var temp_yScale = yScale(temp_filtered, height);

        var month_drought_yScale = yScale(month_drought_filtered, height);
        var month_max_yScale = yScale(month_max_filtered, height);
        var month_min_yScale = yScale(month_min_filtered, height);
        var month_precip_yScale = yScale(month_precip_filtered, height);
        var month_temp_yScale = yScale(month_temp_filtered, height);

        /* Axises */
        var xAxis = getAxis(xScale, "bottom");

        var maxYAxis = getAxis(max_yScale, "left");
        var minYAxis = getAxis(min_yScale, "left");
        var precipYAxis = getAxis(precip_yScale, "left");
        var tempYAxis = getAxis(temp_yScale, "left");

        var month_maxYAxis = getAxis(month_max_yScale, "left");
        var month_minYAxis = getAxis(month_min_yScale, "left");
        var month_precipYAxis = getAxis(month_precip_yScale, "left");
        var month_tempYAxis = getAxis(month_temp_yScale, "left");

        var avg_line = lineGenerator(xScale, month_precip_yScale, 'mean');

        /* Precip */
        var precip_svg = showAxises("#precip_div", "#avg_precip", width, xAxis, month_precipYAxis, "Avg. Precipitation (Inches)");
        var precip_line = lineGenerator(xScale, month_precip_yScale, 'value');
        var precip_avg_line = lineGenerator(xScale, month_precip_yScale, 'mean');

        precip_svg.append("path")
            .attr("id", "precip_line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        d3.select("#precip_line").transition()
            .duration(1000)
            .ease("sin-in-out")
            .attr("d", precip_line(month_precip_filtered));

        precip_svg.append("path")
            .attr("id", "precip_avg_line")
            .attr("fill", "none")
            .attr("stroke", "yellow")
            .attr("stroke-width", 2)
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        d3.select("#precip_avg_line").transition()
            .duration(1000)
            .ease("sin-in-out")
            .attr("d", precip_avg_line(month_precip_filtered));

        var bar_width = barWidth(width, month_precip_filtered);
        var precip_strip_color = stripColors(precip_colors);
        var precip_strip_scale = stripScale(month_precip_filtered, 'anomaly');

        var tip_precip = d3.tip().attr('class', 'd3-tip').html(function(d) {
            return '<h4 class="text-center">' + stringDate(month) + '(' + d.year + ')</h4>' +
                '<p>Historical Avg: ' + monthAvg(avgs, 'precip', month).toFixed(2) + ' inches</p>' +
                '<p>Departure from Avg: ' + d.anomaly + ' inches</p>';
        });

        drawStrip("#precip_div", tip_precip, precip_strip_color, precip_strip_scale, month_precip_filtered)

        /* Avg Temp Year */
        var temp_strip_color = stripColors(temp_colors);
      /*  var temp_strip_scale = stripScale(temp_filtered, 'anomaly');

        d3.select("#avg_temp")
            .attr("width", width + margins.left + margins.right)
            .attr("height", 110)
            .selectAll("bar")
            .data(temp_filtered).enter().append("rect")
            .attr("x", function(d) { return xScale(parse_date(d.date)); })
            .attr("width", bar_width)
            .attr("y",  10)
            .attr("height", 100)
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
            .style("fill", function(d) { return temp_strip_color(temp_strip_scale(d.anomaly)); })
            .on("mouseover", function(d) { console.log(d.anomaly, d.date); }); */

        /* Avg Temp Month */
        var temp_svg = showAxises("#temps_div", "#avg_temp_line", width, xAxis, month_tempYAxis, "Avg. Temperature (F)");
        var temp_line = lineGenerator(xScale, month_temp_yScale, 'value');

        temp_svg.append("path")
            .attr("id", "temp_line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        d3.select("#temp_line").transition()
            .duration(1000)
            .ease("sin-in-out")
            .attr("d", temp_line(month_temp_filtered));

        var month_temp_strip_scale = stripScale(month_temp_filtered, 'anomaly');

        var tip_temp = d3.tip().attr('class', 'd3-tip').html(function(d) {
            return '<h4 class="text-center">' + stringDate(month) + '(' + d.year + ')</h4>' +
                '<p>Historical Avg: ' + monthAvg(avgs, 'temp', month) + ' degrees</p>' +
                '<p>Actual Avg: ' + d.value + ' degrees</p>' +
                '<p>Departure from Avg: ' + d.anomaly + ' degrees</p>';
        });

        drawStrip("#temps_div", tip_temp, temp_strip_color, month_temp_strip_scale, month_temp_filtered);

        /* Max Temp */
        var max_svg = showAxises("#max_div", "#max_temp", width, xAxis, month_maxYAxis, "Avg. Max. Temperature (F)");
        var max_line = lineGenerator(xScale, month_max_yScale, 'value');
        max_svg.append("path")
            .attr("id", "max_line")
            .attr("fill", "none")
            .attr("stroke", "firebrick")
            .attr("stroke-width", 2)
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        d3.select("#max_line").transition()
            .duration(1000)
            .ease("sin-in-out")
            .attr("d", max_line(month_max_filtered));

        /* Min Temp */
        var min_svg = showAxises("#min_div", "#min_temp", width, xAxis, month_minYAxis, "Avg. Min. Temperature (F)");
        var min_line = lineGenerator(xScale, month_min_yScale, 'value');
        min_svg.append("path")
            .attr("id", "min_line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        d3.select("#min_line").transition()
            .duration(1000)
            .ease("sin-in-out")
            .attr("d", min_line(month_min_filtered));

   /*     var vertical = d3.select("#temps_div")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "2px")
           // .style("height", 50)
            .style("top", "130px")
            .style("bottom", "195px")
            .style("left", "0px")
            .style("background", "white");

        var mousex;

        d3.select(".svg")
            .on("mousemove", function(){
                mousex = d3.mouse(this);
                mousex = mousex[0] + 5;
                vertical.style("left", mousex + "px" )})
            .on("mouseover", function(){
                mousex = d3.mouse(this);
                mousex = mousex[0] + 5;
                vertical.style("left", mousex + "px")}); */

        d3.selectAll('.row').classed('hide', false);
        d3.selectAll('#load').classed('hide', true);

        function overlay(svg_element) {
            svg_element.append("rect")
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height)
                .on("mouseover", function() { focus.style("display", null); })
                .on("mouseout", function() { focus.style("display", "none"); })
                .on("mousemove", mousemove)
                .attr("transform", "translate(" + margin.left+ "," + margin.top + ")");

            return svg_element;
        }

        function drawStrip(selector, tip, strip_color, strip_scale, data) {
            var strip = d3.select(selector).append("svg")
                .attr("width", width + margins.left + margins.right)
                .attr("height", 110)
                .attr("class", "svg")
                .call(tip);

            var add = strip.selectAll("bar")
                .data(data);

            add.enter().append("rect");

            add.attr("x", function(d) { return xScale(parse_date(d.date)); })
                .attr("width", bar_width)
                .attr("y", 0)
                .attr("height", 80)
                .attr("transform", "translate(" + margins.left + ",0)")
                .style("fill", function(d) { return strip_color(strip_scale(d.anomaly)); })
                .on('mouseover', function(d) {
                    d3.select(this).attr("height", 100);
                    tip.show.call(this, d);
                })
                .on('mouseout', function(d) {
                    d3.select(this).attr("height", 80);
                    tip.hide.call(this, d);
                });

            return add;
        }
    });
}, 200);


/**
 * Filter data
 * @param datas
 * @param value
 * @param value_two
 * @returns {Array|NodeFilter}
 */
function dataFilter(datas, type, month, avgs) {
    var updated = datas.filter(function(d) {
        if(!month) {
            return d.type === type;
        }
        return d.type === type && d.month === month;
    });

    if(month) {
        updated.forEach(function(d) {
            d.mean = monthAvg(avgs, type, month);
        });
    }

    return updated;
}

/**
 * Avg value for month
 * @param avgs
 * @param field
 * @param month
 * @returns {*}
 */
function monthAvg(avgs, field, month) {
    return avgs[field][parseInt(month,10) - 1].value
}

/**
 * Avg Values by Type
 * @param data
 * @returns {{drought: Array, max: Array, min: Array, precip: Array, temp: Array}}
 */
function avgValues(data) {
    var fields = ['drought', 'max', 'min', 'precip', 'temp'];
    var months = d3.range(1, 13);
    var avgs = {
        drought: [],
        max: [],
        min: [],
        precip: [],
        temp: []
    };
    var field_value, avg;

    fields.forEach(function(field) {
        months.forEach(function(month) {
            var month_format = (month < 10) ? '0' + month : '' + month;
            field_value = _.findWhere(data, { month: month_format, type: field });
            avg = field_value.value - field_value.anomaly;
            avgs[field].push({ key: month_format, value: avg });
        });
    });

    return avgs;
}

/**
 * Min & Max values
 * @param data
 * @param value
 * @returns {{min: (Array|string|Blob), max: (Array|string|Blob)}}
 */
function maxMin(data, value) {
    var sorted = _.sortBy(data, value);
    var min = sorted.slice(0, 5);
    var max = sorted.slice(-5);

    return { min: min, max: max };
}

/**
 * Bar width for barcode charts
 * @param width
 * @param data
 * @returns {number}
 */
function barWidth(width, data) {
    return _.floor((width / data.length), 3);
}

/**
 * Y scale for values charts
 * @param data
 * @param height
 * @returns {*}
 */
function yScale(data, height) {
    var y_scale =  d3.scale.linear().range([0, height]);

    return y_scale.domain([d3.max(data, function(d) { return d.value; }), 0])
}

/**
 * Y scale for anomaly charts
 * @param data
 * @param height
 * @returns {*}
 */
function yScaleAnomaly(data, height) {
    return d3.scale.linear()
        .domain(d3.extent(data, function(d) { return d.anomaly; }))
        .range([0, height]);
}

/**
 * Color codes for strip charts
 * @param values
 * @returns {*}
 */
function stripColors(values) {
    return d3.scale.quantize()
        .domain(d3.range(0, 1, 1.0 / (values.length - 1)))
        .range(values);
}

/**
 * Scales for strip charts
 * @param values
 * @param type
 * @returns {*}
 */
function stripScale(values, type) {
    return d3.scale.linear().domain(d3.extent(values, function(d) {
        return d[type];
    })).range([0,1]);
}

/**
 * Create axises
 * @param scale
 * @param orientation
 * @returns {*}
 */
function getAxis(scale, orientation) {
    return  d3.svg.axis()
        .scale(scale)
        .orient(orientation);
}

/**
 * Draw axises
 * @param selector
 * @param xAxis
 * @param yAxis
 * @param text
 * @returns {*}
 */
function showAxises(selector, svg_selector, width, xAxis, yAxis, text) {
    var svg = d3.select(selector).append('svg');

    svg.attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .attr("id", svg_selector)
        .attr("class", "svg")

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+ margins.left + "," + (height + margins.top) + ")")

    d3.selectAll(selector + " g.x").call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")

    d3.selectAll(selector + " g.y").call(yAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/3)
        .attr("y", 6)
        .attr("dy", "3.71em")
        .style("text-anchor", "end")
        .text(text);

    return svg;
}

/**
 * Create line path function
 * @param xScale
 * @param yScale
 * @param y
 * @returns {*}
 */
function lineGenerator(xScale, yScale, y) {
    return d3.svg.line()
        .interpolate("monotone")
        .x(function(d) { return xScale(parse_date(d.date)); })
        .y(function(d) { return yScale(d[y]); });
}

/**
 * Get month as word
 * @param month
 * @returns {*}
 */
function stringDate(month) {
    var month_names = ["January", "February", "March",
        "April", "May", "June",
        "July", "August", "September",
        "October", "November", "December"];

    var month_num = parseInt(month, 10) - 1;

    return month_names[month_num];
}

function createFocus(chart) {
    var focus = chart.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("class", "y0")
        .attr("r", 4.5);

    focus.append("line")
        .attr("x1")

    focus.append("text")
        .attr("class", "y0")
        .attr("x", 9)
        .attr("dy", ".35em");

    return focus;
}

render();

window.addEventListener("resize", render);