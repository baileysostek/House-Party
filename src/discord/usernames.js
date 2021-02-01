
let CLIENT;

module.exports = {
  initialize : function(client){
    this.CLIENT = client;
  },

  getUsernameFromID: function(userID){
    let userData = this.CLIENT.guilds.cache.get('793673031292682272').members.cache.get(userID).user;
    return userData.username;
  },

  getIDFromUsername: function(username){
    for(let userObject of this.CLIENT.guilds.cache.get('793673031292682272').members.cache){
      let user = userObject[1].user;
      console.log("User Check me!:" , user.username, "=?", username);
      if(user.username === username){
        console.log(user.id);
        return user.id;
      }
    }
    return null;
  }
}
