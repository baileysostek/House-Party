party_data = {

  "description":"Welcome to a representation of Dylans House",
  "rooms":[{
    "Dining Room":{
      "floor":"First Floor",
      "data":{"id": "dining"},
      "objects":{
        "table":{
          "imobile":true
        },
        "chair":{
        }
      }
    },
    "Bathroom":{
      "nsfw":true,
      "user_limit":3,
      "data":{"id": "bathroom"},
      "entry_permission":{
        "rule":"FIRST_OCCUPANT",
        "meta":{
          "try_entry_message":"Knock Knock Knock",
          "entry_message":"scoots over and makes some room...",
          "denied_message":"There is no response."
        }
      }
    },
    "Closet":{
      "nsfw":true,
      "user_limit":2,
      "data":{"id": "closet"},
      "entry_permission":{
        "rule":"FIRST_OCCUPANT",
        "meta":{
          "try_entry_message":"Knock Knock Knock",
          "entry_message":"scoots over and makes some room...",
          "denied_message":"There is no response."
        }
      }
    },
    "Kitchen":{

    },
    "Living Room":{

    },
    "Dylans Bedroom":{
      "data": {"id": "dylanbed"}
    },
    "Rachels Bedroom":{
      "data": {"id": "rachelbed"},
      "entry_permission":{
        "rule":"HAS_ROLE",
        "meta":{
          "role":"sober",
          "entry_message":"You are allowed to enter",
          "denied_message":"In order to enter this room you need to be sober."
        }
      }
    },
    "Pongos Bedroom":{

    },
    "Stairs":{
      "data": {"id": "stairs"},
    }
  }],
  "edges": [
    {"data": {"id": "1", "source":"dining", "target": "bathroom"}},
    {"data": {"id": "2", "source":"dining", "target": "closet"}},
    {"data": {"id": "3", "source":"bathroom", "target": "closet"}},
    {"data": {"id": "4", "source":"stairs", "target": "dining"}},
    {"data": {"id": "5", "source":"stairs", "target": "closet"}},
    {"data": {"id": "6", "source":"stairs", "target": "bathroom"}},
    {"data": {"id": "7", "source":"stairs", "target": "rachelbed"}},
    {"data": {"id": "8", "source":"stairs", "target": "dylanbed"}},
    {"data": {"id": "9", "source":"dylanbed", "target": "rachelbed"}}
  ],
  "roles":[
    "Drunk",
    "Sober",
    "High"
  ]
}