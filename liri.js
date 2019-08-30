"use strict";

require("dotenv").config();

const keys = require("./keys.js");
const Spotify = require('node-spotify-api');
const spotify = new Spotify(keys.spotify);
const axios = require('axios');
const moment = require('moment');
const colors = require('colors');
var inquirer = require("inquirer");

colors.setTheme({
    header: ['bgCyan', 'black'],
    main: 'cyan',
    mainTwo: 'grey',
    helpHeader: ['bgGreen', 'black'],
    err: 'red'
  });

const app = {
    method: process.argv[2],
    instructHeader: [
        '----------Liri Instructions----------'.helpHeader,
        "",
    ],
    setUpSpot: [
        'How to Set-Up Spotify'.helpHeader,
        '',
        'To use Spotify, you will need to get the necessary credentials.'.green,
        '  1. Visit https://developer.spotify.com/dashboard/login'.mainTwo,
        '  2. Create an account or login with your existing account.'.mainTwo,
        "  3. Once you login, you should see an option to create a new application.".mainTwo,
        '  4. Create a new application, and on the next screen copy the *client id* and *client secret*.'.mainTwo,
        '  5. In the liri folder create a file named \'.env\' and format it like this:'.mainTwo,
        '     SPOTIFY_ID=Your-ID-Here'.mainTwo,
        '     SPOTIFY_SECRET=Your-Secret-Here'.mainTwo,
        '  6. Save and try \'node liri spotify-this-song bye bye bye\''.mainTwo
    ],
    init(){
        this.instructBIT = this.helpMessage('Bands in Town', 'concert-this', "band or artist's name", 'the black keys');
        this.instructOMDB = this.helpMessage('Open Movie Database(OMDB)', 'movie-this', 'movie name', 'die hard');
        this.instructSpot = this.helpMessage('Spotify', 'spotify-this-song', 'song name', 'turn it around');

        switch(this.method){
            case "movie-this":
                this.movie();
                break;
            case "concert-this":
                this.bands();
                break;
            case "spotify-this-song":
                this.spotify();
                break;
            case "help":
            default:
                this.liriHelp();
                break;
        }
    },
    movie(){
        if (this.getArgs()){

            let that = this;
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
                            `Title: ${d.Title}`.main, 
                            `Release Year: ${d.Year}`.mainTwo, 
                            `IMDB Rating: ${d.imdbRating}`.mainTwo, 
                            `Rotten Tomatoes Score: ${d.Ratings[1] !== undefined ? d.Ratings[1].Value : 'N/A'}`.mainTwo, 
                            `Country: ${d.Country}`.mainTwo, 
                            `Language(s): ${d.Language}`.mainTwo, 
                            `Plot: ${d.Plot}`.mainTwo, 
                            `Actors: ${d.Actors}`.mainTwo
                        ];
                        that.consoleLog(output);
                    } else {
                        that.consoleLog([`Error: The movie '${movie}' was not found :-(.`.err]);
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

            let that = this;
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

                        that.consoleLog([`${artist}'s upcoming events:`.header, '']);

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

            let that = this;
            let song = this.getArgs();
            let errMessage = () => this.consoleLog([`The song '${song}' was not found :-(`.err]);

            spotify
                .search({ type: 'track', query: song })
                .then(function(response) {

                    let data = response.tracks.items;
                    if (data.length > 0){
                        that.consoleLog([`Spotify results for '${song}':`.header]);
                        let d = data.length > 5 ? data.slice(0, 5) : [...data];
                        let x;
                        for (x of d){
                            let output = [
                                `'${x.name}' by ${x.artists[0].name}`.main,
                                `   Album: ${x.album.name}`.mainTwo, 
                                `   Link: ${x.external_urls.spotify}`.mainTwo
                            ]
                            that.consoleLog(output);
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
    liriHelp(){

        let that = this;
        inquirer
            .prompt([
                {
                    type: "list",
                    message: "About Liri & Liri Help".green,
                    choices: [
                        {name: "Setting up Spotify", value: 0},
                        {name: "How to use Liri", value: 1},
                    ],
                    name: "help"
                }
            ])
            .then(function(res){
                switch(res.help){
                    case 0:
                        that.consoleLog(that.setUpSpot);
                        break;
                    case 1:
                        that.help(that.instructOMDB, that.instructBIT, that.instructSpot);
                        break;
                }
            });
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
