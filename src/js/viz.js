$( document ).ready(function() {
  const file = 'data/tloh_2020.csv';
  let dataLink = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-i1s7BGITTkdaWOvZIHcLhGfQHCPKooh9wAoRIkUX_bb5fjn0Q-PXRpJonCpC3G3q_jrwKbYJezrY/pub?gid=0&single=true&output=csv';
  let epidemioData ;
  
  let maladiesSelectionnees = ['Covid-19', 'Paludisme', 'Méningite'];

  let weekTo = 1,
      weekFrom = 3;

  function getData() {
    Promise.all([
      d3.csv(dataLink)
    ]).then(function(data){
      epidemioData = data[0];
      epidemioData.forEach( function(d) {
        d['NSEM'] = Number(d['NSEM']);
      });
      console.log(epidemioData)
      filtresSetter();
      init();
    });
  }
  
  // Creer les filtres du sidebar
  function filtresSetter (argument) {
    console.log("dessiner les filtres");
  }//filtresSetter


  // Fetcher les donnees et creer les graphes pour les maladies
  // de la selection
  function drawCharts (argument) {
    var data = epidemioData.filter(function(d){
      return d['N°SEM'] >= weekTo &&
              d['N°SEM'] <= weekFrom;
    });
    console.log(data);
  } //drawCharts

  // Fetcher les filtres et updater les vars globaux
  // et re-appliquer les fonctions de creation des graphes
  function update (argument) {
    // body... 
  }//update

  function init() {
    drawCharts();
    //remove loader and show vis
    $('.loader').hide();
    $('main').css('opacity', 1);
  }

  getData();
});