/* File JS contenente le funzioni utili alla pagina groups.html per la gestione dei gruppi di utenti */

/* fillData mostra i gruppi dell'utente (creati e seguiti) sull'onload del body della pagona groups.html */
function fillGroupsData() {
  var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));
  var userGroups = getUserOwnedGroups(loggedUser.email);
  var subscribedGroups = getUserSubscribedGroups(loggedUser.email);

  //Creo il div che mostra i gruppi creati dall'utente
  var userGroupsDiv = document.getElementById("user-groups");
  for (i = 0; i < userGroups.length; i++) {
    var imageURL =
      userGroups[i].imageURL != ""
        ? userGroups[i].imageURL
        : "No_image_available.svg.png";
    userGroupsDiv.innerHTML +=
      "<div class='user-groups-element' id='user-groups-element-" +
      toString(i) +
      "'onclick=\"groupsView('" +
      userGroups[i].groupID +
      "')\"><img class='user-groups-pic' src='" +
      imageURL +
      "'><span class='user-groups-span'>" +
      userGroups[i].groupName +
      "</div>";
  }

  //Creo il div dei gruppi a cui l'utente si è iscritto
  var userSubscribedGroupsDiv = document.getElementById(
    "user-subscribed-groups"
  );
  for (var i = 0; i < subscribedGroups.length; i++) {
    var imageURL =
      subscribedGroups[i].imageURL != ""
        ? subscribedGroups[i].imageURL
        : "No_image_available.svg.png";
    userSubscribedGroupsDiv.innerHTML +=
      "<div class='user-groups-element' id='user-groups-element-" +
      toString(i) +
      "'onclick=\"groupsView('" +
      subscribedGroups[i].groupID +
      "')\"><img class='user-groups-pic' src='" +
      imageURL +
      "'><span class='user-groups-span'>" +
      subscribedGroups[i].groupName +
      "<br><span class='pink-text'>" +
      subscribedGroups[i].ownerUsername +
      "</span>" +
      "</div>";
  }
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

/* getUserSubscribedGroups ritorna un array con i gruppi a cui l'utente si è iscritto */
function getUserSubscribedGroups(loggedUserMail) {
  var groups = JSON.parse(window.localStorage.getItem("groups"));
  var subscribedGroups = [];
  if (groups != undefined) {
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].subscribers != null) {
        for (var j = 0; j < groups[i].subscribers.length; j++) {
          if (groups[i].subscribers[j] == loggedUserMail) {
            subscribedGroups.push(groups[i]);
            break;
          }
        }
      }
    }
  }
  return subscribedGroups;
}

/* createUserGroup nasconde tutti gli elementi della pagina per mostrare soltanto il form di creazione del gruppo */
function createUserGroup() {
  document.getElementById("groups-results-container").style.display = "none";
  document.getElementById("searchbar").style.display = "none";
  document.getElementById("search-mode-button").style.display = "none";
  document.getElementById("create-group-form").style.display = "block";
}

/* insertNewGroup crea e aggiunge il gruppo creato nel "database" dei gruppi */
function insertNewGroup() {
  if (document.getElementById("group-name").value.trim().length < 4) {
    alert("Inserisci un nome di almeno 4 caratteri");
  } else {
    var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));
    var users = JSON.parse(window.localStorage.getItem("users"));
    var groups = JSON.parse(window.localStorage.getItem("groups"));

    //Inserisco il gruppo nel "database" dei gruppi
    if (groups == null) {
      groups = [];
    }

    //Creo l'oggetto group
    var group = {
      groupID:
        document.getElementById("group-name").value.trim() + loggedUser.email,
      groupName: document.getElementById("group-name").value.trim(),
      groupGenre: document.getElementById("group-genre-select-form").value,
      imageURL: document.getElementById("image-url").value.trim(),
      ownerEmail: loggedUser.email,
      ownerUsername: loggedUser.username,
      subscribers: null,
      sharedPlaylists: null,
    };

    //Controllo che non esista già un gruppo con quel nome
    var nameAlreadyTaken = false;
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].groupID == group.groupID) {
        nameAlreadyTaken = true;
        errorPopupGroup(
          "Esiste già un gruppo con quel nome, inserisci un nome diverso"
        );
      }
    }
    //Se il nome è unico, inserisco il gruppo nel database dei gruppi
    if (!nameAlreadyTaken) {
      groups.push(group);
      window.localStorage.setItem("groups", JSON.stringify(groups));

      //Inserisco il gruppo nei gruppi dell'utente loggato
      if (loggedUser.ownedGroups == null) {
        loggedUser.ownedGroups = [];
      }
      loggedUser.ownedGroups.push(group.groupID);
      window.localStorage.setItem("loggedUser", JSON.stringify(loggedUser));

      //Aggiorno le modifiche nel "database" degli utenti
      index = getUserIndexFromLoggedUser();
      users[index] = loggedUser;
      window.localStorage.setItem("users", JSON.stringify(users));

      successPopup(document.getElementById("group-name").value.trim());
    }
  }
}

/* successPopup nasconde il form di creazione del gruppo e mostra il popup di avvenuta creazione del gruppo, mostrando il nome dell'utente che ha creato il gruppo e il nome del gruppo  */
function successPopup(groupName) {
  document.getElementById("create-group-form").style.display = "none";
  document.getElementById("group-form-success").style.display = "block";

  document.getElementById("username-popup").innerHTML = JSON.parse(
    window.localStorage.getItem("loggedUser")
  ).username;
  document.getElementById("group-name-popup").innerHTML = groupName;
}

/* errorPopupGroup nasconde il form di creazione del gruppo e mostra il popup di errore nella creazione del gruppo  */
function errorPopupGroup(message) {
  document.getElementById("create-group-form").style.display = "none";
  document.getElementById("error-message").innerText = message;
  document.getElementById("group-form-error").style.display = "block";
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

/* searchMode mostra gli elementi utili alla ricerca dei gruppi, nascondendo ciò che non serve */
function searchMode() {
  document.getElementById("groups-results-container").style.display = "none";
  document.getElementById("search-mode-button").style.display = "none";
  document.getElementById("go-back-from-search-mode-button").style.display =
    "block";
  document.getElementById("search-groups-results").style.display = "block";
  document.getElementById("searchbar").style.display = "flex";
}

/* goBackFromSearchMode reindirizza l'utente alla pagina groups.html */
function goBackFromSearchMode() {
  window.location.href = "groups.html";
}

/* searchGroups cerca gruppi nel local storage che abbiano un nome simile a quello inserito dall'utente e del genere selezionato dall'utente */
function searchGroups() {
  var filter = document.getElementById("group-genre-search-select").value;
  var query = document.getElementById("search").value.trim();

  var groups = JSON.parse(window.localStorage.getItem("groups"));
  var results = [];

  //se l'utente ha inserito un genere specifico, controllo che il gruppo sia del genere specificato
  if (filter != "all") {
    for (var i = 0; i < groups.length; i++) {
      if (
        groups[i].groupName.toLowerCase().includes(query.toLowerCase()) &&
        groups[i].groupGenre == filter
      ) {
        results.push(groups[i]);
      }
    }
    //altrimenti cerco soltanto gruppo con nomi simili
  } else {
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].groupName.toLowerCase().includes(query.toLowerCase())) {
        results.push(groups[i]);
      }
    }
  }
  showSearchGroupsResults(results);
}

/* showSearchGroupsResults mostra i risultati della ricerca dei gruppi */
function showSearchGroupsResults(results) {
  resultsDiv = document.getElementById("search-groups-results");
  resultsDiv.innerHTML = "";
  //se la ricerca non ha prodotto risultati mostro un messaggio
  if (results.length < 1) {
    resultsDiv.innerHTML += "<p>La ricerca non ha prodotto alcun risultato</p>";
    //altrimenti mostro i risultati della ricerca
  } else {
    for (var i = 0; i < results.length; i++) {
      var imageURL =
        results[i].imageURL != ""
          ? results[i].imageURL
          : "No_image_available.svg.png";
      resultsDiv.innerHTML +=
        "<div class='search-groups-element' id='search-groups-element-" +
        toString(i) +
        "'onclick=\"groupsView('" +
        results[i].groupID +
        "')\"><img class='search-groups-pic' src='" +
        imageURL +
        "'><span class='search-groups-span'>" +
        results[i].groupName +
        "</span><br><span class='search-groups-owner'>" +
        results[i].ownerUsername +
        "</span></div>";
    }
  }
}

/* getGroupIndexFromGroupID mi ritorna l'indice del gruppo con groupID all'interno dell'array contenente tutti i gruppi groups*/
function getGroupIndexFromGroupID(groups, groupID) {
  if (
    groups != undefined &&
    groups != null &&
    groupID != null &&
    groupID != undefined
  ) {
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].groupID.trim() == groupID.trim()) {
        return i;
      }
    }
  }
  return null;
}



/* getPlaylistsFromPlaylistID ritorna un array di playlist contenente le playlists seguite da un utente a partire dal loro playlistID */
function getPlaylistsFromPlaylistID(sharedPlaylists) {
  var playlists = JSON.parse(window.localStorage.getItem("playlists"));
  var sharedPlaylistsReturned = [];
  if (sharedPlaylists != null) {
    for (var i = 0; i < sharedPlaylists.length; i++) {
      for (var j = 0; j < playlists.length; j++) {
        if (sharedPlaylists[i] == playlists[j].playlistID) {
          sharedPlaylistsReturned.push(playlists[j]);
          break;
        }
      }
    }
  }

  return sharedPlaylistsReturned;
}

/*groupsView mostra le informazioni relative del gruppo selezionato */
function groupsView(groupID) {
  if (document.getElementById("groups-results-container") != null) {
    document.getElementById("groups-results-container").style.display = "none";
  }
  if (document.getElementById("search-mode-button") != null) {
    document.getElementById("search-mode-button").style.display = "none";
  }
  if (document.getElementById("search-groups-results") != null) {
    document.getElementById("search-groups-results").style.display = "none";
  }
  if (document.getElementById("user-view") != null) {
    document.getElementById("user-view").style.display = "none";
  }

  var groupView = document.getElementById("group-view");

  var groups = JSON.parse(window.localStorage.getItem("groups"));
  var index = getGroupIndexFromGroupID(groups, groupID);
  if (index != null) {
    var group = groups[index];

    //se il gruppo ha iscritti, il numero degli iscritti è uguale alla lunghezza degli utenti iscritti, altrimenti 0
    var subscibersNumber =
      group.subscribers == null || group.subscribers.length == 0
        ? 0
        : group.subscribers.length;
    //se è presente un'immagine uso quella, altrimenti ne uso una predefinita
    imageURL =
      group.imageURL != "" ? group.imageURL : "No_image_available.svg.png";

    sharedPlaylists = getPlaylistsFromPlaylistID(group.sharedPlaylists);

    var loggedUserMail = JSON.parse(
      window.localStorage.getItem("loggedUser")
    ).email;

    var groupButton = "";
    //se entro nella vista del gruppo come utente diverso dall'utente che ha creato il gruppo
    if (group.ownerEmail != loggedUserMail) {
      //se il numero di utenti iscritti è maggiore di 0 allora c'è la possibilità che sia iscritto, quindi controllo per mostrare il bottone opportuno
      if (subscibersNumber > 0) {
        var subcribers = group.subscribers;
        if (subcribers == null || subcribers == undefined) {
          subcribers = [];
        }
        //se sono iscritto mostro il pulsante per disiscrivermi
        if (subcribers.find((element) => element == loggedUserMail)) {
          groupButton =
            "<div><button class='registration-btn subscribe-btn' onclick=\"rejectSubscription('" +
            group.groupID +
            "')\"><span class='material-icons-outlined'>group_remove</span><div><span>Disicriviti dal gruppo</span><div></button></div><br>";
          //se non sono iscritto mostro il pulsante per iscrivermi
        } else {
          groupButton =
            "<div><button class='registration-btn subscribe-btn' onclick=\"addSubscription('" +
            group.groupID +
            "')\"><span class='material-icons-outlined'>group_add</span><div><span>Iscriviti al gruppo</span></button></div><br>";
        }
        //se il numero di utenti iscritti è 0 e non sono il proprietario del gruppo non posso fare altro che iscrivermi
      } else {
        groupButton =
          "<div><button class='registration-btn subscribe-btn' onclick=\"addSubscription('" +
          group.groupID +
          "')\"><span class='material-icons-outlined'>group_add</span><div><span>Iscriviti al gruppo</span></button></div><br>";
      }
    }

    groupView.innerHTML = "";

    //mostro l'immagine, il nome e un bottone per tornare alla pagina di ricerca
    var button = "";
    if (document.getElementById("user-view") != null) {
      button =
        "<a href='users.html'<button class='go-back-button-result moved-button' id='go-back-button'><span class='material-icons-outlined'>arrow_back_ios</span></button></a>";
    } else {
      button =
        "<a href='groups.html'><button class='go-back-button-result moved-button' id='go-back-button'><span class='material-icons-outlined'>arrow_back_ios</span></button></a>";
    }
    groupView.innerHTML +=
      "<div class='artist-view-artist-info' id='artist-view-artist-info'>" +
      button +
      "<img src='" +
      imageURL +
      "' class='group-view-pic'><h1 class='artist-view-name'>" +
      group.groupName +
      "</h1><h3 class='group-view-owner-name'>" +
      group.ownerUsername +
      "</h3><br><p>Utenti iscritti: " +
      subscibersNumber +
      "</p><br>" +
      groupButton +
      "<hr></div>" +
      "<h2 class='artist-view-album-header group-view-group-header'>Playlist condivise</h2><div class='artist-view-album-container' id='artist-view-album-container'></div>";

    //quando si clicca sul bottone per tornare indietro si viene riportati alla pagina di ricerca
    document.getElementById("go-back-button").addEventListener("click", () => {
      window.location.href = "groups.html";
    });

    //se sono state condivise playlist con il gruppo le mostro
    if (sharedPlaylists.length > 0) {
      for (i = 0; i < sharedPlaylists.length; i++) {
        //se c'è l'immagine della playlist uso quella sennò ne uso una di default
        var playlistImage =
          sharedPlaylists[i].imageURL != ""
            ? sharedPlaylists[i].imageURL
            : "No_image_available.svg.png";

        document.getElementById("artist-view-album-container").innerHTML +=
          "<div class='artist-view-album' id='artist-view-album-" +
          i.toString() +
          "'<button onclick=\"playlistView('" +
          sharedPlaylists[i].playlistID +
          "')\"></button><img src='" +
          playlistImage +
          "' class='group-view-playlist-pic'>" +
          "<span class='artist-view-album-name'>" +
          sharedPlaylists[i].playlistName +
          "</span><br>" +
          "<span class='artist-view-album-year'>" +
          sharedPlaylists[i].playlistGenre +
          " &bull; " +
          "<span class='pink-text'>" +
          sharedPlaylists[i].ownerUsername +
          "</span></span>" +
          "</div>";
      }
      //se non sono state condivise playlist mostro un messaggio
    } else {
      document.getElementById("group-view").classList.add("raised-view");
      document.getElementById("artist-view-album-container").innerHTML +=
        "<p>Al momento non è stata condivisa alcuna playlist</p>";
    }

    //per ogni playlist del gruppo visualizzo l'elemento per visualizzare la foto della playlist, nome, genere e proprietario della playlist
    document.getElementById("group-view").style.display = "block";
  }
}

/* playlistView mostra le informazioni della playlist selezionata */
function playlistView(playlistID) {
  document.getElementById("group-view").style.display = "none";
  document.getElementById("searchbar").style.display = "none";

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

    //se sono il proprietario della playlist mostro un bottone per poterla modificare
    if (playlistID.includes(loggedUserMail)) {
      button =
        "<button class='modify-button' onclick=\"enterModifyView('" +
        playlistID +
        "')\">Modifica la playlist</button>";
      // se non sono il proprietario e non ci sono iscritti alla playlist mostro un bottone per aggiungere la playlist alle playlist che seguo
    } else if (loggedUser.followedPlaylists == null) {
      button =
        "<button class='action-button playlist-action-button' onclick=\"confirmAddPlaylist('" +
        playlistID +
        "')\"><span class='material-icons-outlined'>add</span></button>";
      // se non sono il proprietario e non seguo la playlist mostro un bottone per aggiungere la playlist alle playlist che seguo
    } else if (!loggedUser.followedPlaylists.includes(playlistID)) {
      button =
        "<button class='action-button playlist-action-button' onclick=\"confirmAddPlaylist('" +
        playlistID +
        "')\"><span class='material-icons-outlined'>add</span></button>";
      // se non sono il proprietario e seguo la playlist mostro un bottone per rimuovere la playlist alle playlist che seguo
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
      if (index != null) {
        privacy = "Condivisa con: " + groups[index].groupName;
      }
    }

    //mostro le informazioni della playlist: immagine, nome, proprietario, genere, un pulsante per aggiungere la playlist alle proprie playlist se non si è il proprietario oppure un pulsante per modificarla se si è il proprietario. Mostro inoltr un pulsante per tornare alla pagina playlists.html
    container.innerHTML +=
      "<button class='go-back-button-playlist' id='go-back-button' onclick='goBackFromPlaylistView()'><span class='material-icons-outlined'>arrow_back_ios</span></button><div class='playlist-view-playlist-info'><img src='" +
      imageURL +
      "' class='playlist-view-pic'><div class='album-view-album-info-column' id='album-view-album-info-column'><h1 class='album-view-name'>" +
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

/* getPlaylistFromID mi ritorna una playlist a partire dall ID della playlist */
function getPlaylistFromID(playlistID) {
  var playlists = JSON.parse(window.localStorage.getItem("playlists"));
  for (var i = 0; i < playlists.length; i++) {
    if (playlists[i].playlistID == playlistID) {
      return playlists[i];
    }
  }
  return null;
}

/* getGroupFromGroupID mi ritorna un gruppo a partire dall'ID del gruppo */
function getGroupFromGroupID(groupID) {
  var groups = JSON.parse(window.localStorage.getItem("groups"));
  if (groups != null && groups != undefined) {
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].groupID == groupID) {
        return groups[i];
      }
    }
  }
  return null;
}

/* searchTracks gestisce la ricerca. 
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

/* addSubscription aggiunge l'utente loggatto agli iscritti del gruppo */
function addSubscription(groupID) {
  var groups = JSON.parse(window.localStorage.getItem("groups"));
  var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));
  var users = JSON.parse(window.localStorage.getItem("users"));

  var index = getGroupIndexFromGroupID(groups, groupID);
  //se trovo il gruppo
  if (index != null) {
    var group = groups[index];
    if (group.subscribers == null) {
      group.subscribers = [];
    }
    //aggiungo l'utente loggato al gruppo
    group.subscribers.push(loggedUser.email);
    groups[index] = group;

    if (loggedUser.subscribedGroups == null) {
      loggedUser.subscribedGroups = [];
    }
    //aggiungi il gruppo ai gruppi seguiti dall'utente
    loggedUser.subscribedGroups.push(groupID);

    //aggiorno le modifiche del "database" dei gruppi e degli utenti
    window.localStorage.setItem("groups", JSON.stringify(groups));
    var indexUser = getUserIndexFromLoggedUser();
    users[indexUser] = loggedUser;
    window.localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
    window.localStorage.setItem("users", JSON.stringify(users));
    successPopupSubscribe(group.groupName, loggedUser.username);
  } else {
    errorPopupSubscribe("Qualcosa è andato storto");
  }
}

/* rejectSubscription rimuove l'utente loggato dagli iscritti al gruppo */
function rejectSubscription(groupID) {
  var groups = JSON.parse(window.localStorage.getItem("groups"));
  var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));
  var users = JSON.parse(window.localStorage.getItem("users"));

  var index = getGroupIndexFromGroupID(groups, groupID);
  //se trovo il gruppo
  if (index != null) {
    var group = groups[index];
    //rimuovo l'utente loggato dal gruppo
    var subscribedUsers = group.subscribers;
    if (subscribedUsers == null || subscribedUsers == undefined) {
      subscribedUsers = [];
    }
    subscribedUsers = subscribedUsers.filter(
      (element) => element != loggedUser.email
    );
    group.subscribers = subscribedGroups;
    groups[index] = group;

    //rimuovo il gruppo dai gruppi seguiti dall'utente
    var subscribedGroups = loggedUser.subscribedGroups;
    subscribedGroups = subscribedGroups.filter(
      (element) => element != group.groupID
    );
    loggedUser.subscribedGroups = subscribedGroups;

    //aggiorno le modifiche del "database" dei gruppi e degli utenti
    window.localStorage.setItem("groups", JSON.stringify(groups));
    var indexUser = getUserIndexFromLoggedUser();
    users[indexUser] = loggedUser;
    window.localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
    window.localStorage.setItem("users", JSON.stringify(users));
    successPopupRejectSubscription(group.groupName, loggedUser.username);
  } else {
    errorPopupSubscribe("Qualcosa è andato storto");
  }
}

/* errorPopupSubscribe mostra un popup se qualcosa è andato storto nell'iscrizione ad un gruppo */
function errorPopupSubscribe(message) {
  if (document.getElementById("group-view") != null) {
    document.getElementById("group-view").style.display = "none";
  }
  if (document.getElementById("searchbar") != null) {
    document.getElementById("searchbar").style.display = "none";
  }

  document.getElementById("error-message-subscribe").innerText = message;
  document.getElementById("error-popup-subscribe").style.display = "block";
}

/* successPopupSubscribe mostra un popup di avvenuta iscrizione al gruppo, mostrando nome del gruppo e username dell'utente */
function successPopupSubscribe(groupName, username) {
  if (document.getElementById("group-view") != null) {
    document.getElementById("group-view").style.display = "none";
  }
  if (document.getElementById("searchbar") != null) {
    document.getElementById("searchbar").style.display = "none";
  }

  document.getElementById("username-popup-subscribe").innerText = username;
  document.getElementById("group-name-popup-subscribe").innerText = groupName;
  document.getElementById("group-subscribe-success").style.display = "block";
}

/* successPopupRejectSubscription mostra un popup se qualcosa è andato storto nella disiscrizione da un gruppo */
function successPopupRejectSubscription(groupName, username) {
  if (document.getElementById("group-view") != null) {
    document.getElementById("group-view").style.display = "none";
  }
  if (document.getElementById("searchbar") != null) {
    document.getElementById("searchbar").style.display = "none";
  }

  document.getElementById("username-popup-reject-subscription").innerText =
    username;
  document.getElementById("group-name-popup-reject-subscription").innerText =
    groupName;
  document.getElementById("group-reject-subscription-success").style.display =
    "block";
}
