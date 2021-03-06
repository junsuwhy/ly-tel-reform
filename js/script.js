//var url = "https://raw.github.com/g0v/twlyparser/master/data/mly-8.json";
//sortable table solution: http://jsfiddle.net/VAKrE/105/

(function(window, document, $){

"use strict";

var dataCache;
var reportCache = {};
var url = "data/mly-8.json";

var iso3166tw = {
    "CHA": "彰化縣",
    "CYI": "嘉義市",
    "CYQ": "嘉義縣",
    "HSQ": "新竹縣",
    "HSZ": "新竹市",
    "HUA": "花蓮縣",
    "ILA": "宜蘭縣",
    "KEE": "基隆市",
    "KHH": "高雄市",
    "KHQ": "高雄市",
    "MIA": "苗栗縣",
    "NAN": "南投縣",
    "PEN": "澎湖縣",
    "PIF": "屏東縣",
    "TAO": "桃園縣",
    "TNN": "台南市",
    "TNQ": "台南市",
    "TPE": "台北市",
    "TPQ": "新北市",
    "TTT": "台東縣",
    "TXG": "台中市",
    "TXQ": "台中市",
    "YUN": "雲林縣",
    "JME": "金門縣",
    "LJF": "連江縣"
}

var constituencyParser = function (constituency) {
    var result;
    switch (constituency[0]) {
    case 'proportional':
        return '全國不分區';
    case 'aborigine':
        if (constituency[1] == 'highland')
            return '山地原住民';
        else
            return '平地原住民';
    case 'foreign':
        return '僑居國外國民';
    default:
        if (iso3166tw[constituency[0]]) {
            if (constituency[1] == 0) {
                return iso3166tw[constituency[0]];
            } else {
                return iso3166tw[constituency[0]] + '第' + constituency[1] + '選區';
            }
        } else {
            return constituency[0] + '<br>' + constituency[1];
        }
    }
};

var partyParser = function (party) {
    switch (party) {
    case 'KMT':
        return '中國國民黨';
    case 'DPP':
        return '民主進步黨';
    case 'TSU':
        return '台灣團結聯盟';
    case 'PFP':
        return '親民黨';
    case 'NSU':
        return '無黨團結聯盟';
    case 'MKT':
        return '民國黨';
    default:
        if (party === null){
            return '無黨籍';
        }else{
            return '不明';
        }
    }
};

// function sortResults(prop, asc) {
//     dataCache = dataCache.sort(function(a, b) {
//         if (asc) return (a[prop] > b[prop]);
//         else return (b[prop] > a[prop]);
//     });
//     showResults();
// }

// $(function() {
//     $('#contact-list th').click(function() {
//         var id = $(this).attr('id');
//         var asc = (!$(this).attr('asc')); // switch the order, true if not set

//         // set asc="asc" when sorted in ascending order
//         $('#contact-list th').each(function() {
//             $(this).removeAttr('asc');
//         });
//         if (asc) $(this).attr('asc', 'asc');

//         sortResults(id, asc);
//     });

//     //showResults();
// });

function showReportNum(lyId, reportNum){
    var reportNumSpan = $('.btn-report.btn-success[data-ly="'+ lyId +'"]');
    if (reportNumSpan) {
        reportNumSpan.find('.report-num').text(reportNum + ' 人');
    }
}

function showResults(){
    $('#results').html('');
    /*
        Structure:

        <article>
            <header>
                <img alt="avatar">
                <h1>Legislator name</h1>
                <h2><small>Party<br>Zone</small></h2>
            </header>
            <main>
                Telephone data
            </main>
        </article>

    */

    var html = '';
    $.each(dataCache, function (key, val) {
        html += '<article class="row" id="ly-' + val['id'] + '">';
        html +=   '<div class="ly-info';
        html +=     '<div class="col-xs-1 ly-avatar">';
        html +=       '<img src="' + val['avatar'] + '" alt="' + val['name'] + '" class="img-circle">';

        var reported = $.cookie('ly-' + val['id'] + '-reported');
        if (reported) {
            html +=       '<div class="btn btn-success btn-sm btn-report disabled" data-ly="' + val['id'] +'"><span class="glyphicon glyphicon-ok"></span> <span class="report-num"></span>回報已打</div>';
        } else {
            html +=       '<div class="btn btn-warning btn-sm btn-report" data-ly="' + val['id'] +'"><span class="glyphicon glyphicon-ok"></span> <span class="report-num"></span>回報已打</div>';
        }

        html +=     '</div>';
        html +=     '<header class="col-xs-3 ly-title">';
        html +=       '<h1>' + val['name'] + '</h1>';
        html +=       '<h2><small>' + partyParser(val['party']) + '<br>' + constituencyParser(val['constituency']) + '</small></h2>';
        html +=     '</header>';
        html +=   '</div>';

        var contacts = val['contacts'] || [];
        html += '<main class="col-xs-12 col-sm-8 ly-contact">';
        $.each(contacts, function (key, val) {
            key = val['name'];
            if(key){
                html = html + '<div class="contact"><h3>' + key + '</h3>';
                if (val['phone'] != undefined){
                    html = html + '<span class="glyphicon glyphicon-earphone"></span>　<a class="tel" href="tel:' + val['phone'] + '">' + val['phone'] + '</a><br>';
                }
                if (val['address'] != undefined){
                    html = html + '<small>地址　<a href="http://maps.google.com.tw/?q=' + val['address'] + '">' + val['address'] + '</a></small>';
                }
                if (val['fax'] != undefined){
                    html = html + '<br><small>傳真　<a href="fax:' + val['fax'] + '">' + val['fax'] + '</a></small>';
                }
                html = html + '</div>';
            }
        });
        html += '</main></article>';
    });
    $('#results').append(html);
    $('a[href="#ly-id"]').click(function (e) {
        e.preventDefault();
        $(document).scrollTop( $("#ly-" + dataCache[Math.floor((Math.random()*dataCache.length))]['id']).offset().top );
    });
    // report button
    $('.btn-report.btn-warning').click(function (e) {
        var lyId = $(this).data('ly');
        $.cookie('ly-' + lyId + '-reported', 'true');
        $(this).addClass('btn-success disabled').removeClass('btn-warning');
        if (lyId in reportCache) {
            showReportNum(lyId, parseInt(reportCache[lyId])+1);
        } else {
            showReportNum(lyId, 1);
        }
        $.ajax({
            url: 'https://docs.google.com/forms/d/1yf_SOKIkA-mX9wTWJK8OgI6sm-972isPyBMnN7QTmu8/formResponse',
            data: {'entry.1286314681': lyId},
            type: 'POST',
            dataType: 'xml'
        });
    });
    $.ajax({
        url: 'https://spreadsheets.google.com/tq?&tq=select%20B%2C%20count(A)%20group%20by%20B&key=1R4HffQexRmeqVVWMdLaSwRTjU_AaK07P6qn1IdSHYQY&gid=&tqx=out:html',
        success: function (result) {
            $($.parseHTML(result)).find('tr').each(function () {
                var lyId = $(this).find('td').first().text();
                var reportNum = $(this).find('td').last().text();
                reportCache[lyId] = reportNum;
                showReportNum(lyId, reportNum);
            });
        }
    });
}

$.getJSON(url, function (data) {
    dataCache=data;
    showResults();
});
//while not small device, execute this
if($(window).width()>767){
    var offset = $(".sidebar").offset();
    var topPadding = 50;
    $(window).scroll(function() {
        if($(window).scrollTop()  > 47000){
            $(".sidebar").css("margin-top", 47000);
        }else if ($(window).scrollTop() > offset.top) {
            $(".sidebar").css("margin-top", $(window).scrollTop() - offset.top + topPadding);
        }else {
            $(".sidebar").css("margin-top", 20);
        };
    });

    var $w = $(window);
    $('.sidebar').css('height',$w.height());
}

// add by junsuwhy


function changeTopic(){
    var topic = $('#topic').val();
    $('.call-topic').hide();
    $('.call-'+topic).show();
    $('.topic-reference-content').addClass('hide');
}

/**
 * For reference list.
 */
function ajaxGssGetData(url, func){
    $.getJSON(url,function(objGss){
        if(objGss.feed.entry){
            var arrData = new Array();
            var keyarr;
            for (var i = 0; i < objGss.feed.entry.length; i++) {
                arrData[i] = new Object();
                keyarr = Object.keys(objGss.feed.entry[i]);
                for (var j = 0; j < keyarr.length; j++) {
                    var key = keyarr[j].split('gsx$')[1];
                    if(key){
                        arrData[i][key] = objGss.feed.entry[i][keyarr[j]]['$t'];
                    }
                };
            };
            func(arrData);
        }else{
            console.error("It's not a Gss object.");
        }
        
    },function(){
        console.error("Doesn't get Data.");
    });    
}

ajaxGssGetData("https://spreadsheets.google.com/feeds/list/19xCzpDYK_AB7aLZXqaStTvHDL4p8yOr1391sDY7vP-Y/od6/public/values?alt=json",function(data){
    for (var i = data.length - 1; i >= 0; i--) {
        if(data[i].enable == "1"){
            var $ref_li = $('<li>').append($('<a>').attr('href',data[i].url).attr('target',"_blank").text(data[i].title));
            $ref_li.insertAfter($('.reference'));
            $ref_li.clone().prependTo($('#reference').find('ul'));
        };
    }
});

/* For action2 content */
ajaxGssGetData("https://spreadsheets.google.com/feeds/list/19xCzpDYK_AB7aLZXqaStTvHDL4p8yOr1391sDY7vP-Y/ocsoi5b/public/values?alt=json",function(data){
   for (var i = 0; i < data.length; i++) {
        if(data[i].enable == "1"){
            $('#topic').append($('<option value="topic'+i+'">').text(data[i].title));
            var $title_h4 = $('<h4>').text("要求："+data[i].title);
            var content = '<p>'+data[i].content.replace(/\n\n/g,'\n').replace(/\n/g,'</p><p>').replace('______選區的選民______','<span class="custom-name">____選區的選民____</span>')+'</p>';
            var $ref_a = $('<a href="javascript:void(0)" class="display-reference">').text('憲動盟參考條文');
            var $ref_body_div = $('<div class="topic-reference-content hide">').html('<p>'+data[i].addition.replace(/\n\n/g,'\n').replace(/\n/g,'</p><p>')+'</p>');
            var $ref_div = $('<div class="topic-reference">').append($ref_a).append($ref_body_div);
            var $con_div = $('<div class="call-topic call-topic'+i+'">').append($('<blockquote>').html(content).prepend($title_h4)).append($ref_div);
            $('.call-content').append($con_div);
        };
    } 
    $('#topic').change(changeTopic);
    changeTopic();

    /**
     * For changing topic form. 
     */
    $('.topic-reference a').click(function(){
        $(this).next().toggleClass('hide');
    })

});


}(window, document, jQuery));

function clickMenu(){
    if($('#menu').prop('checked')){
        $('#main').css('overflow', 'hidden');
        //remove bottombar when click sidebar
        $('.bottombar').removeClass('visible-xs').css('display','none');
    }else{
        $('.bottombar').addClass('visible-xs');
    }
}
$('#menu').click(function(){
    clickMenu();
});
$('.sidebar ul li').click(function(){
    $('#menu').prop("checked", false);
    clickMenu();
});