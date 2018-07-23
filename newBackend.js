var httpwebsite = require('url');
var getfiles = require('fs')
var downloadRequest = require("request");
const passedPage = require('cheerio');
var qs = require('querystring');
const concat = require('concat-stream');

var express = require('express');
var app = express();

var targetURL = "";

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

      if (incomingRequest.method === 'POST') 
      {
        console.log("POST logic triggered")
        incomingRequest.on('data', function (bufferChunk) 
        {
          targetURL = bufferChunk.toString();
          targetURL = targetURL.slice(18, targetURL.length);
          targetURL = "https://" + targetURL;
          targetURL = targetURL.replace(/%2F/gi, "/");
          console.log("Targe URL: " + targetURL);



          downloadRequest(targetURL, function(error, response, html)
          {
            console.log("trying to connect")

            if(!error)
            {
              var page = passedPage.load(html);
              // console.log(html);
              
              playlistName = page('h1[class="product-header__title product-header__title--album-header"]').text();
  
            page('a[class="table__row__link table__row__link--secondary"]').each(function(i, element)
            {
            var a = page(element);
            var holder = a.attr('data-test-song-artist-url');
            bandsList[i]=holder;
            });
  
  
            page('span[class="tracklist-item__text__headline targeted-link__target we-truncate we-truncate--single-line ember-view"]').each(function(i, element)
            {
              var b = page(element);
              var holder = b.text();
              holder = holder.substring(0, holder.length -1);
          
              songsList[i]=holder;
            });

          }
            console.log ("Playlist: " + playlistName + "\n");
            console.log( songsList.length + " Songs: " + songsList + "\n");
            console.log(bandsList.length + " Bands: " + bandsList + "\n");
        });

      });

      switch(path)
      {
                case '/':
                  outResponse.writeHead(200, { 'Content-Type': 'text/html' });
                  renderPage('./index.html', outResponse);
                  break;
  
                case '/cats':
                  outResponse.writeHead(200, { 'Content-Type': 'text/html' });
                  renderPage('./go.html', outResponse);
                  
                  break;
  
                default:
                  outResponse.writeHead(666);
                  outResponse.write('nothin here');
                  outResponse.end();
      }

      
    }



  }
}

 






  // function appleDownload(passedPage)
  // {
  //         console.log("running download function");
            
  
          //   playlistName = passedPage('h1[class="product-header__title product-header__title--album-header"]').text();
          //   console.log (playlistName);
  
          //   var resultSongs = passedPage('span[class="tracklist-item__text__headline targeted-link__target we-truncate we-truncate--single-line ember-view"]').text();
          //   // var resultBands = cheerioload('div[class="we-truncate we-truncate--single-line ember-view"]').html();
  
          //   passedPage('a[class="table__row__link table__row__link--secondary"]').each(function(i, element)
          //   {
          //   var a = passedPage(element);
          //   var holder = a.attr('data-test-song-artist-url');
          //   bandsList[i]=holder;
          //   });
  
  
          //   passedPage('span[class="tracklist-item__text__headline targeted-link__target we-truncate we-truncate--single-line ember-view"]').each(function(i, element)
          //   {
          //     var b = passedPage(element);
          //     var holder = b.text();
          //     holder = holder.substring(0, holder.length -1);
          // // holder = unescape(holder);
          // // holder = holder.replace(/\\/g, '');
          //     songsList[i]=holder;
  
          // // console.log(holder);
  
          //     console.log(resultBands.length);
          //     console.log(resultSongs);
          //     console.log(songsList);
          //     console.log(bandsList);
  
          //   });
            //table__row__link table__row__link--secondary
  // }
    




//https://itunes.apple.com/us/playlist/dooooomtreeee/pl.u-gxblgbxC5560Aq








function renderPage(path, theResponce) 
{
  getfiles.readFile(path, null, function (error, data) {
    if (error) {
      theResponce.writeHead(666)
      theResponce.write('shit broke yo!')
    }
    else {
      theResponce.write(data);
    }
    theResponce.end();
  });


}
