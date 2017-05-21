;(function () {
  var d3 = window.d3
  var hb = window.HOUSTON_BUDGET

  function fetchTreemap (id, file) {
    d3.json(file, function (data) {
      hb.createTreemap(id, data)
    })
  }

  function byId (id) {
    return document.getElementById(id)
  }

  function addEvents () {
    byId('btnLeft1').addEventListener('click', hb.transitionTreeMap.bind(null, 'treemapLeft', 'priorYearActual'))
    byId('btnLeft2').addEventListener('click', hb.transitionTreeMap.bind(null, 'treemapLeft', 'budget'))
    byId('btnRight1').addEventListener('click', hb.transitionTreeMap.bind(null, 'treemapRight', 'priorYearActual'))
    byId('btnRight2').addEventListener('click', hb.transitionTreeMap.bind(null, 'treemapRight', 'budget'))
  }

  function init () {
    addEvents()
    fetchTreemap('treemapLeft', 'data/2016-budget-treemap.json')
    fetchTreemap('treemapRight', 'data/2017-budget-treemap.json')
  }

  init()
})()
