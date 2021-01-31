/* global fetch, cytoscape, document, window, require */

(function(){
  var toJson = function(res){ return res.json(); };
    window.cy = cytoscape({
      container: document.getElementById('cy'),
  
      layout: {
        name: 'grid',
        cols: 3
      },
  
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(id)'
          }
        },
    
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],
  
      elements: fetch('test.json').then(toJson)
    });
  })();