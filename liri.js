"use strict";

var axios = require('axios');
var moment = require('moment');

var app = {
    method: process.argv[2],
    instructHeader: [
        '----------Liri Instructions----------',
        "",
    ],
    instructBIT: [
        "**To Search Bands in Town**",
        "To search Bands in Town enter 'node liri concert-this ' and the band or artist's name.",
        "Ex: 'node liri concert-this the black keys'",
        "",
    ],
    instructOMDB:[
        "**To Search Open Movie Database**",
        "To search OMDB enter 'node liri movie-this ' and the movie name.",
        "Ex: 'node liri movie-this die hard'",
        "",
    ],
    instructSpot:[
        "**To Search Spotify**",
        "To search Spotify enter 'node liri spotify-this-song ' and the song name.",
        "Ex: 'node liri spotify-this-song turn it around'",
        "",
    ],
    liri(){
        switch(app.method){
            case "movie-this":
                app.movie();
                break;
            case "concert-this":
                app.bands();
                break;
            case "spotify-this-song":
                app.spotify();
                break;
            case "help":
            default:
                app.help(this.instructOMDB, this.instructBIT);
                break;
        }
    },
    movie(){
        if (this.getArgs()){

            let movie = this.getArgs();
            let queryUrl = `http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=trilogy`;
    
            axios.get(queryUrl).then(function(response){
                let d = response.data;
                if (d.Response === 'True'){
                    let output = [
                        `Information for '${d.Title}':`,
                        ``,
                        `Title: ${d.Title}`, 
                        `Release Year: ${d.Year}`, 
                        `IMDB Rating: ${d.imdbRating}`, 
                        `Rotten Tomatoes Score: ${d.Ratings[1] !== undefined ? d.Ratings[1].Value : 'N/A'}`, 
                        `Country: ${d.Country}`, 
                        `Language(s): ${d.Language}`, 
                        `Plot: ${d.Plot}`, 
                        `Actors: ${d.Actors}`
                    ];
                    app.consoleLog(output);
                } else {
                    app.consoleLog([`Error: The movie '${movie}' was not found :-(.`]);
                }
         
            });
        } else {
            this.help(this.instructOMDB);
        }
    },
    bands(){
        if (this.getArgs()){

            let artist = this.getArgs();
            let queryUrl = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";
            let errMessage = () => this.consoleLog([`Error: No events for '${artist}' were found :-(`]);
    
            axios.get(queryUrl).then(function(response){
                let d = response.data;
                if (d.length > 0 && d[0].datetime !== undefined){
                    app.consoleLog([`${artist}'s upcoming events:`, '']);
                   
                    let e;
                    for (e of d){
                        let time = moment(e.datetime, 'YYYY-MM-DD[T]HH:mm:ss').format('MM/DD/YYYY');
                        console.log(`${time} @ ${e.venue.name} in ${e.venue.city}${e.venue.region.length > 0 ? ', ' + e.venue.region : ''}`);
                    }
                } else {
                    errMessage();
                }
            }).catch(function(err){
                errMessage();
            });
        } else {
            this.help(this.instructBIT);
        }  
    },
    spotify(){
        if (this.getArgs()){

            let song = this.getArgs();
            // let queryUrl = "https://rest.bandsintown.com/artists/" + song + "/events?app_id=codingbootcamp";
    
            // axios.get(queryUrl).then(function(response){
          
            // }).catch(function(err){
            //     this.consoleLog([`Error: No songs matching '${song}' were found :-(`])
            // });

            //     * Artist(s)
   
            //     * The song's name
   
            //     * A preview link of the song from Spotify
   
            //     * The album that the song is from
        } else {
            this.help(this.instructSpot);
        }  
    },
    help(...helpArrs){
        let helpArr = [...this.instructHeader];
        let x;
        for (x of helpArrs){
            helpArr = helpArr.concat(x);
        }
        this.consoleLog(helpArr);
    },
    getArgs(){
        const [,,,...argsArr] = process.argv;
        return process.argv.length > 0 ? argsArr.join(" ") : false;
    },
    consoleLog(arr){
        console.log('');
        let x;
        for (x of arr){
            console.log(x);
        }
    }
}

app.liri();
