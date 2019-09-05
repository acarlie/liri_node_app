"use strict";

require("dotenv").config();
const fs = require("fs");
const axios = require('axios');
const moment = require('moment');
const colors = require('colors');
const inquirer = require("inquirer");

//Spotify
let keys;
let spotifySetUp = true;
const Spotify = require('node-spotify-api');
let spotify;

//Allows app to function before Spotify is set-up.
try {
    keys = require("./keys.js");
    spotify = new Spotify(keys.spotify);
}
catch(err) {
    spotifySetUp = false;
}

colors.setTheme({
    header: ['bgCyan', 'black'],
    main: 'cyan',
    mainTwo: 'grey',
    helpHeader: ['bgGreen', 'black'],
    err: 'red',
    errHeader: ['bgRed', 'black']
});

const app = {
    instructHeader: [
        `----------Liri Instructions----------`.helpHeader,
        ``,
    ],
    setUpSpot: [
        `How to Set-Up Spotify`.helpHeader,
        ``,
        `To use Spotify, you will need to get the necessary credentials.`.green,
        `  1. Visit https://developer.spotify.com/dashboard/login\n  2. Create an account or login with your existing account.\n  3. Once you login, you should see an option to create a new application.\n  4. Create a new application, and on the next screen copy the *client id* and *client secret*.\n  5. In the liri folder create a file named '.env' and format it like this:\n     SPOTIFY_ID=Your-ID-Here\n     SPOTIFY_SECRET=Your-Secret-Here\n  6. Save and try 'node liri spotify-this-song bye bye bye'`.mainTwo
    ],
    init(){
        this.instructBIT = this.helpMessage('Bands in Town', 'concert-this', "band or artist's name", 'the black keys');
        this.instructOMDB = this.helpMessage('Open Movie Database(OMDB)', 'movie-this', 'movie name', 'die hard');
        this.instructSpot = this.helpMessage('Spotify', 'spotify-this-song', 'song name', 'turn it around');
        this.switchArg(process.argv[2], this.getArgs());
    },
    switchArg(method, arg){
        switch(method){
            case "movie-this":
                this.movie(arg);
                break;
            case "concert-this":
                this.bands(arg);
                break;
            case "spotify-this-song":
                this.spotify(arg);
                break;
            case "saved":
                this.browseSavedOrHist('saved.txt', 'Saved Searches', 'saved');
                break;
            case "save-last":
                this.saveLast('history.txt');
                break;
            case "history":
                this.browseSavedOrHist('history.txt', "Recent Searches", "history");
                break;
            case "random":
                this.random();
                break;
            case "help":
            default:
                this.liriHelp();
                break;
        }
    },
    movie(movie){
        if (movie){

            let that = this;
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
                            `Release Year: ${d.Year}\nIMDB Rating: ${d.imdbRating}\nRotten Tomatoes Score: ${d.Ratings[1] !== undefined ? d.Ratings[1].Value : 'N/A'}\nCountry: ${d.Country}\nLanguage(s): ${d.Language}\nPlot: ${d.Plot}\nActors: ${d.Actors}`.mainTwo
                        ];
                        that.consoleLog(output);
                        that.toAppend('movie-this', movie);
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
    bands(artist){
        if (artist){

            let that = this;
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
                        that.toAppend('concert-this', artist);
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
    spotify(song){
        if (song && spotifySetUp){

            let that = this;
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
                                `   Album: ${x.album.name}\n   Link: ${x.external_urls.spotify}`.mainTwo
                            ]
                            that.consoleLog(output);
                        }
                        that.toAppend('spotify-this-song', song);
                    } else{
                        errMessage();
                    }
                })
                .catch(function(err) {
                    errMessage();
                });

        } else if (!song && spotifySetUp){
            this.help(this.instructSpot);
        } else if (!spotifySetUp){
            console.log(`\nSpotify isn't set-up :-(. Please follow the instructions below to set-up Spotify` .errHeader);
            this.consoleLog(this.setUpSpot);
        }

    },
    saveLast(file){
        let that = this;

        this.readFilePromise(file)
        .then(function(res){
            if (res.split){
                //Saving last search
                let arr = [...res.split];
                that.appendToFile('saved.txt', `${arr[arr.length-1]}|`);
                console.log('\nSearch Saved.' .helpHeader);
            } else {
                //If trying to save and no history exists
                console.log(`\nNo searches to save :-(` .errHeader);
            }
        });
    },
    browseSavedOrHist(file, message, name){
        let that = this;

        this.readFilePromise(file)
        .then(function(res){
            if (res.objs){
                
                //View history or saved
                const values = async () => {
                    let inquireRes = await that.inquireList(res.objs, message, name);
                    let splitArr = inquireRes[name].split('_');
                    that.switchArg(splitArr[0], splitArr[1]);
                }
        
                values();
            } else {
                //If no history or saved exists
                let alert = name === "history" ? `\nNo history to show :-(` : `\nThere are no saved searches yet, after searching type 'node liri save-last' to save a search.`;
                console.log(alert .errHeader);
            } 
        });
    },
    random(){
        let that = this;
        
        this.readFilePromise('random.txt')
        .then(function(res){
            let randomNum = Math.floor(Math.random()*res.objs.length);
            let randomSearchArr = res.objs[randomNum].value.split('_');
            that.switchArg(randomSearchArr[0], randomSearchArr[1]);
        });
    },
    liriHelp(){
        let that = this;
        let arr = [
            {name: "Setting up Spotify", value: 0},
            {name: "How to use Liri", value: 1},
        ];
        
        //node liri help prompt
        const helpResponse = async () => {
            let inquireRes = await that.inquireList(arr, "About Liri & Liri Help", "help");
            switch(inquireRes.help){
                case 0:
                    that.consoleLog(that.setUpSpot);
                    break;
                case 1:
                    that.help(that.instructOMDB, that.instructBIT, that.instructSpot);
                    break;
            }
        }

        helpResponse();
    },
    readFilePromise(file){
        let that = this;
        
        return new Promise((resolve, reject) => {
            fs.readFile(file, "utf8", function(err, content){
                let parsed = that.parseSaved(content);
                resolve(parsed);
            });
        });
    },
    inquireList(arr, message, name){
        return inquirer
            .prompt([
                {
                    type: "list",
                    message: message .green,
                    choices: arr,
                    name: name
                }
            ])
            .then(res => {return res});
    },
    toAppend(method, search){
        let str = `${method}_${search},${search}|`;
        this.appendToFile("history.txt", str);
    },
    appendToFile(file, str){
        fs.appendFile(file, str, function(err){
            if (err){
                return console.log(err);
            }
        });
    },
    parseSaved(res){
        let tempStr = res.substring(0, res.length - 1);
        let split = res.length > 0 ? tempStr.split('|') : false ;
        let final;

        if (split){
            let secondSplit = split.map((i) => i.split(','));
            let objArr = secondSplit.map(function(i){
                return {name: i[1], value: i[0]};
            });
            final = res.length > 0 ? objArr.reverse() : false ;
        }
        
        return {split: split, objs: final};
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
            `To search ${service} enter 'node liri ${command} ' followed by the ${input}.\nEx: 'node liri ${command} ${example}'`.mainTwo,
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
