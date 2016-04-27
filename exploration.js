$(function() {
	//import csv file
	d3.csv('data.csv', function(error, allData) {
		//initialize variables
		var xScale, yScale, currentData;
		var actualMinutes = ['0', '12'];
		var actualSeconds = ['0', '60'];
		var actualQuarters = ['1', '8'];
		var courtSizeWidth = 50; //actual court width (50ft)
		var courtSizeHeight = 94; //actual court height (94ft)
		var actualHeight = 752; //arbitary defined height of graphic
		var actualWidth = 800; //arbitary defined width of graphic

		//set margins for graphic
		var margin = {
			left:15,
			bottom:10,
			top:50,
			right:15
		};

		//calculate graphic height and width
		var height = actualHeight - margin.bottom - margin.top;
		var width = actualWidth - margin.left - margin.right;

		//set feet -> pixel scale
		//for this grahpic, since we have to draw a basketball court, we have to
		//assume the width and height are evenly scaled, which is why our feet ->
		//pixel scale can take just the width and assume its the same for height
		ftPxScale = d3.scale.linear().range([0, actualWidth]).domain([0, 50]);

		//Arbitrary numbers, but for this dataset, the width of the courts x coords range from -240 to 240
		var xMin = -240;
		var xMax = 240;
		//And Y coords range from -45, to 378. Sometimes min/max values aren't in data set, but
		//are needed for full basketball court dimensions
		var yMin = -45;
		var yMax = 378;

		var svg = d3.select('#chart')
			.append('svg')
			.attr('class', 'chartsvg')
			.attr('height', actualHeight)
			.attr('width', actualWidth);


		// helper to create an arc path
		// credit: https://github.com/virajsanghvi/d3.basketball-shot-chart 
		$.fn.appendArcPath = function (base, radius, startAngle, endAngle) {
			var points = 30;

			var angle = d3.scale.linear()
				.domain([0, points - 1])
				.range([startAngle, endAngle]);

			var line = d3.svg.line.radial()
				.interpolate("basis")
				.tension(0)
				.radius(radius)
				.angle(function(d, i) { return angle(i); });

			return base.append("path").datum(d3.range(points))
				.attr("d", line);
		};

    	// draw basketball court
    	// credit: https://github.com/virajsanghvi/d3.basketball-shot-chart 
    	// all the appends draw a certain part of the basketball court
    	$.fn.drawCourt = function () {
    		//define constants
			var courtWidth = ftPxScale(50),
				visibleCourtLength = actualHeight - margin.bottom,
				keyWidth = ftPxScale(16)
				threePointRadius = ftPxScale(23.75),
				threePointSideRadius = ftPxScale(22), 
				threePointCutoffLength = ftPxScale(14),
				freeThrowLineLength = ftPxScale(19),
				freeThrowCircleRadius = ftPxScale(6),
				basketProtrusionLength = ftPxScale(4),
				basketDiameter = ftPxScale(1.5),
				basketWidth = ftPxScale(6),
				restrictedCircleRadius = ftPxScale(4),   
				keyMarkWidth = ftPxScale(0.5);

			var base = svg
				.append('g')
				.attr('class', 'shot-chart-court');

			//draw paint area
			base.append("rect")
				.attr('class', 'shot-chart-court-key')
				.attr("x", (courtWidth / 2 - keyWidth / 2))
				.attr("y", (visibleCourtLength - freeThrowLineLength))
				.attr("width", keyWidth)
				.attr("height", freeThrowLineLength);

			base.append("line")
				.attr('class', 'shot-chart-court-baseline')
				.attr("x1", 0)
				.attr("y1", visibleCourtLength)
				.attr("x2", courtWidth)
				.attr("y2", visibleCourtLength);

			var tpAngle = Math.atan(threePointSideRadius / 
				(threePointCutoffLength - basketProtrusionLength - basketDiameter/2));

			$.fn.appendArcPath(base, threePointRadius, -1 * tpAngle, tpAngle)
				.attr('class', 'shot-chart-court-3pt-line')
				.attr("transform", "translate(" + (courtWidth / 2) + ", " + 
					(visibleCourtLength - basketProtrusionLength - basketDiameter / 2) + ")");

			[1, -1].forEach(function (n) {
				base.append("line")
					.attr('class', 'shot-chart-court-3pt-line')
					.attr("x1", courtWidth / 2 + threePointSideRadius * n)
					.attr("y1", visibleCourtLength - threePointCutoffLength)
					.attr("x2", courtWidth / 2 + threePointSideRadius * n)
					.attr("y2", visibleCourtLength);
			});

			$.fn.appendArcPath(base, restrictedCircleRadius, -1 * Math.PI/2, Math.PI/2)
				.attr('class', 'shot-chart-court-restricted-area')
				.attr("transform", "translate(" + (courtWidth / 2) + ", " + 
					(visibleCourtLength - basketProtrusionLength - basketDiameter / 2) + ")");

			$.fn.appendArcPath(base, freeThrowCircleRadius, -1 * Math.PI/2, Math.PI/2)
				.attr('class', 'shot-chart-court-ft-circle-top')
				.attr("transform", "translate(" + (courtWidth / 2) + ", " + 
					(visibleCourtLength - freeThrowLineLength) + ")");

			$.fn.appendArcPath(base, freeThrowCircleRadius, Math.PI/2, 1.5 * Math.PI)
				.attr('class', 'shot-chart-court-ft-circle-bottom')
				.attr("transform", "translate(" + (courtWidth / 2) + ", " + 
			(visibleCourtLength - freeThrowLineLength) + ")");

			[7, 8, 11, 14].forEach(function (mark) {
				[1, -1].forEach(function (n) {
					base.append("line")
						.attr('class', 'shot-chart-court-key-mark')
						.attr("x1", courtWidth / 2 + keyWidth / 2 * n + keyMarkWidth * n)
						.attr("y1", visibleCourtLength - mark)
						.attr("x2", courtWidth / 2 + keyWidth / 2 * n)
						.attr("y2", visibleCourtLength - mark)
				});
			});    

			base.append("line")
				.attr('class', 'shot-chart-court-backboard')
				.attr("x1", courtWidth / 2 - basketWidth / 2)
				.attr("y1", visibleCourtLength - basketProtrusionLength)
				.attr("x2", courtWidth / 2 + basketWidth / 2)
				.attr("y2", visibleCourtLength - basketProtrusionLength)

			base.append("circle")
				.attr('class', 'shot-chart-court-hoop')
				.attr("cx", courtWidth / 2)
				.attr("cy", visibleCourtLength - basketProtrusionLength - basketDiameter / 2)
				.attr("r", basketDiameter / 2)
		};
		//end draw court





		var g = svg.append('g')
			.attr('transform', 'translate(' +  margin.left + ',' + margin.top + ')')
			.attr('height', height)
			.attr('width', width);

		//define tooltips for points
		var tooltip = d3.select("body").append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);

		//set scales for x,y coords of dataset -> x,y coords on screen
		//since we predefine max and min vals for this dataset, we don't need to
		//pass the dataset into it to calculate the scale
		$.fn.setScales = function() {
			xScale = d3.scale.linear().range([0, width]).domain([xMin, xMax]);
			yScale = d3.scale.linear().range([height, 0]).domain([yMin, yMax]);
		};

		//Filter the data based on how many minutes, seconds, or quarters
		//Also, arbitary but I decided to filter on only playoffs to narrow
		//down dataset for expressiveness, and the shot_made_flag (ie if the
		//shot was made or missed) must be defined, or else we don't plot it
		$.fn.filterData = function(minutes, seconds, quarters) {
			currentData = allData.filter(function(d) {
				return +d.minutes_remaining >= +minutes[0] && +d.minutes_remaining < +minutes[1]
					&& +d.seconds_remaining > +seconds[0] && +d.seconds_remaining <= +seconds[1]
					&& +d.period >= +quarters[0] && +d.period < +quarters[1]
					&& d.playoffs == '1' && (d.shot_made_flag);
			});
		};

		//Draw function draws points on the scatter plot of all the data passed
		//into it. Plots shots made as green circles, and shots missed as red
		//circles. Also adds a nice transition for visual effect.
		$.fn.draw = function(data) {
			var circles = g.selectAll('circle').data(data);
			circles.enter().append('circle')
				.attr('cx', function(d){return xScale(d.loc_x)})
				.attr('cy', height)
				.attr('r', 2)
				.attr("data-legend",function(d) { 
					if (+d.shot_made_flag == 1) {
						return "Shot Made";
					} else {
						return "Shot Missed";
					}
				})
				.attr('title', function(d) {return d.shot_made_flag})
				.style("fill", function(d) {
					if (d.shot_made_flag == '0') {
						return "rgb(255,0,0)";
					} else {
						return "rgb(0,255,0)";
					}
				});

			circles.exit().remove();

			circles.transition()
				.duration(1000)
				.attr('cx', function(d){return xScale(d.loc_x)})
				.attr('cy', function(d){return yScale(d.loc_y)})
				.attr('r', 3);
		};

		//Initialize scales, and draw court, and plot points with default data parameters
		$.fn.setScales(allData);
		$.fn.drawCourt();
		$.fn.filterData(actualMinutes, actualSeconds, actualQuarters);
		$.fn.draw(currentData);

		//append legend to graph
		//credit: http://bl.ocks.org/ZJONSSON/3918369 for the legend
		var legend = svg.append('g')
			.attr("class","legend")
			.attr("transform","translate(50,30)")
			.style("font-size","12px")
			.call(d3.legend);

		$("circle").tooltip({
			'container': 'body',
			'placement': 'bottom'
		});







		//Set sliders
		//Credit: https://github.com/MasterMaps/d3-slider 
		var snapSlider = document.getElementById('range');

		//create slider for 'range' element, this particular one corresponds to
		//minutes remaining, hence 0-12 range (12 minutes in NBA quarter)
		noUiSlider.create(snapSlider, {
			start: [ 0, 12 ],
			step: 1,
			margin: 1,
			connect: true,
			direction: 'rtl',
			orientation: 'horizontal',
			behaviour: 'tap-drag',
			range: {
				'min': 0,
				'max': 12
			},
			pips: {
				mode: 'steps',
				density: 2
			}
		});

		//initialize array of elements of slider necessary to update values
		var snapValues = [
			document.getElementById('slider-snap-value-lower'),
			document.getElementById('slider-snap-value-upper')
		];

		//set on update of slider function, refilter data and redraw graph
		snapSlider.noUiSlider.on('update', function( values, handle ) {
			snapValues[handle].innerHTML = Math.round(values[handle]);
			actualMinutes = values;
			$.fn.filterData(actualMinutes, actualSeconds, actualQuarters);
			$.fn.draw(currentData);
			
		});

		//get second slider div
		var snapSlider2 = document.getElementById('range2');

		//create slider for 'range2' div. This particular slider pertains to seconds
		//remaining, hence the 0-60 range, 60 seconds in a minute.
		//This also has a nonlinear scale, hence 50% is 30 seconds, but
		//20% is 3 seconds, etc.
		noUiSlider.create(snapSlider2, {
			start: [ 0, 60 ],
			snap: true,
			connect: true,
			direction: 'rtl',
			orientation: 'horizontal',
			behaviour: 'tap-drag',
			range: {
				'min': 0,
				'10%': 1,
				'20%': 3,
				'30%': 5,
				'40%': 10,
				'50%': 30,
				'max': 60
			},
			pips: {
				mode: 'steps',
				density: 2
			}
		});

		//initialize array of elements of slider necessary to update values
		var snapValues2 = [
			document.getElementById('slider-snap-value-lower2'),
			document.getElementById('slider-snap-value-upper2')
		];

		//set on update of slider function, refilter data and redraw graph
		snapSlider2.noUiSlider.on('update', function( values, handle ) {
			snapValues2[handle].innerHTML = values[handle];
			actualSeconds = values;
			$.fn.filterData(actualMinutes, actualSeconds, actualQuarters);
			$.fn.draw(currentData);		
		});

		//get third slider div
		var snapSlider3 = document.getElementById('range3');

		//create slider for 'range3' element, this particular one corresponds to
		//quarters remaining. The range is from 1-6 (6 is exclusive) because Kobe
		//has never taken a shot in a double overtime playoff game according to this
		//dataset.
		noUiSlider.create(snapSlider3, {
			start: [ 1, 6],
			step: 1,
			margin: 1,
			connect: true,
			direction: 'rtl',
			orientation: 'horizontal',
			behaviour: 'tap-drag',
			range: {
				'min': 1,
				'max': 6
			},
			pips: {
				mode: 'steps',
				density: 2
			}
		});

		//initialize array of elements of slider necessary to update values
		var snapValues3 = [
			document.getElementById('slider-snap-value-lower3'),
			document.getElementById('slider-snap-value-upper3')
		];

		//set on update of slider function, refilter data and redraw graph
		snapSlider3.noUiSlider.on('update', function( values, handle ) {
			actualQuarters = values;
			snapValues3[handle].innerHTML = Math.round(values[handle]);
			if (snapValues3[handle].innerHTML == 6) {
				snapValues3[handle].innerHTML = '2OT';
			} else if (snapValues3[handle].innerHTML == 5) {
				snapValues3[handle].innerHTML = '1OT';
			}
			$.fn.filterData(actualMinutes, actualSeconds, actualQuarters);
			$.fn.draw(currentData);		
		});
		//end set sliders
	});
	//end csv.read
});