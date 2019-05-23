var helper = require ('./code/helper');

var express    = require('express');   
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('result'));

var port = process.env.PORT || 8080;        // set port
var router = express.Router();              // get instance of express Router

router.post('/', function(req, res) {
    var intent = req.body.queryResult.intent['displayName'];
    var pokemon = req.body.queryResult.parameters['pokemon'];
    pokemon = pokemon.charAt(0).toLowerCase() + pokemon.slice(1);

    var data = helper.getData(
        url = 'https://pokeapi.co/api/v2/pokemon/' + pokemon);

    helper.createGif(intent, data);
        var image = 'https://pokehook.azurewebsites.net/final.gif';

    var output = '';
    switch(intent){
        case "Abilities": output = pokemon+" has the Ability '"+data.abilities[0].ability.name+"'."; break;
        case "Height": output = pokemon+" is "+data.height+" feet tall."; break;
        case "Index": output = pokemon + "'s pokedex-index is " + data.id + "."; break;
        case "First Appearance": output = pokemon + " first appeared in version " + data.game_indices[data.game_indices.length-1].version.name + "."; break;
        case "Shiny": output = " this is what " + pokemon + " in shiny looks like. "; break;
        case "PokedexEntry": 
          case "PokedexEntry":
        case "PokedexEntry":
            var data = helper.getData(
                url = 'https://pokeapi.co/api/v2/pokemon-species/' + pokemon);            
            output = "The Pokedex Entry of " + pokemon + " is called " + data.flavor_text_entries[0].flavor_text; break;
        case "Type": 
          case "Type": 
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
        case "Succesful": 
          case "Succesful": 
        case "Succesful": 
            var requesttype = new XMLHttpRequest()
            requesttype.open('GET', data.types[0].type.url, true)
            requesttype.onload = function() {
                if (requesttype.status >= 200 && requesttype.status < 400) {
                    var datatype = JSON.parse(this.responseText)
                    output = pokemon + " is most succesful against type " + datatype.damage_relations.double_damage_to[0].name;
                } else {
                    output = pokemon + " is not succesful.";
                }
            }
            requesttype.send() 
                requesttype.send() 
            requesttype.send() 
            break;
        
        
            
            
            
        default: output = "No Intent parsed"; break;
        }
        
        res.json(helper.createResponse(image, pokemon, output));
});

app.use('/api', router);

// START THE SERVER
app.listen(port);
console.log('Started Server on Port: ' + port);