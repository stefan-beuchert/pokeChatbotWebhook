var express    = require('express');   
var bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var app        = express();

app.use(basicAuth({
    users: { 
        admin: 'chatbots_ss19',
    },
    challenge: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set port
var router = express.Router();              // get instance of express Router

router.post('/', function(req, res) {
    var request = new XMLHttpRequest()
    var intent = req.body.queryResult.intent['displayName'];
    var pokemon = req.body.queryResult.parameters['pokemon'];
    pokemon = pokemon.charAt(0).toLowerCase() + pokemon.slice(1);
    request.open('GET', 'https://pokeapi.co/api/v2/pokemon/'+pokemon+'/', true)
  
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(this.responseText)
        pokemon = pokemon.charAt(0).toUpperCase() + pokemon.slice(1);
        var output = '';
        switch(intent){
          case "Abilities": output = pokemon+" has the Ability '"+data.abilities[0].ability.name+"'."; break;
          case "Height": output = pokemon+" is "+data.height+" meters tall."; break;
          default: output = "No Intent parsed"; break;
        }
      } else {
        output = "There is no Pokemon with the name "+pokemon+". Check your damn Pokedex!";
        }
        // res.json({ fulfillmentText: output});
        res.json({
                "payload": {
                  "google": {
                    "expectUserResponse": true,
                    "richResponse": {
                      "items": [
                        {
                          "simpleResponse": {
                            "textToSpeech": "This is a basic card example."
                          }
                        },
                        {
                          "basicCard": {
                            "title": "Title: this is a title",
                            "subtitle": "This is a subtitle",
                            "formattedText": output,
                            "image": {
                              "url": "https://example.com/image.png",
                              "accessibilityText": "Image alternate text"
                            },
                            "buttons": [
                              {
                                "title": "This is a button",
                                "openUrlAction": {
                                  "url": "https://assistant.google.com/"
                                }
                              }
                            ],
                            "imageDisplayOptions": "CROPPED"
                          }
                        }
                      ]
                    }
                  }
                }
        })
    }
    request.send()
});

app.use('/api', router);

// START THE SERVER
app.listen(port);
console.log('Started Server on Port: ' + port);