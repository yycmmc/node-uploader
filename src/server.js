const http = require('http');
const path = require('path');
const fs = require('fs');

var rootdir = path.join(__dirname, '..');
var savedir = path.join(rootdir, 'download');
var defaultport = 8000;


var port = process.argv[2] || defaultport;
const httpServer = http.createServer(requestHandler);

process.on('uncaughtException', function(err){
  console.log('uncaughtException: ' + err);
})

httpServer.listen(port, function(){
  console.log('server is listening on port '+ port)
});


function requestHandler(req, res){
  if(req.url === '/'){
    goHome(res);
  }else if( req.url === '/list'){
    listFiles(res);
  }else if( /\/download\/[^\/]+$/.test(req.url)){
    downloadFile(req.url, res);
  }else if( /\/upload\/[^\/]+$/.test(req.url) ){
    uploadFile(req, res)
  }else{
    goError(res);
  }
}

function goHome(res){
  var indexFile = path.join(__dirname, 'index.html');
  fs.readFile(indexFile, function(err, content){
    if(err){
      res.writeHead(404, {'Content-Type': 'text'});
      res.write('File Not Found!');
      res.end();
    }else{
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(content);
      res.end();
    }
  })
}

function listFiles(res){
  fs.readdir(savedir, function(err, files){
    if(err){
      console.log(err);
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(err.message));
      res.end();
    }else{
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(files));
      res.end();
    }
  })
}


function downloadFile(url, res){
  var file = path.join(rootdir, url);
  fs.readFile(file, function(err, content){
    if(err){
      res.writeHead(404, {'Content-Type': 'text'});
      res.write('File Not Found!');
      res.end();
    }else{
      console.log("downloading: " + url);
      res.writeHead(200, {'Content-Type': 'application/octet-stream'});
      res.write(content);
      res.end();
      console.log("downloaded succesfully: " + url);
    }
  })
}


function uploadFile(req, res){
  console.log("uploading: " + req.url);
  var fileName = path.basename(req.url);
  var file = path.join(savedir, fileName)
  req.pipe(fs.createWriteStream(file));
  req.on('end', function(){
    res.writeHead(200, {'Content-Type': 'text'});
    res.write('uploaded succesfully: ' + req.url);
    console.log("uploaded succesfully: " + req.url);
    res.end();
  })
}

function goError(res){
  res.writeHead(400, {'Content-Type': 'application/json'});
  res.write('Invalid Request');
  res.end(); 
}