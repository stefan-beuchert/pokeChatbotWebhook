var Jimp = require('jimp');
var GIFEncoder = require('gifencoder');
var fs = require('fs');

var encoder = new GIFEncoder(921, 506);
encoder.createReadStream().pipe(fs.createWriteStream('./resources/final.gif'));

encoder.start();
encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat 
encoder.setDelay(200);  // frame delay in ms 
encoder.setQuality(10); // image quality. 10 is default. 

export function processFrame(background, pkmn){
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