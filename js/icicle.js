var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

var RED = '#f76e4a';
var GREEN = '#7aba7f';

// returns an array of object keys
var keys = function(obj) {
  var arr = [];
  for (var i in obj) {
    if (obj.hasOwnProperty(i) !== true) continue;
    arr.push(i);
  }
  return arr;
};

var icicle;

var buildTreemap = function(data) {
  // icicle chart options
  var opts = {
    // id of the visualization container
    injectInto: 'chart_container',

    // whether to add transition animations
    animate: animate,

    // nodes offset
    offset: 1,

    // whether to add cushion type nodes
    cushion: false,

    // do not show all levels at once
    constrained: true,
    levelsToShow: 4,


    // enable tips
    Tips: {
      enable: true,
      type: 'Native',
      // add positioning offsets
      offsetX: 20,
      offsetY: 20,
      // implement the onShow method to
      // add content to the tooltip when a node
      // is hovered
      onShow: function(tip, node){
        // count children
        var count = 0;
        node.eachSubnode(function(){
          count++;
        });
        // add tooltip info
        tip.innerHTML = "<div class=\"tip-title\"><b>Name:</b> "
            + node.name + "</div><div class=\"tip-text\">" + count
            + " children</div>";
      }
    },

    // Add events to nodes
    Events: {
      enable: true,
      onClick: function(node){
        if (node) {
          //hide tips
          icicle.tips.hide();
          // perform the enter animation
          icicle.enter(node);
        }
      },
      onRightClick: function(){
        //hide tips
        icicle.tips.hide();
        // perform the out animation
        icicle.out();
      }
    },
    
    // Add canvas label styling
    Label: {
      type: labelType, // "Native" or "HTML"
      color: '#333',
      style: 'bold',
      size: 12
    },

    // Add the name of the node in the corresponding label
    // This method is called once, on label creation and only for DOM and
    // not
    // Native labels.
    onCreateLabel: function(domElement, node){
      domElement.innerHTML = node.name;
      var style = domElement.style;
      style.fontSize = '0.9em';
      style.display = '';
      style.cursor = 'pointer';
      style.color = '#333';
      style.overflow = 'hidden';
    },

    // Change some label dom properties.
    // This method is called each time a label is plotted.
    onPlaceLabel: function(domElement, node){
      var style = domElement.style, width = node.getData('width'), height = node
          .getData('height');
      if (width < 7 || height < 7) {
        style.display = 'none';
      } else {
        style.display = '';
        style.width = width + 'px';
        style.height = height + 'px';
      }
    }
  };

  icicle = new $jit.Icicle(opts);

  // load data
  icicle.loadJSON(data);
  
  // compute positions and plot
  icicle.refresh();

}; // end buildTreemap

/*
var addEvents = function() {
  var jit = $jit;
  var gotoparent = jit.id('update');
  jit.util.addEvent(gotoparent, 'click', function() {
    icicle.out();
  });

  var select = jit.id('s-orientation');
  jit.util.addEvent(select, 'change', function () {
    icicle.layout.orientation = select[select.selectedIndex].value;
    icicle.refresh();
  });

  var levelsToShowSelect = jit.id('i-levels-to-show');
  jit.util.addEvent(levelsToShowSelect, 'change', function () {
    var index = levelsToShowSelect.selectedIndex;
    if(index == 0) {
      icicle.config.constrained = false;
    } else {
      icicle.config.constrained = true;
      icicle.config.levelsToShow = index;
    }
    icicle.refresh();
  });
};
*/

var buildDepartments = function(data) {
  var departments = [];

  for (var i in data.depts) {
    departments.push({
      id: "Department " + i,
      name: i + " - " + data.depts[i].deptName,
      data: {
        '$area': (data.depts[i].revenue + data.depts[i].expenses),
        '$dim': (data.depts[i].revenue + data.depts[i].expenses),
        '$color': (data.depts[i].revenue > data.depts[i].expenses) ? GREEN : RED
      }
    });
  }

  return departments;
};

// returns an array of Funds for the data structure that InfoVis is expecting
var buildFunds = function(data) {
  var funds = [];

  for (var i in data.funds) {
    funds.push({
      id: "Fund " + i,
      name: i + " - " + data.funds[i].name,
      data: {
        '$area': data.funds[i].value,
        '$dim': data.funds[i].value
      },
      //children: buildDepartments(data)
    });
  }

  return funds;
};

// convert budget data to the graph that InfoVis is expecting
var convertBudget = function(data) {
  // add totals to the departments
  for (var i = 0; i < data.accounts.length; i++) {
    var deptNum = data.accounts[i].deptNum;

    if (typeof data.depts[deptNum] === 'string') {
      data.depts[deptNum] = {
        deptNum: deptNum,
        deptName: data.depts[deptNum],
        expenses: 0,
        revenue: 0
      };
    }

    if (data.accounts[i].acctNum.search(/^4/) !== -1) {
      data.depts[deptNum].revenue += data.accounts[i].value;
    }
    else {
      data.depts[deptNum].expenses += data.accounts[i].value;
    }
  }

  /*
  // add totals to the funds object
  for (var i = 0; i < data.accounts.length; i++) {
    var fundNum = data.accounts[i].fundNum;

    if (typeof data.funds[fundNum] === 'string') {
      data.funds[fundNum] = {
        name: data.funds[fundNum],
        value: 0
      };
    }

    data.funds[fundNum].value += Math.abs(data.accounts[i].value);
  }
  */

  var tree = {
    id: "root",
    name: "Fiscal Year 2009",
    children: buildDepartments(data)
  };

  console.log(tree);

  return tree;
};

var success = function(budget) {
  buildTreemap(convertBudget(budget));
};

var fetchData = function() {
  $.ajax('data/fy2009-adopted-budget2.json', {
    dataType: 'json',
    success: success
  });
};
$(document).ready(fetchData);