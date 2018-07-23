var httpwebsite = require('url');
var getfiles = require('fs')
var downloadRequest = require("request");
const myCheerio = require('cheerio');
var qs = require('querystring');
const concat = require('concat-stream');

var requestBody = "";
const chunks = [];

module.exports =
{
  processRequest: function(incomingRequest, outResponse)
  {
    outResponse.writeHead(200, {'Content-Type': 'text/html'});

    var path = httpwebsite.parse(incomingRequest.url).pathname;
    console.log(path);
    console.log(incomingRequest.data);
    // console.log(incomingRequest);
    // console.log(outResponse);

    concat(incomingRequest, dataFromBuffer =>
    {
      requestBody = qs.parse(dataFromBuffer.toString());
      console.log(proccessedData);
    });

    switch (path) {
      case '/':
      renderPage('./index.html', outResponse)
      break;
      case '/go':
      renderPage('./go.html', outResponse)
      break;

    incomingRequest.on('error', (err) =>
    {
      console.error(err);
      incomingRequest.statusCode = 400;
      incomingRequest.end();
    });

    outResponse.on('error', (err) =>
    {
      console.error(err);
    });


    if (incomingRequest.method === 'POST')
    {
      console.log("post logic triggered")
      incomingRequest.on('data', chunk => chunks.push(chunk));
      request.on('end', () =>
      {

    });

    }
    else
    {
      outResponse.statusCode = 404;
      outResponse.end();
    }









//

      downloadRequest('https://itunes.apple.com/us/playlist/dooooomtreeee/pl.u-gxblgbxC5560Aq', function(error, response, body)
      {

        // console.log(body);
          var count = 0;
          var bandsList = [];
          var songsList = [];
          var cheerioload = myCheerio.load(body);
          var playlistName = ""

          playlistName = cheerioload('h1[class="product-header__title product-header__title--album-header"]').text();
          console.log (playlistName);

          var resultSongs = cheerioload('span[class="tracklist-item__text__headline targeted-link__target we-truncate we-truncate--single-line ember-view"]').text();
          // var resultBands = cheerioload('div[class="we-truncate we-truncate--single-line ember-view"]').html();

          cheerioload('a[class="table__row__link table__row__link--secondary"]').each(function(i, element)
          {
          var a = cheerioload(element);
          var holder = a.attr('data-test-song-artist-url');
          bandsList[i]=holder;
        });


        cheerioload('span[class="tracklist-item__text__headline targeted-link__target we-truncate we-truncate--single-line ember-view"]').each(function(i, element) {
        var b = cheerioload(element);
        var holder = b.text();
        holder = holder.substring(0, holder.length -1);
        // holder = unescape(holder);
        // holder = holder.replace(/\\/g, '');
        songsList[i]=holder;
        });
        // console.log(holder);

          // console.log(resultBands.length);
          // console.log(resultSongs);
           // console.log(songsList);
           // console.log(bandsList);


          //table__row__link table__row__link--secondary

      });






      break;
    default:
    outResponse.writeHead(666);
    outResponse.write('nothin here')
    outResponse.end();
  }
}
};





function renderPage(path, theResponce)
{
  getfiles.readFile(path, null, function(error, data)
  {
      if (error) {
        theResponce.writeHead(666)
        theResponce.write('shit broke yo!')
      }
      else
      {
        theResponce.write(data);
      }
        theResponce.end();
  });
}
