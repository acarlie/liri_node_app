"use strict";

var axios = require('axios');
var moment = require('moment');

var app = {
    method: process.argv[2],
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
                app.help();
                break;
        }
    },
    movie(){

        let movie = this.getArgs() ? this.getArgs() : 'Mr. Nobody';
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
    },
    bands(){
        let artist = this.getArgs() ? this.getArgs() : '';
        let queryUrl = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";

        axios.get(queryUrl).then(function(response){
            let d = response.data;
            if (response.data.length > 0){
                app.consoleLog(['', `${artist}'s upcoming events:`, '']);

               
                let event;
                for (event of d){
                    let time = moment(event.datetime, 'YYYY-MM-DD[T]HH:mm:ss').format('MM/DD/YYYY');
                    console.log(`${time} @ ${event.venue.name} in ${event.venue.city}${event.venue.region.length > 0 ? ', ' + event.venue.region : ''}`);
                }
                
                console.log('');
            }
        });
    },
    spotify(s){

    },
    help(){
        let helpArr = [
            '',
            '----------Liri Instructions----------',
            '',
            "**OMDB**",
            "To search OMDB enter 'node liri movie-this ' and the movie name.",
            "Ex: 'node liri movie-this die hard'",
            '',
            "**Bands in Town**",
            "To search Bands in Town enter 'node liri concert-this ' and the band or artist's name.",
            "Ex: 'node liri concert-this the black keys'",
        ]
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
