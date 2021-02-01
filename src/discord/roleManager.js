
let CLIENT;

module.exports = {

  MAP_ID_TO_ROLE:[],
  MAP_ROLE_TO_ID:[],
  MAP_ROLE_UPPERCASE_TO_ID:[],

  initialize : function(client){
    this.CLIENT = client;

    //When the client loads
    client.on('ready', () => {
      //Query the client / traverse returned object to get all roles on this server. 
      let serverRoles = this.CLIENT.guilds.cache.get('793673031292682272').roles.cache;
      //For each roll
      for(let role of serverRoles){
        //Map the ID of the role to the name of the role.
        this.MAP_ID_TO_ROLE[role[0]] = role[1].name;
        //Map the name of the role to its ID.
        this.MAP_ROLE_TO_ID[role[1].name] = role[0];
        this.MAP_ROLE_UPPERCASE_TO_ID[role[1].name.toUpperCase()] = role[0];
      }
    });
  },

  //Globally accessable function to see if userID has role "role"
  userHasRole: function(userID, role){
    //Get all roles this user has.
    let userRoles = this.CLIENT.guilds.cache.get('793673031292682272').members.cache.get(userID)._roles;

    //Get the RoleID for the passed role name
    let roleID = this.MAP_ROLE_UPPERCASE_TO_ID[role.toUpperCase()];

    //IF we found something
    if(roleID){
      //IF the user has that role
      if(userRoles.includes(roleID)){
        //return true
        return true;
      }
    }
    return false;
  }
}