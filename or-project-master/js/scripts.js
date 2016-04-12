var reader; //GLOBAL File Reader object for demo purpose only
var dataSum = 0;
var dataSet = [];
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
    if(filePath.files && filePath.files[0]) {           
        reader.onload = function (e) {
            output = e.target.result;
            cleanOutput = output.replace(/\s+/g,"").replace(/\./g," ").replace(/\s+$/, ""); //remove unnecessary whitespace, period, and then remove space from end of string
            stringArray = cleanOutput.split(" ");
            stringArray.pop();
            //for 100% of data
            for(i = 0; i < stringArray.length; i++) { //loop through array, convert each element to an integer, then add to yVals
                x = parseInt(stringArray[i], 10); //convert each number
                dataSum += x;
                yVals[i] = x;
            }
            document.getElementById("full-data-graph").innerHTML = "";
            populateDataset(dataSum, yVals);
            scatterChart(dataSet, 100);
            //for 30% of data
            dataSum = 0; //reset data sum for new data
            dataSet.length = 0; //reset dataSet array for new data
            yVals.length = 0; //reset yVals array for new data
            limit = Math.floor(stringArray.length * .3); //set limit to 30% of values from file data
            for(i = 0; i < limit; i++) { //loop through array, convert each element to an integer, then add to yVals
                x = parseInt(stringArray[i], 10); //convert each number
                dataSum += x;
                yVals[i] = x;
            }
            document.getElementById("partial-data-graph").innerHTML = "";
            populateDataset(dataSum, yVals);
            scatterChart(dataSet, 30);
        };//end onload()
        reader.readAsText(filePath.files[0]);
    }//end if html5 filelist support
    else if(ActiveXObject && filePath) { //fallback to IE 6-8 support via ActiveX
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
    for(i = 0; i < array.length; i++) {
        xVal = array[i] / sum;
        dataSet[i] = [xVal, array[i]];
    }
    return true;
}
function scatterChart(dataset, percentage) {
    //Chart dimensions
            var width = 800;
            var height = 600;            var padding = 30;

            //Static test data
            // var dataset = [
            //                 [5, 20], [480, 90], [250, 50], [100, 33], [330, 95],
            //                 [410, 12], [475, 44], [25, 67], [85, 21], [220, 88],
            //                 [600, 150]
            // ];
    //Clear divs with data (if there's anything in them)
    //Create scales for the data (domain and range)
        var xScale = d3.scale.linear()
                             .domain([0, d3.max(dataset, function(d) { return d[0]; })]).nice() //get max value from dataset x-range
                             .range([padding, width- padding * 2]);

        var yScale = d3.scale.linear()
                             .domain([0, d3.max(dataset, function(d) { return d[1]; })]) //get max value from dataset y-range
                             .range([height - padding, padding]);

        var rScale = d3.scale.linear()
                             .domain([0, d3.max(dataset, function(d) { return d[1]; })])
                             .range([2, 5]);

        var formatAsPercentage = d3.format(".1%");

        //Define X axis
        var xAxis = d3.svg.axis()
                          .scale(xScale)
                          .orient("bottom")
                          .ticks(5)
                          .tickFormat(formatAsPercentage);

        //Define Y axis
        var yAxis = d3.svg.axis()
                          .scale(yScale)
                          .orient("left")
                          .ticks(5);
    //Create SVG element in HTML page
        if(percentage == 100 || percentage == 1) {
            var svg = d3.select("#full-data-graph")
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height);
        }
        if(percentage == 30 || percentage == .3) {
            var svg = d3.select("#partial-data-graph")
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height);
        }
            //Create points
            svg.selectAll("circle")
               .data(dataset)
               .enter()
               .append("circle")
               .attr("cx", function(d) {
                    return xScale(d[0]);
               })
               .attr("cy", function(d) {
                    return yScale(d[1]);
               })
               .attr("r", function(d){
                    return rScale(d[1]);
               });
            //Create X axis
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + (height - padding) + ")")
                .call(xAxis);
            
            //Create Y axis
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + padding + ",0)")
                .call(yAxis);
}