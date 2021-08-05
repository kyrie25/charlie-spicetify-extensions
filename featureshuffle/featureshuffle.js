//@ts-check

// NAME: Feature Shuffle
// AUTHOR: CharlieS1103
// DESCRIPTION: Create a playlist based on the average features of a playlist

/// <reference path="../globals.d.ts" />

(function songstats() {

    const {
        CosmosAsync,
        Player,
        LocalStorage,
        PlaybackControl,
        ContextMenu,
        URI
    } = Spicetify;
    if (!(CosmosAsync && URI)) {
        setTimeout(songstats, 300)
        return
    }


    const buttontxt = "Create Feature Based Playlist"

    const average = (array) => array.reduce((a, b) => a + b) / array.length;

    async function makePlaylist(uris) {
        const uri = uris[0];
        const uriObj = Spicetify.URI.fromString(uri);
        const uriFinal = uri.split(":")[2]

        const user = await CosmosAsync.get('https://api.spotify.com/v1/me')

        const playlistitems = (await CosmosAsync.get('https://api.spotify.com/v1/playlists/' + uriFinal + '/tracks')).items.map(i => i.track.href);






        const avrDanceability = [];

        const avrTempo = [];

        const avrEnergy = [];

        const avrAcousticness = [];

        const avrInstrumentalness = [];

        const avrSpeechiness = [];

        const avrLiveness = [];

        var avr2Dance

        var avr2Tempo

        var avr2Energy

        var avr2Acoustic

        var avr2Intrumentalness

        var avr2Speechiness

        var avr2Liveness
        for (i = 0; i < playlistitems.length; i++) {
            var songuri = playlistitems[i].split("/")[5]
            var res;
            try {
                res = await CosmosAsync.get('https://api.spotify.com/v1/audio-features/' + songuri);
            } catch (error) {
                //e
            }

            avrDanceability.push(Math.round(100 * res.danceability) / 100);

            avrEnergy.push(Math.round(100 * res.energy) / 100);

            avrAcousticness.push(Math.round(100 * res.acousticness) / 100);

            avrInstrumentalness.push(Math.round(100 * res.instrumentalness) / 100);

            avrSpeechiness.push(Math.round(100 * res.speechiness) / 100);

            avrTempo.push(Math.round(100 * res.tempo) / 100);

            avrLiveness.push(Math.round(100 * res.liveness) / 100);
        }


        avr2Dance = average(avrDanceability);

        avr2Acoustic = average(avrAcousticness);

        avr2Tempo = average(avrTempo)

        avr2Energy = average(avrEnergy)

        avr2Intrumentalness = average(avrInstrumentalness)

        avr2Liveness = average(avrLiveness)

        avr2Speechiness = average(avrSpeechiness)



        const randomSongrequest = [];

        for (var i = 0; i < 21; i++) {

            const getRandomSongsArray = ['%25-%25', '-%25', '%25-%25', '-%25', '%25-%25', '-%25', '%25-%25', '-%25'];
            const rndInt = Math.floor(Math.random() * 3) + 1

            var ranSong = getRandomSongsArray[Math.floor(Math.random() * getRandomSongsArray.length)];


            function randAlph(rndInt, ) {

                const alphabet = "abcdefghijklmnopqrstuvwxyz"
                const letters = []

                for (var i = 0; i < rndInt; i++) {
                    const randomletter = alphabet[Math.floor(Math.random() * alphabet.length)]
                    letters.push(randomletter)
                }
                const string = letters.join("")
                return (string)
            }

            const ranString = randAlph(rndInt)

            const getRandomSongs = ranSong.replace("-", ranString)

            const getRandomOffset = Math.floor(Math.random() * (600 - 1 + 1) + 1)

            const url = "https://api.spotify.com/v1/search?q=" + getRandomSongs + '&offset=' + getRandomOffset + "&type=track&limit=1&market=US";

            const randomSongrequestToAppend = (await CosmosAsync.get(url)).tracks.items.map(track => track.uri);






            if (randomSongrequestToAppend[0] != undefined) {

                let res2 = await CosmosAsync.get('https://api.spotify.com/v1/audio-features/' + randomSongrequestToAppend[0].split(":")[2]);

                if (Math.round(100 * res2.liveness) / 100 >= avr2Liveness - 20 && Math.round(100 * res2.liveness) / 100 <= avr2Liveness + 20) {

                    if (res2.tempo >= avr2Tempo - 5 && res2.tempo <= avr2Tempo + 5) {

                        if (Math.round(100 * res2.instrumentalness) / 100 >= avr2Intrumentalness - 20 && Math.round(100 * res2.instrumentalness) / 100 <= avr2Intrumentalness + 20) {

                            if (Math.round(100 * res2.energy) / 100 >= avr2Energy - 20 && Math.round(100 * res2.energy) / 100 <= avr2Energy + 20) {

                                if (Math.round(100 * res2.danceability) / 100 >= avr2Dance - 20 && Math.round(100 * res2.danceability) / 100 <= avr2Dance + 20) {

                                    randomSongrequest.push(randomSongrequestToAppend[0])
                                    console.log("Song passed")
                                } else {

                                    i--
                                }
                            } else {
                                i--

                            }
                        } else {
                            i--

                        }
                    } else {
                        i--

                    }
                } else {
                    i--

                }

            } else {
                i--

            }

        }




        const newplaylist = await CosmosAsync.post('https://api.spotify.com/v1/users/' + user.id + '/playlists', {
            name: 'New Playlist'
        });

        const playlisturi = newplaylist.uri.split(":")[2]

        const addToPlaylist = CosmosAsync.post('https://api.spotify.com/v1/playlists/' + playlisturi + '/tracks', {
            uris: randomSongrequest
        });


    }

    function shouldDisplayContextMenu(uris) {

        if (uris.length > 1) {
            return false;
        }

        const uri = uris[0];
        const uriObj = Spicetify.URI.fromString(uri);


        if (uriObj.type === Spicetify.URI.Type.PLAYLIST_V2) {
            return true;
        }

        return false;
    }


    const cntxMenu = new Spicetify.ContextMenu.Item(

        buttontxt,
        makePlaylist,
        shouldDisplayContextMenu,

    );

    cntxMenu.register();
})();