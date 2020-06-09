var colorPattern = ['#1ebfb3', '#f2645a', '#007ce1', '#9c27b0', '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

function createLineCharts(columns, type, title) {
	timeseriesChart = c3.generate({
    padding: {
      top: 10,
      left: 35,
      right: 16
    },
    size: { height: 190},
    bindto: '.' + type,
    title: {
  		text: title,
  		position: 'upper-left',
		},
		data: {
			x: 'x',
      type: 'line',
			columns: columns,
		},
    color: {
        pattern: colorPattern
    },
		axis: {
			x: {
				type: 'category',
				tick: {
				  // format: ,
          centered: false,
          outer: false
				}
			},
			y: {
				min: 0,
				padding: { top:0, bottom:0 },
        tick: { 
          outer: false
        }
			}
		}
	});
}//createLineCharts


function createBarChart (data) {
  var chart = c3.generate({
      bindto: '#regionchart',
      size: {height: 95},
      data: {
          x: 'x',
          columns: data,
          type: 'bar'
      },
      color: {
          pattern: colorPattern
      },
      axis: {
          x: {
              type: 'category',
              tick: {
                outer: false,
                multiline: false,
                rotate: 12,
                center: true
              }
          },
          y: {
            show: false,
            tick: {
              count: 1,
              // format: d3.format(".1r"),
              fit: true
            }
          }
      },
      legend: { 
        show: false
      }
  });
} //createBarChart

function KeyFiguresSetter (arr) {
  var divCas = '<div class="keyfigure"><div class="inner"><div class="num">'+arr[0]+'<div class="title">total cumulé de cas</div></div></div></div>';
  // var divCas = '<div class="keyfigure"><div class="inner"><div class="num">'+arr[0]+'</div><h3>total cumulé de cas</div></div>';
  // var divMorts = '<div class="keyfigure"><div class="inner"><div class="num">'+arr[1]+'</div><h3>total cumulé de décès</div></div>';
  var divMorts = '<div class="keyfigure"><div class="inner"><div class="num">'+arr[1]+'<div class="title">total cumulé de décès</div></div></div></div>';

  $('.key-Figures').html(divCas + divMorts);
}//KeyFiguresSetter

function sumArray (arr) {
  return d3.sum(arr);

} //sumArray


function calcPercentage (regionlist) {
  var pct = [];

  var total = 0;
  for (k in regionlist){
    total += Number(regionlist[k]);
  }
  console.log("le total" +total)
  for (k in regionlist){
    var pt = (regionlist[k]/total)*100
    pct.push(pt);
  }

  return pct;
}//calcPercentage


// district barchart 
function createDistrictDecesChart (data, place) {
  var chart = c3.generate({
      bindto: '#' +place,
      size: {height: 120},
      title: {
        text: 'Nombre de dècés',
        position: 'upper-left'
      },
      data: {
          x: 'x',
          columns: data,
          type: 'bar'
      },
      color: {
          pattern: colorPattern
      },
      axis: {
          x: {
              type: 'category',
              tick: {
                outer: false,
                multiline: false,
                // rotate: 12
              }
          },
          y: {
            // show: false,
            tick: {
              count: 3,
              // format: d3.format('.2s')
            }
          }
      },
      legend: { 
        show: false
      },
      transition: { duration: 300 }
  });
} //createDistrictBarChart

// district barchart 
function createDistrictCasChart (data, place) {
  var chart = c3.generate({
      bindto: '#' +place,
      size: {height: 120},
      title: {
        text: 'Nombre de Cas',
        position: 'upper-left'
      },
      data: {
          x: 'x',
          columns: data,
          type: 'bar'
      },
      color: {
          pattern: colorPattern
      },
      axis: {
          x: {
              type: 'category',
              tick: {
                outer: false,
                multiline: false,
                // rotate: 12
              }
          },
          y: {
            // show: false,
            tick: {
              count: 3,
              // format: d3.format('.2s')
            }
          }
      },
      legend: { 
        show: false
      },
      transition: { duration: 300 }
  });
} //createDistrictCasChart


function createRegionDistrictMap (regionList, data) {
   var dic = {};
   regionList.forEach( function(region) {
    var regData = data.filter(function(d){
      return d['REGION'] == region;
    });

    var districts = regData.map(function(d){
      return d['DISTRICT'];
    });

    var distArr = [];
    districts.forEach( function(element, index) {
      distArr.includes(element)? '' : distArr.push(element);
    });

     dic[region] = {districts: distArr};
   });

   return dic;
} //createRegionDistrictMap 

function weekOfMonth(m) {
  return m.week() - moment(m).startOf('month').week() + 1;
}
var months = {
  Janvier: 'Jan', 
  Fevrier: 'Feb',
  Mars: 'Mar', 
  Avril: 'Apl',
  Mai: 'May',
  Juin: 'Jun',
  Juillet: 'Jul',
  Aout: 'Aug',
  Septembre: 'Sep', 
  Octobre: 'Oct', 
  Novembre: 'Nov', 
  Decembre: 'Dec'
};
var year = 2020;

function getWeekRange (mois1, mois2) {
    
    var d1 = moment(months[mois1] + "-" + year, ['MMM-YYYY']);
    var d2 = moment(months[mois2] + "-" + year, ['MMM-YYYY']);

    var j1 = d1.daysInMonth();
    var j2 = d2.daysInMonth();
    var date1 = moment(j1+"-"+months[mois1] + "-" + year,['DD-MMM-YYYY']);
    var date2 = moment(j2+"-"+months[mois2] + "-" + year,['DD-MMM-YYYY']);
    var week1 = date1.isoWeekday();
    var week2 = date1.isoWeekday() + date2.isoWeekday();
    console.log(week1)
    console.log(week2)

}//getWeekRange



//



var get_calendar;
var calendar, endDay, firstDay, firstWeekDay, headerRow, i, j, lastWeekDay, len, len1, month, monthRange, row, startDate, week, weekRange, weeks, year,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

function get_calendar (year, month) {
  startDate = moment([year, month]);
  firstDay = moment(startDate).startOf('month');
  endDay = moment(startDate).endOf('month');
  monthRange = moment.range(firstDay, endDay);
  weeks = [];
  monthRange.by('days', function(moment) {
    var ref;
    ref = void 0;
    if (ref = moment.week()) {
      indexOf.call(weeks, ref) < 0;
      return weeks.push(moment.week());
    }
  });
    console.log(weeks)

  calendar = [];
  i = 0;
  len = weeks.length;
  while (i < len) {
    week = weeks[i];
    if (i > 0 && week < weeks[i - 1]) {
      firstWeekDay = moment([year, month]).add(1, 'year').week(week).day(1);
      lastWeekDay = moment([year, month]).add(1, 'year').week(week).day(7);
    } else {
      firstWeekDay = moment([year, month]).week(week).day(1);
      lastWeekDay = moment([year, month]).week(week).day(7);
    }
    weekRange = moment.range(firstWeekDay, lastWeekDay);
    calendar.push(weekRange);
    i++;
  }
  return calendar;
};


function getDistricts (data) {
  var districts = [];
  var dists = data.map(function(d){
    return d['DISTRICT'];
  });

  dists.forEach( function(element, index) {
    districts.includes(element) ? '' : districts.push(element);
  });
  return districts;
} //getDistricts


