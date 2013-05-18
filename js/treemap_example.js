;(function() {

// returns an array of object keys
var keys = function(obj) {
  var arr = [];
  for (var i in obj) {
    if (obj.hasOwnProperty(i) !== true) continue;
    arr.push(i);
  }
  return arr;
};

var encode = AutoComplete.htmlEncode;

// returns an object of departments from account data
var getFunds = function(data) {
  var funds = {};
  for (var i = 0; i < data.length; i++) {
    funds[data[i].fundNum] = data[i].fundName;
  }
  return funds;
};

var getDepts = function(data) {
  var depts = {};
  for (var i = 0; i < data.length; i++) {
    depts[data[i].deptNum] = data[i].deptName;
  }
  return depts;
};

var getCostCenters = function(data) {
  var costCenters = {};
  for (var i = 0; i < data.length; i++) {
    costCenters[data[i].ccNum] = data[i].ccName;
  }
  return costCenters;
}

var getAccounts = function(data) {
  var accounts = [];
  for (var i = 0; i < data.length; i++) {
    accounts.push({
      fundNum: data[i].fundNum,
      deptNum: data[i].deptNum,
      ccNum: data[i].ccNum,
      acctNum: data[i].acctNum,
      acctName: data[i].acctName,
      value: data[i].value
    });
  }
  return accounts;
};

var createAutoCompleteOptions = function(budget) {
  var options = [];

  // funds
  for (var i in budget.funds) {
    options.push({
      optionHTML: encode(i + ' - ' + budget.funds[i]),
      value: {
        fundId: i,
        fundName: budget.funds[i]
      }
    });
  }  

  // departments
  /*
  for (var i = 0; i < budget.accounts.length; i++) {
    options.push({
      optionHTML: encode(budget.accounts[i].acctNum + ' - ' + budget.accounts[i].acctName),
      value: budget.accounts[i]
    });
  }
  */

  // cost centers

  // accounts
  /*
  for (var i = 0; i < budget.accounts.length; i++) {
    options.push({
      optionHTML: encode(budget.accounts[i].acctNum + ' - ' + budget.accounts[i].acctName),
      value: budget.accounts[i]
    });
  }
  */

  return options;
};

var buildSearchBar = function(budget) {
  var opts = {
    initialList: 'categories',
    maxTokenGroups: 1,
    placeholderHTML: 'Search Funds, Departments, Cost Centers, Accounts',
    lists: {
      categories: {
        options: createAutoCompleteOptions(budget)
      }
    }
  };
  var ac = new AutoComplete('search_bar', opts);
};

var loadTree = function(budget) {
  var margin = {top: 40, right: 10, bottom: 10, left: 10},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var color = d3.scale.category20c();

  var treemap = d3.layout.treemap()
      .size([width, height])
      .sticky(true)
      .value(function(d) { return d.size; });

  var div = d3.select("body").append("div")
      .style("position", "relative")
      .style("width", (width + margin.left + margin.right) + "px")
      .style("height", (height + margin.top + margin.bottom) + "px")
      .style("left", margin.left + "px")
      .style("top", margin.top + "px");

  d3.json("flare.json", function(error, root) {
    var node = div.datum(root).selectAll(".node")
        .data(treemap.nodes)
      .enter().append("div")
        .attr("class", "node")
        .call(position)
        .style("background", function(d) { return d.children ? color(d.name) : null; })
        .text(function(d) { return d.children ? null : d.name; });

    d3.selectAll("input").on("change", function change() {
      var value = this.value === "count"
          ? function() { return 1; }
          : function(d) { return d.size; };

      node
          .data(treemap.value(value).nodes)
        .transition()
          .duration(1500)
          .call(position);
    });
  });

  function position() {
    this.style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
  }
};

var loadZoomableTree = function() {




var margin = {top: 20, right: 0, bottom: 0, left: 0},
    width = 960,
    height = 500 - margin.top - margin.bottom,
    formatNumber = d3.format(",d"),
    transitioning;

var x = d3.scale.linear()
    .domain([0, width])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, height])
    .range([0, height]);

var treemap = d3.layout.treemap()
    .children(function(d, depth) { return depth ? null : d.children; })
    .sort(function(a, b) { return a.value - b.value; })
    .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
    .round(false);

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .style("margin-left", -margin.left + "px")
    .style("margin.right", -margin.right + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("shape-rendering", "crispEdges");

var grandparent = svg.append("g")
    .attr("class", "grandparent");

grandparent.append("rect")
    .attr("y", -margin.top)
    .attr("width", width)
    .attr("height", margin.top);

grandparent.append("text")
    .attr("x", 6)
    .attr("y", 6 - margin.top)
    .attr("dy", ".75em");

d3.json("flare.json", function(root) {

  console.log(root);

  var nodes = [];

  initialize(root);
  accumulate(root);
  layout(root);
  display(root);

  function initialize(root) {
    root.x = root.y = 0;
    root.dx = width;
    root.dy = height;
    root.depth = 0;
  }

  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  function accumulate(d) {
    nodes.push(d);
    return d.children
        ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
        : d.value;
  }

  // Compute the treemap layout recursively such that each group of siblings
  // uses the same size (1×1) rather than the dimensions of the parent cell.
  // This optimizes the layout for the current zoom state. Note that a wrapper
  // object is created for the parent node for each group of siblings so that
  // the parent’s dimensions are not discarded as we recurse. Since each group
  // of sibling was laid out in 1×1, we must rescale to fit using absolute
  // coordinates. This lets us use a viewport to zoom.
  function layout(d) {
    if (d.children) {
      treemap.nodes({children: d.children});
      d.children.forEach(function(c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }

  function display(d) {
    grandparent
        .datum(d.parent)
        .on("click", transition)
      .select("text")
        .text(name(d));

    var g1 = svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d.children)
      .enter().append("g");

    g.filter(function(d) { return d.children; })
        .classed("children", true)
        .on("click", transition);

    g.selectAll(".child")
        .data(function(d) { return d.children || [d]; })
      .enter().append("rect")
        .attr("class", "child")
        .call(rect);

    g.append("rect")
        .attr("class", "parent")
        .call(rect)
      .append("title")
        .text(function(d) { return formatNumber(d.value); });

    g.append("text")
        .attr("dy", ".75em")
        .text(function(d) { return d.name; })
        .call(text);

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll("text").call(text).style("fill-opacity", 0);
      t2.selectAll("text").call(text).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        svg.style("shape-rendering", "crispEdges");
        transitioning = false;
      });
    }

    return g;
  }

  function text(text) {
    text.attr("x", function(d) { return x(d.x) + 6; })
        .attr("y", function(d) { return y(d.y) + 6; });
  }

  function rect(rect) {
    rect.attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
  }

  function name(d) {
    return d.parent
        ? name(d.parent) + "." + d.name
        : d.name;
  }
});


}; // end loadZoomableTree

var success = function(budget) {
  /*
  var budget = {
    funds: getFunds(data),
    depts: getDepts(data),
    costCenters: getCostCenters(data),
    accounts: getAccounts(data)
  };
  */

  //$('#foo').html(JSON.stringify(data, null, 2));
  //document.write(JSON.stringify(budget));
  
  //buildSearchBar(budget);
  //loadTree(budget);
  loadZoomableTree();
};

var fetchData = function() {
  $.ajax('data/fy2009-adopted-budget2.json', {
    dataType: 'json',
    success: success
  });
};

var init = function() {
  fetchData();
};
$(document).ready(init);

})();