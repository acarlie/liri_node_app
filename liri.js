"use strict";

var axios = require('axios');
var moment = require('moment');

var app = {
    method: process.argv[2],
    instructHeader: [
        '',
        '----------Liri Instructions----------',
    ],
    instructBIT: [
        '',
        "**Bands in Town**",
        "To search Bands in Town enter 'node liri concert-this ' and the band or artist's name.",
        "Ex: 'node liri concert-this the black keys'",
    ],
    instructOMDB:[
        '',
        "**OMDB**",
        "To search OMDB enter 'node liri movie-this ' and the movie name.",
        "Ex: 'node liri movie-this die hard'",
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
                        `Title:  ${d.Title}`, 
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
                    console.log(`The movie '${movie}' was not found :-(.`);
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
    
            axios.get(queryUrl).then(function(response){
                let d = response.data;
                if (d.length > 0){
                    app.consoleLog(['', `${artist}'s upcoming events:`, '']);
                   
                    let event;
                    for (event of d){
                        let time = moment(event.datetime, 'YYYY-MM-DD[T]HH:mm:ss').format('MM/DD/YYYY');
                        console.log(`${time} @ ${event.venue.name} in ${event.venue.city}${event.venue.region.length > 0 ? ', ' + event.venue.region : ''}`);
                    }
                } else {
                    console.log(`No events for '${artist}' were found :-(`);
                }
            }).catch(function(err){
                console.log(`No events for '${artist}' were found :-(`);
            });
        } else {
            this.help(this.instructBIT);
        }  
    },
    spotify(s){
    //     * Artist(s)
   
    //     * The song's name
   
    //     * A preview link of the song from Spotify
   
    //     * The album that the song is from
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
        let x;
        for (x of arr){
            console.log(x);
        }
    }
}

app.liri();
