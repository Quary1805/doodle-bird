var Data = {}; // Bugged 427-444 and 519
var Out = {};
var Save = {};
var ctx = document.createElement("canvas").getContext("2d");
var PrevText = null;
var NowText = null;
const Colors = ["#800","#f00","#f90","#963","#fc9","#ff0","#880","#0f0","#080","#0ff","#08f","#00f","#f8f","#80f","#fff","#aaa","#666","#000","#f0f","#f88"];
var Phase = true;
var Results = [];
var Semi = [];
var Display = [null,null,null,false];
var Element1 = null;
var Debug = null;
var Loaded = false;

function Init() {
  ctx = document.getElementById("canvas").getContext("2d");
  Engine();

  ctx.font = "20px Segoe UI";
  var AJAX = new XMLHttpRequest;
  AJAX.open("get", "data.json");
  AJAX.responseType = "json";
  AJAX.send();
  AJAX.onprogress = function(e) {Debug = e};
  AJAX.onload = function() {
    Data = AJAX.response;
    LoadGame();
    Loaded = true;
  }
}

function LoadGame() {
  if (localStorage.elemental == undefined) NewGame();
  if (Save.Mobile == undefined) Save.Mobile = false;
  if (Save.Sort == undefined) Save.Sort = "ID";
  Save = JSON.parse(localStorage.elemental);
}

function SaveGame() {
  localStorage.elemental = JSON.stringify(Save);
}

function NewGame() {
  Save = {};
  Save.Unlocked = [0,1,2,3];
  Save.Cheated = false;
  Save.IDs = false;
  SaveGame();
}

function Engine() {
  if (Loaded) {
    document.getElementById("text").focus();
    NowText = document.getElementById("text").value;
    if (NowText != PrevText) {
      PrevText = NowText;
      Update();
    }
  } else {
    ctx.fillStyle = "#222";
    ctx.fillRect(0,0,1440,1000);
    ctx.fillStyle = "#111";
    ctx.fillRect(1440,0,480,1000);
    ctx.fillStyle = "#060";
    if (Debug != null) ctx.fillRect(0,950,Debug.loaded*1440/Debug.total,50);
    ctx.fillStyle = "white";
    ctx.font = "40px Segoe UI";
    if (Debug != null) ctx.fillText(Math.floor(100*Debug.loaded/Debug.total) + "%", 5, 988);
    ctx.textAlign = "right";
    if (Debug != null) ctx.fillText(Math.floor(Debug.loaded/10485.76)/100 + "MB / " + Math.floor(Debug.total/10485.76)/100 + "MB", 1435, 988);
    ctx.textAlign = "left";
    ctx.font = "60px Segoe UI";
    ctx.fillText("Doodle Bird", 1442, 49);
    ctx.textAlign = "center";
    ctx.font = "120px Segoe UI";
    ctx.fillText("LOADING...", 720, 550);
    ctx.textAlign = "left";
    ctx.font = "20px Segoe UI";
    ctx.fillText("? / ? elements found.", 1446, 75);
    QH();
  }
  requestAnimationFrame(Engine);
}

function Update() {
  Results = [];
  var Test = Save.Unlocked.length;
  if (Test > 150 && Save.Sort != "ABC") Test = 150;
  Semi = [];
  for (let i = 0; i < Save.Unlocked.length; i++) {
    Semi[i] = Save.Unlocked[i];
  }

  if (document.getElementById("text").value.slice(0,2) == "/*") {
    var C = 0;
    var F = 0;
    while ((C != Semi.length) && (F < Test)) {
      if (Data.Elements[Semi[C]].name.toLowerCase().indexOf(NowText.slice(2).toLowerCase()) != -1) {
        if (Data.Elements[Semi[C]].name.toLowerCase() == NowText.slice(2).toLowerCase()) {
          Results.unshift(Semi[C]);
          F += 1;
        } else {
          Results[F] = Semi[C];
          F += 1;
        }
      }
      C += 1;
    }
  } else {
    if (document.getElementById("text").value.slice(0,2) == "/#") {
      var T = parseInt(document.getElementById("text").value.slice(2))
      if (!isNaN(T) && T >= 0 && T < Data.Elements.length && Save.Unlocked.indexOf(T) != -1 && T != null) {
        Results = [T]
      } else {
        Results = []
      }
    } else {
      var C = 0;
      var F = 0;
      while ((C != Semi.length) && (F < Test)) {
        if (Data.Elements[Semi[C]].name.toLowerCase().indexOf(NowText.toLowerCase()) == 0) {
          if (Data.Elements[Semi[C]].name.toLowerCase() == NowText.toLowerCase()) {
            Results.unshift(Semi[C]);
            F += 1;
          } else {
            Results[F] = Semi[C];
            F += 1;
          }
        }
        C += 1;
      }
    }
  }
  if (Save.Sort == "ABC") SortABC();
  Draw();
}

function KP(e) {
  if (e.keyCode == 13) Enter(0,false);
}

function Enter(i,c) {
  if (document.getElementById("text").value.slice(0,2) == "//") {
    if (document.getElementById("text").value == "//toggleids") {ToggleIDs();}
    if (document.getElementById("text").value == "//reset") {NewGame();}
    if (document.getElementById("text").value == "//sort") {ChangeSort();}
    if (document.getElementById("text").value == "//changelog") {alert(changelog);}
    if (document.getElementById("text").value == "//credits") {alert(credits);}
    if (document.getElementById("text").value == "//ruinthefun") {RTF();}
    if (document.getElementById("text").value == "//mobile") {ToggleMobile();}
    if (document.getElementById("text").value.slice(0,8) == "//unlock") {Unlock(document.getElementById("text").value.slice(9));}
    if (document.getElementById("text").value.slice(0,9) == "//recipes") {Recipes(document.getElementById("text").value.slice(10));}
  } else {
    if (document.getElementById("text").value == "" && i == 0 && !c) {
      var Selected = Save.Unlocked[Math.floor(Math.random()*Save.Unlocked.length)]
      if (Phase) {
        Element1 = Selected;
        Display = [null,null,null];
        Display[0] = Selected;
      } else {
        TryMerge(Selected, Element1);
        Element1 = null;
        Display[1] = Selected;
      }
      Phase = !Phase;
      Update();
    } else {
      if (Results.length > i) {
        if (Phase) {
          Element1 = Results[i];
          Display = [null,null,null];
          Display[0] = Results[i];
        } else {
          TryMerge(Results[i], Element1);
          Element1 = null;
          Display[1] = Results[i];
        }
        Phase = !Phase;
      }
      Update();
    }
  }
  document.getElementById("text").value = "";
}

function TryMerge(x,y) {
  var Final = null;
  for (let i = 1; i < Data.Equations.length; i++) {
    if ((Data.Equations[i].parent1 == x) && (Data.Equations[i].parent2 == y) || (Data.Equations[i].parent2 == x) && (Data.Equations[i].parent1 == y)) {
      Final = Data.Equations[i].child;
      break;
    }
  }
  Display[2] = Final;
  Display[3] = false;
  if (Final != null && Save.Unlocked.indexOf(Final) == -1) {
    Save.Unlocked.push(Final);
    Save.Unlocked.sort(function(a, b){return a-b});
    Display[3] = true;
    SaveGame();
  }
}

function RTF() {
  Save.Unlocked == [];
  for (let i = 0; i < Data.Elements.length; i++) {
    Save.Unlocked[i] = i;
  }
  Save.Cheated = true;
  SaveGame();
}

function Unlock(x) {
  Final = parseInt(x);
  if (!isNaN(Final) && Final != null && Save.Unlocked.indexOf(Final) == -1) {
    Save.Unlocked.push(Final);
    Save.Unlocked.sort(function(a, b){return a-b});
    Display[3] = true;
    Save.Cheated = true;
    SaveGame();
  }
}

function ToggleIDs() {
  Save.IDs = !Save.IDs;
  SaveGame();
  Update();
}

function getName(x) {
  var Name = Data.Elements[x].name;
  if (Data.Elements[x].name.length > 51) Name = Data.Elements[x].name.slice(0,50) + "...";
  if (Save.IDs) Name = "[" + x + "] " + Name;
  return Name
}

function QH() {
  ctx.fillText("Type the name of the element to select / search.", 1446, 115);
  ctx.fillText("Press enter / click to choose.", 1446, 135);
  ctx.fillText("Spam enter for random merges.", 1446, 155);
  ctx.fillText("Have fun.", 1446, 195);
  ctx.fillText("If the text looks squished press F11.", 1446, 415);
  ctx.fillText("If that doesn't work, try Alt+F4.", 1446, 435);
  ctx.fillText("Otherwise try zooming in or out.", 1446, 455);
  ctx.fillText("Commands are:", 1446, 495);
  ctx.fillText("//reset - Resets game", 1446, 515);
  ctx.fillText("//ruinthefun - Ruins the fun [cheat]", 1446, 535);
  ctx.fillText("//unlock <id> - Unlock element with ID [cheat]", 1446, 555);
  ctx.fillText("//toggleids - Toggles IDs", 1446, 575);
  ctx.fillText("/#<id> - select by ID", 1446, 595);
  ctx.fillText("/*<text> - Searches for element containing <text>", 1446, 615);
  ctx.fillText("//recipes <id> - Shows all recipes", 1446, 635);
  ctx.fillText("//sort - Changes sort method [ABC may be slow]", 1446, 655);
  ctx.fillText("//mobile - Smartphone compatibility mode", 1446, 675);
  ctx.fillText("//changelog - Shows changelog", 1446, 695);
  ctx.fillText("//credits - Shows changelog", 1446, 715);
  ctx.fillStyle = "#999";
  ctx.fillText("Version 1.8", 1446, 815);
  ctx.fillStyle = "#8f8";
  ctx.fillText("Wildcard searching", 1446, 835);
  ctx.fillText("Sorting alphabetically", 1446, 855);
  ctx.fillText("Smartphone compatibility", 1446, 875);
  ctx.fillText("Viewable changelog & credits", 1446, 895);
}

var MousePos = [0,0];
var Tiling = [0,0,0];
function Move(e) {
  MousePos = [e.layerX*1920/e.target.clientWidth, e.layerY*1000/e.target.clientHeight];
  var PrevT = Tiling[2]
  Tiling = [Math.floor(MousePos[0]/480),Math.floor(MousePos[1]/20),Math.floor(MousePos[0]/480)*50+Math.floor(MousePos[1]/20)];
  if (PrevT != Tiling[2] && Loaded && !Save.Mobile) Draw();
}

function Click() {
  if (!Save.Mobile) {
    Tiling = [Math.floor(MousePos[0]/480),Math.floor(MousePos[1]/20),Math.floor(MousePos[0]/480)*50+Math.floor(MousePos[1]/20)];
    if (Tiling[2] < 150) Enter(Tiling[2],true);
  } else {
    Tiling = [Math.floor(MousePos[1]/100),(MousePos[0]<1440)];
    if (Tiling[1]) Enter(Tiling[0],true);
  }
}

function Draw() {
  if (!Save.Mobile) {
    ctx.fillStyle = "#222";
    ctx.fillRect(0,0,1440,1000);
    ctx.fillStyle = "#111";
    ctx.fillRect(1440,0,480,1000);
    ctx.fillStyle = "#444";
    if (Tiling[2] < 150) ctx.fillRect(480*Tiling[0],20*Tiling[1],480,20);
    var Limit = Results.length;
    if (Limit > 150) Limit = 150;
    for (let i = 0; i < Limit; i++) {
      ctx.fillStyle = Colors[Data.Elements[Results[i]].color];
      ctx.fillRect(Math.floor(i/50)*480,(i%50)*20,20,20);
      ctx.fillStyle = "#999";
      if (Save.Cheated) ctx.fillStyle = "#f99";
      if (i == 0) ctx.fillStyle = "white";
      ctx.fillText(getName(Results[i]),Math.floor(i/50)*480+22,(i%50)*20+17);
    }
    ctx.fillStyle = "white";
    ctx.font = "60px Segoe UI";
    ctx.fillText("Doodle Bird", 1442, 49);
    ctx.font = "20px Segoe UI";
    ctx.fillText(Save.Unlocked.length + " / " + Data.Elements.length + " elements found.", 1446, 75);
    QH();
  
    if (Display[0] != null) {
      ctx.fillStyle = Colors[Data.Elements[Display[0]].color];
      ctx.fillRect(1440,220,20,20);
      ctx.fillStyle = "#fff";
      ctx.fillText(getName(Display[0]),1462,237);
      if (Display[1] != null) {
        ctx.fillStyle = Colors[Data.Elements[Display[1]].color];
        ctx.fillRect(1440,260,20,20);
        ctx.fillStyle = "#fff";
        ctx.fillText("+",1443,255);
        ctx.fillText("=",1443,295);
        ctx.fillText(getName(Display[1]),1462,277);
        if (Display[2] != null) {
          ctx.fillStyle = Colors[Data.Elements[Display[2]].color];
          ctx.fillRect(1440,300,20,20);
          ctx.fillStyle = "#fff";
          ctx.fillText(getName(Display[2]),1462,317);
          if (Display[3]) {
            ctx.fillStyle = "#f0f";
            ctx.fillText("NEW!",1462,337);
          }
        } else {
          ctx.fillStyle = "#888";
          ctx.fillText("Nothing",1462,317);
          ctx.fillText("X",1444,317);
        }
      }
    }
  } else {
    ctx.fillStyle = "#222";
    ctx.fillRect(0,0,1440,1000);
    ctx.fillStyle = "#111";
    ctx.fillRect(1440,0,480,1000);
    ctx.fillStyle = "#444";
    var Limit = Results.length;
    if (Limit > 10) Limit = 10;
    for (let i = 0; i < Limit; i++) {
      ctx.fillStyle = Colors[Data.Elements[Results[i]].color];
      ctx.fillRect(0,i*100,100,100);
      ctx.fillStyle = "#999";
      if (Save.Cheated) ctx.fillStyle = "#f99";
      if (i == 0) ctx.fillStyle = "white";
      ctx.font = "72px Segoe UI";
      ctx.fillText(getName(Results[i]),108,i*100+70);
    }
    ctx.fillStyle = "white";
    ctx.font = "60px Segoe UI";
    ctx.fillText("Doodle Bird", 1442, 49);
    ctx.font = "20px Segoe UI";
    ctx.fillText(Save.Unlocked.length + " / " + Data.Elements.length + " elements found.", 1446, 75);
    QH();
  
    if (Display[0] != null) {
      ctx.fillStyle = Colors[Data.Elements[Display[0]].color];
      ctx.fillRect(1440,220,20,20);
      ctx.fillStyle = "#fff";
      ctx.fillText(getName(Display[0]),1462,237);
      if (Display[1] != null) {
        ctx.fillStyle = Colors[Data.Elements[Display[1]].color];
        ctx.fillRect(1440,260,20,20);
        ctx.fillStyle = "#fff";
        ctx.fillText("+",1443,255);
        ctx.fillText("=",1443,295);
        ctx.fillText(getName(Display[1]),1462,277);
        if (Display[2] != null) {
          ctx.fillStyle = Colors[Data.Elements[Display[2]].color];
          ctx.fillRect(1440,300,20,20);
          ctx.fillStyle = "#fff";
          ctx.fillText(getName(Display[2]),1462,317);
          if (Display[3]) {
            ctx.fillStyle = "#f0f";
            ctx.fillText("NEW!",1462,337);
          }
        } else {
          ctx.fillStyle = "#888";
          ctx.fillText("Nothing",1462,317);
          ctx.fillText("X",1444,317);
        }
      }
    }
  }

}

function Recipes(x) {
  var T = parseInt(x);
  var Recipes = [];
  if (!isNaN(T) && T >= 0 && T < Data.Elements.length && Save.Unlocked.indexOf(T) != -1 && T != null) {
    for (let i = 1; i < Data.Equations.length; i++) {
      if (Data.Equations[i].child == T) {
        if (Save.Unlocked.indexOf(Data.Equations[i].parent1) != -1) {
          Recipes[Recipes.length] = Data.Elements[Data.Equations[i].parent1].name
        } else {
          Recipes[Recipes.length] = "[UNKNOWN]";
        }

        Recipes[Recipes.length - 1] += " + ";

        if (Save.Unlocked.indexOf(Data.Equations[i].parent2) != -1) {
          Recipes[Recipes.length - 1] += Data.Elements[Data.Equations[i].parent2].name
        } else {
          Recipes[Recipes.length - 1] += "[UNKNOWN]";
        }

        Recipes[Recipes.length - 1] += " = ";

        Recipes[Recipes.length - 1] += Data.Elements[T].name;
      }
    }
    var Final = "Recipes for " + Data.Elements[T].name + " are :\n"
    for (let i = 0; i < Recipes.length; i++) {
      Final += "\n" + Recipes[i];
    }
    window.alert(Final);
  }
}

function SortABC() {
  var Semi = [];
  for (let i = 0; i < Results.length; i++) {
    Semi[i] = Results[i];
  }
  Results = [];
  for (let i = 0; i < Data.SortABC.length; i++) {
    if (Semi.indexOf(Data.SortABC[i]) != -1) Results[Results.length] = Data.SortABC[i];
  }
}

function ChangeSort() {
  var Prev = Save.Sort;
  if (Prev == "ID") {
    Save.Sort = "ABC";
    alert("Sorting alphabetically");
  }
  if (Prev == "ABC") {
    Save.Sort = "ID";
    alert("Sorting by ID");
  }
  SaveGame();
}

function ToggleMobile() {
  Save.Mobile = !Save.Mobile;
  SaveGame();
}

var changelog = "1.0 - Released Doodle Cock\n1.1 - Unselectable bug, select by ID\n1.2 - Fixed the color bug, mouse selection, recipe peeking\n1.3 - Everything by ID\n1.4 - Fixed click hitboxes, Fixed 1.3 error, Fixed colors upto 19\n1.5 - Fixed clicking on 1st element, Fixed text on //recipes\n1.6 - Game Renamed (DC -> Doodle Bird), Fixed colors (yet again), Minified json\n1.7 - Loading screen, Fixed that thing causing errors, json size halved\n1.8 - Wildcard searching, sorting alphabetically, smartphone compatibility, changelog visible without devtools";
var credits = "Doodle Bird was made by Quary\nReleased 12.09.20\nUpdated 14.09.20\n\nBased Of Elemental 3\nWhich was made by carykh\nYou can see E2 on htwins.net\n\nPublicied by the Elemental discord\nhttps://discord.com/invite/X9VyN42"

/*
  1.0 - Released Doodle Cock

  1.1 - Unselectable bug, select by ID

  1.2 - Fixed the color bug, mouse selection, recipe peeking

  1.3 - Everything by ID

  1.4 - Fixed click hitboxes, Fixed 1.3 error, Fixed colors upto 19

  1.5 - Fixed clicking on 1st element, Fixed text on //recipes

  1.6 - Game Renamed (DC -> Doodle Bird), Fixed colors (yet again), Minified json

  1.7 - Loading screen, Fixed that thing causing errors, json size halved

  1.8 - Wildcard searching, sorting alphabetically, smartphone compatibility, changelog visible without devtools
*/