/* global fetch, cytoscape, document, window, require */
const api = require("./api.js");

let cytoscape = require('cytoscape');
let cola = require('cytoscape-cola');
let cxtmenu = require('cytoscape-cxtmenu');
let cxtmenu2 = require('cytoscape-context-menus');
let edgehandles = require('cytoscape-edgehandles');

cytoscape.use(cola); 


(function(){
  var toJson = function(res){
    return res.json();
  };

  request('getRoomsAndEdges', [], (party_data) => {

    saveToConfigFile(party_data, (data) => {
      console.log("Save response:", data);
    });

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
        },
        {
          selector: '.eh-handle',
          style: {
            'background-color': 'red',
            'width': 3,
            'height': 3,
            'shape': 'ellipse',
            'overlay-opacity': 0,
            'border-width': 4, // makes the handle easier to hit
            'border-opacity': 0
          }
        },

        {
          selector: '.eh-hover',
          style: {
            'background-color': 'red'
          }
        },

        {
          selector: '.eh-source',
          style: {
            'border-width': 2,
            'border-color': 'red'
          }
        },

        {
          selector: '.eh-target',
          style: {
            'border-width': 2,
            'border-color': 'red'
          }
        },

        {
          selector: '.eh-preview, .eh-ghost-edge',
          style: {
            'background-color': 'red',
            'line-color': 'red',
            'target-arrow-color': 'red',
            'source-arrow-color': 'red'
          }
        },

        {
          selector: '.eh-ghost-edge.eh-preview-active',
          style: {
            'opacity': 0
          }
        }
      ],

      elements: graphdata
    });
    // cyto.cxtmenu({
		// 			selector: 'node, edge',

		// 			commands: [

		// 				{
		// 					content: 'Update',
		// 					select: function(ele){
		// 						console.log( ele.position() );
		// 					}
    //         },
    //         {
		// 					content: 'Remove',
		// 					select: function(ele){
		// 						console.log( ele.position() );
		// 					}
    //         },
    //         {
		// 					content: 'Lock',
		// 					select: function(ele){
		// 						console.log( ele.position() );
		// 					}
    //         },
		// 			]
    //     });
    var instance = cyto.contextMenus({
      menuItems: [
        {
          id: 'remove',
          content: 'remove',
          tooltipText: 'remove',
          image: {src: "assets/remove.svg", width: 12, height: 12, x: 6, y: 4},
          selector: 'node, edge',
          onClickFunction: function (event) {
            var target = event.target || event.cyTarget;
            removed = target.remove();

            contextMenu.showMenuItem('undo-last-remove');
          },
          hasTrailingDivider: true
        },
        {
          id: 'undo-last-remove',
          content: 'undo last remove',
          selector: 'node, edge',
          show: false,
          coreAsWell: true,
          onClickFunction: function (event) {
            if (removed) {
              removed.restore();
            }
            contextMenu.hideMenuItem('undo-last-remove');
          },
          hasTrailingDivider: true
        },
        {
          id: 'color',
          content: 'change color',
          tooltipText: 'change color',
          selector: 'node',
          hasTrailingDivider: true,
          submenu: [
            {
              id: 'color-blue',
              content: 'blue',
              tooltipText: 'blue',
              onClickFunction: function (event) {
                let target = event.target || event.cyTarget;
                target.style('background-color', 'blue');
              },
              submenu: [
                {
                  id: 'color-light-blue',
                  content: 'light blue',
                  tooltipText: 'light blue',
                  onClickFunction: function (event) {
                    let target = event.target || event.cyTarget;
                    target.style('background-color', 'lightblue');
                  },
                },
                {
                  id: 'color-dark-blue',
                  content: 'dark blue',
                  tooltipText: 'dark blue',
                  onClickFunction: function (event) {
                    let target = event.target || event.cyTarget;
                    target.style('background-color', 'darkblue');
                  },
                },
              ],
            },
            {
              id: 'color-green',
              content: 'green',
              tooltipText: 'green',
              onClickFunction: function (event) {
                let target = event.target || event.cyTarget;
                target.style('background-color', 'green');
              },
            },
            {
              id: 'color-red',
              content: 'red',
              tooltipText: 'red',
              onClickFunction: function (event) {
                let target = event.target || event.cyTarget;
                target.style('background-color', 'red');
              },
            },
          ]
        },
        {
          id: 'add-node',
          content: 'add node',
          tooltipText: 'add node',
          image: {src: "assets/add.svg", width: 12, height: 12, x: 6, y: 4},
          coreAsWell: true,
          onClickFunction: function (event) {
            var data = {
              group: 'nodes'
            };

            var pos = event.position || event.cyPosition;

            cy.add({
              data: data,
              position: {
                x: pos.x,
                y: pos.y
              }
            });
          }
        },
        {
          id: 'select-all-nodes',
          content: 'select all nodes',
          selector: 'node',
          coreAsWell: true,
          show: true,
          onClickFunction: function (event) {
            selectAllOfTheSameType('node');

            contextMenu.hideMenuItem('select-all-nodes');
            contextMenu.showMenuItem('unselect-all-nodes');
          }
        },
        {
          id: 'unselect-all-nodes',
          content: 'unselect all nodes',
          selector: 'node',
          coreAsWell: true,
          show: false,
          onClickFunction: function (event) {
            unselectAllOfTheSameType('node');

            contextMenu.showMenuItem('select-all-nodes');
            contextMenu.hideMenuItem('unselect-all-nodes');
          }
        },
        {
          id: 'select-all-edges',
          content: 'select all edges',
          selector: 'edge',
          coreAsWell: true,
          show: true,
          onClickFunction: function (event) {
            selectAllOfTheSameType('edge');

            contextMenu.hideMenuItem('select-all-edges');
            contextMenu.showMenuItem('unselect-all-edges');
          }
        },
        {
          id: 'unselect-all-edges',
          content: 'unselect all edges',
          selector: 'edge',
          coreAsWell: true,
          show: false,
          onClickFunction: function (event) {
            unselectAllOfTheSameType('edge');

            contextMenu.showMenuItem('select-all-edges');
            contextMenu.hideMenuItem('unselect-all-edges');
          }
        }
      ]
    });
    let eh = cyto.edgehandles();
    window.cy = cyto
  });
})();