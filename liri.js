"use strict";

require("dotenv").config();
const keys = require("./keys.js");
const Spotify = require('node-spotify-api');
const spotify = new Spotify(keys.spotify);

const colors = require('colors');
colors.setTheme({
    header: ['bgCyan', 'black'],
    main: 'cyan',
    mainTwo: 'grey',
    helpHeader: ['bgGreen', 'black'],
    err: 'red'
  });

const axios = require('axios');
const moment = require('moment');

const app = {
    method: process.argv[2],
    instructHeader: [
        '----------Liri Instructions----------'.helpHeader,
        "",
    ],
    init(){
        this.instructBIT = this.helpMessage('Bands in Town', 'concert-this', "band or artist's name", 'the black keys');
        this.instructOMDB = this.helpMessage('Open Movie Database(OMDB)', 'movie-this', 'movie name', 'die hard');
        this.instructSpot = this.helpMessage('Spotify', 'spotify-this-song', 'song name', 'turn it around');

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
                app.help(this.instructOMDB, this.instructBIT, this.instructSpot);
                break;
        }
    },
    movie(){
        if (this.getArgs()){

            let movie = this.getArgs();
            let queryUrl = `http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=trilogy`;
    
            axios
                .get(queryUrl)
                .then(function(response){
                    let d = response.data;
                    if (d.Response === 'True'){
                        let output = [
                            `Information for '${d.Title}':`.header,
                            ``,
                            `Title: ${d.Title}`.mainTwo, 
                            `Release Year: ${d.Year}`.mainTwo, 
                            `IMDB Rating: ${d.imdbRating}`.mainTwo, 
                            `Rotten Tomatoes Score: ${d.Ratings[1] !== undefined ? d.Ratings[1].Value : 'N/A'}`.mainTwo, 
                            `Country: ${d.Country}`.mainTwo, 
                            `Language(s): ${d.Language}`.mainTwo, 
                            `Plot: ${d.Plot}`.mainTwo, 
                            `Actors: ${d.Actors}`.mainTwo
                        ];
                        app.consoleLog(output);
                    } else {
                        app.consoleLog([`Error: The movie '${movie}' was not found :-(.`.err]);
                    }
            
                })
                .catch(function(err){
                });

        } else {
            this.help(this.instructOMDB);
        }
    },
    bands(){
        if (this.getArgs()){

            let artist = this.getArgs();
            let queryUrl = `https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`;
            let errMessage = () => this.consoleLog([`Error: No events for '${artist}' were found :-(`.err]);

            axios
                .get(queryUrl)
                .then(function(response){
                    let d = response.data;
                    if (d.length > 0 && d[0].datetime !== undefined){

                        let time = (date) => moment(date, 'YYYY-MM-DD[T]HH:mm:ss').format('MM/DD/YYYY');
                        let dateTime = (date) => `${date} @`.mainTwo;
                        let region = (r) => r.length > 0 ? `, ${r}` : '';
                        let concert = (vname, vcity, vregion) => `${vname} in ${vcity}${vregion}`.main;

                        app.consoleLog([`${artist}'s upcoming events:`.header, '']);

                        let e;
                        for (e of d){
                            console.log(dateTime(time(e.datetime)), concert(e.venue.name, e.venue.city, region(e.venue.region)));
                        }
                    } else {
                        errMessage();
                    }
                })
                .catch(function(err){
                    errMessage();
                });

        } else {
            this.help(this.instructBIT);
        }  
    },
    spotify(){
        if (this.getArgs()){

            let song = this.getArgs();
            let errMessage = () => this.consoleLog([`The song '${song}' was not found :-(`.err]);
            spotify
                .search({ type: 'track', query: song })
                .then(function(response) {

                    let data = response.tracks.items;
                    if (data.length > 0){
                        app.consoleLog([`Spotify results for '${song}':`.header]);
                        let d = data.length > 5 ? data.slice(0, 5) : [...data];
                        let x;
                        for (x of d){
                            let output = [
                                `'${x.name}' by ${x.artists[0].name}`.main,
                                `   Album: ${x.album.name}`.mainTwo, 
                                `   Link: ${x.external_urls.spotify}`.mainTwo
                            ]
                            app.consoleLog(output);
                        }
                    } else{
                        errMessage();
                    }
                })
                .catch(function(err) {
                    errMessage();
                });

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
    helpMessage(service, command, input, example){
        let helpArray = [
            `**To Search ${service}**`.green,
            `To search ${service} enter 'node liri ${command} ' followed by the ${input}.`.mainTwo,
            `Ex: 'node liri ${command} ${example}'`.mainTwo,
            ``,
        ]
        return helpArray;
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

app.init();
