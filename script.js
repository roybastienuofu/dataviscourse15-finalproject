
var progData,
    cityData,
    industryData,
    industry1Data,
    industry2Data,
    industryIDs,
    bubbleData,
    nationalJobs,
    cityJobs,
    selectedCity,
    selectedIndustry,
    colorScale;

var selectedJob = "Cashier";


function checkEnter() {
    var key = window.event.keyCode;
    // If the user has pressed enter
    if (key == 13) {
        var text = document.getElementById('textarea').value;
        //console.log(text);
        document.getElementById('textarea').value = document.getElementById('textarea').value.replace(/r/g, '');
        submitSearch(text);
    }
}

function submitButtonPressed(){
    var text = document.getElementById('textarea').value;
    submitSearch(text);
}

function dropdownChanged(){
    var selectBox = document.getElementById('dropDown');
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;
    if (selectedValue == "Industry"){
        document.getElementById('textarea').value = "click an industry below";
    }
    else if (selectedValue == "City, State"){
        document.getElementById('textarea').value = "";
    }
    else if (selectedValue == "Job Progression"){
        document.getElementById('textarea').value = "";
    }
    else{

    }

}

function submitSearch(text){

    var selectBox = document.getElementById('dropDown');
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;
    console.log("submitSearch");
    if (selectedValue == "Job Progression"){
        selectedJob = text;
        progSearch(text);
    }
    else if (selectedValue == "City, State"){
        selectedCity = text;
        cityJobSearch(text);
    }
    else{

    }

}

function progSearch(text){

    //var text = document.getElementById('textarea').value;
    selectedJob = text.replace(/\b./g, function(m){ return m.toUpperCase(); });
    //console.log(selectedJob);
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
        alert("Sorry, please refresh our page.")
        //if (cityData.response.results.length == 0){
        return;
    }
    updateMap();
}

function industrySearch(id){
    //console.log("industrySearch");
    selectedIndustry = id;
    id = id.replace(/\s/g, '');
    id = id.replace(/\//g, '');
    id = id.replace(/\(/g, '');
    id = id.replace(/\)/g, '');
    id = id.replace(/\-/g, '');
    id = industryIDs[id];

    var industryReq = new XMLHttpRequest();
    industryReq.addEventListener("load", industryReqListener);
    var industryurl = "http://api.glassdoor.com/api/api.htm?t.p=46048&t.k=h0bHsIwlmfs&userip=0.0.0.0&useragent=&format=json&v=1&action=jobs-stats&returnJobTitles=true&returnCities=true&admLevelRequested=1&jc=" + id;
    industryReq.open("GET", industryurl);
    industryReq.send();
}

function industryReqListener(){
    industryData = JSON.parse(this.responseText);
    cityData = industryData;
    cityJobs = industryData;
    updateMapFromIndustry();
    updateBarChard1IndustryData();
    updateBarChart2NatJobData();
}

function natJobSearch(){
    var natJobReq = new XMLHttpRequest();
    natJobReq.addEventListener("load", natJobReqListener);
    var naturl = "http://api.glassdoor.com/api/api.htm?t.p=46048&t.k=h0bHsIwlmfs&userip=0.0.0.0&useragent=&format=json&v=1&action=jobs-stats&admLevelRequested=1&returnJobTitles=true";
    natJobReq.open("GET", naturl);
    natJobReq.send();
}

function natJobReqListener(){
    nationalJobs = JSON.parse(this.responseText);
    //console.log(nationalJobs);
    //updateBarChart2NatJobData();
}

function cityJobSearch(city){
    //console.log(city);
    selectedCity = city.replace(/\b./g, function(m){ return m.toUpperCase(); });
    var cityReq = new XMLHttpRequest();
    cityReq.addEventListener("load", cityReqListener);
    var cityurl = "http://api.glassdoor.com/api/api.htm?t.p=46048&t.k=h0bHsIwlmfs&userip=0.0.0.0&useragent=&format=json&v=1&action=jobs-stats&returnJobTitles=true&admLevelRequested=1&l=" + city;
    cityReq.open("GET", cityurl);
    cityReq.send();
}

function cityReqListener(){
    cityJobs = JSON.parse(this.responseText);
    //console.log(cityJobs);
    updateBarChart1CityJobData();
    updateBarChart2NatJobData();
}

function initializeIndusrty1Data(){
    for (var i = 1; i < 33; i++){
        console.log(i);
        var bubbleReq = new XMLHttpRequest();
        bubbleReq.addEventListener("load", industry1Listener);
        var bubbleurl = "http://api.glassdoor.com/api/api.htm?t.p=46048&t.k=h0bHsIwlmfs&userip=0.0.0.0&useragent=&format=json&v=1&action=jobs-stats&returnJobTitles=true&returnStates=true&admLevelRequested=1&jc=" + 33;
        bubbleReq.open("GET", bubbleurl);
        bubbleReq.send();
    }
}


function industry1Listener (){
    bubbleData = JSON.parse(this.responseText);
    var jobTitles = industry1Data.response.jobTitles;
    //console.log(jobTitles);
    var totalJobs = 0;
    for (var i = 0; i < jobTitles.length; i++){
        totalJobs += jobTitles[i].numJobs;
    }
    //console.log(totalJobs);
}

function initializeBarChart1() {
    //console.log("initializeBarChart1");
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
    })
    .on('click', function (d) {
        selectedJob = d.nextJobTitle;
        document.getElementById('textarea').value = selectedJob;
        var selectBox = document.getElementById('dropDown');
        selectBox.options[selectBox.selectedIndex].value = "Job Progression";
        submitSearch(selectedJob);
    });
}

function initializeBarChart2() {
    //console.log("initializeBarChart2");
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
    })
    .on('click', function (d) {
        selectedJob = d.nextJobTitle;
        document.getElementById('textarea').value = selectedJob;
        var selectBox = document.getElementById('dropDown');
        selectBox.options[selectBox.selectedIndex].value = "Job Progression";
        submitSearch(selectedJob);
    });
}

function updateBarChart1() {
    //console.log("updateBarChart1");
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
        });

    bars.transition()
        .duration(3000)
        .attr('y', function (d) {
            return yScale(d.medianSalary);
        }).attr('fill', function (d) {
            return colorScale(d.medianSalary);
        })
        .attr('height', function (d) {
            return svgBounds.height - xAxisWidth - yScale(d.medianSalary);
        });
    bars.on('click', function (d) {
        selectedJob = d.nextJobTitle;
        document.getElementById('textarea').value = selectedJob;
        var selectBox = document.getElementById('dropDown');
        selectBox.options[selectBox.selectedIndex].value = "Job Progression";
        submitSearch(selectedJob);
    });

    document.getElementById('bar1Header').innerHTML = selectedJob + " Job Progression Pay";
}

function updateBarChart2() {
    //console.log("updateBarChart2");
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
    bars.on('click', function (d) {
        selectedJob = d.nextJobTitle;
        document.getElementById('textarea').value = selectedJob;
        var selectBox = document.getElementById('dropDown');
        selectBox.options[selectBox.selectedIndex].value = "Job Progression";
        submitSearch(selectedJob);
    });

    document.getElementById('bar2Header').innerHTML = selectedJob + " Progression National Availabilities";
}

function updateBarChard1IndustryData() {
    //console.log("updateBarChard1IndustryData");
    var svgBounds = document.getElementById("barChart1").getBoundingClientRect(),
        xAxisWidth = 160,
        yAxisHeight = 60;

    var shortCityData = [];
    for(var i = 0; i < 16; i++){
        shortCityData[i] = cityJobs.response.jobTitles[i];
    }
    //console.log(shortCityData);
    var xScale = d3.scale.ordinal()
        //.domain(shortCityData.response.jobTitles.map(function (d) {
        .domain(shortCityData.map(function (d) {
            return d.jobTitle;
        })).rangeRoundBands([yAxisHeight, svgBounds.width], 0.1);

    var maxJobs = d3.max(shortCityData, function (d) {
        return parseInt(d.numJobs);
    });

    var minJobs = d3.min(shortCityData, function (d) {
        return parseInt(d.numJobs);
    });

    var yScale = d3.scale.linear()
        .domain([0, maxJobs]).range([svgBounds.height - xAxisWidth, 0]);

    colorScale = d3.scale.linear()
        .domain([0, maxJobs])
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

    var bars = d3.select("#bars1").selectAll("rect").data(shortCityData);
    bars.enter().append('rect');
    bars.exit().remove();
    bars.attr('x', function (d) {
        return xScale(d.jobTitle);
    })
        .attr('width', function (d) {
            return xScale.rangeBand();
        });

    bars.transition()
        .duration(3000)
        .attr('y', function (d) {
            return yScale(d.numJobs);
        }).attr('fill', function (d) {
            return colorScale(d.numJobs);
        })
        .attr('height', function (d) {
            return svgBounds.height - xAxisWidth - yScale(d.numJobs);
        });


    bars.on('click', function (d) {
        selectedJob = d.jobTitle;
        document.getElementById('textarea').value = selectedJob;
        var selectBox = document.getElementById('dropDown');
        selectBox.options[selectBox.selectedIndex].value = "Job Progression";
        submitSearch(selectedJob);
    });

    document.getElementById('bar1Header').innerHTML = selectedIndustry + " Job Availabilities";
}

function updateBarChart1CityJobData() {
    //console.log("updateBarChart1CityJobData");
    var svgBounds = document.getElementById("barChart1").getBoundingClientRect(),
        xAxisWidth = 160,
        yAxisHeight = 60;

    var shortCityData = [];
    for(var i = 0; i < 16; i++){
        shortCityData[i] = cityJobs.response.jobTitles[i];
    }
    //console.log(shortCityData);
    var xScale = d3.scale.ordinal()
        //.domain(shortCityData.response.jobTitles.map(function (d) {
        .domain(shortCityData.map(function (d) {
            return d.jobTitle;
        })).rangeRoundBands([yAxisHeight, svgBounds.width], 0.1);

    var maxJobs = d3.max(shortCityData, function (d) {
        return parseInt(d.numJobs);
    });

    var minJobs = d3.min(shortCityData, function (d) {
        return parseInt(d.numJobs);
    });

    var yScale = d3.scale.linear()
        .domain([0, maxJobs]).range([svgBounds.height - xAxisWidth, 0]);

    colorScale = d3.scale.linear()
        .domain([0, maxJobs])
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

    var bars = d3.select("#bars1").selectAll("rect").data(shortCityData);
    bars.enter().append('rect');
    bars.exit().remove();
    bars.attr('x', function (d) {
        return xScale(d.jobTitle);
    })
        .attr('width', function (d) {
            return xScale.rangeBand();
        });

    bars.transition()
        .duration(3000)
        .attr('y', function (d) {
            return yScale(d.numJobs);
        }).attr('fill', function (d) {
            return colorScale(d.numJobs);
        })
        .attr('height', function (d) {
            return svgBounds.height - xAxisWidth - yScale(d.numJobs);
        });


    bars.on('click', function (d) {
        selectedJob = d.jobTitle;
        document.getElementById('textarea').value = selectedJob;
        var selectBox = document.getElementById('dropDown');
        selectBox.options[selectBox.selectedIndex].value = "Job Progression";
        submitSearch(selectedJob);
    });

    document.getElementById('bar1Header').innerHTML = selectedCity + " Job Availabilities";
}

function updateBarChart2NatJobData() {
    //console.log("updateBarChart2NatJobData");
    var svgBounds = document.getElementById("barChart2").getBoundingClientRect(),
        xAxisWidth = 160,
        yAxisHeight = 60;

    var shortNatData = [];
    for(var i = 0; i < 16; i++){
        shortNatData[i] = nationalJobs.response.jobTitles[i];
    }

    var xScale = d3.scale.ordinal()
        .domain(shortNatData.map(function (d) {
            return d.jobTitle;
        })).rangeRoundBands([yAxisHeight, svgBounds.width], 0.1);

    var maxJobs = d3.max(shortNatData, function (d) {
        return parseInt(d.numJobs);
    });

    var minJobs = d3.min(shortNatData, function (d) {
        return parseInt(d.numJobs);
    });

    var yScale = d3.scale.linear()
        .domain([0, maxJobs]).range([svgBounds.height - xAxisWidth, 0]);

    colorScale = d3.scale.linear()
        .domain([0, maxJobs])
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

    var bars = d3.select("#bars2").selectAll("rect").data(shortNatData);
    bars.enter().append('rect');
    bars.exit().remove();
    bars.attr('x', function (d) {
        return xScale(d.jobTitle);
    })
        .attr('width', function (d) {
            return xScale.rangeBand();
        });

    bars.transition()
        .duration(3000)
        .attr('y', function (d) {
            return yScale(d.numJobs);
        }).attr('fill', function (d) {
            return colorScale(d.numJobs);
        })
        .attr('height', function (d) {
            return svgBounds.height - xAxisWidth - yScale(d.numJobs);
        });

    bars.on('click', function (d) {
        selectedJob = d.jobTitle;
        document.getElementById('textarea').value = selectedJob;
        var selectBox = document.getElementById('dropDown');
        selectBox.options[selectBox.selectedIndex].value = "Job Progression";
        submitSearch(selectedJob);
    });

    document.getElementById('bar2Header').innerHTML = "National Job Availabilities"
}

function updateMap() {
    //console.log("updateMap");

    var shortCityData = [];
    for(var i = 0; i < 16; i++){
        shortCityData[i] = cityData.response.cities[i];
    }

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

    circles.on('click', function(d) {
        //console.log("City Selected");
        selectedCity = d.name;
        document.getElementById('textarea').value = d.name;
        var selectBox = document.getElementById('dropDown');
        selectBox.options[selectBox.selectedIndex].value = "City, State";
        cityJobSearch(d.name);
        updateBarChart2NatJobData();
        });

    document.getElementById('mapHeader').innerHTML = selectedJob + " Job Map";
}

function updateMapFromIndustry() {
    //console.log("updateMapFromIndustry");
    var shortCityData = [];
    for(var i = 0; i < 16; i++){
        shortCityData[i] = cityData.response.cities[i];
    }

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
    circles.on('click', function(d) {
        selectedIndustry = d.name;
        document.getElementById('textarea').value = d.name;
        var selectBox = document.getElementById('dropDown');
        selectBox.options[selectBox.selectedIndex].value = "City, State";
        cityJobSearch(d.name);
        updateBarChart2NatJobData();
    });
    //document.getElementById('mapHeader').innerHTML = selectedJob + " Job Map";
}

function drawStates(usStateData) {
    d3.select("#states")
        .datum(topojson.feature(usStateData, usStateData.objects.states))
        .attr("d", d3.geo.path());
}

function initializeBubbleChart(){
    //console.log("initializeBubbleChart");
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
            //console.log("Industry Selected");
            selectedIndustry = d.className;
            document.getElementById('textarea').value = selectedIndustry;
            var selectBox = document.getElementById('dropDown');
            //console.log(selectBox.options[selectBox.selectedIndex].value);
            selectBox.options[selectBox.selectedIndex].value = "Industry";
            //console.log(selectBox.options[selectBox.selectedIndex].value);
            document.getElementById('mapHeader').innerHTML = d.className + " Job Map";
            industrySearch(d.className);

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
    initializeIndusrty1Data();
    //initializeInd2Data();
    initializeBubbleChart();
    natJobSearch();
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
