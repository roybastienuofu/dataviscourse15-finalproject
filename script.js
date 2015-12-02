
var progData,
    cityData,
    industryData,
    industryIDs,
    bubbleData,
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
function showIndustryTable(){
    var table = document.getElementById('industryTable');
    table.setAttribute("style", "display: inline-table;")
}

function hideIndustryTable(){
    var table = document.getElementById('industryTable');
    table.setAttribute("style", "display: none;")
}

function dropdownChanged(){
    var selectBox = document.getElementById('dropDown');
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;
    if (selectedValue == "Industry"){
        document.getElementById('textarea').value = "click an industry below";

        //showIndustryTable()
    }
    else{
        //hideIndustryTable();
    }

}

function submitSearch(){
    //console.log("button pressed");
    var text = document.getElementById('textarea').value;
    //console.log(text);

    var progReq = new XMLHttpRequest();
    progReq.addEventListener("load", progReqListener);
    var progurl = "http://api.glassdoor.com/api/api.htm?t.p=46048&t.k=h0bHsIwlmfs&userip=0.0.0.0&useragent=&format=json&v=1&action=jobs-prog&countryId=1&jobTitle=" + text;
    progReq.open("GET", progurl);
    progReq.send();

    var mapReq = new XMLHttpRequest();
    mapReq.addEventListener("load", mapReqListener);
    var mapurl = "http://api.glassdoor.com/api/api.htm?t.p=46048&t.k=h0bHsIwlmfs&userip=0.0.0.0&useragent=&format=json&v=1&action=jobs-stats&returnCities=true&admLevelRequested=1&jobTitle=" + text;
    mapReq.open("GET", mapurl);
    mapReq.send();

}

function industrySearch(id){
    id = id.replace(/\s/g, '');
    id = id.replace(/\//g, '');
    id = id.replace(/\(/g, '');
    id = id.replace(/\)/g, '');
    id = id.replace(/\-/g, '');
    id = industryIDs[id];
    //console.log(id);
    var industryReq = new XMLHttpRequest();
    industryReq.addEventListener("load", industryReqListener);
    var industryurl = "http://api.glassdoor.com/api/api.htm?t.p=46048&t.k=h0bHsIwlmfs&userip=0.0.0.0&useragent=&format=json&v=1&action=jobs-stats&returnJobTitles=true&returnCities=true&admLevelRequested=1&jc=" + id;
    industryReq.open("GET", industryurl);
    industryReq.send();
}

function industryReqListener(){
    industryData = JSON.parse(this.responseText);
    //console.log(industryData.response.cities);
    cityData = industryData;
    updateMap();
    //cityData = industryData.response.cities;
    //console.log(cityData);
    //updateMap();
}



function progReqListener () {
    progData = JSON.parse(this.responseText);
    //console.log(progData);
    if (progData.response.results.length == 0){
        alert("No data available, please make a different selection.");
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

function initializeBubbleData(){
    //for (var i = 1; i < 33; i++){
        //console.log(i);
        var bubbleReq = new XMLHttpRequest();
        bubbleReq.addEventListener("load", bubbleReqListener, throwAlert);
        var bubbleurl = "http://api.glassdoor.com/api/api.htm?t.p=46048&t.k=h0bHsIwlmfs&userip=0.0.0.0&useragent=&format=json&v=1&action=jobs-stats&returnJobTitles=true&returnStates=true&admLevelRequested=1&jc=" + 33;
        bubbleReq.open("GET", bubbleurl);
        bubbleReq.send();
    //}
}

function bubbleReqListener (){
    bubbleData = JSON.parse(this.responseText);
    var jobTitles = bubbleData.response.jobTitles;
    //console.log(jobTitles);
    var totalJobs = 0;
    for (var i = 0; i < jobTitles.length; i++){
        totalJobs += jobTitles[i].numJobs;
    }
    //console.log(totalJobs);
}

function initializeBarChart1() {
    var svgBounds = document.getElementById("barChart1").getBoundingClientRect(),
        xAxisWidth = 160,
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

function initializeBarChart2() {
    var svgBounds = document.getElementById("barChart2").getBoundingClientRect(),
        xAxisWidth = 160,
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

function updateBarChart1() {
    var svgBounds = document.getElementById("barChart1").getBoundingClientRect(),
        xAxisWidth = 160,
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

    bars.transition()
        .duration(3000)
        .attr('y', function (d) {
            return yScale(d.medianSalary);
        }).attr('fill', function (d) {
            return colorScale(d.medianSalary);
        })
        .attr('height', function (d) {
            return svgBounds.height - xAxisWidth - yScale(d.medianSalary);
        })
    ;
}

function updateBarChart2() {
    var svgBounds = document.getElementById("barChart2").getBoundingClientRect(),
        xAxisWidth = 160,
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

    bars.transition()
        .duration(3000)
        .attr('y', function (d) {
            return yScale(d.nationalJobCount);
        }).attr('fill', function (d) {
            return colorScale(d.nationalJobCount);
        })
        .attr('height', function (d) {
            return svgBounds.height - xAxisWidth - yScale(d.nationalJobCount);
        });
}

function updateMap() {

    var shortCityData = [];
    for(var i = 0; i < 16; i++){
        shortCityData[i] = cityData.response.cities[i];
    }
    //console.log(shortCityData[0]);
    var projection = d3.geo.albersUsa();
    var circles = d3.select('#points').selectAll('circle').data(d3.values(shortCityData));
    circles.enter().append('circle');
    circles.exit().remove();

    circles.attr('class', 'game')
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

    var j = shortCityData.length;
    circles.style('fill', function (d) {
        return colorScale(d.numJobs*20);
    });
    circles.attr('r', function (d) {
        j = j - 0.5;
        return j;
    });
    circles.on('click', function(d) {throwAlert(d.name)});
}

function drawStates(usStateData) {
    d3.select("#states")
        .datum(topojson.feature(usStateData, usStateData.objects.states))
        .attr("d", d3.geo.path());
}

function throwAlert(message){
    alert(message);
}

function initializeBubbleChart(){
    var diameter = 900,
        format = d3.format(",d"),
        color = d3.scale.category20c();

    var bubble = d3.layout.pack()
        .sort(null)
        .size([diameter, diameter])
        .padding(1.5);


    var svg = d3.select("#bubbleChart").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");

    d3.json("data/flare.json", function(error, root) {
        if (error) throw error;

        var node = svg.selectAll(".node")
            .data(bubble.nodes(classes(root))
                .filter(function(d) { return !d.children; }))
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        node.append("title")
            .text(function(d) {
                //console.log(d.r);
                return d.className + ": " + format(d.value); });

        node.append("circle")
            .attr("r", function(d) { return d.r; })
            .attr('fill', function (d) {
                //console.log(d.value);
                return colorScale(d.value);
            });
            //.style("fill", function(d) { return color(d.packageName); });

        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.className.substring(0, d.r / 3); });


        node.on("click", function(d) {
            var id = d.className;
            //throwAlert(id);
            industrySearch(id)
            });
    });

// Returns a flattened hierarchy containing all leaf nodes under the root.
    function classes(root) {
        var classes = [];

        function recurse(name, node) {
            if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
            else classes.push({packageName: name, className: node.name, value: node.size});
        }

        recurse(null, root);
        return {children: classes};
    }

    d3.select(self.frameElement).style("height", diameter + "px");
}



d3.json("data/cashierprog.json", function (error, progressionData) {
    if (error) throw error;
    progData = progressionData;
    initializeBarChart1();
    initializeBarChart2();
    //initializeBubbleData();
    initializeBubbleChart();
});

d3.json("data/cashiercities.json", function (error, citiesData) {
    if (error) throw error;
    cityData = citiesData;
});

d3.json("data/industryToID.json", function (error, industryIDdata) {
    if (error) throw error;
    industryIDs = industryIDdata;
});

d3.json("data/us.json", function (error, usStateData) {
    if (error) throw error;
    drawStates(usStateData);
    updateMap();
});
