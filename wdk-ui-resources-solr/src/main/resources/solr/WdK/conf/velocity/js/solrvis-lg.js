

var main_jd = [];
var main_jd_smooth = [];



var secondlevel_jd = [];
var secondlevel_jd_totals = []

var totals = new Array();
var totalsPivot2 = new Array();

var totalsNumFound = 0;
var currentNumFound = 0;

var fieldTitles = {};


var fieldTitles_stats = {};

var fieldTitles_pivot_count_rel = {};
var fieldTitles_pivot_count  = {};

var overallmean_topics = {};
var overallmean_topics_totals = {};

var slg = { ABS : "_abs",
            COUNT_REL: "_count",
            STATS: "_topic",
            TOPIC_MEAN: "_tm"};

var mv = "-"; //sign for missingvalues


var solrjson_pivot_query;
var charttitle;
var chart;

var hiddenKeys =  [];

var show_smooth = false;
var smooth_steps = 2;


var x_time_values;

var percentformat =	d3.format('.2p');
var numberformat =  d3.format('r');
var numberp2 = d3.format('2r');
var yearformat = d3.time.format('%Y');
var y1Axis_tickformat = numberformat;


var sortYear = function(a, b){ return d3.ascending(a['fieldvalue'], b['fieldvalue']);};

var sortDesc = function(a, b, accessor){ return d3.descending(a[accessor], b[accessor]);};

var createFieldId = function(field, value){return (field + value).replace("/[\W\s]/g", "")};//remove special characters and spaces


var show_absolute = true;

var show_stats = false;
var show_groups = false;

var cs;


var maxNumberOfGroups = 100;



 var solrvis_lg_loadchart = function(chart_conf){

	if(typeof(chart_conf) !== undefined){
        console.log("\n\nchartconf:");
        console.log(chart_conf);
        cs = chart_conf;

        var open = localStorage['chartcontrols'];

        show_groups = 	( cs.groupfield &&  cs.groupfield !== "") ;
        show_stats =  ( cs.statsfield &&  cs.statsfield.length > 0) ;



        if((open  == 'open' || (open !== 'closed' &&  $('#chartcontrols').hasClass('open')))){
            if(typeof(solrjson_pivot_query) !== undefined){
                loadChart();
                initialize_settings();
            }
        }
	}else{
		console.log("chart_conf missing")
		return false;
	}



};


jQuery(document).on('solrvis_open_collapsible', function() {
	console.log('solrvis_show_collapsible');

	if(cs.currentselection_url && main_jd.length == 0 ){
		console.log("loading chart");
        initialize_settings();
        loadChart();

	}else if(cs.currentselection_url){
        console.log("flushing chart");
		chart.flush();
	}

});

var initialize_settings = function(){


    $("#PagesAbsBut").click(function(event){
        //event.preventDefault();
        switchCount(true);
        chart.flush();
    });
    $("#PagesRelBut").click(function(event){
        //event.preventDefault();
        switchCount(false);
        chart.flush();
    });

    $("#nosmooth").click(function(event){
        switchSmooth(false);
        chart.flush();
    });

    $("#smooth").click(function(event){
        switchSmooth(true);
        chart.flush();
    });
   //TODO: Add-ghost ghost: true
        $( "#chartresizable" ).resizable({
        	handles: "s",
        	maxHeight: 1500,
        	stop: function() {var size = { height: $('#chartresizable')[0].offsetHeight }
        					   chart.resize(size);
        	 //TODO: save chartheight to cookie // localvar
        	}
        });




    $( "#y1settings" ).buttonset();

    $( "#y2settings" ).buttonset();


    //read settings from client-side store (cookie)
    if(localStorage["showCounts"] == "relative" && (!typeof cs.norelativevalues !== 'undefined' && cs.norelativevalues != true)){
        setChartAbsolute(false);
    }else{
        setChartAbsolute(true);
    }

    if(localStorage["lines_view"]  == "smooth"){
        setChartSmooth(true);
    }else{
        setChartSmooth(false);
    }

};




function loadChart(){

    if(typeof cs === 'undefined'){console.error("Error: cs undefined. Aborting Chart-Creation"); return false;}
	if(typeof cs.currentselection_url === 'undefined' || cs.currentselection_url == ""){console.error("Error: cs.currentselection_url undefined"); return;}
	if(typeof current_query_url === 'undefined' || current_query_url == ""){console.error("Error: current_query_url undefined"); return;}

	//get totals for facet without other queryparameters applied
	console.log('get totals from: ' + cs.baseurl);

    //http://localhost:8983/solr/WdK.dev/browse?&indent=true&fq=ntokens%3A[50+TO+*]+AND+nsentences%3A[3+TO+*]+AND+NOT%28alphaCharsPerToken%3A[0+TO+1.71]+OR+alphabeticCharsRatio%3A[0+TO+0.71]%29&sort=topic_capitals_chapters_sentences_50_3+desc&fl=*%2Cscore&ct=topic_capitals_chapters_sentences_50_3&q=*&rows=0&wt=json&stats=true&facet.limit=0&f.text.facet.limit=0&facet.pivot={!stats%3Dp}goobi_PublicationYear&f.goobi_PublicationYear.facet.limit=10000&stats.field={!tag%3Dp+mean%3Dtrue+stddev%3Dtrue}topic_capitals_chapters_sentences_50_3&stats.field={!tag%3Dp+mean%3Dtrue+stddev%3Dtrue}topic_capitals_chapters_sentences_50_2&stats.field={!tag%3Dp+mean%3Dtrue+stddev%3Dtrue}topic_capitals_chapters_sentences_50_4

	jQuery.ajax({

		url: cs.baseurl,//solrjson_base_facet,
		dataType: 'json',//jsonp for online query
		json: 'json.wrf'
		}).done(function(dataTotal) {
			console.log('parsing totals of x documents: ');
			console.log(dataTotal.response.numFound);


			totals = dataTotal;

            totalsNumFound = dataTotal.response.numFound;

        /**
            if( cs.groupfield &&  cs.groupfield !== ""){
                secondlevel_jd_totals = parsePivotData(dataTotal, cs.groupfield, false, cs.statsfield);
            }
        **/

			totalsPivot2 = parsePivotData(dataTotal, cs.groupfield, cs.statsfield, false);
            console.log('data totals parsed, ' + dataTotal.length + " datapoints");

             overallmean_topics_totals = parseStatsFields(dataTotal, cs.statsfield) ;

            console.log('loading data from: ' + cs.currentselection_url);

			jQuery.ajax({
				url:  cs.currentselection_url,
				dataType: 'json',//jsonp for online query
				json: 'json.wrf'
				}).done(function(data) {
                     currentNumFound = data.response.numFound;

                    console.log('parsing data of current query x documents: ');

                    console.log(currentNumFound);
					//parse year based data (timefield)



					main_jd = parsePivotData(data, cs.timefield, cs.groupfield, cs.statsfield);



					if(typeof(main_jd) !== 'undefined' && main_jd !== false && main_jd.length > 0){

							console.log('data current parsed, ' + main_jd.length + " datapoints");


							main_jd = fillYears(main_jd);


				    		x_time_values = year_values(main_jd[0]['fieldvalue'], main_jd[main_jd.length-1]['fieldvalue']);

                            main_jd_smooth = smoothData(main_jd);


							if( cs.groupfield &&  cs.groupfield !== ""){
								secondlevel_jd = parsePivotData(data, cs.groupfield, false, cs.statsfield);
							}
                         overallmean_topics = parseStatsFields(data, cs.statsfield) ;

							drawChart();


					}else{
						console.error('no data parsed from');
                        console.error(data);
					}
				});
		});

}


function parseStatsFields(data, statsfields){
    var stats = {};
    $.each(statsfields, function(i, sf){
        if(data.stats.stats_fields[sf]) {
            var statstopicid = createFieldId(sf, slg.TOPIC_MEAN);
            stats[statstopicid] = data.stats.stats_fields[sf].mean;
        }
    });
    return stats;
}

function parsePivotData(data, pivot1, pivot2, statsfield){

    var jd = [];

    var subtopicscount = 0;
    var subgroupscount = 0;


	var pivotname = pivot1;
	if(pivot2){
		pivotname += "," + pivot2;
	}

	//console.log("data.facet_counts.facet_pivot["+pivotname+"]");
	//console.log(data.facet_counts.facet_pivot[pivotname]);

	//check if statsfield exists
	if( typeof(statsfield ==  'undefined' || typeof(data.stats) == 'undefined' || typeof(data.stats.stats_fields[statsfield]) == 'undefined') || statsfield.length < 1){
		statsfield == false;
	}
	var totalsforpivot = false;
	if(typeof(totals.facet_counts.facet_pivot[pivotname])=='object'){
		totalsforpivot = totals.facet_counts.facet_pivot[pivotname];
		//console.log("totalsforpivot");
		//console.log(totalsforpivot);
	}

	if(typeof(data.facet_counts.facet_pivot[pivotname]) !== undefined && Array.isArray(data.facet_counts.facet_pivot[pivotname])){
		$.each(data.facet_counts.facet_pivot[pivotname], function(parentIndex, parentData){
			var row = {};
			row.fieldvalue = parentData.value;
			row.count = parentData.count;
			row.field = parentData.field;
			row.fieldid = createFieldId(row.field, row.fieldvalue);

			var totalsforyear = false;
            //console.log("typeof("+row.fieldvalue +"): " + typeof(row.fieldvalue));
			if(totalsforpivot && row.fieldvalue){
                var fieldvalue_compare_string = row.fieldvalue.toString().toLowerCase().trim();
				var totalsforyear = $.grep(totalsforpivot, function(e){
                    if(typeof(e.value) == 'string'){
                        return e.value.toString().toLowerCase().trim() == fieldvalue_compare_string;
                    }else{
                        return e.value == row.fieldvalue;
                    }
                });
				totalsforyear = totalsforyear[0];
				//console.log(totalsforyear);
			}
			if( totalsforyear ){
				//console.log(parentData.field + ":" + row.fieldvalue + " = " + row.count);
				row.count_rel =   row.count / totalsforyear.count;
                row.totals_year = totalsforyear.count;
				//TODO: Stats für total-query abfragen! Abweichung angeben
			}else{
				//console.log("not in totals:" + row.fieldvalue);
               // console.log(typeof(row.fieldvalue));
                //console.log(totalsforpivot);
			}

			if(parentData.stats){

                //console.log(statsfield);
                $.each(statsfield, function(i, sf){
                    var statstopicid = createFieldId(sf, "") + slg.TOPIC_MEAN;
                    if(!(statstopicid in fieldTitles_stats)){
                        fieldTitles_stats[statstopicid] = topicnames[sf] ? topicnames[sf].name : sf ; //will not work for opther topicmodel
                    }

                    row[statstopicid] = parentData.stats.stats_fields[sf].mean;
                });


                row.totals_year = row.count;
				//row.mean_topic_stddev = parentData.stats.stats_fields[statsfieldname].stddev;
			}

			if(pivot2 && parentData.pivot){
				//console.log(parentData.pivot);
				$.each(parentData.pivot, function(pivotIndex, p) {
					var pivotid = createFieldId(p.field, p.value);
                    var pivottopicid = pivotid+slg.STATS;

					if(p.stats){
                        row[pivotid + slg.ABS] = p.count;//for tooltip
						if(!(pivottopicid in fieldTitles_stats)){
							fieldTitles_stats[pivottopicid] = (topicnames[statsfield[0]] ?  truncateString(topicnames[statsfield[0]].name,50) : statsfield[0])  + " in "+  p.value;
						}
						//var stddev = pivot.stats.stats_fields[statsfieldname].stddev;

						//IDEA: topic relative to corpus? Higher/lower?
						row[pivottopicid] = p.stats.stats_fields[statsfield[0]].mean;

					}else{
						if(p.count){
							var pivotcountid = pivotid + slg.COUNT_REL;
							if(!(pivotcountid in fieldTitles_pivot_count_rel)){
								fieldTitles_pivot_count_rel[pivotcountid] =  "% Treffer in " + p.value;
                                fieldTitles_pivot_count[pivotid + slg.ABS] =  "Treffer in " + p.value;
                                //subgroupscount++;
                            }

							if(totalsforyear && typeof(totalsforyear.pivot == 'object')){
								//console.log(totalsforyear.pivot);
								var totalsforyearpivot = $.grep(totalsforyear.pivot, function(e){ return (e.value == p.value && e.field == p.field); });
								//console.log(totalsforyearpivot);
								if(typeof(totalsforyearpivot[0]) !== 'undefined'){
									totalsforyearpivot = totalsforyearpivot[0];
									//console.log("row["+pivotcountid+"] = "+p.count+ " / " + totalsforyearpivot.count);
									row[pivotcountid] = p.count / totalsforyearpivot.count;
                                    row[pivotid + slg.ABS] = p.count;//for tooltip
								}
							}
						}
					}
				});
			}
			jd.push(row);

		});

            if(jd.length > 0){
		    		return jd;
		    }
	    }else{
	    	console.log("data.facet_counts.facet_pivot["+pivotname+ "] not set");
			return false;
	    }




}


function fillYears(array){

	var pivotsAvg = {};
	array.sort(sortYear);

	var firstyear = array[0]['fieldvalue'];
	var lastyear = array[array.length-1]['fieldvalue'];



	if(firstyear == null || firstyear == ""){
		firstyear = array[1]['fieldvalue'];
		array.shift();
	}

	var newarray = new Array();
	var arrayindex = 0;

	for ( var year = firstyear; year <= lastyear; year++) {
		if(array[arrayindex]['fieldvalue'] == year){
			//push arraydata
			newarray.push(array[arrayindex]);
			arrayindex++;
		}else{
			newarray.push({fieldvalue: year});
			//	newarray.push([year, null, null]);
		}
	}

	return newarray;
}

function smoothData(array){


	//keys to be smoothed
    var keys = [];
    if(show_stats){

        keys = d3.keys(fieldTitles_stats);
        //keys.unshift('mean_topic');
    }else if(show_groups){
        keys = d3.keys(fieldTitles_pivot_count_rel);
        keys = keys.concat(keys, d3.keys(fieldTitles_pivot_count)); //auch absolute werte smoothen
    }

	 //keys: pivot & mean_topic
     var n = array.length;
     var newarray = new Array();


    //deep copy array
     array = jQuery.extend(true, {}, array);
    //console.log("deep copied array with length " + n);
     for(var i = 0; i<n; i++){
		 newarray[i] = array[i];
		 //console.log("normal:");
		// console.log(newarray[i]);
		 if(i >= smooth_steps && i < n-smooth_steps){

			 for(var k = 0; k < keys.length; k++){
				 var values_window = new Array();

				 for(var j = (i-smooth_steps) ; j<=(i+smooth_steps); j++){
					 if(keys[k] in array[j]){
						 values_window.push(array[j][keys[k]]);
					 }
				 }
				 if(values_window.length > (smooth_steps)){
					 newarray[i][keys[k]] =  d3.mean(values_window);
				 }
		   }
		 }
		// console.log("smoothed:");
		//console.log(newarray[i]);
	 }

	 return newarray;
}





function parseFacetData(data){

	var parseDate = d3.time.format("%Y").parse;

	var totals = new Array();
	for(var i = 0; i<data.length; i=i+2){
				//console.log(data[i] + " " + data[i+1] );
				var parentIndex = data[i];
				var parentAsDate = parseDate(data[i] );
				var count = data[i+1];
				totals[parentIndex] = [parentAsDate, count]; //seiten in prozent: zwei values? Oder eigenes? Oder dynamisch?
	}
	return totals;

}

function drawChart(){
	console.log("drawing Chart");
    console.time("drawChart()");


//add count: "Seiten" - make temporal copy of array, keep original for new combinations
    fieldTitles = {};


    var keys = [];


    if(show_absolute){
        fieldTitles.count = "Treffer";
        keys.push('count');
        var addFieldTitlesCount = fieldTitles_pivot_count;

    }else{
        fieldTitles.count_rel = "% Treffer pro Jahr";
        var addFieldTitlesCount = fieldTitles_pivot_count_rel;
        keys.push('count_rel');
    }


    if(show_stats && !show_groups){
            fieldTitles = $.extend(fieldTitles, fieldTitles_stats );
        console.log("if(show_stats && !show_groups){ fieldTitles");

            keys = keys.concat(d3.keys(fieldTitles_stats));
    }
    if(show_groups){
            if(show_stats){
                fieldTitles = $.extend(fieldTitles, fieldTitles_stats);
            }else{
                fieldTitles = $.extend(fieldTitles, addFieldTitlesCount);
            }

            if(secondlevel_jd.length > 0) {
                var topkeys = getTopTitles(secondlevel_jd, maxNumberOfGroups);
                //wenn keine topkeys: alle
                keys = keys.concat( topkeys);

            }
    }


   // addGroupStatsToFieldTitles(fieldTitles);



c3chartsettings = {
	    bindto: '#chartcontainer',
	    size: {

	    	height: $('#chartcontainer')[0].offsetHeight,
	    },

	    data: {
	    	x: 'fieldvalue',
		    json: (show_smooth ?  main_jd_smooth : main_jd), //smooth ? keys: jd_smooth
		    keys:{
		    	x: 'fieldvalue',
		    	value: keys
		    },
		    types: {
			    	count: 'bar',
			    	count_rel: 'bar'
			    },
			axes: {
			      count: 'y2' ,
			      count_rel: 'y2'  ,

			    },
		    names: fieldTitles,

		   colors: {
               count: cs.pages_colour,
               count_rel: cs.pages_colour
           },
	    	onclick: openyear

	    },
	    bar: {
	    	  width: {
	    	    ratio: ( main_jd.length >= 100) ? 0.06 : 0.125 //ratio has to be set dpending on number of tickvalues - bug in c3.js-libary?
	    	  }
	    	},
	    axis: {
              x: {
                  show: true,
                  tick:{
                      values: x_time_values,
                      },

                },
            //linke achse: einzelnes Topic oder  Topics nach Gruppen (%) oder Gruppe relativ
                y: {
                        show: (show_stats),
                        tick:{
                                format:  percentformat
                            },
                        label: "Topic-Intensität",
                        min: 0,
                        padding: {
                            top: 0,
                            bottom: 0
                        }
                },

            //rechte-Achse: hintergrund -absolute oder relative werte für gesamttreffer, absolute werte fuer grupperey:
             y2: {
                    show: true,//do not show if rel_values
                    tick:{
                        format: show_absolute ? numberformat : percentformat
                        //fit: false
                    },
                    label: show_absolute ? "Treffer" : "% Treffer pro Jahr",
                    min: 0,
                     padding: {
                         top: 0,
                         bottom: 0
                     }
                }

         },
    legend:{
        show: false
    },zoom: {
        enabled: true
    },

    tooltip: {
        contents: solrvis_getTooltipContent
    }
}


		var field_count_keys = d3.keys(fieldTitles_pivot_count_rel);
		//console.log(field_count_keys);

        if(show_groups && ! show_stats){
            c3chartsettings.axis.y.show = false;
            if(show_absolute){
                   for (key in fieldTitles_pivot_count) {
                       c3chartsettings.data.axes[key] = 'y2';
                       c3chartsettings.data.types[key] = 'line';
                   }
             } else {
                   for (key in fieldTitles_pivot_count_rel) {
                       c3chartsettings.data.axes[key] = 'y2';
                       c3chartsettings.data.types[key] = 'line';
                   }
            }

        }


//smooth ueber jd_smooth

	console.log("c3chartsettings:");
	console.log(c3chartsettings);
	chart = c3.generate( c3chartsettings );

    function toggle(id) {
        chart.toggle(id);
    }
    console.timeEnd("drawChart()");

    createTabularLegend(chart, keys, fieldTitles);
}


function createTabularLegend(chart, keys, fieldTitles) {
    console.time("createTabularLegend");

    var class_legendItem = 'legend-item';
    var class_legendItemUnFocused = 'legendItemUnFocused';
    var class_legendItemTempFocused = 'legendItemTempFocused';
    var class_legendControls = 'legendControls';
    var class_legendData = 'legendData';
    var id_legendHeading = 'legendHeading';
    var id_legend = 'chartlegend';
    var id_legend_outer = 'chartlegendresizable';


    var legendContainerOuter = d3.select('#' + id_legend_outer);
    var legendContainer = d3.select('#' + id_legend);

    legendContainer.select("#" + id_legend +" ." + class_legendData).remove();
    legendContainer.select("#" + id_legend +" ." + class_legendControls).remove();
    legendContainer.select("#" + id_legendHeading).remove();
    legendContainer.select(".groups_uncalled").remove();




    var legendLengthDefault = 6;

    //hiddenkeys from reload
    var hiddenIds = [];
    if(hiddenKeys.length === 0){
        //hide all but 5 first entries by default


        if(keys.length > legendLengthDefault){
            // hiddenKeys = keys.slice(legendLengthDefault-1);
            addOrRemoveHiddenKeys(keys.slice(legendLengthDefault-1));
        }

    }

    //console.log("hiddenKeys");
    //console.log(hiddenKeys);


    var insertLegendField = function (id, el, title) {
        title = title ? title : fieldTitles[id];
        //console.log("insertLegendField for " + id);
        el = d3.select(el).attr('data-id', function (id) {
            return id;
        })
            .attr('class', class_legendItem);

        el.insert('span').style('background-color', chart.color(id))
            .attr('class', 'legendmarker');
        el.insert('span').attr('class', 'titletext').html(title);

        var hidden =  idIsHidden(id);
        //console.log(id + " is hidden? " + hidden);
        el.classed(class_legendItemUnFocused, hidden);
        //collect id-strings that need to be hidden, better performance with c3js
        if(hidden){
            hiddenIds.push(id);
        }

        el.on('mouseover', function (id) {

            chart.focus(id);
            el.classed(class_legendItemTempFocused, true);
        })
            .on('mouseout', function (id) {
                chart.revert();
                el.classed(class_legendItemTempFocused, false);
            })
            .on('click', function (id) {
                chart.toggle(id);
                el.classed(class_legendItemUnFocused, !el.classed(class_legendItemUnFocused));
                addOrRemoveHiddenKeys([id]);
                console.log("hiddenKeys");
                console.log(hiddenKeys);
            });

        return el;
    };


    //select all keys except count
    //console.log(keys);
    var keysData = keys.slice(1);

    if (keysData.length > 2){
        var legendControls = legendContainer.insert('div').attr('class', class_legendControls);
        //recreate topic_id by removing slg.STATS from key topicnames[sf]

        legendControls.insert('button').classed('pure-button button-small', true).text("Alle verstecken")
            .on('click', function () {
                d3.event.preventDefault();
                hideShowLegendFields(keysData, false);
            });
        legendControls.insert('button').classed('pure-button button-small', true).text("Alle anzeigen")
            .on('click', function () {
                d3.event.preventDefault();
                hideShowLegendFields(keys, true);
            });
    }

    legendContainer.data([keys[0]]).insert('h2', '#groupselector_box').attr("id",
        id_legendHeading).each(function (id) {
        insertLegendField(id, this,
            currentNumFound + " Seiten / "
            + percentformat(currentNumFound / totalsNumFound) + " des gesamten Korpus in diesem Zeitraum");
    });




    var legendTable = legendContainer.insert('table').attr('class', class_legendData);

    //TODO:insert as first heading-line
    var rowsData = legendTable.selectAll('tr')
        .data(keysData)
        .enter().append('tr').attr('data-id', function (id) {return id;});

    var thr = legendTable.append('thead').append('tr');
    //TODO: Recreate for each case: Topics, Groups, Topics in Groups
    // recreate topic_id by removing slg.STATS from key topicnames[sf]


    if (show_stats && !show_groups){

        thr.insert('th').text('Topic');
        thr.insert('th').html('&oslash;Topic-Intensit&auml;t');
        thr.insert('th').html('&oslash;Topic-Intensit&auml;t im gesamten Korpus/Zeitraum');

        rowsData.data(keysData).filter(function (id, i) {
            return overallmean_topics[id] ? true : false;
        }).each(function(id){
            var tr = d3.select(this);

            tr.append('th')
                .each(function (id) {
                    var id_tm = id.replace(slg.TOPIC_MEAN, "");
                    var title = fieldTitles[id];
                    insertLegendField(id, this, title);
                });
            tr.append('td').text(  percentformat(overallmean_topics[id]));
            tr.append('td').text( percentformat(overallmean_topics_totals[id]));
        });

    }else if(show_groups && !show_stats ){
        thr.insert('th').text('Wert');
        thr.insert('th').html('Treffer in Gruppe');
        thr.insert('th').html('Anteil Treffer in Gruppe');

        rowsData.data(keysData).each(function(id){
            var tr = d3.select(this);
            var fieldid = id.replace(slg.COUNT_REL, "").replace(slg.ABS, "");
            var fieldData = secondlevel_jd.find(function(e){
                return e.fieldid  == fieldid; });
            /**
             * var fieldDataTotals = secondlevel_jd_totals.find(function(e){
                return e.fieldid == fieldid; });
             console.log(fieldDataTotals);
             */

            if(fieldData){

                tr.append('th').each(function(i){
                    insertLegendField(id, this, fieldData.fieldvalue);
                });
                tr.insert('td').text(fieldData.count);

                tr.insert('td').text(percentformat(fieldData.count_rel));
                //tr.insert('td').text(percentformat(fieldData.count / totalsNumFound));

            }

        });


    }else if(show_groups && show_stats ){
        legendContainer.insert('div', '#groupselector_box').html(
             percentformat(overallmean_topics[cs.statsfield[0]+slg.TOPIC_MEAN])
           +"&oslash;Topic-Intensit&auml;t f&uuml;r Topic "
            +  truncateString(topicnames[cs.statsfield[0]].name, 50)
            + " in allen Treffern. "
            );

        thr.insert('th').text('Wert');
        thr.insert('th').html('&oslash;Topic-Intensit&auml;t' );
        thr.insert('th').html('Seiten in Gruppe');
        //thr.insert('th').html('Anzahl in Korpus');

        rowsData.data(keysData).each(function(id){
            var tr = d3.select(this);
            var fieldid = id.replace(slg.STATS, "");
            var fieldData = secondlevel_jd.find(function(e){
                return e.fieldid  == fieldid; });


            if(fieldData){
                //topicname?
                tr.append('th').each(function(i){
                    insertLegendField(id, this);
                });

                tr.insert('td').text(percentformat(fieldData[cs.statsfield[0]+slg.TOPIC_MEAN]));
                tr.insert('td').text( fieldData.count);
            }

        });

    }

    //console.log()
    if(secondlevel_jd.length > keysData.length){
        legendContainer.insert('p').classed('groups_uncalled', true).html( keysData.length + " gr&ouml;&szlig;te Gruppen nach Trefferzahl. " + (secondlevel_jd.length - keysData.length + " Gruppen ausgelassen zur Performanceverbesserung."))
    }

    //console.log("hiddenIds");
    //console.log(hiddenIds);
    chart.hide(hiddenIds);



    var hideShowLegendFields = function (changeKeys, show){
        d3.selectAll('#'+id_legend + ' .' + class_legendItem).filter(function(id) {
            return changeKeys.some(function(hid){

                console.log(hid +" ==? " + id);
                return id == hid || removeIdType(id) == hid || removeIdType(hid) == id  ;
            })})
            .classed(class_legendItemUnFocused,!show);
        if(show){
            chart.show(changeKeys);
            //persist: remove any keys that are present
            addOrRemoveHiddenKeys(changeKeys);

        }else{
            chart.hide(changeKeys);
            //persist: add those that are hidden
            hiddenKeys = [];
            addOrRemoveHiddenKeys(changeKeys);
        }




    };





    if(keys.length > 1){
        var chartlegendcontainer_size =  $("#chartlegendcontainer")[0].offsetHeight -10;
        var topicbox_size = $(".topicbox")[0].offsetHeight ;
        var max_chartlegend_size = (keys.length + 5) * 24;
        //var max_resize_height = topicbox_size> max_chartlegend_size ? topicbox_size:max_chartlegend_size;
        var max_start_size = (topicbox_size > chartlegendcontainer_size)? topicbox_size:chartlegendcontainer_size;

        $("#chartlegend").css({"max-height": max_start_size});

        $("#chartlegendcontainer")
                .resizable({
                    handles: 's',

                    //maxHeight: max_resize_height,

                    stop: function(event, ui) {
                        var size = ui.size.height -10;
                        if(size >= topicbox_size){
                            $("#chartlegend").css({"max-height": size});
                        }
                    }
                });

        //TODO:  datatable not working -  Sorting etc? does not work
        /**
        $('#'+id_legend + " ." + class_legendData).ready(function() {
            console.log('table.legendData.ready');
            $('#'+id_legend + " ." + class_legendData).tablesorter({});
        });**/
    }
    console.timeEnd("createTabularLegend");


}





function openyear(d){
	//console.log(d);
	var year = d.x;

	//verlinken auf untergruppe? Wenn id != 'count' oder 'mean_topic'
	if(current_query_url){
		var windowwidth = $(window).width();
		  var doc_url = current_query_url + '&fq='+cs.timefield+":"+year;
		  var doc_popups = window.open(doc_url, "docs", "width="+windowwidth*0.8+",height=800,left=100,top=100,scrollbars=1,status=1");
		  doc_popups.focus();
	}
}

function switchSmooth(smooth){

	setChartSmooth(smooth);
	localStorage["lines_view"] = (smooth ?  "smooth" : "nosmooth");
	drawChart();
}


function setChartSmooth(smooth){
	//console.log("set smooth: " + smooth);

	if(smooth){
		show_smooth = true;
		$("#smooth").prop('checked', true).button('refresh');
		$("#nosmooth").prop('checked', false).button('refresh');
	}else{
		show_smooth = false;
		$("#nosmooth").prop('checked', true).button('refresh');
		$("#smooth").prop('checked', false).button('refresh');
	}

}





function switchCount(absolute){
	setChartAbsolute(absolute);
	localStorage["showCounts"] = absolute ? "absolute" : "relative";
	drawChart();
}


function setChartAbsolute(absolute){
	//console.log("switchCount() absolute = " + absolute);
	if(absolute){
		show_absolute = true;
		$("#PagesAbsBut").prop('checked', true).button('refresh');
		$("#PagesRelBut").prop('checked', false).button('refresh');

	}else{

		show_absolute = false;
		$("#PagesAbsBut").prop('checked', false).button('refresh');
		$("#PagesRelBut").prop('checked', true).button('refresh');
	}

		//chart.y1Axis.tickFormat(y1Axis_tickformat);
}




function range(start, count) {
    if(Array.isArray(start) && start.length === 2 ){
    	count = start[1];
    	start = start[0];
    }else if(arguments.length == 1) {
        count = start;
        start = 0;
    }

    var foo = [];
    for (var i = 0; i < count; i++) {
        foo.push(start + i);
    }
    return foo;
}


function year_values(start, end){
	var step = (end-start > 90) ? 10 : 5;
	step =  (end-start < 15) ? 1 : step;
	var values = [];
	for (var year = start;   year <= end; year++) {
		if(year % step === 0){
			values.push(year);
		}
	}
	//if(values[values.length-1] !== end){
	//	values.push(end);
	//}
	//console.log("values " + values);
	return values;
}

function getTopTitles(secondlevel_jd, topno){
   // console.log("getTopTitles");
    //console.table(secondlevel_jd);

    var valuelabel = "count" ; //always sort groups by absolute count

    if(show_stats){
        //var valuelabel = "mean_topic";
        var valuetype = slg.STATS;
    }else{
        var valuetype = show_absolute ? slg.ABS : slg.COUNT_REL;
    }





    var topGroups = secondlevel_jd.sort(function(a, b){ return d3.descending(a[valuelabel], b[valuelabel]);});
    topGroups = topGroups.slice(0, topno).map(function(e){return e.fieldid + valuetype});

    //secondlevel_jd.forEach(function(e){console.log(e.fieldid + ": " + e.count_rel);});
    //console.log(secondlevel_jd);
    return topGroups;


}




var solrvis_getTooltipContent = function (d, defaultTitleFormat, defaultValueFormat, color) {

    var $$ = this, config = $$.config,
        titleFormat = defaultTitleFormat,
        nameFormat =  function (name) { return name; },
        valueFormat = defaultValueFormat,
        text, i, title, value, name, bgcolor;

    var jsonData = (show_smooth ?  main_jd_smooth : main_jd);

    var CLASS = {tooltipContainer: 'c3-tooltip-container',
        tooltip: 'c3-tooltip',
        tooltipName: 'c3-tooltip-name'};

       // console.log("\n\n\n d:");
       // console.log(d);

        d.sort(function(x, y){
            return sortDesc(x, y, 'value');
        });

        for (i = 0; i < d.length; i++) {
           //

            if (! (d[i] && (d[i].value || d[i].value === 0))) { continue; }

            var row = jsonData[d[i].index];
           // console.log("row for " );
           // console.log(d[i]);
           // console.log(row);

            var groupid= d[i].id;
            var group = groupid;
            var grouptype = "";

            $.each(slg, function(i,e){
                if(groupid.endsWith(e)){
                    group  = groupid.substr(0, groupid.length-e.length);
                    grouptype = e;
                }
            });

           // console.log ("groupid: " +groupid);
          //  console.log ("group: " +group);
           // console.log ("grouptype: " + grouptype);

            value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);
            var topicstats = d[i].id.endsWith(slg.STATS) || d[i].id.endsWith(slg.TOPIC_MEAN);

            if (! text) {
                title = titleFormat ? titleFormat(d[i].x) : d[i].x;
                text = "<table class='" + CLASS.tooltip + "'>" + "<tr><th colspan='2'>" + title + " (" + row.totals_year + " Seiten)";
                text += "</th></tr>";

                if(row.count && row.count_rel){
                    if(topicstats) {
                        var count = row.count;
                    }else if (show_absolute) {

                        var count =  row.count + " (" +  percentformat(row.count_rel) + ")";

                    }else{
                        var  count = percentformat(row.count_rel)  + " (" + row.count  + ")";

                    }

                    text += rowformat( "Treffer", count, CLASS.tooltipContainer, color('count'));
                }else if(row.count_rel){
                    count = percentformat(row.count_rel);
                    text += rowformat( "% Treffer pro Jahr", count, CLASS.tooltipContainer, color('count'));
                }
            }

            //count && count_rel immer firstline
            if ( d[i].id !== "count" &&  d[i].id !== "count_rel" ) {

                name = nameFormat(d[i].name, d[i].ratio, d[i].id, d[i].index);
                bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

                var abs_count = row[group + slg.ABS];
                if(show_smooth && abs_count ){
                    abs_count = abs_count.toFixed(2);
                }
                if(typeof(abs_count) == 'undefined'){
                    abs_count = mv;
                }


                if(grouptype === slg.TOPIC_MEAN){
                    text += rowformat( fieldTitles[d[i].id], value, CLASS.tooltipContainer, bgcolor);
                }else if(grouptype === slg.STATS){
                    text += rowformat( fieldTitles[d[i].id], value, CLASS.tooltipContainer, bgcolor);
                }else if(grouptype === slg.COUNT_REL){
                    text += rowformat( fieldTitles[d[i].id], value + " ("+ abs_count +")", CLASS.tooltipContainer, bgcolor);
                }else if(grouptype === slg.ABS){
                    var rel_count =  percentformat(row[group + slg.COUNT_REL]);
                    text += rowformat( fieldTitles[d[i].id], abs_count + " ("+ rel_count +")", CLASS.tooltipContainer, bgcolor);
                }else{
                    text += rowformat(  groupid + " (" + typeof(value) + " - Unbekanntes Format): " +fieldTitles[d[i].id], value, CLASS.tooltipContainer, bgcolor);

                }
            }

            //TODO: Lookup values for variance- &stats.field={!tag%3Dp+mean%3Dtrue+stddev%3Dtrue} in chart.vm
    }
    return text + "</table>";
};

function rowformat(name, value, css_class, bgcolor){
    var text = "\n<tr class='" + css_class + "'>";
    text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + "</td>";
    text += "<td class='value'>" + value + "</td>";
    text += "</tr>";
    return text;
}

function truncateString(str, length) {
    if(typeof(str) == "string" ){
        return str.length > length ? str.substring(0, length - 3) + '...' : str;
    }else{
        return "";
    }
}



function removeIdType(id){
    for (key in slg){
        id = id.replace(slg[key], "");
    }
    return id;
}


function addOrRemoveHiddenKeys(values){
    for(i=0; i<values.length; i++){
        var value = removeIdType(values[i]);
        addOrRemove(hiddenKeys, value);
    }
}

function idIsHidden(id){
    return hiddenKeys.indexOf(removeIdType(id)) >= 0;
}

function addOrRemove(array, value) {
    var index = array.indexOf(value);

    if (index === -1) {
        array.push(value);
    } else {
        array.splice(index, 1);
    }
}
