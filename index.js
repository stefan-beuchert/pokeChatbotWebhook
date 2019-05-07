var express    = require('express');   
var bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var Jimp = require('jimp');
var GIFEncoder = require('gifencoder');
var fs = require('fs');

var app = express();

// app.use(basicAuth({
//     users: { 
//         admin: 'chatbots_ss19',
//     },
//     challenge: true
// }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('result'));

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

        var encoder = new GIFEncoder(400, 250);
        encoder.createReadStream().pipe(fs.createWriteStream('./result/final.gif'));

        encoder.start();
        encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat 
        encoder.setDelay(200);  // frame delay in ms 
        encoder.setQuality(1); // image quality. 10 is default. 

        function processFrame(background, pkmn, move1, move2){
            Jimp.read(pkmn, (err, pkmn) => {
                if (err) throw err;
                pkmn
                .scale(4.5)
                Jimp.read(background, (err, background) => {
                    if (err) throw err;
                    background
                    .composite(pkmn, move1, move2)
                    .resize(400,250);
                    encoder.addFrame(background.bitmap.data)
                });
            });
        }

        processFrame('./resources/oak_00.png', data.sprites.front_default, 500, 75)
        processFrame('./resources/oak_01.png', data.sprites.front_default, 500, 75)
        processFrame('./resources/oak_02.png', data.sprites.front_default, 490, 80)
        processFrame('./resources/oak_03.png', data.sprites.front_default, 490, 80)


        // Jimp.read(data.sprites.front_default, (err, pkmn) => {
        //           if (err) throw err;
        //           pkmn
        //           .resize(100,100)
        //           Jimp.read('./resources/oak_00.png', (err, background) => {
        //               if (err) throw err;
        //               background
        //               .composite(pkmn, 500, 100)
        //               encoder.addFrame(background.bitmap.data)
        //           });
        //       });

        //encoder.finish();

        var image = 'https://pokehook.azurewebsites.net/final.gif'

        pokemon = pokemon.charAt(0).toUpperCase() + pokemon.slice(1);
        var output = '';
        switch(intent){
          case "Abilities": output = pokemon+" has the Ability '"+data.abilities[0].ability.name+"'."; break;
          case "Height": output = pokemon+" is "+data.height+" feet tall."; break;
          case "Index": output = pokemon + "'s pokedex-index is " + data.id + "."; break;
          case "First Appearance": output = pokemon + " first appeared in version " + data.game_indices[0].version.name + "."; break;
          case "Type": 
            if(data.types.length == 1){
                output = pokemon + " is an " + data.types[0].type.name + "-type Pokemon.";
            }
            else if(data.types.length == 2){
                output = pokemon + " is an " + data.types[1].type.name + " and " + data.types[0].type.name + " type pokemon.";
            }
            else{
                output = "wtf... according to the pokedex there is no type for " + pokemon + ".";
            }
             
            break;
          default: output = "No Intent parsed"; break;
        }
      } else {
        output = "There is no Pokemon with the name "+pokemon+". Check your damn Pokedex!";
        }
        res.json({
                "fulfillmentText": output,
                "fulfillmentMessages": [
                  {
                    "card": {
                      "title": output,
                      "imageUri": image
                    }
                  }
                ],
                "payload": {
                    "google": {
                      "expectUserResponse": true,
                      "richResponse": {
                        "items": [
                            {
                                "simpleResponse": {
                                "textToSpeech": output
                                }
                            },
                            {
                                "basicCard": {
                                "title": pokemon,
                                "formattedText": "Picture of a "+pokemon,
                                "image": {
                                    "url": image,
                                    "accessibilityText": "Pokemon Image"
                                }
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