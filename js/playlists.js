/* File JS contenente le funzioni utili alla pagina groups.html per la gestione dei gruppi di utenti */

/* fillPlaylistData mostra le playlist dell'utente sull'onload del body della pagona playlists.html */
function fillPlaylistData() {
  var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));
  var userPlaylists = loggedUser.playlists;
  var userFollowedPlaylists = loggedUser.followedPlaylists;

  window.localStorage.removeItem("searchResults");
  window.localStorage.removeItem("trackResults");
  //Popolo il div che mostra le playlists dall'utente
  var userPlaylistDiv = document.getElementById("user-playlists");
  if (userPlaylists != null) {
    for (i = 0; i < userPlaylists.length; i++) {
      var imageURL =
        userPlaylists[i].imageURL != ""
          ? userPlaylists[i].imageURL
          : "No_image_available.svg.png";

      var privacy;
      if (userPlaylists[i].playlistPrivacy == "public") {
        privacy = "Pubblica";
      }
      if (userPlaylists[i].playlistPrivacy == "private") {
        privacy = "Privata";
      }
      if (
        userPlaylists[i].playlistPrivacy != "public" &&
        userPlaylists[i].playlistPrivacy != "private"
      ) {
        privacy = "Condivisa";
      }
      userPlaylistDiv.innerHTML +=
        "<div class='user-playlists-element' id='user-playlists-element-" +
        i.toString() +
        "'onclick=\"playlistView('" +
        userPlaylists[i].playlistID +
        "')\"><img class='user-playlists-pic' src='" +
        imageURL +
        "'><br><span class='user-playlists-span pink-text'>" +
        userPlaylists[i].playlistName +
        "</span><br><span>" +
        privacy +
        "</span></div>";
    }
  }
  //Popolo il div che mostra le playlists seguite dall'utente
  var followedPlaylistsDiv = document.getElementById(
    "followed-playlists-element"
  );
  followedPlaylistsDiv.innerHTML = "";

  if (userFollowedPlaylists == null || userFollowedPlaylists.length <= 0) {
    followedPlaylistsDiv.innerHTML +=
      '<p>Al momento non segui nessuna playlist<p><button class="btn login-btn" onclick="searchMode()">Cerca una nuova playlist</button>';
  } else {
    for (var i = 0; i < userFollowedPlaylists.length; i++) {
      playlist = getPlaylistFromID(userFollowedPlaylists[i]);
      var imageURL =
        playlist.imageURL != ""
          ? playlist.imageURL
          : "No_image_available.svg.png";

      followedPlaylistsDiv.innerHTML +=
        "<div class='user-playlists-element' id='user-playlists-element-" +
        i.toString() +
        "'onclick=\"playlistView('" +
        playlist.playlistID +
        "')\"><img class='user-playlists-pic' src='" +
        imageURL +
        "'><br><span class='user-playlists-span'>" +
        playlist.playlistName +
        "</span><br><span class='pink-text'>" +
        playlist.ownerUsername +
        "</span></div>";
    }
  }
}

/* createUserPlaylist nasconde tutti gli elementi della pagina per mostrare soltanto il form di creazione della playlist */
function createUserPlaylist() {
  document.getElementById("playlist-results-container").style.display = "none";
  document.getElementById("search-mode-button").style.display = "none";
  document.getElementById("create-playlist-form").style.display = "block";
}

/* insertNewPlaylist crea e aggiunge la playlist creata nel "database" delle playlists */
function insertNewPlaylist() {
  if (document.getElementById("playlist-name").value.trim().length < 4) {
    alert("Inserisci un nome di almeno 4 caratteri");
  } else {
    var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));
    var users = JSON.parse(window.localStorage.getItem("users"));
    var playlists = window.localStorage.getItem("playlists");

    //Inserisco la playlist nel "database" delle playlists
    if (playlists == null) {
      playlists = [];
    } else {
      playlists = JSON.parse(playlists);
    }

    var playlistID =
      loggedUser.email + document.getElementById("playlist-name").value.trim();
    var playlist = {
      playlistName: document.getElementById("playlist-name").value.trim(),
      playlistID: playlistID,
      playlistPrivacy: document.getElementById("playlist-privacy-select-form")
        .value,
      playlistGenre: document.getElementById("playlist-genre-select-form")
        .value,
      imageURL: document.getElementById("image-url").value.trim(),
      ownerEmail: loggedUser.email,
      ownerUsername: loggedUser.username,
      tracks: [],
    };

    var nameAlreadyTaken = false;
    for (var i = 0; i < playlists.length; i++) {
      if (playlists[i].playlistID == playlist.playlistID) {
        nameAlreadyTaken = true;
        errorPopup(
          "Esiste già una playlist con questo nome, scegline un altro"
        );
      }
    }

    if (!nameAlreadyTaken) {
      playlists.push(playlist);
      window.localStorage.setItem("playlists", JSON.stringify(playlists));

      //Inserisco la playlist nelle playlist dell'utente loggato
      if (loggedUser.playlists == null) {
        loggedUser.playlists = [];
      }
      loggedUser.playlists.push(playlist);
      window.localStorage.setItem("loggedUser", JSON.stringify(loggedUser));

      //Aggiorno le modifiche nel "database" degli utenti
      index = getUserIndexFromLoggedUser();
      users[index] = loggedUser;
      window.localStorage.setItem("users", JSON.stringify(users));

      successPopup(document.getElementById("playlist-name").value.trim());
    }
  }
}

/* successPopup nasconde il form di creazione della playlist e mostra il popup di avvenuta creazione della playlist, mostrando il nome dell'utente che ha creato la playlist e il nome della playlist  */
function successPopup(playlistName) {
  document.getElementById("create-playlist-form").style.display = "none";
  document.getElementById("playlist-form-success").style.display = "block";

  document.getElementById("username-popup").innerHTML = JSON.parse(
    window.localStorage.getItem("loggedUser")
  ).username;
  document.getElementById("playlist-name-popup").innerHTML = playlistName;
}

function errorPopup(message) {
  document.getElementById("create-playlist-form").style.display = "none";
  document.getElementById("error-message").innerText = message;
  document.getElementById("playlist-form-error").style.display = "block";
}

/* getUserIndexFromLoggedUser ritorna l'indice dell'utente loggato all'interno dell'array contenente tutti gli utenti registrati */
function getUserIndexFromLoggedUser() {
  users = JSON.parse(window.localStorage.getItem("users"));
  loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));
  for (i = 0; i < users.length; i++) {
    if (users[i].username == loggedUser.username) {
      return i;
    }
  }
  return -1;
}

/* searchMode mostra gli elementi utili alla ricerca delle playlist, nascondendo ciò che non serve */
function searchMode() {
  document.getElementById("playlist-results-container").style.display = "none";
  document.getElementById("search-mode-button").style.display = "none";
  document.getElementById("go-back-from-search-mode-button").style.display =
    "block";
  document.getElementById("search-playlist-results").style.display = "block";
  document.getElementById("searchbar").style.display = "flex";
}

/* goBackFromSearchMode mostra gli elementi utili alla navigazione delle playlist, nascondendo gli elementi di ricerca delle playlist */
function goBackFromSearchMode() {
  document.getElementById("go-back-from-search-mode-button").style.display =
    "none";
  document.getElementById("searchbar").style.display = "none";
  document.getElementById("search-playlist-results").style.display = "none";
  document.getElementById("search-playlist-results").innerHTML = "";
  document.getElementById("playlist-results-container").style.display = "block";
  document.getElementById("search-mode-button").style.display = "block";
}

/* searchPlaylists cerca playlist nel local storage che abbiano un nome simile a quello inserito dall'utente e del genere selezionato dall'utente */
function searchPlaylists() {
  var filter = document.getElementById("playlist-genre-search-select").value;
  var query = document.getElementById("search").value.trim();

  var playlists = JSON.parse(window.localStorage.getItem("playlists"));
  var results = [];

  if (filter != "all") {
    for (var i = 0; i < playlists.length; i++) {
      if (
        playlists[i].playlistName.toLowerCase().includes(query.toLowerCase()) &&
        playlists[i].playlistGenre == filter &&
        playlists[i].playlistPrivacy == "public"
      ) {
        results.push(playlists[i]);
      }
    }
  } else {
    for (var i = 0; i < playlists.length; i++) {
      if (
        playlists[i].playlistName.toLowerCase().includes(query.toLowerCase()) &&
        playlists[i].playlistPrivacy == "public"
      ) {
        results.push(playlists[i]);
      }
    }
  }
  showSearchPlaylistsResults(results);
}

/* showSearchGroupsResults mostra i risultati della ricerca dei gruppi */
function showSearchPlaylistsResults(results) {
  resultsDiv = document.getElementById("search-playlist-results");
  resultsDiv.innerHTML = "";
  if (results.length < 1) {
    resultsDiv.innerHTML += "<p>La ricerca non ha prodotto alcun risultato</p>";
  } else {
    for (var i = 0; i < results.length; i++) {
      var imageURL =
        results[i].imageURL != ""
          ? results[i].imageURL
          : "No_image_available.svg.png";

      resultsDiv.innerHTML +=
        "<div class='search-playlist-element' id='search-playlist-element-" +
        i.toString() +
        "'onclick=\"playlistView('" +
        results[i].playlistID +
        "')\"><img class='search-playlist-pic' src='" +
        imageURL +
        "'><span class='search-playlist-span'>" +
        results[i].playlistName +
        "</span><br><span class='search-playlist-owner'>" +
        results[i].ownerUsername +
        "</span></div>";
    }
  }
}

function getPlaylistFromID(playlistID) {
  var playlists = JSON.parse(window.localStorage.getItem("playlists"));
  for (var i = 0; i < playlists.length; i++) {
    if (playlists[i].playlistID == playlistID) {
      return playlists[i];
    }
  }
  return null;
}

function playlistView(playlistID) {
  if (document.getElementById("search-mode-button") != null) {
    document.getElementById("search-mode-button").style.display = "none";
  }
  if (document.getElementById("playlist-results-container") != null) {
    document.getElementById("playlist-results-container").style.display =
      "none";
  }
  if (document.getElementById("searchbar") != null) {
    document.getElementById("searchbar").style.display = "none";
  }
  if (document.getElementById("search-playlist-results") != null) {
    document.getElementById("search-playlist-results").style.display = "none";
  }
  if (document.getElementById("group-view") != null) {
    document.getElementById("group-view").style.display = "none";
  }

  if (document.getElementById("user-view") != null) {
    document.getElementById("user-view").style.display = "none";
  }

  loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));
  loggedUserMail = loggedUser.email;

  container = document.getElementById("view-playlist-container");

  container.style.display = "inline-block";
  container.innerHTML = "";

  playlist = getPlaylistFromID(playlistID);
  if (playlist == null) {
    container.innerHTML += "<p>C'è stato un errore, riprova</p>";
  } else {
    var button = "";
    //se non è stata inserita un'immagine ne utilizzo una predefinita
    imageURL =
      playlist.imageURL != ""
        ? playlist.imageURL
        : "No_image_available.svg.png";

    if (playlistID.includes(loggedUserMail)) {
      button =
        "<button class='modify-button' onclick=\"enterModifyView('" +
        playlistID +
        "')\">Modifica la playlist</button>";
    } else if (loggedUser.followedPlaylists == null) {
      button =
        "<button class='action-button playlist-action-button' onclick=\"confirmAddPlaylist('" +
        playlistID +
        "')\"><span class='material-icons-outlined'>add</span></button>";
    } else if (!loggedUser.followedPlaylists.includes(playlistID)) {
      button =
        "<button class='action-button playlist-action-button' onclick=\"confirmAddPlaylist('" +
        playlistID +
        "')\"><span class='material-icons-outlined'>add</span></button>";
    } else {
      button =
        "<button class='action-button playlist-action-button' onclick=\"confirmRemovePlaylist('" +
        playlistID +
        "')\"><span class='material-icons-outlined'>remove</span></button>";
    }

    var privacy = "";
    if (playlist.playlistPrivacy == "public") {
      privacy = "Pubblica";
    }
    if (playlist.playlistPrivacy == "private") {
      privacy = "Privata";
    }
    if (
      playlist.playlistPrivacy != "public" &&
      playlist.playlistPrivacy != "private"
    ) {
      var groups = JSON.parse(window.localStorage.getItem("groups"));
      var index = getGroupIndexFromGroupID(groups, playlist.playlistPrivacy);
      privacy = "Condivisa con: " + groups[index].groupName;
    }
    //mostro le informazioni della playlist: immagine, nome, proprietario, genere, un pulsante per aggiungere la playlist alle proprie playlist se non si è il proprietario oppure un pulsante per modificarla se si è il proprietario. Mostro inoltr un pulsante per tornare alla pagina playlists.html
    if (document.getElementById("user-view") != null) {
      container.innerHTML +=
        "<a href='users.html'><button class='go-back-button-playlist' id='go-back-button'><span class='material-icons-outlined'>arrow_back_ios</span></button></a>";
    } else {
      container.innerHTML +=
        "<button class='go-back-button-playlist' id='go-back-button' onclick='goBackFromPlaylistView()'><span class='material-icons-outlined'>arrow_back_ios</span></button>";
    }
    container.innerHTML +=
      "<div class='playlist-view-playlist-info'><img src='" +
      imageURL +
      "' class='playlist-view-pic'><div class='album-view-album-info-column' id='album-view-album-info-column'><h1 class='album-view-name' id='playlist-name'>" +
      playlist.playlistName +
      "</h1><h1 class='album-view-artist'>" +
      playlist.ownerUsername +
      "</h1><br><span class='album-view-album-year'>Genere: " +
      playlist.playlistGenre +
      "</span><br><span class='album-view-album-year'>Privacy: <span class='pink-text'>" +
      privacy +
      "</span></span><br>" +
      button +
      "</div></div><hr class='album-view-separator'>" +
      //predispongo il div in cui inserire le tracce della playlist
      "<div class='playlist-view-tracks-container' id='playlist-view-tracks-container'><div class='album-view-tracks-container-elements' id='album-view-tracks-container-elements'></div></div>";

    document.getElementById("album-view-tracks-container-elements").innerHTML =
      "";
    //recupero le tracce della playlist
    var tracks = playlist.tracks;

    if (tracks.length > 0) {
      searchTracks(tracks, playlistID);
    } else {
      document.getElementById(
        "album-view-tracks-container-elements"
      ).innerHTML += "<p>La playlist non contiene nessuna traccia</p>";
    }
  }
}

function showResults(playlistID) {
  var returnedTracks = JSON.parse(
    window.localStorage.getItem("trackResults")
  ).tracks;
  window.localStorage.setItem("playlistID", JSON.stringify(playlistID));
  //per ogni canzone mostro il numero della canzone, il nome, la durata e un bottone che mostra il menu contestuale
  for (var i = 0; i < returnedTracks.length; i++) {
    var action = "";
    if (playlistID.includes(loggedUserMail)) {
      action =
        "<button class='action-button track-element-button' id='action-button-" +
        i.toString() +
        "' onclick=\"showDeleteMenu('" +
        i +
        "')\"><span class='material-icons-outlined'>clear</span></button>";
    }

    document.getElementById("album-view-tracks-container-elements").innerHTML +=
      "<div class='track-element' id='track-element-" +
      i.toString() +
      "'><div class='playlist-track-element-column-1'><img class='track-element-column-image' src='" +
      returnedTracks[i].album.images[0].url +
      "'></div><div class='playlist-track-element-column-2'><span class='track-element-name'>" +
      returnedTracks[i].name +
      "</span><br><span class='track-element-artist'>" +
      returnedTracks[i].artists[0].name +
      "</span><span class='track-element-album'>" +
      " &bull; " +
      returnedTracks[i].album.name +
      "</span></div><div class='playlist-track-element-column-3'><span class='track-element-duration'>" +
      millisToMinutesAndSeconds(returnedTracks[i].duration_ms) +
      "</span></div><div class='playlist-track-element-column-4'>" +
      action +
      "<div class='track-element-break-line'></div></div></div>";
  }
  //calcolo la durata totale dell'album
  var totalLength = 0;
  for (var i = 0; i < returnedTracks.length; i++) {
    totalLength += parseInt(returnedTracks[i].duration_ms, 10);
  }
  //mostro il numero di branie la durata totale dell'album
  container.innerHTML +=
    "<hr class='album-view-separator'></hr><div class='track-element-break-line'></div>";
  document.getElementById("album-view-album-info-column").innerHTML +=
    "<span class='album-view-summary'>" +
    returnedTracks.length +
    " brani, " +
    millisToMinutes(totalLength) +
    " minuti</span>";
}

/* millisToMinutesAndSeconds converte i millisecondi in minuti:secondi in quanto spotify fornisce la durata delle canzoni in millisecondi */
function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

/* millisToMinutes converte i millisecondi in minuti */
function millisToMinutes(millis) {
  var minutes = Math.floor(millis / 60000);
  return minutes;
}

/* goBackFromPlaylistView reindirizza alla pagina playlists.html */
function goBackFromPlaylistView() {
  window.location.href = "playlists.html";
}

/* enterModifyView mostra il form di modifica di una playlist */
function enterModifyView(playlistID) {
  document.getElementById("view-playlist-container").style.display = "none";
  document.getElementById("modify-playlist-form").style.display = "block";

  var playlist = getPlaylistFromID(playlistID);

  //riempio gli spazi di input del form con le informazioni già esistenti della playlist
  document.getElementById("playlist-name-modify-form").value =
    playlist.playlistName;

  document.getElementById("image-url-modify-form").value = playlist.imageURL;

  document.getElementById("playlist-privacy-modify-form").value =
    playlist.playlistPrivacy;

  document.getElementById("playlist-genre-select-modify-form").value =
    playlist.playlistGenre;

  var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));
  var ownedGroups = getUserOwnedGroups(loggedUser.email);
  var subscribedGroups = getUserSubscribedGroups(loggedUser.email);
  var userGroups = [];

  //se l'utente possiede dei gruppi ma non ne segue
  if (ownedGroups.length > 0 && subscribedGroups.length == 0) {
    userGroups = ownedGroups;
  }
  //se l'utente non possiede dei gruppi ma ne segue
  if (ownedGroups.length == 0 && subscribedGroups.length > 0) {
    userGroups = subscribedGroups;
  }
  //se l'utente possiede dei gruppi e ne segue
  if (ownedGroups.length > 0 && subscribedGroups.length > 0) {
    userGroups = ownedGroups;
    userGroups = userGroups.concat(subscribedGroups);
  }

  //mostro la possibilità di condividere la playlist con i gruppi seguiti o posseduti dall'utente
  for (var i = 0; i < userGroups.length; i++) {
    document.getElementById("playlist-privacy-modify-form").innerHTML +=
      "<option value='" +
      userGroups[i].groupID +
      "'>Condividi con il gruppo: " +
      userGroups[i].groupName +
      "</option>";
  }
  //aggiungo la funzione di modifica della playlist alla pressione del bottone corrispondente
  document
    .getElementById("modify-playlist-btn")
    .addEventListener("click", function () {
      modifyPlaylist(playlistID);
    });

  //aggiungo la funzione di cancellazione della playlist alla pressione del bottone corrispondente
  document
    .getElementById("delete-playlist")
    .addEventListener("click", function () {
      confirmDeletePlaylist(playlistID);
    });
}

/* getUserOwnedGroups ritorna un array con i gruppi creati dall'utente */
function getUserOwnedGroups(loggedUserMail) {
  var groups = JSON.parse(window.localStorage.getItem("groups"));
  var ownedGroups = [];
  if (groups != undefined) {
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].groupID.includes(loggedUserMail)) {
        ownedGroups.push(groups[i]);
      }
    }
  }
  return ownedGroups;
}

/* getUserSubscribedGroups ritorna gli utenti a cui l'utente loggato si è iscritto */
function getUserSubscribedGroups(loggedUserMail) {
  var groups = JSON.parse(window.localStorage.getItem("groups"));
  var subscribedGroups = [];
  if (groups != undefined) {
    //controllo per ogni gruppo
    for (var i = 0; i < groups.length; i++) {
      //se esistono iscritti o il gruppo i ha almeno un iscritto
      var subscribers = groups[i].subscribers;
      if (subscribers != null) {
        //controllo se tra gli iscritti del gruppo i c'è l'utente loggato
        for (var j = 0; j < subscribers.length; j++) {
          if (subscribers[j] == loggedUserMail) {
            subscribedGroups.push(groups[i]);
            break;
          }
        }
      }
    }
  }
  return subscribedGroups;
}

/* modifyPlaylist modifica la playlist selezionata */
function modifyPlaylist(playlistID) {
  var playlist = getPlaylistFromID(playlistID);
  var oldPlaylistPrivacy = playlist.playlistPrivacy;

  //controllo se effettivamente l'utente ha apportato qualche modifica
  if (
    document.getElementById("playlist-name-modify-form").value.trim() !=
      playlist.playlistName ||
    document.getElementById("image-url-modify-form").value.trim() !=
      playlist.imageURL ||
    document.getElementById("playlist-privacy-modify-form").value !=
      playlist.playlistPrivacy ||
    document.getElementById("playlist-genre-select-modify-form").value !=
      playlist.playlistGenre
  ) {
    playlist.playlistName = document
      .getElementById("playlist-name-modify-form")
      .value.trim();

    playlist.imageURL = document
      .getElementById("image-url-modify-form")
      .value.trim();

    playlist.playlistPrivacy = document.getElementById(
      "playlist-privacy-modify-form"
    ).value;

    playlist.playlistGenre = document.getElementById(
      "playlist-genre-select-modify-form"
    ).value;

    var users = JSON.parse(window.localStorage.getItem("users"));
    var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));
    var playlists = JSON.parse(window.localStorage.getItem("playlists"));
    var groups = JSON.parse(window.localStorage.getItem("groups"));

    ownedGroups = getUserOwnedGroups(loggedUser.email);

    //Aggiorno l'ID  se è cambiato il nome
    var oldID = playlist.playlistID;
    playlist.playlistID = playlist.ownerEmail + playlist.playlistName.trim();

    /*
      1- se la playlist era già condivisa con un gruppo, la tolgo da quel gruppo
      2- aggiungo la playlist al nuovo gruppo
    */
    //aggiorno i gruppi se la playlist viene condivisa con un gruppo
    //se la playlist viene condivisa con un gruppo diverso oppure da condivisa diventa pubblica o privata
    if (
      (playlist.playlistPrivacy != oldPlaylistPrivacy &&
        oldPlaylistPrivacy != "public" &&
        oldPlaylistPrivacy != "private") ||
      (playlist.playlistPrivacy != oldPlaylistPrivacy &&
        (playlist.playlistPrivacy == "public" ||
          playlist.playlistPrivacy == "private"))
    ) {
      //trovo il vecchio gruppo e rimuovo la playlist
      var indexOldGroup = getGroupIndexFromGroupID(groups, oldPlaylistPrivacy);
      if (indexOldGroup != undefined && indexOldGroup != -1) {
        var sharedPlaylists = groups[indexOldGroup].sharedPlaylists;
        groups[indexOldGroup].sharedPlaylists = sharedPlaylists.filter(
          (item) => item != oldID || item != playlist.playlistID
        );
      }
    }
    //se la playlist da pubblica o privata viene condivisa con un gruppo
    if (
      playlist.playlistPrivacy != oldPlaylistPrivacy &&
      (oldPlaylistPrivacy == "public" || oldPlaylistPrivacy == "private")
    ) {
      //trovo il nuovo gruppo e gli aggiungo la playlist
      var indexNewGroup = getGroupIndexFromGroupID(
        groups,
        playlist.playlistPrivacy
      );
      if (indexNewGroup != undefined && indexNewGroup != -1) {
        if (groups[indexNewGroup].sharedPlaylists == null) {
          groups[indexNewGroup].sharedPlaylists = [];
        }
        groups[indexNewGroup].sharedPlaylists.push(playlist.playlistID);
      }
    }

    //aggiorno le modifiche nel "database" dei gruppi
    window.localStorage.setItem("groups", JSON.stringify(groups));

    //aggiorno le modifiche alla playlist nel "databse" delle playlist
    var indexC = getPlaylistIndexFromPlaylistID(playlists, oldID);
    if (indexC != -1) {
      playlists[indexC] = playlist;
      window.localStorage.setItem("playlists", JSON.stringify(playlists));
      var indexD = getPlaylistIndexFromPlaylistID(loggedUser.playlists, oldID);
      if (indexD != -1) {
        loggedUser.playlists[indexD] = playlists[indexC];
      }
    }

    //aggiorno l'utente loggato e il "database" degli utenti
    window.localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
    var index = getUserIndexFromLoggedUser();
    users[index] = loggedUser;
    window.localStorage.setItem("users", JSON.stringify(users));

    successPopupModify(playlist.playlistName, loggedUser.username);
  } else {
    window.location.href = "playlists.html";
  }
}

/* successPopupModify mostra il popup di avvenuta modifica della playlist, mostrando il nome della playlist e l'username dell'utente */
function successPopupModify(playlistName, username) {
  document.getElementById("username-popup-modify-success").innerText = username;

  document.getElementById("playlist-name-popup-modify-success").innerText =
    playlistName;

  document.getElementById("modify-playlist-form").style.display = "none";

  document.getElementById("playlist-modify-success").style.display = "block";
}

/* getPlaylistIndexFromPlaylistID ritorna l'indice della playlist all'interno dell'array con tutte le playlist */
function getPlaylistIndexFromPlaylistID(playlists, playlistID) {
  for (var i = 0; i < playlists.length; i++) {
    if (playlists[i].playlistID == playlistID) {
      return i;
    }
  }
  return -1;
}

/* getPlaylistIndexFromGroups ritorna l'indice della playlist all'interno dell'array delle playlist condivise del gruppo */
function getPlaylistIndexFromGroups(groups, playlistID) {
  for (var i = 0; i < groups.length; i++) {
    if (groups[i] == playlistID) {
      return i;
    }
    return -1;
  }
}

/* confirmAddPlaylist aggiunge la playlist alle playlist seguite dall'utente e mostra un popup di avvenuta aggiunta */
function confirmAddPlaylist(playlistID) {
  var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));
  var users = JSON.parse(window.localStorage.getItem("users"));

  if (loggedUser.followedPlaylists == null) {
    loggedUser.followedPlaylists = [];
  }
  loggedUser.followedPlaylists.push(playlistID);
  window.localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
  index = getUserIndexFromLoggedUser();
  users[index] = loggedUser;
  window.localStorage.setItem("users", JSON.stringify(users));

  confirmAddPopup(playlistID);
}

/* confirmRemovePlaylist rimuove la playlist dalle playlist seguite dall'utente e mostra un popup di avvenuta rimozione */
function confirmRemovePlaylist(playlistID) {
  var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));
  var users = JSON.parse(window.localStorage.getItem("users"));

  if (loggedUser.followedPlaylists.length == 1) {
    loggedUser.followedPlaylists.pop();
  } else {
    var index = -1;
    for (var i = 0; i < loggedUser.followedPlaylists.length; i++) {
      if (loggedUser.followedPlaylists[i] == playlistID) {
        index = i;
      }
    }
    if (index == loggedUser.followedPlaylists.length - 1) {
      loggedUser.followedPlaylists.pop();
    } else {
      var temp =
        loggedUser.followedPlaylists[loggedUser.followedPlaylists.length - 1];
      loggedUser.followedPlaylists[loggedUser.followedPlaylists.length - 1] =
        loggedUser.followedPlaylists[index];

      loggedUser.followedPlaylists[index] = temp;

      loggedUser.followedPlaylists.pop();
    }
  }
  window.localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
  var index = getUserIndexFromLoggedUser();
  users[index] = loggedUser;
  window.localStorage.setItem("users", JSON.stringify(users));

  confirmRemovePopup(playlistID);
}

/* confirmAddPopup mostra il popup di avvenuta aggiunta della playlist alle playlist seguite dall'utente */
function confirmAddPopup(playlistID) {
  document.getElementById("view-playlist-container").style.display = "none";
  playlist = getPlaylistFromID(playlistID);
  document.getElementById("playlist-name-popup-add-success").innerText =
    playlist.playlistName;

  document.getElementById("playlist-add-success").style.display = "block";
}

/* confirmRemovePopup mostra il popup di avvenuta rimozione della playlist dalle playlist seguite dall'utente */
function confirmRemovePopup(playlistID) {
  document.getElementById("view-playlist-container").style.display = "none";
  playlist = getPlaylistFromID(playlistID);
  document.getElementById("playlist-name-popup-remove-success").innerText =
    playlist.playlistName;

  document.getElementById("playlist-remove-success").style.display = "block";
}

/* getToken recupera il token valido per un'ora da Spotify */
function getToken() {
  const client_id = "185d7503f72a4db9a5e699d5d2d04622";
  const client_secret = "3c7239ca0c21471f9e3d5490c2246e23";
  var url = "https://accounts.spotify.com/api/token";
  fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(`${client_id}:${client_secret}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return alert(json.statusText);
      }
    })
    .then((token) => {
      window.localStorage.setItem("token", token.access_token);
    });
}

/* searchTracks gestisce la ricerca delle tracce all'interno di una playlist. 
   - Se la risposta è 200 allora ciò che ritorna viene iserito nel local storage in searchResults e mostrato con la funzione generateResultsView().
   - Se la risposta è 401 viene generato un nuovo token e viene rifatta la ricerca
   - Se la risposta è 403 viene visualizzato l'alert relativo e si viene reindirizzati alla homepage
   - Se la risposta è 429 viene visualizzato l'alert relativo e si viene reindirizzati alla homepage  */
function searchTracks(tracks, playlistID) {
  var IDs = "";
  for (var i = 0; i < tracks.length; i++) {
    if (i == tracks.length - 1) {
      IDs += tracks[i];
    } else {
      IDs += tracks[i] + ",";
    }
  }

  var url = "https://api.spotify.com/v1/tracks?ids=" + IDs;

  fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + window.localStorage.getItem("token"),
    },
  }).then((response) => {
    if (response.status == "200") {
      response
        .json()
        .then((searchResults) =>
          window.localStorage.setItem(
            "trackResults",
            JSON.stringify(searchResults)
          )
        )
        .then(() => showResults(playlistID));
    } else if (response.status == "401") {
      getToken();
      search(url);
    } else if (response.status == "403") {
      alert("Qualcosa è andato storto, riprova");
      window.location.href = "playlists.html";
    } else if (response.status == "429") {
      alert("Limite massimo di ricerche, riprova più tardi");
      window.location.href = "home.html";
    }
  });
}

/* showDeleteMenu mostra il menu per eliminare la playlist */
function showDeleteMenu(i, playlistID) {
  var trackToDelete = JSON.parse(window.localStorage.getItem("trackResults"))
    .tracks[i];
  document
    .getElementById("confirm-delete-track-btn")
    .addEventListener("click", function () {
      deleteTrack(trackToDelete, playlistID);
    });
  document.getElementById("track-to-delete-name-confirm").innerText =
    trackToDelete.name;
  document.getElementById("track-artist-to-delete-name-confirm").innerText =
    trackToDelete.artists[0].name;

  document.getElementById("track-remove-confirm").style.display = "block";
}

/* deleteTrack elimina la traccia selezionata dalla playlist */
function deleteTrack(trackToDelete, playlistID) {
  var playlists = JSON.parse(window.localStorage.getItem("playlists"));
  var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));
  var users = JSON.parse(window.localStorage.getItem("users"));
  var playlistID = JSON.parse(window.localStorage.getItem("playlistID"));

  //tolgo la traccia dalla playlist selezionata
  for (var i = 0; i < playlists.length; i++) {
    if (playlists[i].playlistID == playlistID) {
      var tracks = playlists[i].tracks;
      playlists[i].tracks = tracks.filter(
        (element) => element != trackToDelete.id
      );
      break;
    }
  }

  //tolgo la traccia nella playlist selezionata
  for (var i = 0; i < loggedUser.playlists.length; i++) {
    if (loggedUser.playlists[i].playlistID == playlistID) {
      var tracks = loggedUser.playlists[i].tracks;
      loggedUser.playlists[i].tracks = tracks.filter(
        (element) => element != trackToDelete.id
      );
      break;
    }
  }

  //aggiorno le modifiche nel local storage
  window.localStorage.setItem("playlists", JSON.stringify(playlists));
  var index = getUserIndexFromLoggedUser();
  users[index] = loggedUser;
  window.localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
  window.localStorage.setItem("users", JSON.stringify(users));

  //mostro il messaggio di avvenuta rimozione della canzone
  var popup = document.getElementById("track-remove-confirm");
  popup.innerHTML = "";
  popup.innerHTML +=
    "<p>Il brano <span class='pink-text'>" +
    trackToDelete.name +
    "</span> è stato correttamente eliminato dalla playlist!<br><a href='playlists.html'><button class='btn registration-btn'>OK</button></a>";
}

/* confirmDeletePlaylist mostra un popup in cui si chiede se l'utente voglia davvero eliminare la playlist selezionata */
function confirmDeletePlaylist(playlistID) {
  var playlist = getPlaylistFromID(playlistID);
  document.getElementById("modify-playlist-form").innerHTML = "";
  document.getElementById("modify-playlist-form").innerHTML +=
    "<p>Sei sicuro di voler cancellare la playlist <span class='pink-text'>" +
    playlist.playlistName +
    "</span>?</p><br><button class='btn registration-btn' onclick=\"deletePlaylist('" +
    playlistID +
    "')\">SI, VOGLIO CANCELLARE LA PLAYLIST</button><br><a href='playlists.html'<button class='btn login-btn'>ANNULLA</button></a>";
}

/* deletePlaylist elimina la playlist selezionata */
function deletePlaylist(playlistID) {
  var playlists = JSON.parse(window.localStorage.getItem("playlists"));
  var groups = JSON.parse(window.localStorage.getItem("groups"));
  var users = JSON.parse(window.localStorage.getItem("users"));
  var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));

  //creo un array contenente tutte le playlist tranne quella selezionata
  var newPlaylists = playlists.filter(
    (element) => element.playlistID != playlistID
  );

  //creo un nuovo array contenente i gruppi, eliminando la playlist selezionata dalle playlist condivise nei gruppi in cui è stata condivisa
  if (groups != null && groups != undefined && groups.length > 0) {
    var newGroups = groups.filter(
      (element) => element.sharedPlaylists != playlistID
    );
    window.localStorage.setItem("groups", JSON.stringify(newGroups));
  }

  //rimuovo la playlist dalle playlist dell'utente
  var newLoggedUserPlaylists = loggedUser.playlists;
  newLoggedUserPlaylists = newLoggedUserPlaylists.filter(
    (element) => element.playlistID != playlistID
  );
  loggedUser.playlists = newLoggedUserPlaylists;

  for (i = 0; i < users.length; i++) {
    var userFollowedPlaylists = users[i].followedPlaylists;
    if (userFollowedPlaylists != null) {
      userFollowedPlaylists = userFollowedPlaylists.filter(
        (element) => element != playlistID
      );
      users[i].followedPlaylists = userFollowedPlaylists;
    }
  }

  var index = getUserIndexFromLoggedUser();
  users[index] = loggedUser;

  window.localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
  window.localStorage.setItem("playlists", JSON.stringify(newPlaylists));
  window.localStorage.setItem("users", JSON.stringify(users));

  //mostro un messaggio di avvenuta rimozione
  document.getElementById("modify-playlist-form").innerHTML = "";
  document.getElementById("modify-playlist-form").innerHTML +=
    "<p>La playlist è stata eliminata con successo!</p><br><a href='playlists.html'><button class='btn login-btn'>OK</button></a>";
}
