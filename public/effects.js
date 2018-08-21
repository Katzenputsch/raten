var goodGuys = ["23","Barnsey","Torvesta","Flint","GINO","Iniesta","Kurcho","Lexus","MixGaming","Patrick","Sachsen","SevN","The German","catpower", "Moy", "Manuel"];

$(function(){

  $("#imageBox").hide();
  $("#guessInput").hide();
  $("#yearEvent").hide();
  //$("#names").html("♡ " + goodGuys[Math.floor(Math.random() * (13 - 0 + 1)) + 0]);
  var $logoText = $("#logoText");
  var $playBtn = $("#playBtn");

  ani();
  ani2();
  ani3();
  //ani4();

  $logoText.animate({
      width: 250,
      borderBottomColor: "#000",
      color: "#000"
  }, 2000);

  $playBtn.hover(
  function(e){
      $(this).stop().animate({
          borderColor: "#000",
          backgroundColor: "#FFF",
          color: "#000"
      }, 300);
  }, //over
  function(e){
      $(this).stop().animate({
          borderColor: "#FFF",
          backgroundColor: "#000",
          color: "#FFF"
      }, 500);
  }  //out
  );

  function ani(){
      $("#proto").animate({
          color: "#FF0000"
      }, 2000).animate({
          color: "#000"
      }, 2000, ani);
  }

  function ani2(){
    $("#names").html("♡ " + goodGuys[Math.floor(Math.random() * (goodGuys.length - 0 + 1)) + 0]);
    $("#names").animate({
        marginRight: "-20px",
        opacity: "1"
    }, 2000).animate({
        marginRight: "100px",
        opacity: "0"
    }, 2000, ani2);
}

function ani3(){
    $("#contactTop").animate({
        height: "40px"
    }, 500).animate({
        height: "35px"
    }, 500);

    $("#hand").animate({
        marginTop: "5px"
    }, 500).animate({
      marginTop: "0px"
    }, 500, ani3);
}

/*
function ani4(){
    $("#hand").animate({
        marginLeft: "60px"
    }, 250).animate({
      marginLeft: "-60"
    }, 250, ani4);
}
*/
});
