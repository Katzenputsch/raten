var express = require("express");
var app = express();
var port = process.env.PORT || 3600;
var server = app.listen(port);
var socket = require("socket.io");
var io = socket(server);
var spieler = [];
var nickMaxLength = 15;
var Jimp = require("jimp");
//var rimraf = require("rimraf");
var fs = require("fs");
var path = require("path");
//var wikipedia = require("node-wikipedia");

var idToKick = 999999;
var ips = [];

var ball = new Jimp("public/assets/ball2.png", function (err, img){
  err ? console.log("bild err " + err) : console.log("jimp bild erstellt");
  ball.opacity(0.5);
});

fs.readdir("public/bild", (err, files) => {
  if(err) throw err;

  for(const file of files){
    if(file.includes(".jpg")){
      fs.unlink(path.join("public/bild", file), err => {
        if(err) throw err;
      });
    }
  }
});

app.use(express.static("public"));

app.get("/*", function(req, res, next){
  var file = req.params[0];
  if(file.includes(".jpg")){
    res.setHeader("Cache-Control", "public, max-age=0");
  }
});

console.log("Server bereit...");

server.lastPlayerID = 0;

io.sockets.on("connection", function(socket){

  clients = io.sockets.clients();

  setTimeout(function(){
    if(!socket.player){
      fehlerSenden("Disconnected due to inactivity. Refresh page to connect again.");
      socket.disconnect();
    }
  }, 20000);

  socket.on("request join", function(data){
    //if(ips.indexOf(socket.handshake.address) > -1){
      //fehlerSenden("You are already playing.");
    //}else{
      //ips.push(socket.handshake.address);
      requestJoin(data);
    //}
  });

  var aktiv = false;

  socket.on("rateZahl", function(data){
    empfangeneRateZahlVerarbeiten(data);
  });

  //inactiveInterval();
  function inactiveInterval(){
    aktiv = false;
    clearInterval(inactiveTimer);
    var inactiveTimer = setInterval(function(){
      if(aktiv == false){
        initiateKick();
      }
    }, 40000);
  }

  function initiateKick(){
    var zeitUebrig = 15;
    var kickIn = setInterval(function(){
      socket.emit("chatUpdate", {nickname: "ಥ_ಥ", id: "SERVER-KICK", message: "you will be kicked due to inactivity in <b>" + zeitUebrig + "</b> seconds!"});
      if(zeitUebrig <= 0){
        fehlerSenden("kicked due to inactivity :/");
        clearInterval(kickIn);
        socket.disconnect();
      }
      zeitUebrig --;
      if(aktiv == true){
        clearInterval(kickIn);
      }
    }, 1000);
  }

  function empfangeneRateZahlVerarbeiten(data){
    if(ratenErlaubt && data > 0 && data < 999999 && !isNaN(data)){
      socket.player.guessS = data;
      //console.log(socket.player);
    }else if(isNaN(data)){
      fehlerSenden(":3");
    }
  }

  socket.on("disconnect", function(){
    if(!socket.player) return;
    spieler.splice(spieler.indexOf(socket.player), 1);
    ips.splice(ips.indexOf(socket.handshake.address), 1);
    //console.log("gelöscht");
    alleSpielerSenden();
  });

  socket.on("chat", function(data){
    if(data.includes("!kick") && socket.player.id == "∞"){
      idToKick = parseInt(data.match(/[0-9]+/)[0], 10);
      console.log("erkannt");
    }else if(checkChatInput(data)){
      io.sockets.emit("chatUpdate", {nickname: socket.player.nick, id: socket.player.id, message: data});
    }
  });

  setInterval(function(){
    if(socket.player && socket.player.id == idToKick){
      fehlerSenden("Kicked.");
      socket.disconnect();
      idToKick = 0;
    }
  }, 1000);

  function checkChatInput(data){
    if(socket.player.chatAllowed == false || data.length > 100 || data.length <= 0 || data.includes("<") || data.includes(">") || data.includes("ௌ")){
      return false;
    }else{
      socket.player.chatAllowed = false;
      chatErlauben();
      return true;
    }
  }

  function chatErlauben(){
    setTimeout(function(){
      socket.player.chatAllowed = true;
    }, 1000);
  }

  function requestJoin(data){
    if(data.length > 15){
      fehlerSenden("nick too long");
    }else if(data.length <= 0 || data.includes("<") || data.includes(">")){
      data = "unnamed";
      spielerErstellen(data);
    }else{
      spielerErstellen(data);
    }
  }

  function fehlerSenden(data){
    socket.emit("fehler", data);
  }

  function spielerErstellen(data){
    if(data == "vilso296"){
      socket.player = {
        id: "∞",
        nick: "<b style=\"text-decoration: underline;\">Vilso</b>",
        guess: 0,
        guessS: 0,
        best: false,
        score: 0,
        chatAllowed: true,
        warn: 0
      };
      socket.emit("dev");
    }else{
      socket.player = {
        id: server.lastPlayerID++,
        nick: data,
        guess: 0,
        guessS: 0,
        best: false,
        score: 0,
        chatAllowed: true,
        warn: 0
      };
    }
    spieler.push(socket.player);
    socket.emit("deine id", {id: socket.player.id, erlaubt: ratenErlaubt, image: imagesCreated});
    alleSpielerSenden();
  }

});

function alleSpielerSenden(){
  io.sockets.emit("alle spieler", spieler);
}

var ratenErlaubt = false;
var zufallszahl = 0;
spielfluss();

/*
shoppingFunc();
var shoppingTime = false;
var shoppingCount = 20;

function shoppingFunc(){
  var shoppingCounter = setInterval(function(){
    shoppingCount --;
    if(shoppingCount >= 0){
      io.sockets.emit("shopping", "shopping break in " + shoppingCount + "s !");
    }else{
      io.sockets.emit("shopping", "shopping break starts after this round.");
      shoppingTime = true;
      shoppingCount = 120;
      clearInterval(shoppingCounter);
    }
  }, 1000);
}

*/

function spielfluss(){

  setTimeout(function(){
    //start

    var verstricheneZeit = 0;
    var countdown = setInterval(function(){
      verstricheneZeit ++;
      io.sockets.emit("zeit", {tick: verstricheneZeit});
      if(verstricheneZeit >= 33){
        clearInterval(countdown);
      }
      if(verstricheneZeit == 24){
        io.sockets.emit("jahr", zufallszahl);
      }
    }, 1000);

    for(i=0;i<spieler.length;i++){
      spieler[i].guessS = 0;
      spieler[i].guess = 0;
      spieler[i].best = false;
    }
    alleSpielerSenden();

    zufallszahl = Math.floor(Math.random() * (1200 - 20 + 1)) + 20;
    createImage();

    console.log(zufallszahl);
    ratenErlaubt = true;
    io.sockets.emit("raten erlaubt", {erlaubt: ratenErlaubt, image: imagesCreated});

    setTimeout(function(){
      //stop
      ratenErlaubt = false;
      io.sockets.emit("raten erlaubt", {erlaubt: ratenErlaubt, x: cordsX, y: cordsY});

      for(i=0;i<spieler.length;i++){
        spieler[i].guess = spieler[i].guessS;
      }
      alleSpielerSenden();

      setTimeout(function(){
        //winner anzeigen
        closest();
        //rimraf("/ani", function(){
          //console.log("ordner gelöscht");
        //});
        spielfluss();
      }, 5000);

    }, 20000);
  }, 8000);
}

var imagesCreated = 0;

var cordsX = [];
var cordsY = [];

function createImage(){

  cordsX = [];
  cordsY = [];

  imagesCreated2 = imagesCreated;
  imagesCreated2 -= 1;

  fs.exists("public/bild/fertig" + imagesCreated2 + ".jpg", function(exists){
    //console.log("public/bild/fertig" + imagesCreated2 + ".jpg");
    if(exists){
      fs.unlink("public/bild/fertig" + imagesCreated2 + ".jpg");
      //console.log("bild gelöscht");
    }
  });

  Jimp.read("public/bild/hintergrund.png").then(function(hintergrund){
    for(i=0; i<zufallszahl; i++){
      cordsX.push(Math.floor(Math.random()*(595-0+1)+0));
      cordsY.push(Math.floor(Math.random()*(295-0+1)+0));

      hintergrund.composite(ball, cordsX[i], cordsY[i]);
    }
    hintergrund.quality(60);
    hintergrund.write("public/bild/fertig"+ imagesCreated +".jpg");
    imagesCreated++;
    //console.log("fertig.jpg erstellt");
  });
}

/*
function createImage(){
  Jimp.read("public/bild/hintergrund.png").then(function (hintergrund){
    for(i=0; i<100; i++){
      hintergrund.composite(ball, Math.floor(Math.random()*(790-10+1)+10), Math.floor(Math.random()*(390-10+1)+10));
      hintergrund.write("ani/fertig" + i + ".png");
    }
  }).catch(function (err){
    console.error(err);
  });
  console.log("bilder in ani ordner geladen");
  setTimeout(function(){
    //createVideo();
  },1000);
}

createGif();
function createGif(){
  pngFileStream('ani/fertig?[0-99].png').pipe(encoder.createWriteStream({ repeat: -1, delay: 50, quality: 1 })).pipe(fs.createWriteStream('myanimated.gif'));
  console.log("gif erstellt");
}
*/

function closest(){
  var nummern = [];
  for(i=0;i<spieler.length;i++){
    nummern.push(spieler[i].guess);
  }
  //console.log(nummern);
  let closest = nummern.sort( (a, b) => Math.abs(zufallszahl - a) - Math.abs(zufallszahl - b) )[0];
  //console.log(closest);
  var wievieleBeste = 0;
  for(i=0;i<spieler.length;i++){
    if(spieler[i].guess == closest){
      wievieleBeste ++;
      spieler[i].best = true;
      if(spieler[i].guess != 0){
        spieler[i].score += 2;
      }
      //console.log(spieler[i].nick);
    }
  }
  if(wievieleBeste > 1){
    io.sockets.emit("chatUpdate", {nickname: "[-c°▥°]-c", id: "SERVER", message: "The number was <b>" + zufallszahl + "</b>! multiple people guessed same number holy moly"});
    io.sockets.emit("nummer", zufallszahl);
  }else{
    for(i=0;i<spieler.length;i++){
      if(spieler[i].guess == closest){
        io.sockets.emit("chatUpdate", {nickname: "[-c°▥°]-c", id: "SERVER", message: "The number was <b>" + zufallszahl + "</b>! " + spieler[i].nick + "'s guess was the closest congratz!"});
        io.sockets.emit("nummer", zufallszahl);
      }
    }
  }
  alleSpielerSenden();
}
