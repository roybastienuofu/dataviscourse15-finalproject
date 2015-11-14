
var progData,
    cityData,
    shortCityData,
    colorScale;



function checkEnter() {
    var key = window.event.keyCode;
    // If the user has pressed enter
    if (key == 13) {
        var text = document.getElementById('textarea').value;
        //document.getElementById('textarea').value = document.getElementById('textarea').value.replace(/(\r\n|\n|\r)/gm,"");
        submitSearch();
    }
}

function submitSearch(){
    //console.log("button pressed");
    var text = document.getElementById('textarea').value;
    //console.log(text);

    var progReq = new XMLHttpRequest();
    progReq.addEventListener("load", reqListener);
    var progurl = "http://api.glassdoor.com/api/api.htm?t.p=46048&t.k=h0bHsIwlmfs&userip=0.0.0.0&useragent=&format=json&v=1&action=jobs-prog&countryId=1&jobTitle=" + text;
    progReq.open("GET", progurl);
    progReq.send();

    var mapReq = new XMLHttpRequest();
    mapReq.addEventListener("load", mapReqListener);
    var mapurl = "http://api.glassdoor.com/api/api.htm?t.p=46048&t.k=h0bHsIwlmfs&userip=0.0.0.0&useragent=&format=json&v=1&action=jobs-stats&returnCities=true&admLevelRequested=1&jobTitle=" + text;
    mapReq.open("GET", mapurl);
    mapReq.send();

}
function reqListener () {
    progData = JSON.parse(this.responseText);
    //console.log(progData);
    if (progData.response.results.length == 0){
        alert("No data available, please select a different job title.");
        return;
    }
    updateBarChart1();
    updateBarChart2();
}
function mapReqListener () {
    cityData = JSON.parse(this.responseText);
    //console.log(cityData);
    if (progData.response.results.length == 0){
    //if (cityData.response.results.length == 0){
        return;
    }
    updateMap();
}

function updateBarChart1() {
    var svgBounds = document.getElementById("barChart1").getBoundingClientRect(),
        xAxisWidth = 150,
        yAxisHeight = 60;

    var xScale = d3.scale.ordinal()
        .domain(progData.response.results.map(function (d) {
            return d.nextJobTitle;
        })).rangeRoundBands([yAxisHeight, svgBounds.width], 0.1);

    var maxPay = d3.max(progData.response.results, function (d) {
        return parseInt(d.medianSalary);
    });

    var minPay = d3.min(progData.response.results, function (d) {
        return parseInt(d.medianSalary);
    });

    var yScale = d3.scale.linear()
        .domain([0, maxPay]).range([svgBounds.height - xAxisWidth, 0]);

    colorScale = d3.scale.linear()
        .domain([0, maxPay])
        .range(['#edf8e9', '#006d2c'])
        .interpolate(d3.interpolateLab);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("left");
    d3.select("#xAxis1")
        .attr("transform", "rotate(-90) translate(" + (xAxisWidth - svgBounds.height) + ",0)")
        .call(xAxis);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");
    d3.select("#yAxis1")
        .attr("transform", "translate(" + yAxisHeight + ",0)")
        .call(yAxis);

     //Create the bars
    var bars = d3.select("#bars1").selectAll("rect").data(progData.response.results);
    bars.enter().append('rect');
    bars.exit().remove();
    bars.attr('x', function (d) {
        return xScale(d.nextJobTitle);
    })
        .attr('width', function (d) {
            return xScale.rangeBand();
        })
        .attr('y', function (d) {
            return yScale(d.medianSalary);
        })
        .attr('height', function (d) {
            return svgBounds.height - xAxisWidth - yScale(d.medianSalary);
        })
        .attr('fill', function (d) {
            return colorScale(d.medianSalary);
        });
}

function updateBarChart2() {
    var svgBounds = document.getElementById("barChart2").getBoundingClientRect(),
        xAxisWidth = 150,
        yAxisHeight = 60;

    var xScale = d3.scale.ordinal()
        .domain(progData.response.results.map(function (d) {
            return d.nextJobTitle;
        })).rangeRoundBands([yAxisHeight, svgBounds.width], 0.1);

    var maxPay = d3.max(progData.response.results, function (d) {
        return parseInt(d.nationalJobCount);
    });

    var minPay = d3.min(progData.response.results, function (d) {
        return parseInt(d.nationalJobCount);
    });

    var yScale = d3.scale.linear()
        .domain([0, maxPay]).range([svgBounds.height - xAxisWidth, 0]);

    colorScale = d3.scale.linear()
        .domain([0, maxPay])
        .range(['#edf8e9', '#006d2c'])
        .interpolate(d3.interpolateLab);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("left");
    d3.select("#xAxis2")
        .attr("transform", "rotate(-90) translate(" + (xAxisWidth - svgBounds.height) + ",0)")
        .call(xAxis);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");
    d3.select("#yAxis2")
        .attr("transform", "translate(" + yAxisHeight + ",0)")
        .call(yAxis);

    var bars = d3.select("#bars2").selectAll("rect").data(progData.response.results);
    bars.enter().append('rect');
    bars.exit().remove();
    bars.attr('x', function (d) {
        return xScale(d.nextJobTitle);
    })
        .attr('width', function (d) {
            return xScale.rangeBand();
        })
        .attr('y', function (d) {
            return yScale(d.nationalJobCount);
        })
        .attr('height', function (d) {
            return svgBounds.height - xAxisWidth - yScale(d.nationalJobCount);
        })
        .attr('fill', function (d) {
            return colorScale(d.nationalJobCount);
        });
}


function updateMap() {

    shortCityData = [];
    for(var i = 0; i < 16; i++){
        shortCityData[i] = cityData.response.cities[i];
    }
    //console.log(shortCityData[0].name);

    var projection = d3.geo.albersUsa();
    var circles = d3.select('#points').selectAll('circle').data(d3.values(shortCityData));
    circles.enter().append('circle')
        .attr('class', 'game')
        .attr('r', 5)
        .attr('cx', function (d) {
            if (!d.longitude==0 && !d.latitude==0){
                return projection([d.longitude, d.latitude])[0];
            }
        }).attr('cy', function (d) {
            if (!d.longitude==0 && !d.latitude==0){
                return projection([d.longitude, d.latitude])[1];
            }
        });

    var i = shortCityData.length;
    //circles.style('fill', function (d) {
    //    return colorScale(i+10000);
    //})
    circles.attr('r', function (d) {
        i = i - 0.5;
        return i;
    });
}

function drawStates(usStateData) {
    d3.select("#states")
        .datum(topojson.feature(usStateData, usStateData.objects.states))
        .attr("d", d3.geo.path());
}



d3.json("data/cashierprog.json", function (error, progressionData) {
    if (error) throw error;
    progData = progressionData;
    updateBarChart1();
    updateBarChart2();
});

d3.json("data/cashiercities.json", function (error, citiesData) {
    if (error) throw error;
    cityData = citiesData;
    //console.log(cityData);
});

d3.json("data/us.json", function (error, usStateData) {
    if (error) throw error;
    drawStates(usStateData);
    updateMap();
});
