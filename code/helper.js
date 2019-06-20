var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var Jimp = require('jimp');
var GIFEncoder = require('gifencoder');
var fs = require('fs');

module.exports =  {
    getData: function(url){

        var res;

        var request = new XMLHttpRequest();
        request.open('GET', url + '/', false);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                var data = JSON.parse(this.responseText)
                return data;
            }
            else{
                throw new Error("Fehler beim Abrufen der Daten von " + url);
            }
        }

        request.send();
        return request.onload();
    },

    createGif: function(intent, data, uniID){
        var encoder = new GIFEncoder(400, 250);
        encoder.createReadStream().pipe(fs.createWriteStream('./result/'+uniID+'.gif'));
    
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
        if (intent === "Shiny"){
            processFrame('./resources/oak_00.png', data.sprites.front_shiny, 500, 75)
            processFrame('./resources/oak_01.png', data.sprites.front_shiny, 500, 75)
            processFrame('./resources/oak_02.png', data.sprites.front_shiny, 490, 80)
            processFrame('./resources/oak_03.png', data.sprites.front_shiny, 490, 80)
        }
        else{
            processFrame('./resources/oak_00.png', data.sprites.front_default, 500, 75)
            processFrame('./resources/oak_01.png', data.sprites.front_default, 500, 75)
            processFrame('./resources/oak_02.png', data.sprites.front_default, 490, 80)
            processFrame('./resources/oak_03.png', data.sprites.front_default, 490, 80)
        }
    },

    createResponse : function(image, pokemon, output){
        return {
            "fulfillmentText": output,
            "fulfillmentMessages": [{
                "card": {
                  "title": output,
                  "imageUri": image
                }
            }],
            "payload": {
                "google": {
                  "expectUserResponse": true,
                  "richResponse": {
                    "items": [{
                            "simpleResponse": {
                                "textToSpeech": output
                            }
                        },
                        {
                            "basicCard": {
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
        }
    }
}

