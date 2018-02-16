const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");
const request = require("request");
const pokemon = require('pokemon');
const NodeGeocoder = require('node-geocoder');


var options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: config.gmaps,
    formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

client.on('ready', () => {
  console.log('Bot is up');
});

client.on('message', message => {
  if (message.content === '!nests') {
    request.post({url:'https://thesilphroad.com/atlas/getLocalNests.json',
            form: {
                "data[lat1]": 48.19365332412147,
                "data[lng1]": -123.52191989567041,
                "data[lat2]": 48.07503713039793,
                "data[lng2]": -123.33508345940595,
                "data[zoom]": 11.730587536260147,
                "data[mapFilterValues][mapTypes][]": 1,
                "data[mapFilterValues][nestVerificationLevels][]": 1,
                "data[mapFilterValues][nestVerificationLevels][]": 2,
                "data[mapFilterValues][nestTypes][]": -1,
                "data[center_lat]": 48.13437947931877,
                "data[center_lng]": -123.42850167753045
            }
          },
        function(err,httpResponse,body){
            var markers = JSON.parse(body).localMarkers;
            var nestEmbeds = [];

            Object.keys(markers).forEach(function(id) {
                var marker = markers[id];
                // TODO: fix this so that it doesn't fail to return data if geocoding fails
                // Note: geocoding does fail!
                geocoder.reverse({lat: marker.lt, lon:marker.ln}, function(err, res) {
                    var mapUrl = "https://www.openstreetmap.org/?mlat=" + marker.lt +  "&mlon=" + marker.ln + "#map=15/" + marker.lt + "/" + marker.ln;
                    var silphUrl = "[Silph Road](https://thesilphroad.com/atlas#15.00/" + marker.lt + "/" + marker.ln + ")";
                    var pokemonUrl = "poke https://assets.thesilphroad.com/img/pokemon/icons/96x96/" + marker.pokemon_id + ".png";
                    nestEmbeds.push(
                        {
                            "name": res[0].formattedAddress,
                            "value": "\n\n" + pokemon.getName(marker.pokemon_id) + "\n\n[Google Maps](" + mapUrl + ") " + "\n" + silphUrl
                        }
                    );

                    if (nestEmbeds.length == Object.keys(markers).length) {
                        var data =  {
                            "title":  "Local Nests",
                            "description": "This is the list of local nests, as reported to users at the silph road atlas.  These may be out of date, if so, please [update them](https://thesilphroad.com/atlas#12.13/48.1219/-123.4148)!",
                            "fields": nestEmbeds
                        };

                        var messageContent = new Discord.RichEmbed(data);
                        message.channel.send(messageContent);
                    }
                });

            });


        });
   };
});

client.login(config.token);
