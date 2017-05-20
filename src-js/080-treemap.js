;(function () {
  window.HOUSTON_BUDGET = window.HOUSTON_BUDGET || {}
  var d3 = window.d3

  // NOTE: modified from https://bl.ocks.org/mbostock/4063582

  // ---------------------------------------------------------------------------
  // Util
  // ---------------------------------------------------------------------------

  function fader (color) {
    return d3.interpolateRgb(color, '#fff')(0.2)
  }

  function sumByCount (d) {
    return d.children ? 0 : 1
  }

  function sumBySize (d) {
    return d.size
  }

  // ---------------------------------------------------------------------------
  // Treemap
  // ---------------------------------------------------------------------------

  var treemaps = {}

  function createTreemap (svgId, data) {
    var svgEl = document.getElementById(svgId)

    // sanity check
    if (!svgEl || svgEl.tagName.toLowerCase() !== 'svg') {
      window.alert('Please pass a valid <svg> element id to createTreemap()')
    }

    var svg = d3.select(svgEl)
    var width = svg.attr('width')
    var height = svg.attr('height')
    var color = d3.scaleOrdinal(d3.schemeCategory20.map(fader))
    var format = d3.format(',d')

    var treemap = d3.treemap()
      .tile(d3.treemapResquarify)
      .size([width, height])
      .round(true)
      .paddingInner(1)

    d3.json('data/flare.json', function (error, data) {
      if (error) throw error

      var root = d3.hierarchy(data)
        .eachBefore(function (d) { d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name })
        .sum(sumBySize)
        .sort(function (a, b) { return b.height - a.height || b.value - a.value })

      treemap(root)

      var cell = svg.selectAll('g')
      .data(root.leaves())
      .enter().append('g')
        .attr('transform', function (d) { return 'translate(' + d.x0 + ',' + d.y0 + ')' })

      cell.append('rect')
        .attr('id', function (d) { return d.data.id })
        .attr('width', function (d) { return d.x1 - d.x0 })
        .attr('height', function (d) { return d.y1 - d.y0 })
        .attr('fill', function (d) { return color(d.parent.data.id) })

      cell.append('clipPath')
        .attr('id', function (d) { return 'clip-' + d.data.id })
      .append('use')
        .attr('xlink:href', function (d) { return '#' + d.data.id })

      cell.append('text')
        .attr('clip-path', function (d) { return 'url(#clip-' + d.data.id + ')' })
      .selectAll('tspan')
        .data(function (d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g) })
      .enter().append('tspan')
        .attr('x', 4)
        .attr('y', function (d, i) { return 13 + i * 10 })
        .text(function (d) { return d })

      cell.append('title')
        .text(function (d) { return d.data.id + '\n' + format(d.value) })

      // d3.selectAll('input')
      //   .data([sumBySize, sumByCount], function (d) { return d ? d.name : this.value })
      //   .on('change', changed)

      // var timeout = d3.timeout(function () {
      //   d3.select('input[value="sumByCount"]')
      //     .property('checked', true)
      //     .dispatch('change')
      // }, 2000)

      // function changed (sum) {
      //   timeout.stop()
      //
      //   treemap(root.sum(sum))
      //
      //   cell.transition()
      //     .duration(750)
      //     .attr('transform', function (d) { return 'translate(' + d.x0 + ',' + d.y0 + ')' })
      //   .select('rect')
      //     .attr('width', function (d) { return d.x1 - d.x0 })
      //     .attr('height', function (d) { return d.y1 - d.y0 })
      // }
    })
  }

  HOUSTON_BUDGET.createTreemap = createTreemap
})()
