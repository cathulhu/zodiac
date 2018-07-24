var httpwebsite = require('url');
var getfiles = require('fs')
var downloadRequest = require("request");
const cheerio = require('cheerio');
var qs = require('querystring');
const concat = require('concat-stream');
var express = require('express');
var app = express();
var http = require('http');
var https = require('https');

var cheerioloadPage;
var targetURL = "";
var downloadedPage = "";

var playlistName = ""
var count = 0;
var bandsList = [];
var songsList = [];

module.exports =
{
    processRequest: function (incomingRequest, outResponse) 
    {

      var path = httpwebsite.parse(incomingRequest.url).pathname;

      console.log("path: " + path);
      console.log("protocol: " + incomingRequest.method.toString());
      // console.log(incomingRequest.data);

      if (incomingRequest.method === 'POST' && incomingRequest.url === '/go') 
      {
          console.log("POST logic triggered")

          incomingRequest.on('data', function (bufferChunk) 
          {
            targetURL = bufferChunk.toString();
          });

          incomingRequest.on('end', function() 
          {
            // console.log ("raw data: " + targetURL);
            targetURL = targetURL.slice(18, targetURL.length);
            targetURL = "https://" + targetURL;
            targetURL = targetURL.replace(/%2F/gi, "/");
            console.log("Connecting... Target URL: " + targetURL);


            downloadRequest(targetURL, function(error, response, htmlBody)
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

      else if (incomingRequest.method === 'POST' && incomingRequest.url === '/auth')
      {

        console.log("spotify 1st auth step...");

        function OnResponse(response) 
        {
          var responseData = '';
          
          response.on('data', function(dataChunkIn)
          {
            console.log("getting response:" + dataChunkIn.toString );
            responseData+=dataChunkIn;
            
          });

          response.on('end', function()
          {
            outResponse.write(responseData);
            outResponse.end();
            console.log(responseData);
          });
  
        } 
  

        https.get("https://accounts.spotify.com/authorize?scope=playlist-modify-private%20playlist-modify-public&redirect_uri=http%3A%2F%2F127.0.0.1:8000%2F&response_type=code&client_id=d8c3567b6c8f4a2db4e90c8343bed3ab", OnResponse);
      
      }   

      else
      
      {
        switch(path)
        {
          case '/':
            outResponse.writeHead(200, { 'Content-Type': 'text/html' });
            renderPage('./index.html', outResponse);
            break;

            case '/en/login':
            outResponse.writeHead(200, { 'Content-Type': 'text/html' });
            renderPage('./go.html', outResponse);
            break;

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