var express    = require('express');   
var bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var Jimp = require('jimp');
var GIFEncoder = require('gifencoder');
var fs = require('fs');

var app = express();

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

        // var image = data.sprites.front_default;
        // var image = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/23c3b120-e209-4850-9d73-af3fe703e962/dcybyvi-e4924343-e5dd-4e04-826c-8a9287f92c0c.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzIzYzNiMTIwLWUyMDktNDg1MC05ZDczLWFmM2ZlNzAzZTk2MlwvZGN5Ynl2aS1lNDkyNDM0My1lNWRkLTRlMDQtODI2Yy04YTkyODdmOTJjMGMuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.PDmy73FKHdsz9fbaJwJf1m4kQi3QgHcGRt1jpgWgSi8';

        var encoder = new GIFEncoder(921, 506);
        encoder.createReadStream().pipe(fs.createWriteStream('./result/final.gif'));

        encoder.start();
        encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat 
        encoder.setDelay(200);  // frame delay in ms 
        encoder.setQuality(10); // image quality. 10 is default. 

        function processFrame(background, pkmn){
            Jimp.read(pkmn, (err, riolu) => {
                if (err) throw err;
                riolu
                .resize(100,100)
                Jimp.read(background, (err, oak) => {
                    if (err) throw err;
                    oak.composite(riolu, 500, 100);
                    encoder.addFrame(oak.bitmap.data)
                });
            });
        }

        for(i=0;i<10;++i){
          processFrame('./resources/oak_0'+i+'.png', './resources/riolu.png')
        }

        var image = 'http://pokehook.azurewebsites.net/api/img'

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

router.get('/img.png', function(req, res) {
      // res.header("Content-Type", "image/png");
      res.sendFile('./result/riolu.png');
});

app.use('/api', router);

// START THE SERVER
app.listen(port);
console.log('Started Server on Port: ' + port);