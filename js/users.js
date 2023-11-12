/* File JS contenente le funzioni utili alla pagina users.html per la ricerca e la visualizzazione degli utenti */

/* searchUsers cerca gli utenti per username e se trova degli utenti con un username simile alla ricerca dell'utente li mostra */
function searchUsers() {
  var query = document.getElementById("search").value.toLowerCase();
  if (query.length > 2) {
    var users = JSON.parse(window.localStorage.getItem("users"));
    var results = [];
    for (var i = 0; i < users.length; i++) {
      var username = users[i].username.toLowerCase();
      if (username.includes(query)) {
        results.push(users[i]);
        continue;
      }
    }

    var table = document.getElementById("results");
    var action = "";
    table.innerHTML = "";
    for (i = 0; i < results.length; i++) {
      //aggiungo per ogni elemento un bottone che quando viene cliccato visualizza l'utente
      action =
        "<button class='action-button' id='action-button-" +
        i.toString() +
        "'onclick=\"enterUserView('" +
        results[i].email +
        "')\"><span class='material-icons-outlined'>arrow_forward_ios</span></button>";
      //ogni riga della tabella rappresenta un utente diverso
      table.innerHTML +=
        "<tr class='results-element'><td class='artist-element-1'>" +
        "<img src='" +
        results[i].image +
        "' class='artist-pic user-pic'></td><td class='artist-element-2'><table><tr><td><span class='artist-name'>" +
        results[i].username +
        "</span></td></tr><tr><td>" +
        "" +
        "</td></tr></table></td>" +
        "<td class='artist-element-3'>" +
        action +
        "</td>" +
        "</tr>";
    }
  }
}

/* enterUserView mostra le informazioni dell'utente selezionato */
function enterUserView(userEmail) {
  var playlists = JSON.parse(window.localStorage.getItem("playlists"));

  document.getElementById("results-container").style.display = "none";
  document.getElementById("searchbar-users").style.display = "none";

  userView = document.getElementById("user-view");

  var user = getUserFromEmail(userEmail);

  if (user != null) {
    var genresTag = "Nessuno";
    if (user.genresTag != null) {
      genresTag = user.genresTag;
    }
    userView.innerHTML = "";
    userView.style.display = "block";
    //mostro l'immagine, il nome e un bottone per tornare alla pagina di ricerca
    userView.innerHTML +=
      "<div class='artist-view-artist-info'><button class='go-back-button-result moved-button' id='go-back-button'onclick='goBackToSearchUsers()'><span class='material-icons-outlined'>arrow_back_ios</span></button><img src='" +
      user.image +
      "' class='artist-view-pic user-pic'><h1 class='artist-view-name'>" +
      user.username +
      "</h1><p>Interessi: " +
      genresTag +
      "</p><br><hr></div>" +
      "<h2 class='artist-view-album-header moved-header'>Gruppi</h2><div class='artist-view-album-container user-view-groups-container' id='user-view-groups-container'></div>";
    //quando si clicca sul bottone per tornare indietro si viene riportati alla pagina di ricerca
    document.getElementById("go-back-button").addEventListener("click", () => {
      window.location.href = "users.html";
    });

    //per ogni gruppo dell'utente creo l'emento per visualizzare foto, nome e genere
    if (user.ownedGroups != null && user.ownedGroups != undefined) {
      for (i = 0; i < user.ownedGroups.length; i++) {
        var group = getGroupFromGroupID(user.ownedGroups[i]);
        if (group != null) {
          document.getElementById("user-view-groups-container").innerHTML +=
            "<div class='artist-view-album' id='artist-view-album-" +
            i.toString() +
            "'<button onclick=\"groupsView('" +
            group.groupID +
            "')\"></button><img src='" +
            group.imageURL +
            "' class='artist-view-album-pic user-view-playlist-pic'>" +
            "<span class='artist-view-album-name'>" +
            group.groupName +
            "</span><br>" +
            "<span class='artist-view-album-year'>" +
            group.groupGenre +
            "</span>" +
            "</div>";
        }
      }
    } else {
      document.getElementById("user-view-groups-container").innerHTML +=
        "<p>L'utente non possiede ancora nessun gruppo</p>";
    }

    userView.innerHTML +=
      "</div>" +
      "<h2 class='artist-view-album-header moved-header-2'>Playlist pubbliche</h2><div class='artist-view-album-container' id='user-view-playlist-container'></div>";
    //per ogni playlist pubblica dell'utente creo l'emento per visualizzare foto, nome e genere
    if (user.playlists != null && user.playlists != undefined) {
      for (i = 0; i < user.playlists.length; i++) {
        document.getElementById("user-view-playlist-container").innerHTML +=
          "<div class='artist-view-album' id='artist-view-album-" +
          i.toString() +
          "'<button onclick=\"playlistView('" +
          user.playlists[i].playlistID +
          "')\"></button><img src='" +
          user.playlists[i].imageURL +
          "' class='artist-view-album-pic user-view-group-pic'>" +
          "<span class='artist-view-album-name'>" +
          user.playlists[i].playlistName +
          "</span><br>" +
          "<span class='artist-view-album-year'>" +
          user.playlists[i].playlistGenre +
          "</span>" +
          "</div>";
      }
    } else {
      document.getElementById("artist-view-album-container").innerHTML +=
        "<p>L'utente non possiede ancora nessuna playlist pubblica</p>";
    }
  } else {
    userView.innerHTML = "";
    userView.style.display = "block";
    userView.innerHTML +=
      "<p>Qualcosa è andato storto<p><button class='btn login-btn' onclick=goBackToSearchUsers()>Riprova</button>";
  }
}

/* goBackToSearchUsers ritorna alla pagina users.html */
function goBackToSearchUsers() {
  window.location.href = "users.html";
}

/* getUserFromEmail ritorna un utente a partire dalla mail dell'utente */
function getUserFromEmail(userEmail) {
  var users = JSON.parse(window.localStorage.getItem("users"));
  for (var i = 0; i < users.length; i++) {
    if (users[i].email == userEmail) {
      var playlists = users[i].playlists;
      var publicPlaylists = [];
      if (playlists != null && playlists != undefined) {
        publicPlaylists = playlists.filter(
          (element) => element.playlistPrivacy == "public"
        );
      }
      var user = {
        genresTag: users[i].genresTag,
        username: users[i].username,
        image: users[i].image,
        playlists: publicPlaylists,
        ownedGroups: users[i].ownedGroups,
      };
      return user;
    }
  }
  return null;
}
