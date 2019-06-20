var helper = require ('./code/helper');

var express    = require('express');   
var bodyParser = require('body-parser');
var uuidv1 = require('uuid/v1');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('result'));

var port = process.env.PORT || 8080;        // set port
var router = express.Router();              // get instance of express Router

router.post('/', function(req, res) {
    var intent = req.body.queryResult.intent['displayName'];
    var pokemon = req.body.queryResult.parameters['pokemon'];
    var data = helper.getData(
        url = 'https://pokeapi.co/api/v2/pokemon/' + pokemon.charAt(0).toLowerCase() + pokemon.slice(1));

    var uniID = uuidv1();
    helper.createGif(intent, data, uniID);
    var image = 'https://pokehook.azurewebsites.net/final'+uniID+'.gif';

    var output = '';
    switch(intent){
        case "Abilities": output = pokemon+" has the Ability '"+data.abilities[0].ability.name+"'."; break;
        case "Height": output = pokemon+" is "+data.height+" feet tall."; break;
        case "Index": output = pokemon + "'s pokedex-index is " + data.id + "."; break;
        case "Index mit Context": output = pokemon + "'s pokedex-index is " + data.id + "."; break;
        case "First Appearance": output = pokemon + " first appeared in version " + data.game_indices[data.game_indices.length-1].version.name + "."; break;
        case "Shiny": output = " this is what " + pokemon + " in shiny looks like. "; break;
        case "PokedexEntry": 
            var datadex = helper.getData(
                url = 'https://pokeapi.co/api/v2/pokemon-species/' + pokemon);   
            i = 0;
            while (i < 50){
                if(datadex.flavor_text_entries[i].language.name == 'en'){
                    output = "The Pokedex Entry of " + pokemon + " is called " + datadex.flavor_text_entries[i].flavor_text; 
                    break;
                }
                i = i +1;
            }   
        break; 
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
            if(data.types.length == 1){
                var typedata = helper.getData(url = 'https://pokeapi.co/api/v2/type/' + data.types[0].type.name);
                if(typedata.damage_relations.double_damage_to.length != 0){
                    output = pokemon + " gives double damage to ";
                    var i = 0;
                    while (i < typedata.damage_relations.double_damage_to.length) {
                        output = output + typedata.damage_relations.double_damage_to[i].name + ", ";
                        i = i +1;
                    } 
                    output = output.substr(0, output.length-2);
                    var pos = output.lastIndexOf(',');
                    output = output.substring(0, pos) + ' and' + output.substring(pos+1);
                } else {
                    output = "wtf... " + pokemon + " gives no double damage to anybody";   
                }
            } else if(data.types.length == 2){
                var typedata_one = helper.getData(url = 'https://pokeapi.co/api/v2/type/' + data.types[0].type.name);
                var typedata_two = helper.getData(url = 'https://pokeapi.co/api/v2/type/' + data.types[1].type.name);
                output = pokemon + " gives double damage to ";
                var no_response = false;
                var i = 0;
                while (i < typedata_one.damage_relations.double_damage_to.length) {
                    output = output + typedata_one.damage_relations.double_damage_to[i].name + ", ";
                    i = i +1;
                } 
                if (i == 0) {
                    var no_response = true;
                }
                i = 0;
                while (i < typedata_two.damage_relations.double_damage_to.length) {
                    if(output.indexOf(typedata_two.damage_relations.double_damage_to[i].name) == -1){
                    output = output + typedata_two.damage_relations.double_damage_to[i].name + ", ";
                    } i = i +1;
                } 
                if (i == 0) {
                    var no_response = true;
                }
                if (no_response == true){
                    output = "wtf... " + pokemon + " gives no double damage to anybody";
                } else {
                    output = output.substr(0, output.length-2);
                    var pos = output.lastIndexOf(',');
                    output = output.substring(0, pos) + ' and' + output.substring(pos+1);
                }
            } else {
                output = "wtf... " + pokemon + " gives no double damage to anybody";
            }
            break;            
        default: output = "No Intent parsed"; break;
        }
        
        res.json(helper.createResponse(image, pokemon, output));
});

app.use('/api', router);

// START THE SERVER
app.listen(port);
console.log('Started Server on Port: ' + port);
