$( document ).ready(function() {
  const file = 'data/tloh_2020.csv';
  let dataLink = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-i1s7BGITTkdaWOvZIHcLhGfQHCPKooh9wAoRIkUX_bb5fjn0Q-PXRpJonCpC3G3q_jrwKbYJezrY/pub?gid=0&single=true&output=csv';
  let maladiesListLink = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-i1s7BGITTkdaWOvZIHcLhGfQHCPKooh9wAoRIkUX_bb5fjn0Q-PXRpJonCpC3G3q_jrwKbYJezrY/pub?gid=124026934&single=true&output=csv';
  let geodataLink = 'data/bf.json';
  let epidemioData, geodata;
  let maladiesList = [];
  
  // let maladiesSelectionnees = ['Paludisme Grave'];
  let maladiesSelectionnees = ['Covid-19', 'Paludisme Grave', 'Dengue'];
  
  let weekFrom = 1,
      weekTo = 16;
  let weekMax = 0;

  let weekScale = ['x'];
  let semaines = [];

  let filteredEpidemioData;

  let regionSelected = ['Centre'];
  let regionDim = {};
  let regionScale = [];
  let regionAndDistrictsMap = {};
  let regionChartData;

  let map ;
  let geojson;

  function getData() {
    Promise.all([
      d3.csv(dataLink),
      d3.csv(maladiesListLink),
      d3.json(geodataLink)
    ]).then(function(data){
      epidemioData = data[0];
      epidemioData.forEach( function(d) {
        d['NSEM'] = Number(d['NSEM']);
        d['DEBUT'] = moment(d['DEBUT'], ['DD-MMM-YYYY']);
      });

      weekMax = d3.max(epidemioData, function(d){
        return d['NSEM'];
      });
      weekTo = weekMax;

      data[1].forEach( function(element, index) {
        maladiesList.push(element.Maladies);
      });
      geodata = topojson.feature(data[2], data[2].objects.burkina2);

      var regions = epidemioData.map(function(d){
        return d['REGION'];
      });

      regions.forEach( function(reg) {
        regionScale.includes(reg) ? '' : regionScale.push(reg);
      });

      regionScale.sort();
      regionScale.unshift('x');

      regionAndDistrictsMap = createRegionDistrictMap(regionScale, epidemioData);

      init();
    });
  }
  
  function filterRegions(item) {
    var included = false;
    for (var i=0; i<regionSelected.length; i++) {
      if (item['REGION'] == regionSelected[i]) {
        included = true;
        break;
      }
    }
    return included;
  }

  function filterData (argument) {

    regionChartData = filteredEpidemioData = epidemioData.filter(function(d){
      return d['NSEM'] >= weekFrom &&
              d['NSEM'] <= weekTo;
    });

    for (var i = weekFrom; i <= weekTo ; i++) {
      weekScale.push('s'+i);
    }


    filteredEpidemioData = filteredEpidemioData.filter(filterRegions);


  }//filterData

  // Creer les filtres du sidebar
  function filtresSetter (argument) {

    
    for (var i = 1; i <= weekMax; i++) {
      semaines.push("semaine "+i);
    };

    // Months dropdowns
    var dropdwnMoisDe = d3.select("#to")
        .selectAll("option")
        .data(semaines)
        .enter().append("option")
          .text(function(d){ return d; })
          .attr("value", function(d){
            return d;
          });
    
    $('#to').multipleSelect({
      minimumCountSelected: 1,
      displayValues: true
    });


    var dropdwnMoisFrom = d3.select("#from")
        .selectAll("option")
        .data(semaines)
        .enter().append("option")
          .text(function(d){ return d; })
          .attr("value", function(d){
            return d;
          });
    
    $('#from').multipleSelect({
      minimumCountSelected: 1,
      displayValues: true
    });


    // dropdown maladies

    var dropdwnMaladies = d3.select("#selectMaladies")
        .selectAll("option")
        .data(maladiesList)
        .enter().append("option")
          .text(function(d){ return d; })
          .attr("value", function(d){ return d; });
    
    $("#selectMaladies").multipleSelect({
      minimumCountSelected: 3,
      displayValues: true,
      selectAll: false
    });


    // dropdown region
    var regs = [];
    for (var i = 1; i < regionScale.length; i++) {
      regs.push(regionScale[i]);
    };

    var dropdwnRegion = d3.select("#selectRegion")
        .selectAll("option")
        .data(regs)
        .enter().append("option")
          .text(function(d){ return d; })
          .attr("value", function(d){ return d; });
    
    $("#selectRegion").multipleSelect({
      minimumCountSelected: 3,
      displayValues: true,
      selectAll: true
    });


    $("#districts").multipleSelect({
      displayValues: true
    });

  }//filtresSetter


  // Fetcher les donnees et creer les graphes pour les maladies
  // de la selection
  function drawCharts (argument) {

    var casesArrColumns = [],
        deathArrColumns = [],
        letaliteArr = [];

    var totalCas = 0,
        totolDeces = 0;

    for (var i = 0; i < maladiesSelectionnees.length; i++) {
      var arr = getMaladieData(maladiesSelectionnees[i]);
      casesArrColumns.push(arr[0]);
      deathArrColumns.push(arr[1]);
      totalCas += d3.sum(arr[0]);
      totolDeces += d3.sum(arr[1]);
      // letaliteArr.push(arr[2]);
    }
    casesArrColumns.unshift(weekScale);
    deathArrColumns.unshift(weekScale);

    createLineCharts(casesArrColumns, 'charts-cas', 'Nombre de cas sur la période séléctionnée');
    createLineCharts(deathArrColumns, 'charts-deces', 'Nombre de dècés sur la période séléctionnée');
    KeyFiguresSetter([totalCas, totolDeces]);

  } //drawCharts

  function getMaladieData (mld) {
    var casArr = [],
        deathArr = [];
    var data = d3.nest()
        .key(function(d) { return d['NSEM']; })
        .rollup(function(v){ 
            return {
              cas : d3.sum(v, function(d){ return Number(d[mld + " " +'Cas']); }),
              death : d3.sum(v, function(d){ return Number(d[mld + " " +'Décès']); })
            } 
          })
        .entries(filteredEpidemioData);
    
    casArr.push(mld);
    deathArr.push(mld);

    data.forEach( function(element) {
      casArr.push(element.value.cas);
      deathArr.push(element.value.death);
    });
    return [casArr, deathArr];

  }//getMaladieData

  function drawRegionChart () {

    var deathArr = [],
        casArr = [];

    for (var i = 0; i < maladiesSelectionnees.length; i++) {
      var data = getRegionData(maladiesSelectionnees[i]);

      var cas = [maladiesSelectionnees[i]],
          deaths = {};
      
      for (var j = 1; j < regionScale.length; j++) {
        data.forEach( function(reg) {
          if (reg.key === regionScale[j]) {
            cas.push(reg.value.cas) ;
            deaths[regionScale[j]] = reg.value.death ;
          }
        });
      }
      deathArr.push(deaths);
      casArr.push(cas);
    }
    casArr.unshift(regionScale);
    
    createBarChart(casArr);

    // var total = 0;
    for (var i = 1; i < regionScale.length; i++) {
      var som = 0;
          
      for (var k = 0; k < deathArr.length; k++) {
        som += deathArr[k][regionScale[i]];
      }
      regionDim[regionScale[i]] = som;//{somme: som};
      // total += som;

    }


  }// drawRegionChart


  function getRegionData (mld) {
    var data = d3.nest()
        // .key(function(d) { return d['NSEM']; })
        .key(function(d){ return d['REGION']; })
        .rollup(function(v){ 
            return {
              cas : d3.sum(v, function(d){ return Number(d[mld + " " +'Cas']); }),
              death : d3.sum(v, function(d){ return Number(d[mld + " " +'Décès']); })
            } 
          })
        .entries(regionChartData);
    
    return data;
  } //getRegionData


  function mapClicked (e) {
    var layer = e.target ;
    drawDistrictCharts(layer.feature.properties.ADM1_FR)
  }

  function onEachFeature(feature, layer) {
      layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: mapClicked
      }).bindPopup(feature.properties.ADM1_FR);
  }

  function getColor(region) {
    var d = regionDim[region];
    return d > 100 ? '#800026' :
            d > 80  ? '#BD0026' :
            d > 60  ? '#E31A1C' :
            d > 50  ? '#FC4E2A' :
            d > 30   ? '#FD8D3C' :
            d > 10   ? '#FEB24C' :
            d > 5   ? '#FED976' :
                        '#FFEDA0';
  }

  function style(feature) {
    // use regionDim
    return {
        fillColor: getColor(feature.properties.ADM1_FR),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      };
  }

  function createMap () {

    map = L.map('map',
    {
        maxZoom: 20,
        // minZoom: 2
    });

    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/traffic-day-v2/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW1hZG91MTciLCJhIjoib3NhRnROQSJ9.lW0PVXVIS-j8dGaULTyupg', {
        attribution: '<a href="http://mapbox.com">Mapbox</a>'
    }).addTo(map); 
    
    geojson = L.geoJson(geodata,
              { 
                style:style,
                onEachFeature: onEachFeature
              }).addTo(map);

    map.fitBounds(geojson.getBounds());

  } // createMap()


  function updateMap () {
    map.removeLayer(L.geoJson);

    geojson = L.geoJson(geodata, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);
  } //updateMap


  function highlightFeature(e) {
      var layer = e.target;

      layer.setStyle({
          weight: 5,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.7
      });
      layer.openPopup();

  }

  function resetHighlight(e) {
      geojson.resetStyle(e.target);
      e.target.closePopup();

  }

  function doNotDraw (data) {
    var bool = true ;

    var death = data[0],
        cas = data[1];
    var lenDeathArr = death.length - 1;
    var lenCasArr = cas.length - 1;

    for (var i = 1; i < death.length; i++) {
      death[i].length == 1 ? lenDeathArr-- : '';
    }

    for (var i = 1; i < cas.length; i++) {
      cas[i].length == 1 ? lenCasArr-- : '';
    }
    (lenDeathArr == 0 && lenCasArr == 0) ? bool = false : '';
    
    return bool;
  } //doNotDraw

  function checkedDistrictData (dist) {
    var subdata = filteredEpidemioData.filter(function(d){
      return d['DISTRICT'] == dist ;
    }); 
    var mld = 'Paludisme Grave';

    var casData = subdata.map(function(d){
      return d[mld + " " +'Cas'];
    });
    var deathData = subdata.map(function(d){
      return d[mld + " " +'Cas'];
    });


  }//checkedDistrictData

  function drawDistrictCharts (region) {
    region == undefined ? region = 'Centre' : '';
    var data = regionChartData.filter(function(d){
      return d['REGION'] == region;
    });
    var districts = regionAndDistrictsMap[region].districts;
    
    districts.sort();

    $('.charts-districts h2').text('Région '+region+' - District de ');
    
    $('#districts').children('option').remove();

    var dropdwnDistrict = d3.select("#districts")
        .selectAll("option")
        .data(districts)
        .enter().append("option")
          .text(function(d){ return d; })
          .attr("value", function(d){ return d; });
    
    $("#districts").multipleSelect('refresh');
    
    var selectedDist = $('#districts').val();
    getDistrictDataAll(data, selectedDist);

    $("#districts").on('change', function(d){
      var dist = $('#districts').val();
      getDistrictDataAll(data, dist);
    });
    // for (var i = 0; i < districts.length; i++) {
    //   checkedDistrictData();

    //   var data = getDistrictDataAll(districts[i]);
    //   var deathName = "chart_deces"+i;
    //   var casName = "chart_cas"+i;

    //   $('#'+region).append('<div class="districtChart col-md-4"><div class="chart-header"><h4><span>District '+districts[i]+'</span></h4></div><div class="chart-container"><div id="'+casName+'"></div><div id="'+deathName+'"></div></div></div>');
    //   createDistrictDecesChart(data[0], deathName);
    //   createDistrictCasChart(data[1], casName);

      // if (!doNotDraw(data)) {
      //   console.log("region "+region)
      //   console.log(data);
      //   $('#'+region).html('<div><h3>Les graphes sont vides.</h3></div>');
      // } else {
      //   var deathName = "chart_deces"+i;
      //   var casName = "chart_cas"+i;

      //   $('#'+region).append('<div class="districtChart col-md-4"><div class="chart-header"><h4><span>District '+districts[i]+'</span></h4></div><div class="chart-container"><div id="'+casName+'"></div><div id="'+deathName+'"></div></div></div>');
      //   createDistrictDecesChart(data[0], deathName);
      //   createDistrictCasChart(data[1], casName);
      // }

    // }

  } //drawDistrictCharts

  function getDistrictDataAll (data, district) {
    var subdata = data.filter(function(d){
      return d['DISTRICT'] == district ;
    });

    var pop = d3.max(subdata, function(d){
      return d['POP'];
    });

    var allDecesArr = [],
        allCasArr = [];

    allDecesArr.push(weekScale);
    allCasArr.push(weekScale);

    for (var i = 0; i < maladiesSelectionnees.length; i++) {
       var data = getDistrictData(subdata, maladiesSelectionnees[i]);
       allDecesArr.push(data[1]);
       allCasArr.push(data[0]);
     } 
    var deathName = "chart_deces";
    var casName = "chart_cas";
    $('#distCharts').html('');
    // $('#distCharts').append('<div class="grid-item pop"><div class="content"><div id="population">'+d3.format(",")(pop)+'</div><div classe="title">population totale</div></div></div>');
    $('#distCharts').append('<div class="grid-item"><div class="chart-container"><div id="'+casName+'"></div></div></div>');
    $('#distCharts').append('<div class="grid-item"><div class="chart-container"><div id="'+deathName+'"></div></div></div>');
    
    createDistrictDecesChart(allDecesArr, deathName);
    createDistrictCasChart(allCasArr, casName);
    // return [allDecesArr, allCasArr];
    
  }//getDistrictDataAll


  function getDistrictData (dataArg, mld) {
    var data = d3.nest()
        .key(function(d){ return d['NSEM']; })
        .rollup(function(v){ 
            return {
              cas : d3.sum(v, function(d){ return Number(d[mld + " " +'Cas']); }),
              death : d3.sum(v, function(d){ return Number(d[mld + " " +'Décès']); })
            } 
          })
        .entries(dataArg);

    var casArr = [],
        deathArr = [];

    casArr.push(mld);
    deathArr.push(mld);

    data.forEach( function(element) {
      casArr.push(element.value.cas);
      deathArr.push(element.value.death);
    });

    var cpteCas = 1;
    for (var i = 1; i < casArr.length; i++) {
      casArr[i]==0 ? cpteCas++ : '';
    }

    var cpteDeath = 1;
    for (var i = 1; i < deathArr.length; i++) {
      deathArr[i]==0 ? cpteDeath++ : '';
    }

    return [casArr, deathArr];
  } //getDistrictData


  // Fetcher les filtres et updater les vars globaux
  // et re-appliquer les fonctions de creation des graphes
  function update (argument) {
    var maladies = $('#selectMaladies').val();
    maladies===undefined ? null : maladiesSelectionnees = maladies;
    
    var regs = $('#selectRegion').val();
    regs===undefined ? null : regionSelected = regs;
    
    weekTo = ($('#to').val()).split(" ")[1];
    weekFrom = ($('#from').val()).split(" ")[1];


    filterData();

    drawCharts();
    drawRegionChart();
    drawDistrictCharts();
    updateMap();

  }//update

  function init() {
    // initialiser tous tes var glo ici
    filterData();
    filtresSetter();
    drawCharts();
    drawRegionChart();
    createMap();
    drawDistrictCharts();

    $("#from").val("semaine "+weekFrom);
    $("#from").multipleSelect('refresh');

    $("#to").val("semaine "+weekTo);
    $("#to").multipleSelect('refresh');

    $("#selectMaladies").val(maladiesSelectionnees);
    $("#selectMaladies").multipleSelect('refresh');

    $("#selectRegion").val(regionSelected);
    $("#selectRegion").multipleSelect('refresh');

    //remove loader and show vis
    $('.loader').hide();
    $('main').css('opacity', 1);
  }

  getData();

  $('#update').on('click', function(d){
    update();
  });
  
  $('#reset').on('click', function(d){
    $('#from').val(semaines[0])
    $('#to').val(semaines[semaines.length - 1]);
    $('#to').multipleSelect('refresh');
    $('#from').multipleSelect('refresh');
    
    $("#selectRegion").val("Centre");
    $("#selectRegion").multipleSelect('refresh');

    $("#selectMaladies").val(['Covid-19', 'Paludisme Grave', 'Dengue']);
    $("#selectMaladies").multipleSelect('refresh');
    update();
  });

});