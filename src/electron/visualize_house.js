/* global fetch, cytoscape, document, window, require */
const api = require("./api.js");

let cytoscape = require('cytoscape');
let cola = require('cytoscape-cola');

cytoscape.use(cola); 
//contextMenus(cytoscape);
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
    let cyto = cytoscape({
      container: document.getElementById('cy'),

      layout: {
        name: 'cola',
      },

      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(name)',
            'width': 10,
            'height': 10
          }
        },
    
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'none',
            'curve-style': 'bezier'
          }
        }
      ],

      elements: graphdata
    });
    window.cy = cyto
  });
})();