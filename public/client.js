var socket = io.connect();
var myID;
var ratenErlaubt;
var self;
var imagesCreated = 0;
var chatErlaubt = true;
var alleSpieler = [];
var dev = false;
var saved = false;

$(function(){

  $("#countdownText").hide();

  $("#playBtn").click(function(){
    socket.emit("request join", $("#nickInput").val());
    $("#nickInput").val("");
  });

  $("#guessInput").keypress(function(e){
    if(e.which == 13){
      if(ratenErlaubt){
        socket.emit("rateZahl", $(this).val());
        $(this).val("");
        $("#guessInput").attr("placeholder", "Saved! To change type new guess.");
        saved = true;
      }
    }
  });

  $("#chatInput").keypress(function(e){
    if(e.which == 13){
      if(chatErlaubt){
        socket.emit("chat", $(this).val());
        $(this).val("");
        chatErlaubt = false;
        setTimeout(function(){
          chatErlaubt = true;
        }, 1000);
      }
    }
  });

  socket.on("chatUpdate", function(data){
    $("#chatBox").append("<div style=\"border-bottom: 1px solid #FFFFFF;\" class=\"message-from-" + data.id +"\"><p><b>" + data.nickname + "</b> : " + data.message + "</p>");
    $(".message-from-" + myID).css({
      backgroundColor: "#FF7979"
    });
    $(".message-from-" + alleSpieler[0].id).css({
      backgroundColor: "#EAC51F"
    });
    $(".message-from-SERVER").css({
      backgroundColor: "#3EFF00"
    });
    $(".message-from-SERVER-KICK").css({
      backgroundColor: "#FF0000",
      color: "#FFFFFF"
    });
    updateChatScroll();
  });

  function updateChatScroll(){
    var element = document.getElementById("chatBox");
    element.scrollTop = element.scrollHeight;
}

  socket.on("fehler", function(data){
    alert(data);
  });

  socket.on("deine id", function(data){
    //console.log(data);
    myID = data.id;
    imagesCreated = data.image -1;

    if(data.erlaubt){

      $("#bild").animate({
        width: "600px",
        borderWidth: "5px"
      }, 1000);

      setTimeout(function(){
        $("#bild").css("background-image", "url(bild/fertig"+ imagesCreated +".jpg)");
      }, 1000);

      ratenErlaubt = true;
      $("#guessInput").css({
        backgroundColor: "#A7FF00"
      });
    }else{

      $("#bild").animate({
        width: "0px",
        borderWidth: "0px"
      }, 1000);

      $("#bild").css("background-color", "#000000");
      $("#guessInput").attr("placeholder", "Wait for new round.");
      saved = false;
    }
  });

  socket.on("alle spieler", function(data){
    alleSpieler = data;
    alleSpieler = alleSpieler.sort(compare);
    //console.log(data);
    if(myID){
      anmeldungFertig(data);
    }
  });

  socket.on("dev", function(){
    dev = true;
  });

  socket.on("raten erlaubt", function(data){
    if(data.erlaubt){
      //$("#guessInput").attr("placeholder", "Your guess here!");
      saved = false;
      imagesCreated = data.image;
      //countdown();
    }else{
      //$("#guessInput").attr("placeholder", "Wait for new round.");
      saved = false;
    }

    imagesCreated = data.image;
    ratenErlaubt = data.erlaubt;
    if(data.erlaubt){
      $("#bild").css("background-image", "none").stop().animate({
        width: "600px",
        borderWidth: "5px"
      }, 1000);

      setTimeout(function(){
        $("#bild").css("background-image", "url(bild/fertig"+ imagesCreated +".jpg)");
      }, 1000);

      $("#guessInput").css({
        backgroundColor: "#A7FF00"
      });
    }else{

      $("#countdownText").css({
        marginBottom: "400px"
      });

      var ballCounter = 0;
      $("#countdownText").show();

      var baelleZeigen = setInterval(function(){

        $("#countdownText").css({
          fontSize: "64px",
          opacity: "1"
        });
      
      if(ballCounter >= data.x.length){
        clearInterval(baelleZeigen);
        $.ajax({
          type: "GET",
          url: "http://numbersapi.com/" + data.x.length + "/year?callback=?",
          dataType: "jsonp",
          success: function(data) {
            $("#yearEvent").text("ⓘ " + data);
          }
        });
        setTimeout(function(){
          $("#countdownText").hide();
          $("#countdownText").css({
            marginBottom: "0px"
          });
  
          $("#bild").stop().animate({
            width: "0px",
            borderWidth: "0px"
          }, 1000, function(){
            $(".circles").remove();
            $("#yearEvent").slideDown(500);
          });
    
          $("#bild").css("background-image", "#000000");
        }, 1000);
      }

      $("#bild").append("<div class=\"circles\" style=\"left: " + data.x[ballCounter] + "px; top: " + data.y[ballCounter] + "px;\"></div>");

      $("#countdownText").text(ballCounter);
      ballCounter ++;
      }, 1);

      // setTimeout(function(){
      //   $("#countdownText").hide();
      //   $("#countdownText").css({
      //     marginBottom: "0px"
      //   });

      //   $("#bild").stop().animate({
      //     width: "0px",
      //     borderWidth: "0px"
      //   }, 1000, function(){
      //     $(".circles").remove();
      //   });
  
      //   $("#bild").css("background-color", "#000000");
      // }, 4000);

      $("#guessInput").css({
        backgroundColor: "#8A8A8A"
      });
    }
  });

  /*

  function farbenwechsel(erlaubt){
      var invertNummer = 0;
      var invertieren = setInterval(function(){
        invertNummer ++;
        if(invertNummer < 100){
          $("#bild").css("-webkit-filter", "invert(" + invertNummer + "%)");
          $("#bild").css("filter", "invert(" + invertNummer + "%)");
        }else{
          clearInterval(invertieren);
        }
      }, 10);
  }

  */
  
  socket.on("nummer", function(data){
    closestColouration(data);
  });

  function closestColouration(data){
    setTimeout(function(){
      for(i=0;i<alleSpieler.length;i++){
        if(alleSpieler[i].guess >= data -100 || alleSpieler[i].guess >= data +100){
          $("#" + alleSpieler[i].id).css({
            backgroundColor: "#40FF00"
          });
        }else if(alleSpieler[i].guess >= data -200 || alleSpieler[i].guess >= data +200){
          $("#" + alleSpieler[i].id).css({
            backgroundColor: "#80FF00"
          });
        }else if(alleSpieler[i].guess >= data -300 || alleSpieler[i].guess >= data +300){
          $("#" + alleSpieler[i].id).css({
            backgroundColor: "#BFFF00"
          });
        }
        else if(alleSpieler[i].guess >= data -400 || alleSpieler[i].guess >= data +400){
          $("#" + alleSpieler[i].id).css({
            backgroundColor: "#FFFF00"
          });
        }
        else if(alleSpieler[i].guess >= data -500 || alleSpieler[i].guess >= data +500){
          $("#" + alleSpieler[i].id).css({
            backgroundColor: "#FFBF00"
          });
        }
        else if(alleSpieler[i].guess >= data -600 || alleSpieler[i].guess >= data +600){
          $("#" + alleSpieler[i].id).css({
            backgroundColor: "#FF8000"
          });
        }
        else if(alleSpieler[i].guess >= data -700 || alleSpieler[i].guess >= data +700){
          $("#" + alleSpieler[i].id).css({
            backgroundColor: "#FF4000"
          });
        }
        else if(alleSpieler[i].guess >= data -800 || alleSpieler[i].guess >= data +800){
          $("#" + alleSpieler[i].id).css({
            backgroundColor: "#FF0000"
          });
        }else{
          $("#" + alleSpieler[i].id).css({
            backgroundColor: "#B40404"
          });
        }
      }

      // for(i=0;i<alleSpieler.length;i++){
      //   var p = Math.round((alleSpieler[i].guess/data)*100);
      //   $("#" + alleSpieler[i].id).append("<div id=\"percentage" + alleSpieler[i].id + "\" style=\"position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 44px; color: #000000;\"><p>" + p + "%" + "</p></div>");
      // }
    }, 100);
  }

  socket.on("zeit", function(data){
    if(data.tick > 0 && data.tick < 21 && saved == false){
      var secondsLeftToGuess = 20 - data.tick;
      $("#guessInput").attr("placeholder", "Type your guess here and press Enter! " + secondsLeftToGuess + " seconds left to guess");
      if(secondsLeftToGuess < 5){
        $("#countdownText").show();
        $("#countdownText").css("color", "#FF0000");
        $("#countdownText").text(secondsLeftToGuess);
      }else{
        $("#countdownText").hide();
      }
    }if(data.tick > 0 && data.tick < 21 && saved){
      var secondsLeftToGuess = 20 - data.tick;
      $("#guessInput").attr("placeholder", "Your guess has been saved. " + secondsLeftToGuess + " seconds left to change your mind ^^");
      if(secondsLeftToGuess < 5){
        $("#countdownText").show();
        $("#countdownText").css("color", "#FF0000");
        $("#countdownText").text(secondsLeftToGuess);
      }else{
        $("#countdownText").hide();
      }
    }
    if(data.tick < 34 && data.tick > 19){
      var secondsLeftForNewRound = 33 - data.tick;
      $("#guessInput").attr("placeholder", "New round starts in " + secondsLeftForNewRound + " seconds");
    }
    if(data.tick == 33){
      $("#yearEvent").slideUp(500);
    }

    if(ratenErlaubt){
      $("#countdownText").stop().animate({
        fontSize: "32px",
        opacity: "0"
      }, 700, function(){
        $(this).stop().animate({
          fontSize: "64px",
          opacity: "1"
        }, 300);
      });
    }else{
      $("#countdownText").css({
        fontSize: "64px",
        opacity: "1"
      });
    }
  });

  // socket.on("jahr", function(data){
  //   $.ajax({
  //     type: "GET",
  //     url: "http://numbersapi.com/" + data + "/year?callback=?",
  //     dataType: "jsonp",
  //     success: function(data) {
  //       $("#yearEvent").text("ⓘ " + data).slideDown(500);
  //     }
  //   });
  // });

  function compare(a,b) {
    if (a.score > b.score)
    return -1;
    if (a.score < b.score)
    return 1;
    return 0;
  }

  function anmeldungFertig(data){

    data = data.sort(compare);

    $(".verschwinde").hide();
    $("#imageBox").show();
    $("#guessInput").show();

    $("#nickList").remove();
    $("#alles").append("<div id=\"nickList\" style=\"width: 100%; height: 420px; margin: 0 auto; position: relative; overflow-y: auto;\"></div>");
    for(i=0;i<data.length;i++){
      if(dev){
        $("#nickList").append("<div class=\"spielerInfo\" id=\""+ data[i].id +"\" best=\"" + data[i].best + "\" style=\"border: 0.05em solid #000; width: 100px; text-align: center; background-color: #FFF; display: inline-block; white-space: nowrap;\"><p id=\""+ "nick_" + data[i].id +"\">"+ "<b>[" + data[i].id + "]</b> " + data[i].nick +"</p><p class=\"spielerGuess\" id=\""+ "g" + data[i].id +"\">"+ "guess: " + data[i].guess +"</p><p id=\""+ "score" + data[i].id +"\">score: " + data[i].score + "</p></div>");
      }else{
        $("#nickList").append("<div class=\"spielerInfo\" id=\""+ data[i].id +"\" best=\"" + data[i].best + "\" style=\"position: relative; border: 0.05em solid #000; width: 100px; text-align: center; background-color: #FFF; display: inline-block; white-space: nowrap;\"><p id=\""+ "nick_" + data[i].id +"\">"+ data[i].nick +"</p><p class=\"spielerGuess\" id=\""+ "g" + data[i].id +"\">"+ "guess: " + data[i].guess +"</p><p id=\""+ "score" + data[i].id +"\">score: " + data[i].score + "</p></div>");
      }
      if(data[i].id == myID){
        self = data[i];
      }
    }

    $("#" + data[0].id).css('background-image', 'url("' + "assets/best2.png" + '")');
    //$("#" + data[0].id).addClass("scheinen");
   
    if(self.best){
      $(".spielerInfo[best=true]").append("<div style=\"background-color: #FFF\"><p style=\"color: #31AC00;\">✓</p></div>");
    }else{
      $(".spielerInfo[best=true]").append("<div style=\"background-color: #000\"><p style=\"color: #BCFBA3;\">✓</p></div>");
    }

    $("#" + myID).css({
      backgroundColor: "#000000",
      color: "#FFFFFF"
    });

  }

  /*
  socket.on("shopping", function(data){
    $("#shoppingCountdown").text(data);
  });
  */
});
