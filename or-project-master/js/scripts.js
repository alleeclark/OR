var reader; //GLOBAL File Reader object for demo purpose only
var dataSum = 0;
var dataSet = [];
var coordinates = [{}];
/**
    * Check for the various File API support.
 */
function checkFileAPI() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        reader = new FileReader();
        return true;
    } else {
        alert('The File APIs are not fully supported by your browser. Fallback required.');
        return false;
    }
}
/**
    * read text input and populate it into an array
*/
function readText(filePath) {
    var output = ""; //placeholder for text output
    var stringArray = new Array();
    var yVals = new Array();
    if (filePath.files && filePath.files[0]) {
        reader.onload = function (e) {
            output = e.target.result;
            cleanOutput = output.replace(/\s+/g, "").replace(/\./g, " ").replace(/\s+$/, ""); //remove unnecessary whitespace, period, and then remove space from end of string
            stringArray = cleanOutput.split(" ");
            stringArray.pop();
            //for 100% of data
            for (i = 0; i < stringArray.length; i++) { //loop through array, convert each element to an integer, then add to yVals
                x = parseInt(stringArray[i], 10); //convert each number
                dataSum += x;
                yVals[i] = x;
            }
            populateDataset(dataSum, yVals);
            if (document.getElementById('scatter').checked) {
                document.getElementById("full-data-graph").innerHTML = "";
                scatterChart(dataSet, 100);
            }
            //for 30% of data
            dataSum = 0; //reset data sum for new data
            dataSet.length = 0; //reset dataSet array for new data
            yVals.length = 0; //reset yVals array for new data
            limit = Math.floor(stringArray.length * .3); //set limit to 30% of values from file data
            for (i = 0; i < limit; i++) { //loop through array, convert each element to an integer, then add to yVals
                x = parseInt(stringArray[i], 10); //convert each number
                dataSum += x;
                yVals[i] = x;
            }
            populateDataset(dataSum, yVals);
            if (document.getElementById('scatter').checked) {
                document.getElementById("partial-data-graph").innerHTML = "";
                scatterChart(dataSet, 30);
            }
        };//end onload()
        reader.readAsText(filePath.files[0]);
    }//end if html5 filelist support
    else if (ActiveXObject && filePath) { //fallback to IE 6-8 support via ActiveX
        try {
            reader = new ActiveXObject("Scripting.FileSystemObject");
            var file = reader.OpenTextFile(filePath, 1); //ActiveX File Object
            output = file.ReadAll(); //text contents of file
            cleanOutput = output.replace(/\s+/g, '') //remove whitespace from string 
            console.log(cleanOutput);
            file.Close(); //close file "input stream"
            //displayContents(output);
        }
         catch (e) {
            if (e.number == -2146827859) {
                alert('Unable to access local files due to browser security settings. ' + 
                    'To overcome this, go to Tools->Internet Options->Security->Custom Level. ' + 
                    'Find the setting for "Initialize and script ActiveX controls not marked as safe" and change it to "Enable" or "Prompt"');
            }
        }
    }
    else { //this is where you could fallback to Java Applet, Flash or similar
        return false;
    }
    return true;
}
/**
    * display content using a basic HTML replacement
*/
function displayContents(txt) {
    var el = document.getElementById('main');
    el.innerHTML = txt; //display output in DOM
}
/**
    * Get X values for dataset (calculated by taking Y value and dividing it by total sum of all y values)
    * add X and Y values to new array, which will be used to create graphs
*/
function populateDataset(sum, array) {
    xArray = [];
    for (i = 0; i < array.length; i++) {
        xVal = array[i] / sum;
        xArray.push(xVal);
    }
    coordinates = [{
            xCoordinates: xArray,
            yCoordinates: array
        }];
    //console.log("coordinates object (y coordinates array): " + coordinates.yCoordinates);
    console.log(coordinates[0].xCoordinates);
    console.log(coordinates[0].yCoordinates);
}
function scatterChart(dataset, percentage) {
    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    //setup x  and y scales I've used linear here but there are other options
    // the scales translate data values to pixel values for you
    var x = d3.scale.linear()
              .domain([0, d3.max(coordinates[0].xCoordinates)])//the range of x values to plot
              .range([0, width]);   //the pixel range of the x axis
    var y = d3.scale.linear()
              .domain([0, d3.max(coordinates[0].yCoordinates)])//the range of y values to plot
              .range([height, 0]);
    
    //the chart object (placing the chart on the page)
    if (percentage == 100 || percentage == 1) {
        var scatterChart = d3.select('#full-data-graph')
        .append('svg:svg')//append svg to svg element in html
        .attr('width', width + margin.right + margin.left)//adjusts width to margins (given in margin Object above)
        .attr('height', height + margin.top + margin.bottom)//adjusts height to margins (given in margin Object above)
        .attr('class', 'chart')
    }
    //the chart object (placing the chart on the page)
    if (percentage == 30 || percentage == .3) {
        var scatterChart = d3.select('#full-data-graph')
        .append('svg:svg')//append svg to svg element in html
        .attr('width', width + margin.right + margin.left)//adjusts width to margins (given in margin Object above)
        .attr('height', height + margin.top + margin.bottom)//adjusts height to margins (given in margin Object above)
        .attr('class', 'chart')
    }
    // the main object where the chart and axis will be drawn
    var main = scatterChart.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'main')
    
    // draw the x axis
    var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');
    
    main.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'main axis date')
    .call(xAxis);
    
    // draw the y axis
    var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left');
    
    main.append('g')
    .attr('transform', 'translate(0,0)')
    .attr('class', 'main axis date')
    .call(yAxis);
    
    // draw the graph object
    var g = main.append("svg:g");
    
    g.selectAll("scatter-dots")
      .data(coordinates[0].yCoordinates)// using the values in the ydata array
      .enter().append("svg:circle")// create a new circle for each value
          .attr("cy", function (d) { return y(d); })// translate y value to a pixel
          .attr("cx", function (d, i) { return x(coordinates[0].xCoordinates[i]); })// translate x value
          .attr("r", 3)// radius of circle
          .style("opacity", 0.6); // opacity of circle
}
