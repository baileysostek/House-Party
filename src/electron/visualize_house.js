/* global fetch, cytoscape, document, window, require */
const api = require("./api.js");

(function(){
  var toJson = function(res){
    return res.json();
  };
  
  request('getRoomsAndEdges', [], (party_data) => {

    let graphdata = [];
    Object.entries(party_data.rooms).forEach(([key, value]) => {
        if(value.hasOwnProperty('data')){
          console.log(`${key} ${value.data}`);
          graphdata.push({'data':value.data});
        }
    });
    console.log('-------------------');

    for(edge of party_data.edges){
      graphdata.push(edge);
    }
    console.log(graphdata);
    // var data = JSON.parse(document.getElementById('graphdata')); 
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
            'target-arrow-shape': 'none',
            'curve-style': 'bezier'
          }
        }
      ],

      elements: graphdata
    });
  });
})();