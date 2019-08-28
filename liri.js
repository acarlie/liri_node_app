"use strict";

var axios = require('axios');

var app = {
    method: process.argv[2],
    liri(){
        switch(app.method){
            case "movie-this":
                app.movie();
                break;
            case "spotify-this-song":
                app.spotify();
                break;
        }
    },
    movie(){
        let movie = this.getArgs();
        let queryUrl = `http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=trilogy`;
        axios.get(queryUrl).then(function(response){
            let d = response.data;
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
        });
    },
    spotify(s){

    },
    getArgs(){
        const [,,,...argsArr] = process.argv;
        return argsArr.join(" ");
    },
    consoleLog(arr){
        let x;
        for (x of arr){
            console.log(x);
        }
    }
}

app.liri();

// . `node liri.js movie-this '<movie name here>'`

//    * This will output the following information to your terminal/bash window:

//      ```
//        * Title of the movie.
//        * Year the movie came out.
//        * IMDB Rating of the movie.
//        * Rotten Tomatoes Rating of the movie.
//        * Country where the movie was produced.
//        * Language of the movie.
//        * Plot of the movie.
//        * Actors in the movie.
//      ```

//    * If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'

//      * If you haven't watched "Mr. Nobody," then you should: <http://www.imdb.com/title/tt0485947/>

//      * It's on Netflix!
