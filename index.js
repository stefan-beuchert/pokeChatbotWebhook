var express    = require('express');   
var bodyParser = require('body-parser');

var app        = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port
var router = express.Router();              // get an instance of the express Router

router.get('/', function(req, res) {
    res.json({ fulfillmentText: 'hooray! welcome to our api!' });
});

router.post('/', function(req, res) {
    res.json({ fulfillmentText: 'hooray! welcome to our api! -->POST' });
});

app.use('/api', router);

// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);



// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// var request = new XMLHttpRequest()

// module['exports'] = function whatthefuck (hook) {  //Funktionsname ändern wenn komischer Fehler auftritt
//   var intent = hook.req.body.queryResult.intent['displayName'];
//   var pokemon = hook.req.body.queryResult.parameters['pokemon'];
//   pokemon = pokemon.charAt(0).toLowerCase() + pokemon.slice(1);
//   request.open('GET', 'https://pokeapi.co/api/v2/pokemon/'+pokemon+'/', true)

//   request.onload = function() {
//     if (request.status >= 200 && request.status < 400) {
//       var data = JSON.parse(this.responseText)
//       pokemon = pokemon.charAt(0).toUpperCase() + pokemon.slice(1);
//       var output = '';
//       switch(intent){
//         case "Abilities": output = pokemon+" has the Ability '"+data.abilities[0].ability.name+"'."; break;
//         case "Height": output = pokemon+" is "+data.height+" meters tall."; break;
//         default: output = "No Intent parsed"; break;
//       }
//     } else {
//       output = "There is no Pokemon with the name "+pokemon+". Check your damn Pokedex!";
//       }
//     hook.res.json({"fulfillmentText": output});
//     hook.res.end();
//   }
//   request.send()
// }