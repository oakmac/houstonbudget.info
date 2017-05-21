;(function () {
  window.HOUSTON_BUDGET = window.HOUSTON_BUDGET || {}

  var MAX_YEAR = 2016
  var MIN_YEAR = 2008

  function buildYearSelect (id) {
    var html = '<select>'
    var y = MAX_YEAR
    while (y > MIN_YEAR) {
      html += `<option value="${y}">${y}</option>`
      y = y - 1
    }
    html += '</select>'

    return html
  }

  window.HOUSTON_BUDGET.buildYearSelect = buildYearSelect
})()
