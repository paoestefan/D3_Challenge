// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 200,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
//variable for the scatter chart
var chart=d3.select("#scatter").append("div").classed("chart",true);

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = chart.append("svg").attr("width", svgWidth).attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis= "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

//function used for updating y-scale var upon clicking on axis label
function yScale(censusData, chosenYAxis) {
  //create scales
  var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
          d3.max(censusData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition().duration(1000).call(bottomAxis);
  return xAxis;
}

//function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale,yAxis){
    var leftAxis=d3.axisLeft(newYScale);
    yAxis.transition().duration(1000).call(leftAxis);
    return yAxis;
}

// function used for updating circles group with a transition 
function renderCircles(circlesGroup, newXScale, chosenXAxis,newYScale,chosenYAxis) {
    
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

//function used for updating state labels with a transition to new
function renderText(textGroup,newXScale,chosenXAxis,newYScale,chosenYAxis){
    textGroup.transition()
    .duration(1000)
    .attr("x",d=>newXScale(d[chosenXAxis]))
    .attr("y",d=>newYScale(d[chosenYAxis]));

    return textGroup;
}

//function to change x-axis values for tooltips
function styleX(value,chosenXAxis){
    //stylize based on variable chosen
    //poverty percentage
    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
    //household income in dollars
    else if (chosenXAxis === 'income') {
        return `$${value}`;
    }
    //age (number)
    else {
        return `${value}`;
    }
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis,chosenYAxis, circlesGroup) {
 
  var xLabel;
  var yLabel;
//for X axis
  if (chosenXAxis === "poverty") {
    xLabel = "Poverty:";
  }
  else if (chosenXAxis === 'income') {
    xLabel = "Median Income:";
  }
  else {
    xLabel = "Age:";
  }
//for Y axis
  if (chosenYAxis === "healthcare") {
    yLabel = "No Healthcare:";
  }
  else if (chosenXAxis === 'obesity') {
    yLabel = "Obesity:";
  }
  else {
    yLabel = "Smokers:";
  }

// toolTip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) {
      return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis],chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  //Events
  circlesGroup.on("mouseover",toolTip.show).on("mouseout",toolTip.hide);

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(censusData, err) {
  
  //console.log(censusData);

  // parse data
  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.age = +data.age;
    data.obesity = +data.obesity;
    data.income= +data.income;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle",true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("opacity", ".5");

  //append initial text
  var textGroup=chartGroup.selectAll(".stateText")
    .data(censusData)
    .enter()
    .append("text")
    .classed("stateText",true)
    .attr("x",d=>xLinearScale(d[chosenXAxis]))
    .attr("y",d=>yLinearScale(d[chosenYAxis]))
    .attr("dy",3)
    .attr("font-size","10px")
    .text(function(d){return d.abbr});


  // Create group for three x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "Poverty") // value to grab for event listener
    .classed("active", true)
    .classed("aText",true)
    .text("Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText",true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText",true)
    .text("Household Income (Median)");

  // Create group for three y-axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0-margin.left/4},${(height/2)})`);

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0-20)
    .attr("transform","rotate(-90)")
    .attr("dy","1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .classed("aText",true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0 - 40)
    .attr("transform","rotate(-90)")
    .attr("dy","1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText",true)
    .text("Smokes (%)");

  var obesityLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 0-60)
    .attr("transform","rotate(-90)")
    .attr("dy","1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .classed("aText",true)
    .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value != chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)
        
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxesX(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,yLinearScale, chosenYAxis);

        //update text with new x values
        textGroup=renderText(textGroup,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);  
        }else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);  
        }
        else{
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);  
        }
      }
    });
  
  //y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click",function(){
      var value=d3.select(this).attr("value");

      if (value !=chosenYAxis){
          chosenYAxis=value;
          yLinearScale=yScale(censusData,chosenYAxis);
          yAxis=renderAxes(yLinearScale,yAxis);
          circlesGroup=renderCircles(circlesGroup,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);
          textGroup=renderText(textGroup,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);
          circlesGroup=updateToolTip(chosenXAxis,chosenYAxis,circlesGroup);

          if (chosenYAxis==="obesity"){
              obesityLabel.classed("active",true).classed("inactive",false);
              smokesLabel.classed("active",false).classed("inactive",true);
              healthcareLabel.classed("active",false).classed("inactive",true);
          }else if (chosenYAxis==="smokes"){
            obesityLabel.classed("active",false).classed("inactive",true);
            smokesLabel.classed("active",true).classed("inactive",false);
            healthcareLabel.classed("active",false).classed("inactive",true);
          }else{
            obesityLabel.classed("active",false).classed("inactive",true);
            smokesLabel.classed("active",false).classed("inactive",true);
            healthcareLabel.classed("active",true).classed("inactive",false);
          }
      }
  })  
}).catch(function(error) {
  console.log(error);
});