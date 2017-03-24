


function resetWaiting(){
    $('body').removeClass('waiting');
    //$("body").css("cursor", "default");
}
$(window).bind("pageshow", function() {
    resetWaiting();
});


$(document).ready(function() {


    $('a.sl').click(function(){
       $('body').addClass('waiting');
        //$("body").css("cursor", "progress");
    });


    $(document).tooltip({
        show: {effect: "fadeToggle", duration: 800},
        // position: { my: "left+15 top+15", at: "left bottom" },
        content: function () {
            var element = $(this);

            if (element.is("[title]")) {
                return element.attr("title");
            }
            if (element.is("img")) {
                return element.attr("alt");
            }
        }
    });

    //create function, which hides all but those saved in session
    //element uebergeben?
    $("h2.facet-field, .collapse-button").each(function () {

        var facetid = jQuery(this).attr('id');
        //console.log('hidecollapsed facet ' + facetid);
        var next = jQuery(this).next(".collapsible");
        var open = localStorage[facetid];
        if (open == 'open' || (open !== 'closed' && $(this).hasClass('open'))) {
            $(this).addClass('open').removeClass('closed');
            //console.log('leave facet open at start:' + facetid);
        } else {
            $(this).addClass('closed').removeClass('open');
            next.hide();
            //console.log('hide facet at start: ' + facetid);
        }
    });


    $("h2.facet-field").click(function () {
        //console.log('slide open/close');
        var next = jQuery(this).next(".collapsible");
        next.slideToggle(300);
        var facetid = $(this).attr('id');
        //wenn vorher nicht geöffnet, dann (class auslesen)
        var open = $(this).hasClass('open');
        if (open) {
            $(this).addClass('closed').removeClass('open');
            localStorage[facetid] = 'closed';
            //localStorage[facetid] = '';
            //console.log(facetid + ' marked closed in session');
        } else {
            $(this).addClass('open').removeClass('closed');
            localStorage[facetid] = 'open';

            //console.log(facetid + ' marked opened in session');

        }

    });



    $("h2.collapse-button").click(function () {
        //console.log('slide open/close');
        var next = jQuery(this).next(".collapsible");
        next.slideToggle(500, function () {
            var event = jQuery.Event("solrvis_open_collapsible");
            //$( "body" ).trigger( event );
            next.trigger(event);

        });
        var facetid = $(this).attr('id');
        //wenn vorher nicht geöffnet, dann (class auslesen)
        var open = $(this).hasClass('open');
        if (open) {
            $(this).addClass('closed').removeClass('open');
            localStorage[facetid] = 'closed';
            //localStorage[facetid] = '';
            //console.log(facetid + ' marked closed in session');
        } else {
            $(this).addClass('open').removeClass('closed');
            localStorage[facetid] = 'open';
        }

    });


    var relativecount = localStorage["resultcount"];
    var span = jQuery(this);



    if (relativecount !== 'relative') {
        setFacetsAbsolute();
    } else {
        setFacetsRelative();
    }


    $("#FacetsAbsBut").click(function () {
        setFacetsAbsolute();

    });

    $("#FacetsRelBut").click(function () {
        setFacetsRelative();
        resetWaiting();
    });








    $("#customyear").submit(function (event) {
        event.preventDefault();
        var url = $("#PublicationYearUrl").val() + "&fq={!tag%3D" + timefacetfield + "}" + timefacetfield + ":[" + $("#PublicationYearFrom").val() + "+TO+" + $("#PublicationYearTo").val() + "]";
        console.log(url);
        window.location.replace(url);

    });

    $(".filterbytopic").submit(function (event) {
        event.preventDefault();
        //prevent values <= 0

        var lower = ($(".filterbytopicpercent", this).val()) / 100;
        if (lower > 0) {
            var url = $(this).attr("action") + "&fq=" + $(".filterbytopictopic", this).val() + ":[" + lower + "+TO+*]";
            console.log(url);
            window.location.replace(url);
        } else {
            var myel = $('> span.info', this).length ? $('> span.info', this) : $('<span class="info">Bitte Schwellenwert gr&ouml;sser null eingeben.</span>').appendTo(this);

        }

    });

    $(".filterbytopicpercent").on("input", function () {
        var filterform = jQuery(this).parent();
        jQuery(".filterSubmit", filterform).css('display', 'inline');
        resetWaiting();
    });

    $(".filterbytopicpercent").click(function () {
        //console.log(jQuery(".info", $(this).parent()));
        jQuery(".info", $(this).parent()).remove();
        resetWaiting();
    });


    //$("#customyear").on('click','input[type=number]',function(){ this.select(); });

    $(".selecttable").click(function (event) {
        event.preventDefault();
        selectElementContents(document.getElementById('statsviewtable'));
        resetWaiting();
    });

    $("#sort_combobox").change(function (event) {
        //event.preventDefault();
        var $this = $(this);

        //desc entfernen
        var curr_topic_short = $this.val();
        console.log(curr_topic_short);

        if (curr_topic_short) {
            $('input[name="sort"]', this.form).val(curr_topic_short + " desc");
        }

        console.log(topicnames[curr_topic_short]);

        if (topicnames && topicnames[curr_topic_short]) {
            var originalvalue = $('input[name="hl.q"]', this.form).val();
            $('input[name="hl.q"]', this.form).val(topicnames[curr_topic_short].tokens + " " + originalvalue);
        }

        this.form.submit();
    });

    $(".results_per_page input[name=rows]").change(function (event) {
        //event.preventDefault();
        var $this = $(this);
        this.form.submit();
    });

    $(".results_per_page input[name=start_number]").change(function (event) {
        //event.preventDefault();
        var $this = $(this);
        var start = parseInt($this.val());

        if (start) {
            // console.log("start " + $this.val() -1);
            $('input[name="start"]', this.form).val(($this.val() - 1) > 0 ? ($this.val() - 1) : 0);
        }
        this.form.submit();
    });


    $("#query-form").submit(function (event) {
        event.preventDefault();
        //var $this = $(this);

        //combine query and hlquery (from topic)
        var hlq = $('input[name="topic_highlightquery"]', this).val();
        var q = $('input[name="q"]', this).val();
        console.log("hlq: " + hlq + " q:" + q);

        if (q || hlq) {
            $('input[name="hl.q"]', this.form).val(q ? q + " " + hlq : q);
        }
        this.submit();
    });

    $('#statsdialogue_categories form').submit(function (event) {
        event.preventDefault();
        var $this = $(this);

        $('.stats_categories_params', $this).remove(); //remove all temporal inputs added to the form in previous calls to this function
        var facet_pivot_1 = $('select[name="facet_pivot_1"]', $this).val();
        var facet_pivot_2 = $('select[name="facet_pivot_2"]', $this).val();

        var range_pivot_facet_1 = false;

        console.log("facet_pivot_1: " + facet_pivot_1 + " facet_pivot_2:" + facet_pivot_2);

        if (stats_categories_form_config != undefined) {
            //add facet.field for facets not usually active
            [facet_pivot_1, facet_pivot_2].forEach(function (pivotfacet) {
                if (stats_categories_form_config.add_facet_fields.indexOf(pivotfacet) !== -1) {
                    console.log("We have to add " + pivotfacet + "as a facet.field");
                    var facetfield_input = "<input type='hidden' class='stats_categories_params' name='facet.field' value='" + pivotfacet + "'>";

                    //console.log(rangetag_input)
                    $this.append(facetfield_input);
                }
            });
            if (typeof(stats_categories_form_config.range_facets) !== "undefined"
                && typeof(stats_categories_form_config.range_facets[facet_pivot_1]) !== "undefined") {
                range_pivot_facet_1 = true;
                console.log("range facet " + facet_pivot_1 + " defined as facet_pivot_1:" + stats_categories_form_config.range_facets[facet_pivot_1]);
                facet_pivot_1 = stats_categories_form_config.range_facets[facet_pivot_1]
            }
        }


        if (facet_pivot_1 && facet_pivot_2) {

            if (!range_pivot_facet_1) {
                var facet_pivot_both = facet_pivot_1 + "," + facet_pivot_2;
                $('input[name="facet.pivot"]', $this).val(facet_pivot_both);
                console.log("setting facet.pivot=" + facet_pivot_both);
            } else {
                $('input[name="facet.pivot"]', $this).val("{!range=r1}" + facet_pivot_2);
                var rangetag_input = "<input type='hidden' class='stats_categories_params'  name='facet.range' value='{!tag=r1}" + facet_pivot_1 + "'>";
                //console.log(rangetag_input)
                $this.append(rangetag_input);
                console.log("setting facet.pivot=" + "{!range=r1}" + facet_pivot_2);
                console.log("setting facet.range=" + '{!tag=r1}' + facet_pivot_1);
            }
            this.submit();
        }


    });


    //Functionality for topicselector

    //verschieben in popup-code
    $('#topic_selector').ready(updateselected);

    $('#quicklookupbox').keyup(function () {
        var valThis = $(this).val().toLowerCase();

        $('.topic_selector_tm').each(function () {
            var countField = $(".topiccount", this);
            var count = 0;
            $('tbody tr', this).each(function () {
                var text = $(".topic_label", this).text().toLowerCase();
                if (text.indexOf(valThis) >= 0) {
                    $(this).show();
                    count++;
                } else {
                    $(this).hide();
                }
            });
            countField.text(count);
        });


    });


    var ls_topicmodel_id = "ls_topicmodel_id";
    var allPanels = $('#topic_selector h2').next().hide();



    if (typeof(localStorage[ls_topicmodel_id]) != "undefined") {
        var currentTM = localStorage[ls_topicmodel_id];
        $('#' + currentTM).next().show();
        $('#' + currentTM).addClass("active");
    } else {
        $('#topic_selector .topic_selector_title').next().show();
        $('#topic_selector .topic_selector_title').addClass("active");
    }


    $('#topic_selector h2').click(function () {

        var thisid = $(this).attr('id');
        console.log("clicked on: " + thisid);
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
            localStorage.removeItem(ls_topicmodel_id);
            $(this).next().hide();

        } else {
            allPanels.next().hide();
            allPanels.removeClass("active");
            $(this).next().show();
            $(this).addClass("active");
            localStorage[ls_topicmodel_id] = thisid;

        }

        return false;
    });

    //show selected topics in topicselector
    $('#topic_selector .tcb').change(updateselected);

    $("#topic_selector_form input.uncheck").click(function (event) {
        unselectCheckboxes("#topic_selector_form");
        updateselected();

    });

    function unselectCheckboxes(context) {
        console.log("unselectCheckboxes", context);
        $('input:checkbox', context).prop('checked', false);

    }


    function updateselected() {
        $('#topic_selector  .selected_topics').empty();
        var countAllSelected = 0;

        $('#topic_selector .topic_selector_tm').each(function () {
            var countField = $(".topiccount_selected", this);
            var countSelected = 0;
            var topicModelTitle = $('.tm_title', this).text();

            $('tr', this).each(function () {

                var tr = $(this);
                if ($('input.tcb:checked', tr).length > 0) {
                    //console.log("checked", tr);

                    var topic_label = $('label', tr).text();
                    var topic_id = $('input:checkbox', tr)[0].id;
                    countSelected++;
                    tr.addClass("checked");

                   // console.log("topic_id", topic_id);
                    $('#topic_selector .selected_topics').append('<p>'
                        + '<input type="checkbox" checked="checked" data-value="'+ topic_id
                        +'" id="' + topic_id + '_selection"/>'
                        + ' <label for="' + topic_id + '_selection">'
                        + topicModelTitle + ': '
                        + topic_label + '</label>'
                        + '</p>');
                } else {
                    tr.removeClass("checked");
                }
            });
            countAllSelected += countSelected;
            countField.text(countSelected > 0 ? countSelected : "");
        });
        if (countAllSelected > 0) {
            $("#topic_selector input.uncheck").show();
        } else {

            $("#topic_selector input.uncheck").hide();
        }
    };

    $('#topic_selector .selected_topics').on('change', 'input:checkbox', function(e){
           // console.log("#topic_selector .selected_topics" );
        var topic_id = $(this).attr("data-value");
        $('#'+topic_id).prop( "checked", false );
        updateselected();

    });
    //var dialog, form, submitTopicSelector;


    var topic_selector_dialog, topic_selector_form;

    topic_selector_dialog = $("#topic_selector").dialog(
        {
            autoOpen: false,
            height: "auto",
            width: "auto",
            closeText: "Abbrechen",
            modal: true,
            resizable: false,
            draggable: false,
            position: {my: "center top", at: "center top", of: '#content'},
            close: function () {
                $("#topic_selector_form")[0].reset();
                $('#topic_selector  .selected_topics').empty();
            },
            open: function () {
                updateselected();
                initialize_sort_topic_tables();
            },
        });
    $("#topic_selector_button").click(function (e) {
        e.preventDefault();
        topic_selector_dialog.dialog("open");

    });

    $("#topic_selector .topic-cancel").click(function () {
        topic_selector_dialog.dialog("close");
    });

    function initialize_sort_topic_tables(){

        $('#topic_selector .topic_selector_table').tablesorter({
            cssAsc: 'up',
            cssDesc: 'down',
            sortList: [[2,1]]
        });
    }




});
function decodeEntities(encodedString) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
}

/**
$(document).ready(function() {

   // create method calls with link and topicnumber? create links with data-file, data-nr attributes?
  //  var linkToFile = "/solr/WdK.dev/admin/file?file=/velocity/data/topic_capitals_chapters_sentences_50_.topics&contentType=csv/text";
   // showTopicWordle(linkToFile,0);

});**/
function showTopicWordle(tmfile, topicnumber){
    var div = d3.select('#chartbox').insert('div').attr('class', "topicwords");
    d3.text(tmfile, function(text) {

        var data = d3.csv.parseRows(text);
        //stop at certain weight, use while
        for(var i = 0; i<data[topicnumber].length && i < 50; i=i+2){
            div.insert('span')
                .html(data[topicnumber][i]
                    + ":"
                    + percentformat(data[topicnumber][i+1]))
                .attr('style', 'font-size:'+ percentformat(data[topicnumber][i+1] * 100));

        }
    });
}


function selectElementContents(el) {
    var body = document.body, range, sel;
    if (document.createRange && window.getSelection) {
        range = document.createRange();
        sel = window.getSelection();
        sel.removeAllRanges();
        try {
            range.selectNodeContents(el);
            sel.addRange(range);
        } catch (e) {
            range.selectNode(el);
            sel.addRange(range);
        }
    } else if (body.createTextRange) {
        range = body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}

//prepare table
$("#statsviewtable").ready(function() {

    $("#statsviewtable").tablesorter({
        // pass the headers argument and assing a object
    	 //sortList: [[2,1]],
        cssInfoBlock : "avoid-sort",
        theme : 'blue',
	    cancelSelection:false,
	    sortInitialOrder:"desc",
	    sortRestart : true,
	    widgets: [ 'stickyHeaders', ],
        widgetOptions:{
            /*
            // columnSelector_container : $('#columnSelector'),
            // column status, true = display, false = hide
            // disable = do not display on list
            columnSelector_name : "title",
                /* set to disabled; not allowed to unselect it
            // remember selected columns (requires $.tablesorter.storage)
            columnSelector_saveColumns: false,
            columnSelector_mediaquery: false*/
        }

    });
    $('.statssortreset').click(function(){
        $('#statsviewtable').trigger('sortReset');
        console.log( '#statsviewtable' );
        $('#statsviewtable').trigger('refreshColumnSelector', [ [3] ]);
        return false;
      });
    //http://mottie.github.io/tablesorter/docs/#Configuration
    heatmap('#statsviewtable tbody td.values1', [145, 176, 255] )
    heatmap('#statsviewtable tbody td.rowtotal', [145, 145, 145] )
    heatmap('#statsviewtable tbody td.compare_query', [0, 255, 0], [255,0,0], 0 )

    //create heatmap method with given start/end value? Oder zwei Durchgänge? Oder Legende?
    $("#statsviewtable").on('columnUpdate', function(data) {
        console.log(this);
        console.log(  data );

    });


});



function parseDirtyFloat(text) {
    return parseFloat(text.replace(",", ".").replace("%", "").replace("*", ""));
}


function arrayMin(arr) {
    return arr.reduce(function (p, v) {
        return ( p < v ? p : v );
    });
}

function arrayMax(arr) {
    return arr.reduce(function (p, v) {
        return ( p > v ? p : v );
    });
}

function heatmap(elementselector, startcolour, othercolour, center){

    // Get all data values from our table cells making sure to ignore the first column of text
    // Use the parseInt function to convert the text string to a number

    var counts= $(elementselector).map(function() {
        return parseDirtyFloat($(this).text());
    }).get();

    if(! counts.length > 0) {
        return;
    }
    // run max value function and store in variable
    var max = arrayMax(counts);
    //console.log("max: " + max );
    var min = arrayMin(counts);
   // console.log("min: " + min );

    if(typeof othercolour === "undefined" || typeof center === "undefined") {
        twopoles = false;
    }else{
        var twopoles = true;


        normal_center = (center-min) / (max-min);
        //console.log("normal_center: " + normal_center );

    }



    //console.log(max);
    n = 256; // Declare the number of groups

    // Define the ending colour, which is white
    xr = 255; // Red value
    xg = 255; // Green value
    xb = 255; // Blue value

    var normal_spread = max-min;

    $(elementselector).each(function(){
            var val = parseDirtyFloat($(this).text());
            var normal_value = (val-min) / normal_spread;

            //console.log("\n\nvalue: " + val + " normal_value: " + normal_value);
            var  colour = startcolour;
           // console.log("\n\nvalue: " + val + " normal_value: " + normal_value );

            if(twopoles){
                if(normal_value <= normal_center){
                    normal_value = normal_center-normal_value;
                    //console.log("normal_value: " + normal_value + " normalized distance from center: " + normal_value );
                    colour = othercolour;
                }else{
                    normal_value =  normal_value - normal_center;
                }
            }


            var pos =  parseInt((Math.round(normal_value * 100)).toFixed(0));
            var red = parseInt((xr + (( pos * (colour[0] - xr)) / (n-1))).toFixed(0));
            var green = parseInt((xg + (( pos * (colour[1] - xg)) / (n-1))).toFixed(0));
            var blue = parseInt((xb + (( pos * (colour[2] - xb)) / (n-1))).toFixed(0));


            clr = 'rgb('+red+','+green+','+blue+')';
            $(this).css({backgroundColor:clr});
        }
    );



    //http://www.designchemical.com/blog/index.php/jquery/jquery-tutorial-create-a-flexible-data-heat-map/

}

function setFacetsAbsolute(){
	  jQuery(".navigators .c").addClass('open').removeClass('closed');
	  jQuery(".navigators .rc").addClass('closed').removeClass('open');
	  jQuery("#FacetsAbsBut").addClass('active');
	  jQuery("#FacetsRelBut").removeClass('active');
	  localStorage["resultcount"] = 'absolute';
}
function setFacetsRelative(){
	  jQuery(".navigators .rc").addClass('open').removeClass('closed');
	  jQuery(".navigators .c").addClass('closed').removeClass('open');
	  jQuery("#FacetsRelBut").addClass('active');
	  jQuery("#FacetsAbsBut").removeClass('active');
	  localStorage["resultcount"] = 'relative';
}


function createWordCloud(facet_id, words){
    var fill = d3.scale.category20();

    var layout = cloud()
        .size([300, 300])
        .words(words.map(function(d) {
        return {text: d, size: d.size / 1000, test: "haha"};

    }))
.padding(5)
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .font("Impact")
        .fontSize(function(d) { return d.size; })
        .on("end", draw);

    layout.start();

    function draw(words) {
        d3.select("wordcloud_$field.name").append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Impact")
            .style("fill", function(d, i) { return fill(i); })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
    }
}


