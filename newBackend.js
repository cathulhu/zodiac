var httpwebsite = require('url');
var getfiles = require('fs')
var webRequest = require("request");
const cheerio = require('cheerio');
var qs = require('querystring');
const concat = require('concat-stream');
var express = require('express');
var app = express();
var http = require('http');
var https = require('https');

const util = require('util')

var cheerioloadPage;
var targetURL = "";
var downloadedPage = "";

var spotifyAuthCode = "";
var accessToken = "";

var playlistName = "";
var count = 0;
var bandsList = [];
var songsList = [];

module.exports =
{
    processRequest: function (Request, outResponse) 
    {

      

      var path = httpwebsite.parse(Request.url).pathname;

      console.log("path: " + path);
      console.log("incoming protocol: " + Request.method.toString());
      // console.log(incomingRequest.data);

      if (Request.method === 'POST' && Request.url === '/go') 
      {
          console.log("POST logic triggered")

          Request.on('data', function (bufferChunk) 
          {
            targetURL = bufferChunk.toString();
          });

          Request.on('end', function() 
          {
            // console.log ("raw data: " + targetURL);
            targetURL = targetURL.slice(18, targetURL.length);
            targetURL = "https://" + targetURL;
            targetURL = targetURL.replace(/%2F/gi, "/");
            console.log("Connecting... Target URL: " + targetURL);


            webRequest(targetURL, function(error, response, htmlBody)
            {
                console.log("trying to connect")

                if(!error)
                {
                  downloadedPage = cheerio.load(htmlBody);

                  playlistName = downloadedPage('h1[class="product-header__title product-header__title--album-header"]').text();

                  downloadedPage('a[class="table__row__link table__row__link--secondary"]').each(function(i, element)
                  {
                  var a = downloadedPage(element);
                  var holder = a.attr('data-test-song-artist-url');
                  bandsList[i]=holder;
                  });

                  downloadedPage('span[class="tracklist-item__text__headline targeted-link__target we-truncate we-truncate--single-line ember-view"]').each(function(i, element)
                  {
                    var b = downloadedPage(element);
                    var holder = b.text();
                    holder = holder.substring(0, holder.length -1);

                    songsList[i]=holder;
                  });

                  console.log ("Playlist: " + playlistName + "\n");
                  console.log( songsList.length + " Songs: " + songsList + "\n");
                  console.log(bandsList.length + " Bands: " + bandsList + "\n");

                  outResponse.writeHead(200, { 'Content-Type': 'text/html' });
                  
                  // updatePage("result_text", "/index.html");
                }
                else
                {
                  //could put error here when a valid url isn't found, or at least too short a string
                }       
            });
          });
      }

      if (Request.method === 'GET' && Request.url.slice(0,7) === '/?code=') 
      {
        //first spotify code is aquired here, then trade for access token
        spotifyAuthCode = Request.url.slice(7);
        console.log("auth code recieved: " + spotifyAuthCode);
          
        //trade in for token
        var postHeaders = 
        {
            'Authorization': 'Basic ' + 'ZDhjMzU2N2I2YzhmNGEyZGI0ZTkwYzgzNDNiZWQzYWI6ZTZmNWIwM2ZlNzdlNDZjMmFhYTkzOTJhOThhMmZkYzQ='
        }
        
        var postOptions = 
        {
          url: 'https://accounts.spotify.com/api/token',
          method: 'POST',
          headers: postHeaders,
          json: true,
          form: {'grant_type': 'authorization_code', 'code': spotifyAuthCode, 'redirect_uri': 'http://127.0.0.1:8000/'}
        }

   

        // console.log("\n sending code:" + spotifyAuthCode + "\n");
        // console.log("\n POST request header: " + util.inspect(Request.headers));

        // console.log("\n POST request url: " + util.inspect(Request.url));
        
        // console.log("\n POST request body: " + util.inspect(Request.body));


        webRequest(postOptions, function(error, response, body)
        {

          console.log("\n POST request token body: " + util.inspect(response.request.body));
          console.log("\n POST request token headers: " + util.inspect(response.request.headers));

          // console.log("\n \n Response: " + util.inspect(response.body));

          if (!error && response.statusCode == 200) 
          {
            // Print out the response body
            console.log("response body:" + body)
          }

          accessToken = response.body.access_token;
          console.log("\nAccess token saved!: " + accessToken + "\n \ntoken good for: " + response.body.expires_in);
          console.log("\nPermission scope: " + response.body.scope);



        });

        
      }

      

      
      
      {
        switch(path)
        {
          case '/':
            outResponse.writeHead(200, { 'Content-Type': 'text/html' });
            renderPage('./index.html', outResponse);
            break;

            case '/auth':
            outResponse.writeHead(200, { 'Content-Type': 'text/html' });
            renderPage('./redirect.html', outResponse);
            break;

            // case '/en/login':
            // outResponse.writeHead(200, { 'Content-Type': 'text/html' });
            // renderPage('./go.html', outResponse);
            // break;

          // default:
          //   outResponse.writeHead(666);
          //   outResponse.write('nothin here');
          //   outResponse.end();
        }
      }

      
  }
}

 



function renderPage(path, theResponse) 
{
  console.log("Begining Render...");
  getfiles.readFile(path, null, function (error, data) {
    if (error) {
      theResponse.writeHead(666);
      theResponse.write('shit broke yo!');
    }
    else 
    {
      console.log("writing page data...");
      theResponse.write(data);
    }
    theResponse.end();
  });


}



//https://itunes.apple.com/us/playlist/dooooomtreeee/pl.u-gxblgbxC5560Aq








/*

        //https%3A%2F%2Faccounts.spotify.com

        
        */










        // function updatePage(element, page)
// {
  
//   var indexPage 

//   downloadRequest(page, function(error, response, htmlBody)
//   {
//       console.log("trying to connect")

//       if(!error)
//       {
//         indexPage = cheerio.load(htmlBody);
//       }

//       indexPage("h1").each 
//       {
        
//       }
      
//   });

// }