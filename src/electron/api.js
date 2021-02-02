// In renderer process (web page).
const { ipcRenderer } = require('electron')
// console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

let CALLBACKS = [];
let id = 0;

ipcRenderer.on('api-response', (event, returnData) => {
  console.log("response:", returnData);
  if(typeof CALLBACKS[returnData[1]] === 'function'){
    CALLBACKS[returnData[1]](returnData[0]);
    delete CALLBACKS[returnData[1]];
  }
});

function request(endpoint, args = [], callback = defaultCallback){
  if(!Array.isArray(args)){
    args = [args];
  }else{
    if(args.length == 0){
      args[0] = "";
    }
  }

  let callbackID = id++;

  args.push(callbackID);

  ipcRenderer.send(endpoint, args);
  CALLBACKS[callbackID] = callback;

  console.log("ping:", CALLBACKS);
}

function defaultCallback(returnValue){
  console.log("Retuned:", returnValue);
}