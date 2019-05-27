// Configure
require("dotenv").config();

// Packages Required
var Spotify = require("node-spotify-api");
var keys = require("./keys.js");
var axios = require("axios");
var NodeGeocoder = require("node-geocoder");
var moment = require("moment");
var fs = require("fs");

// MapQuest API key
var options = {
  provider: "mapquest",
  apiKey: "aWxyEm5ZA7sxeMBLmaNUoGQJOxVV2bF2"
};
var geocoder = NodeGeocoder(options);

// Parameters
var searchCat = process.argv[2];
var searchItem = process.argv[3];

// App
if (searchCat == "spotify-this-song") {
  spotify();
} else if (searchCat == "concert-this") {
  BandsInTown();
} else if (searchCat == "movie-this") {
  OMDB();
} else if (searchCat == "do-what-it-says") {
  fs.readFile("random.txt", "utf8", function(error, data) {
    if (error) {
      return console.log(error);
    }
    var dataArr = data.split(",");
    searchItem = dataArr[1];
    if (dataArr[0] == "spotify-this-song") {
      spotify();
    } else if (dataArr[0] == "movie-this") {
      OMDB();
    } else if (dataArr[0] == "concert-this") {
      console.log(searchItem);
      BandsInTown();
    }
  });
}

/// Functions
/////////////////////////////////////////////////////////////////////////////////////////
// Spotify Function
function spotify() {
  var spotify = new Spotify(keys.spotify);

  spotify.search({ type: "track", query: searchItem, limit: 13 }, function(
    err,
    data
  ) {
    if (err) {
      return spotify.search({ type: "track", query: "The Sign" }, function(
        err,
        data
      ) {
        var SpotifySearch =
          "\n************* SPOTIFY THIS SONG IS NOT FOUND SO WE PICKED FOR YOU **************\nArtist: " +
          data.tracks.items[7].artists[0].name +
          "\nSong title: " +
          data.tracks.items[7].name +
          "\nAlbum name: " +
          data.tracks.items[7].album.name +
          "\nURL Preview: " +
          data.tracks.items[7].preview_url +
          "\n********************************************************************************\n";
        console.log(SpotifySearch);
      });
    } else {
      var spotifyresults = data.tracks.items;
      var SpotifySearch =
        "\n****************************** SPOTIFY THIS SONG *******************************\nArtist: " +
        spotifyresults[0].artists[0].name +
        "\nSong title: " +
        spotifyresults[0].name +
        "\nAlbum name: " +
        spotifyresults[0].album.name +
        "\nURL Preview: " +
        spotifyresults[0].preview_url +
        "\n********************************************************************************\n";
      console.log(SpotifySearch);
      fs.appendFile("log.txt", SpotifySearch, function(err) {
        if (err) {
          return console.log("Song data did not append to log.txt file.");
        }
      });
    }
  });
}
/////////////////////////////////////////////////////////////////////////////////////////
// OMD Function
function OMDB() {
  var movieName = searchItem.split(" ").join("+");

  var queryUrl =
    "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

  axios
    .get(queryUrl)
    .then(function(response) {
      if (response.data.Error == "Movie not found!") {
        movieName = "Mr. Nobody";
        queryUrl =
          "http://www.omdbapi.com/?t=" +
          movieName +
          "&y=&plot=short&apikey=trilogy";
        axios.get(queryUrl).then(function(response) {
          var moviesSearch =
            "\n***************** MOVIE NOT FOUND :( SO WE PICKED FOR YOU **********************\nTitle: " +
            response.data.Title +
            "\nRelease Year: " +
            response.data.Year +
            "\nIMDB Rating: " +
            response.data.imdbRating +
            "\nRotten Tomatoes Rating: " +
            response.data.Ratings[1].Value +
            "\nCountry movie produced in: " +
            response.data.Country +
            "\nLanguage: " +
            response.data.Language +
            "\nPlot: " +
            response.data.Plot +
            "\nActors: " +
            response.data.Actors +
            "\n********************************************************************************\n";
          console.log(moviesSearch);
        });
      } else {
        var moviesSearch =
          "\n********************************** MOVIE THIS **********************************\nTitle: " +
          response.data.Title +
          "\nRelease Year: " +
          response.data.Year +
          "\nIMDB Rating: " +
          response.data.imdbRating +
          "\nRotten Tomatoes Rating: " +
          response.data.Ratings[1].Value +
          "\nCountry movie produced in: " +
          response.data.Country +
          "\nLanguage: " +
          response.data.Language +
          "\nPlot: " +
          response.data.Plot +
          "\nActors: " +
          response.data.Actors +
          "\n********************************************************************************\n";
        console.log(moviesSearch);
        fs.appendFile("log.txt", moviesSearch, function(err) {
          if (err) {
            return console.log("Movie data did not append to log.txt file.");
          }
        });
      }
    })
    .catch(function() {
      console.log("OMDBapi response error. Please try again.");
    });
}
/////////////////////////////////////////////////////////////////////////////////////////
// Bands In Town Function
function BandsInTown() {
  var artist = searchItem.split(" ").join("+");

  var queryUrl =
    "https://rest.bandsintown.com/artists/" +
    artist +
    "/events?app_id=codingbootcamp";
  axios.get(queryUrl).then(function(response) {
    // Venue Name
    var venueName = response.data[0].venue.name;
    // Date of the Event (use moment to format this as "MM/DD/YYYY")
    var date = moment(response.data[0].datetime).format("L");
    var bandsintownSearch1 =
      "\n********************************** CONCERT THIS ********************************\nVenue Name: " +
      venueName +
      "\nEvent Date: " +
      date;
    // Venue Address
    var venueLat = response.data[0].venue.latitude;
    var venueLon = response.data[0].venue.longitude;
    geocoder
      .reverse({ lat: venueLat, lon: venueLon })
      .then(function(res) {
        var address =
          res[0].streetName +
          ". " +
          res[0].city +
          ", " +
          res[0].stateCode +
          ", " +
          res[0].zipcode;
        var bandsintownSearch2 =
          "\nVenue Address: " +
          address +
          "\n********************************************************************************\n";
        var bandsintownSearch = bandsintownSearch1 + bandsintownSearch2;
        console.log(bandsintownSearch);
        fs.appendFile("log.txt", bandsintownSearch, function(err) {
          if (err) {
            return console.log("Concert data did not append to log.txt file.");
          }
        });
      })
      .catch(function(err) {
        console.log(err);
      });
  });
}
