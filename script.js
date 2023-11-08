(function ($) {
  "use strict";

  const request = indexedDB.open("fantasy", 1);
  let players = [];

  $(document).ready(function () {
    $("#second-main").fadeOut();
    //validation of the data and store it
    $("#start-btn").click(function () {
      let empty = false;

      $("main input").each(function () {
        if ($(this).val() == "") {
          empty = true;
        }
      });

      if (empty) {
        $("#alert").removeClass("hidden");
        $("#alert").add("flex");
      } else {
        loadingUI($(this), false, "");

        $("#alert").removeClass("flex");
        $("#alert").add("hidden");

        //store the players names
        $("main input").each(function () {
          players.push($(this).val());
        });

        rollDaDice();
      }

      setTimeout(function () {
        alertHides();
      }, 1500);
    });

    $("#restart-btn").click(function () {
      $("#second-main").find("div").remove();
      loadingUI($(this), false, "");
      rollDaDice();
    });

    $("#restart").click(function () {
      $("#second-main").find("div").remove();
      $("#second-main").fadeOut();
      $("#first-main").fadeIn();
      players = [];
    });

    //config the swipper js
    var swiper = new Swiper(".mySwiper", {
      slidesPerView: 15,
      spaceBetween: 30,
      loop: true,
      cssMode: true,
      autoplay: {
        delay: 1000,
        disableOnInteraction: false,
      },
    });
  });

  //functions
  function alertHides() {
    $("#alert").removeClass("flex");
    $("#alert").addClass("hidden");
  }

  function rollDaDice() {
    let teamsWithPlayer;
    // Usage of the function
    getFplTeams()
      .then((data) => {
        const teams = devideTeams(data);
        const playersWithTheirTeams = playersGetTeams(players, teams);
        const htmlTags = fillUI(playersWithTheirTeams);
        
        $("#first-main").fadeOut();
        $("#second-main").prepend(htmlTags);
        $("#second-main").fadeIn();

        loadingUI($("#start-btn"), true, "Start Dice");
        loadingUI($("#restart-btn"), true, " Restart Dice");
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    return teamsWithPlayer;
  }

  function devideTeams(jsonData) {
    const teams = [];
    let fiveTeams = [];
    jsonData.forEach(function (team) {
      fiveTeams.push(team.team);

      if (fiveTeams.length == 4) {
        teams.push(fiveTeams);
        fiveTeams = [];
      }
    });

    return teams;
  }

  function playersGetTeams(players, teams) {
    const sheets = [];
    const teamsIncluded = [];
    players.forEach(function (player) {
      let part = { player: "", teams: [] };
      part.player = player;

      for (let i = 0; i < 5; i++) {
        //get a random team
        let randomTeamIndex = getRandomNumber(0, 3);

        // test if it givven to another player
        while (teamsIncluded.includes(teams[i][randomTeamIndex].name)) {
          randomTeamIndex = getRandomNumber(0, 3);
        }

        let team = teams[i][randomTeamIndex];
        part.teams.push(team);
        teamsIncluded.push(team.name);
      }

      sheets.push(part);
    });

    return sheets;
  }

  function getRandomNumber(min, max) {
    // Ensure that the arguments are valid numbers
    if (typeof min !== "number" || typeof max !== "number") {
      throw new Error("Both min and max must be valid numbers");
    }

    // Generate a random number between min and max (inclusive of min, exclusive of max)
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function fillUI(jsondata) {
    let globalhtml = ``;
    jsondata.forEach(function (part) {
      let html = `
      <div
class="flex flex-col md:flex-row gap-3 border border-gray-500 rounded-sm">
<img
  src="../imgs/default-user.png"
  class="bg-gray-100 cursor-pointer object-cover"
  alt="default player image" />
<div class="px-3 md:py-3 md:px-0">
  <h2 class="font-bold text-gray-700 text-xl">${part.player}</h2>
  <p class="text-gray-500 text-lg">Teams</p>
  <div class="flex flex-wrap py-5 gap-3">`;

      part.teams.forEach(function (team) {
        html += `<img
        class="w-16 h-16 md:w-20 md:h-20 max-h-20 max-w-20"
        src="${team.logo}" data-src="${team.logo}"/>`;
      });

      html += ` </div>
      </div>
      </div>`;

      globalhtml += html;
    });

    return globalhtml;
  }

  const loadingUI = (button, remove, buttonText) => {
    button.html('LOADING <i class="fa-solid fa-spinner fa-spin"></i>');
    button.attr("disabled", "true");
    button.css({ cursor: "not-allowed", opacity: "70%" });

    if (remove) {
      button.removeAttr("disabled", "false");
      button.css({ cursor: "pointer", opacity: "100%" });
      button.html(buttonText + `<i class="fa-solid fa-dice"></i>`);
    }
  };

  const getFplTeams = () => {
    return new Promise((resolve, reject) => {
      const settings = {
        async: true,
        crossDomain: true,
        url: "https://premier-league-standings1.p.rapidapi.com/?season=2023",
        method: "GET",
        headers: {
          "X-RapidAPI-Key":
            "3126a3b50bmsh17126086b224a4dp15c826jsn0f77d3b1434f",
          "X-RapidAPI-Host": "premier-league-standings1.p.rapidapi.com",
        },
      };

      $.ajax(settings)
        .done(function (response) {
          resolve(response); // Resolve the Promise with the response data
        })
        .fail(function (error) {
          reject(error); // Reject the Promise if there's an error
        });
    });
  };
})(jQuery);
