;(function () {
  var d3 = window.d3
  var hb = window.HOUSTON_BUDGET

  function fetchTreemap (id, file) {
    d3.json(file, function (data) {
      hb.createTreemap(id, data)
    })
  }

  function init () {
    fetchTreemap('treemapLeft', 'data/2017-budget-treemap.json')
    fetchTreemap('treemapRight', 'data/2016-budget-treemap.json')
  }

  init()
})()
