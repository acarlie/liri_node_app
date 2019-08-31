# Liri Node App

### Search Open Movie Database
*Command format:*
```
node liri movie-this your movie name
```

*Example:*
```
node liri movie-this die hard
```

*Example Response:*
![Example of an Open Movie Database response.](images/liri_movie-this.png)
  
---
### Search Spotify
*Command format:*
```
node liri spotify-this-song your movie name
```

*Example:*
```
node liri spotify-this-song turn it around
```

*Example Response:*
![Example of a Spotify response.](images/liri_spotify-this.png)

---
### Search Bands in Town
*Command format:*
```
node liri concert-this artist name
```

*Example:*
```
node liri concert-this the black keys
```

*Example Response:*
![Example of a Bands in Town response.](images/liri_concert-this.png)

---
### Liri Help

*Command format:*
```
node liri
```
OR
```
node liri help
```

*Response:*
![Liri Help Choices](images/liri.png)

*Spotify Help Response:*
![Liri Spotify Help Response](images/liri_spotify-instruct.png)

*Liri Instructions Response:*
![Liri Instructions Response](images/liri_instructions.png)

---
### Setting Up Spotify
 1. Visit https://developer.spotify.com/dashboard/login
 2. Create an account or login with your existing account.
 3. Once you login, you should see an option to create a new application.
 4. Create a new application, and on the next screen copy the *client id* and *client secret*.
 5. In the liri folder create a file named '.env' and format it like this:  SPOTIFY_ID=Your-ID-Here  SPOTIFY_SECRET=Your-Secret-Here
 6. Save and try 'node liri spotify-this-song bye bye bye'
