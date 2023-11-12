/* File JS contenente tutte le funzioni utili alla pagina home.html per la ricerca di artisti, album e canzoni sfruttando le API di Spotify */

var user = JSON.parse(window.localStorage.getItem("loggedUser"));
document.getElementById("profileName").innerText = user.username;
if (user.image != null && user.image != "") {
  document.getElementById("profile-pic").src = user.image;
}

/* getToken recupera il token valido per un'ora da Spotify */
function getToken() {
  const client_id = "";
  const client_secret = "";
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

/* searchBar compone l'url prendendo il testo inserito dall'utente e la categoria di ricerca selezionata. L'url viene gestito dalla funzione search() */
function searchBar() {
  if (window.localStorage.getItem("token") == undefined) {
    getToken();
  }
  if (document.getElementById("search").value.length > 2) {
    var query =
      "type=" +
      document.getElementById("categories").value +
      "&q=" +
      document.getElementById("search").value;

    var url = "https://api.spotify.com/v1/search?" + query + "&market=it";

    search(url);
  }
}

/* search gestisce la ricerca. 
   - Se la risposta è 200 allora ciò che ritorna viene iserito nel local storage in searchResults e mostrato con la funzione generateResultsView().
   - Se la risposta è 401 viene generato un nuovo token e viene rifatta la ricerca
   - Se la risposta è 403 viene visualizzato l'alert relativo e si viene reindirizzati alla homepage
   - Se la risposta è 429 viene visualizzato l'alert relativo e si viene reindirizzati alla homepage  */
function search(url) {
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
            "searchResults",
            JSON.stringify(searchResults)
          )
        )
        .then(() => generateResultsView());
    } else {
      if (response.status == "401") {
        getToken();
        search(url);
      }
      if (response.status == "403") {
        alert("Bad OAuth request");
        window.location.href = "home.html";
      }
      if (response.status == "429") {
        alert("Hai raggiunto il limite di ricerche, riprova più tardi");
        window.location.href = "home.html";
      }
    }
  });
}

/* searchNext cerca la pagina successiva di risultati utilizzando l'url presente nel campo next */
function searchNext(item) {
  if (item == "album") {
    search(
      JSON.parse(window.localStorage.getItem("searchResults")).albums.next
    );
  }
}

/* searchPrevious cerca la pagina precedente di risultati utilizzando l'url presente nel campo previous */
function searchPrevious(item) {
  if (item == "album") {
    search(
      JSON.parse(window.localStorage.getItem("searchResults")).albums.previous
    );
  }
}

/* generateResultsView genera una vista diversa a seconda della categoria di ricerca */
function generateResultsView() {
  var filter =
    document.getElementById("categories").options[
      document.getElementById("categories").selectedIndex
    ].value;
  if (filter == "album") {
    showAlbums();
  }
  if (filter == "track") {
    showTracks();
  }
  if (filter == "artist") {
    showArtists();
  }
}

/* showAlbums mostra gli album ritornati dalla ricerca dell'utente */
function showAlbums() {
  var albums = JSON.parse(window.localStorage.getItem("searchResults")).albums;
  var table = document.getElementById("results");
  var buttons = document.getElementById("next-previous-buttons");
  var action = "";
  table.innerHTML = "";
  buttons.innerHTML = "";
  for (i = 0; i < albums.items.length; i++) {
    if (
      albums.items[i].album_type == "album" ||
      albums.items[i].album_type == "single"
    ) {
      //creo il bottone per ogni album che mi permette di andare a vedere il contenuto dell'album tramite la funzione searchAlbumSongs(i)
      //i serve per cercare l'album cliccato dall'utente
      action =
        "<button class='action-button' id='action-button-" +
        i.toString() +
        "' onclick=\"searchAlbumSongs('" +
        i +
        "')\"><span class='material-icons-outlined'>arrow_forward_ios</span></button>";
    }
    //Ogni riga della tabella rappresenta un album diverso
    table.innerHTML +=
      "<tr class='results-element'><td class='album-element-1'>" +
      "<img src='" +
      albums.items[i].images[0].url +
      "' class='album-pic'></td><td class='album-element-2'><table><tr><td><span class='album-name'>" +
      albums.items[i].name +
      "</span></td></tr><tr><td><span class='album-artist'>" +
      albums.items[i].album_type.charAt(0).toUpperCase() +
      albums.items[i].album_type.slice(1).toLowerCase() +
      " &bull; " +
      albums.items[i].artists[0].name +
      " &bull; " +
      albums.items[i].release_date.substring(0, 4) +
      "</span></td></tr></table></td>" +
      "<td class='album-element-3'>" +
      action +
      "</td>" +
      "</tr>";
  }
  //se è presente una pagina precedente di risultati aggiungo il bottone Precedente per cercare la pagina precedente di risultati
  if (albums.previous != null) {
    buttons.innerHTML +=
      "<button class='previous-result' onclick=\"search('" +
      albums.previous +
      "')\">Precedente</button>";
  }
  //se è presente una pagina successiva di risultati aggiungo il bottone Successivo per cercare la pagina successiva di risultati
  if (albums.next != null) {
    buttons.innerHTML +=
      "<button class='next-result' onclick=\"search('" +
      albums.next +
      "')\">Successivo</button>";
  }
}

/* showAlbums mostra le canzoni ritornate dalla ricerca dell'utente */
function showTracks() {
  var tracks = JSON.parse(window.localStorage.getItem("searchResults")).tracks;
  var table = document.getElementById("results");
  var buttons = document.getElementById("next-previous-buttons");
  var action = "";
  table.innerHTML = "";
  buttons.innerHTML = "";
  for (i = 0; i < tracks.items.length; i++) {
    if (tracks.items[i].type == "track") {
      //aggiungo il bottone che quando viene premuto mi mostra il menu contestuale di aggiunta alla playlist
      action =
        "<button class='action-button' id='action-button-" +
        i.toString() +
        "' onclick=\"showContextMenu('" +
        i +
        "')\"><span class='material-icons-outlined'>add</span></button>";
    }

    //ogni riga della tabella rappresenta una canzone diversa
    table.innerHTML +=
      "<tr class='results-element'><td class='track-element-1'>" +
      "<img src='" +
      tracks.items[i].album.images[0].url +
      "' class='album-pic'></td><td class='track-element-2'><table><tr><td><span class='track-name'>" +
      tracks.items[i].name +
      "</span></td></tr><tr><td><span class='album-artist'>" +
      " Brano " +
      " &bull; " +
      tracks.items[i].artists[0].name +
      " &bull; " +
      tracks.items[i].album.release_date.substring(0, 4) +
      "</span></td></tr></table></td>" +
      "<td class='track-element-3'>" +
      millisToMinutesAndSeconds(tracks.items[i].duration_ms) +
      "</td>" +
      "<td class='track-element-4'>" +
      action +
      "</td>" +
      "</tr>";
  }
  //se è presente una pagina precedente di risultati aggiungo il bottone Precedente per cercare la pagina precedente di risultati
  if (tracks.previous != null) {
    buttons.innerHTML +=
      "<button class='previous-result' onclick=\"search('" +
      tracks.previous +
      "')\">Precedente</button>";
  }
  //se è presente una pagina successiva di risultati aggiungo il bottone Successivo per cercare la pagina successiva di risultati
  if (tracks.next != null) {
    buttons.innerHTML +=
      "<button class='next-result' onclick=\"search('" +
      tracks.next +
      "')\">Successivo</button>";
  }
}

/* showArtists mostra gli artisti ritornati dalla ricerca dell'utente */
function showArtists() {
  var artists = JSON.parse(
    window.localStorage.getItem("searchResults")
  ).artists;
  var table = document.getElementById("results");
  var action = "";
  table.innerHTML = "";
  for (i = 0; i < artists.items.length; i++) {
    //se è presente un'immagine per l'artita, allora mostro quella di Spotify, altrimenti mostro una mia immagine che indica che non c'è un'immagine ufficiale disponibile
    imageURL =
      artists.items[i].images[0] != undefined
        ? artists.items[i].images[0].url
        : "No_image_available.svg.png";
    //aggiungo per ogni elemento un bottone che quando viene cliccato cerca gli album dell'artista
    action =
      "<button class='action-button' id='action-button-" +
      i.toString() +
      "'><span class='material-icons-outlined'>arrow_forward_ios</span></button>";
    //ogni riga della tabella rappresenta un artista diverso
    table.innerHTML +=
      "<tr class='results-element'><td class='artist-element-1'>" +
      "<img src='" +
      imageURL +
      "' class='artist-pic'></td><td class='artist-element-2'><table><tr><td><span class='artist-name'>" +
      artists.items[i].name +
      "</span></td></tr><tr><td>" +
      " Artista " +
      "</td></tr></table></td>" +
      "<td class='artist-element-3'>" +
      action +
      "</td>" +
      "</tr>";
  }
  var buttons = document.getElementById("next-previous-buttons");
  buttons.innerHTML = "";

  //se è presente una pagina successiva di risultati aggiungo il bottone Successivo per cercare la pagina successiva di risultati
  //l'addEventListener è commentato perché creava problemi
  if (artists.next != null) {
    buttons.innerHTML +=
      "<button class= 'next-result' onclick=\"search('" +
      artists.next +
      "')\">Successivo</button>";
    // document.getElementById("next-previous-buttons").innerHTML +=
    //   "<button class='next-result' id='next-result'>Successivo</button>";
    // document.getElementById("next-result").addEventListener("click", () => {
    //   search(artists.next);
    // });
  }

  //se è presente una pagina precedente di risultati aggiungo il bottone Precedente per cercare la pagina precedente di risultati
  //l'addEventListener è commentato perché creava problemi
  if (artists.previous != null) {
    buttons.innerHTML +=
      "<button onclick=\"search('" +
      artists.previous +
      "')\">Precedente</button>";
    // document.getElementById("next-previous-buttons").innerHTML +=
    //   "<button class='previous-result' id='previous-result'>Precedente</button>";
    // document.getElementById("previous-result").addEventListener("click", () => {
    //   console.log("sono dentro l'event listener");
    //   search(artists.previous);
    // });
  }

  //prendo tutti gli action-button
  var results = document.getElementsByClassName("action-button");
  //ad ogni action-button aggiungo un eventListener sul click: quando si fa click su un bottone vengono cercati gli album dell'artista con la funzione searchArtistAlbums a cui viene passato:
  // - l'url
  // - l'indice dell'artista (la riga nei risultati)
  for (var i = 0; i < results.length; i++) {
    results[i].addEventListener("click", (e) => {
      target = e.target.parentElement.id;
      index = target.substring(14); //target = action-button-{numeroID}, 14 = lenght("action-button-")
      url =
        "https://api.spotify.com/v1/artists/" +
        artists.items[index].id +
        "/albums?market=it&limit=50";
      searchArtistAlbums(url, artists.items[index]);
    });
  }
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

/* artistView nasconde i risultati e la barra di ricerca per mostrare l'artista selezionato */
function artistView(artist) {
  //se è presente un'immagine da Spotify uso quella, altrimenti ne uso una predefinita
  imageURL =
    artist.images[0] != undefined
      ? artist.images[0].url
      : "No_image_available.svg.png";
  document.getElementById("results-container").style.display = "none";
  document.getElementById("searchbar").style.display = "none";
  document.getElementById("next-previous-buttons").style.display = "none";
  artistView = document.getElementById("artist-view");
  artistAlbums = JSON.parse(window.localStorage.getItem("artistAlbums"));
  artistView.innerHTML = "";
  artistView.style.display = "block";
  //mostro l'immagine, il nome e un bottone per tornare alla pagina di ricerca
  artistView.innerHTML +=
    "<div class='artist-view-artist-info'><button class='go-back-button-result' id='go-back-button'><span class='material-icons-outlined'>arrow_back_ios</span></button><img src='" +
    imageURL +
    "' class='artist-view-pic'><h1 class='artist-view-name'>" +
    artist.name +
    "</h1><hr></div>" +
    "<h2 class='artist-view-album-header'>Album</h2><div class='artist-view-album-container' id='artist-view-album-container'></div>";
  //quando si clicca sul bottone per tornare indietro si viene riportati alla pagina di ricerca
  document.getElementById("go-back-button").addEventListener("click", () => {
    // artistViewToResultsView();
    window.location.href = "home.html";
  });
  //per ogni album dell'artista creo l'emento per visualizzare copertina, nome, tipo di album, e anno di rilascio dell'album
  for (i = 0; i < artistAlbums.items.length; i++) {
    document.getElementById("artist-view-album-container").innerHTML +=
      "<div class='artist-view-album' id='artist-view-album-" +
      i.toString() +
      "'<button onclick=\"searchAlbumSongs('" +
      i +
      "')\"></button><img src='" +
      artistAlbums.items[i].images[0].url +
      "' class='artist-view-album-pic'>" +
      "<span class='artist-view-album-name'>" +
      artistAlbums.items[i].name +
      "</span><br>" +
      "<span class='artist-view-album-year'>" +
      artistAlbums.items[i].album_type.charAt(0).toUpperCase() +
      artistAlbums.items[i].album_type.slice(1).toLowerCase() +
      " &bull; " +
      artistAlbums.items[i].release_date.substring(0, 4) +
      "</span>" +
      "</div>";
  }

  /* Metto i bottoni Precedente e Successivo se ci sono pagine risultati precedenti o successive */
  document.getElementById("artist-view-album-container").innerHTML +=
    "<div class='next-previous-album-buttons' id='next-previous-album-buttons'></div><br><br>";
  if (artistAlbums.previous != null) {
    //TODO: togliere gli event listener e mettere gli onlcik
    document.getElementById("next-previous-album-buttons").innerHTML +=
      "<button class='previous-album' id='previous-album'>Precedente</button>";
    document.getElementById("previous-album").addEventListener("click", () => {
      searchArtistAlbums(artistAlbums.previous, artist);
    });
  }
  if (artistAlbums.next != null) {
    document.getElementById("next-previous-album-buttons").innerHTML +=
      "<button class='next-album' id='next-album'>Successivo</button>";
    document.getElementById("next-album").addEventListener("click", () => {
      searchArtistAlbums(artistAlbums.next, artist);
    });
  }
}

/* searchArtistAlbums cerca gli album di un determinato artista.
   - Se la risposta è 200 OK mostra gli album dell'artista con la funzione artistView 
   - Se la risposta è 401 {Messaggio risposta} genera un nuovo token e rieffettua la ricerca 
*/
function searchArtistAlbums(url, artist) {
  fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + window.localStorage.getItem("token"),
    },
  })
    // .then((response) => response.json())
    // .then((searchResults) =>
    //   window.localStorage.setItem("artistAlbums", JSON.stringify(searchResults))
    // )
    // .then(() => artistView(artist));
    .then((response) => {
      // response.json()
      console.log(response);
      if (response.ok) {
        response
          .json()
          .then((searchResults) =>
            window.localStorage.setItem(
              "artistAlbums",
              JSON.stringify(searchResults)
            )
          )
          .then(() => artistView(artist));
      } else {
        if (response.status == "401") {
          getToken();
          searchArtistAlbums(url, artist);
        }
      }
    });
}

// function artistViewToResultsView() {
//   document.getElementById("results-container").style.display = "flex";
//   document.getElementById("searchbar").style.display = "flex";
//   document.getElementById("next-previous-buttons").style.display = "flex";
//   document.getElementById("artist-view").style.display = "none";
// }

/* searchAlbumSongs cerca le canzoni di un determinato album.
   - Se la risposta è 200 OK mostra le canzoni dell'album con la funzione albumView 
   - Se la risposta è 401 {Messaggio risposta} genera un nuovo token e rieffettua la ricerca 
*/
function searchAlbumSongs(i) {
  var filter =
    document.getElementById("categories").options[
      document.getElementById("categories").selectedIndex
    ].value;
  if (filter == "album") {
    albums = JSON.parse(window.localStorage.getItem("searchResults"));
    targetAlbum = albums.albums.items[i];
    console.log(targetAlbum);
    id = targetAlbum.id;
  }
  // if (filter == "track") {
  // }
  if (filter == "artist") {
    albums = JSON.parse(window.localStorage.getItem("artistAlbums"));
    targetAlbum = albums.items[i];
    id = targetAlbum.id;
  }

  url =
    "https://api.spotify.com/v1/albums/" + id + "/tracks?market=it&limit=50";

  fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + window.localStorage.getItem("token"),
    },
  }).then((response) => {
    console.log(response);
    if (response.ok) {
      response
        .json()
        .then((searchResults) =>
          window.localStorage.setItem(
            "albumTracks",
            JSON.stringify(searchResults)
          )
        )
        .then(() => albumView(targetAlbum));
    } else {
      if (response.status == "401") {
        getToken();
        searchAlbumSongs(targetAlbum);
      }
    }
  });
}

/* albumView nasconde tutti gli elementi della pagina per mostrare solamente la vista dell'album con le sue canzoni */
function albumView(album) {
  document.getElementById("results-container").style.display = "none";
  document.getElementById("searchbar").style.display = "none";
  document.getElementById("next-previous-buttons").style.display = "none";
  document.getElementById("artist-view").style.display = "none";
  albumView = document.getElementById("album-view");
  albumView.style.display = "block";
  var action = "";
  //se non viene fornita un'immagine da Spotify ne utilizzo una predefinita
  imageURL =
    album.images[0] != undefined
      ? album.images[0].url
      : "No_image_available.svg.png";
  //mostro le informazioni dell'album: immagine, nome, artista e data di rilascio e un pulsante per tornare alla pagina di ricerca
  albumView.innerHTML +=
    "<button class='go-back-button-track' id='go-back-button' onclick='goBackToSearch()'><span class='material-icons-outlined'>arrow_back_ios</span></button><div class='album-view-album-info'><img src='" + //al posto di goBackToSearch c'era goBackToResult
    imageURL +
    "' class='album-view-pic'><div class='album-view-album-info-column' id='album-view-album-info-column'><h1 class='album-view-name'>" +
    album.name +
    "</h1><h1 class='album-view-artist'>" +
    album.artists[0].name +
    "</h1><br><span class='album-view-album-year'>" +
    album.release_date.substring(0, 4) +
    "</span></div></div><hr class='album-view-separator'>" +
    //predispongo il div in cui inserire le tracce dell'album
    "<div class='album-view-tracks-container' id='album-view-tracks-container'><div class='album-view-tracks-container-elements' id='album-view-tracks-container-elements'></div></div>";
  document.getElementById("album-view-tracks-container-elements").innerHTML =
    "";
  //recuper le tracce dell'album
  tracks = JSON.parse(window.localStorage.getItem("albumTracks"));
  //per ogni canzone mostro il numero della canzone, il nome, la durata e un bottone che mostra il menu contestuale
  for (var i = 0; i < tracks.items.length; i++) {
    action =
      "<button class='action-button track-element-button' id='action-button-" +
      i.toString() +
      "' onclick=\"showContextMenu('" +
      i +
      "')\"><span class='material-icons-outlined'>add</span></button>";

    document.getElementById("album-view-tracks-container-elements").innerHTML +=
      "<div class='track-element' id='track-element-" +
      i.toString() +
      "'><div class='track-element-column-1'><span class='track-element-index'>" +
      (i + 1).toString() +
      "</span></div><div class='track-element-column-2'><span class='track-element-name'>" +
      tracks.items[i].name +
      "</span></div><div class='track-element-column-3'><span class='track-element-duration'>" +
      millisToMinutesAndSeconds(tracks.items[i].duration_ms) +
      "</span></div>" +
      "<div class='track-element-column-4'>" +
      action +
      "<div class='track-element-break-line'></div></div>" +
      "</div>";
  }
  //calcolo la durata totale dell'album
  var totalLength = 0;
  for (var i = 0; i < tracks.items.length; i++) {
    totalLength += parseInt(tracks.items[i].duration_ms, 10);
  }
  //mostro il numero di branie la durata totale dell'album
  document.getElementById("album-view").innerHTML +=
    "<hr class='album-view-separator'></hr><div class='track-element-break-line'></div>";
  document.getElementById("album-view-album-info-column").innerHTML +=
    "<span class='album-view-summary'>" +
    tracks.items.length +
    " brani, " +
    millisToMinutes(totalLength) +
    " minuti</span>";
}

// function goBackToResult() {
//   var filter =
//     document.getElementById("categories").options[
//       document.getElementById("categories").selectedIndex
//     ].value;
//   if (filter == "album") {
//     document.getElementById("album-view").style.display = "none";
//     document.getElementById("results-container").style.display = "flex";
//     document.getElementById("searchbar").style.display = "flex";
//     document.getElementById("next-previous-buttons").style.display = "block";
//   }
//   if (filter == "track") {
//     showTracks();
//   }
//   if (filter == "artist") {
//     document.getElementById("album-view").style.display = "none";
//     document.getElementById("artist-view").style.display = "block";
//   }
// }

/* goBackToSearch mi riporta alla pagina iniziale di ricerca */
function goBackToSearch() {
  window.location.href = "home.html";
}

function showContextMenu(i) {
  var filter = document.getElementById("categories").value;
  var selectedTrack = 0;
  var menu = document.getElementById("add-song-menu");
  menu.innerHTML = "";
  menu.style.display = "block";

  if (filter == "track") {
    tracks = JSON.parse(window.localStorage.getItem("searchResults")).tracks
      .items;
    selectedTrack = tracks[i];
  }
  if (filter == "album" || filter == "artist") {
    tracks = JSON.parse(window.localStorage.getItem("albumTracks")).items;
    selectedTrack = tracks[i];
  }

  var menuOptions = [];
  menuOptions[0] = "";
  var userPlaylists = JSON.parse(
    window.localStorage.getItem("loggedUser")
  ).playlists;
  if (userPlaylists == null) {
    userPlaylists = [];
  }
  if (userPlaylists.length > 0) {
    for (var i = 0; i < userPlaylists.length; i++) {
      menuOptions.push(userPlaylists[i].playlistName);
    }
  }

  menu.innerHTML +=
    "<button class='action-button' onclick='closeMenu()'><span class='material-icons-outlined'>close</span></button><p>Aggiungi <span class='pink-text' id='menu-track-name'>" +
    selectedTrack.name +
    "</span> di <span class='pink-text'>" +
    selectedTrack.artists[0].name +
    "</span> a:</p><br>" +
    "<select name='add-song-menu-options' id='add-song-menu-options'></select>";

  var options = document.getElementById("add-song-menu-options");

  for (var i = 0; i < menuOptions.length; i++) {
    options.innerHTML +=
      "<option value='" + menuOptions[i] + "'>" + menuOptions[i] + "</option>";
  }

  menu.innerHTML +=
    "<br><br><button class='action-button add-song-to-playlist' onclick=\"addSongToPlaylist('" +
    selectedTrack.id +
    "')\"><span class='material-icons-outlined'>double_arrow</span></button>";
}

function closeMenu() {
  document.getElementById("add-song-menu").style.display = "none";
  document.getElementById("add-song-menu").innerHTML = "";
}

function addSongToPlaylist(trackID) {
  var selectedPlaylist = document.getElementById("add-song-menu-options").value;
  var selectedTrackName = document.getElementById("menu-track-name").innerText;

  var users = JSON.parse(window.localStorage.getItem("users"));
  var playlists = JSON.parse(window.localStorage.getItem("playlists"));
  var user = JSON.parse(window.localStorage.getItem("loggedUser"));
  var modifiedPlaylist = null;

  var playlistID = user.email + selectedPlaylist;

  //aggiungo la canzone nella playlist dell'utente
  for (var i = 0; i < user.playlists.length; i++) {
    if (user.playlists[i].playlistID == playlistID) {
      user.playlists[i].tracks.push(trackID);
      modifiedPlaylist = user.playlists[i];
      break;
    }
  }

  //aggiorno la playlist nell'array delle playlists
  for (var i = 0; i < playlists.length; i++) {
    if (playlists[i].playlistID == playlistID) {
      playlists[i] = modifiedPlaylist;
      break;
    }
  }

  //aggiorno l'utente loggato
  window.localStorage.setItem("loggedUser", JSON.stringify(user));

  //aggiorno l'utente loggato nel "database" con tutti gli utenti
  index = getUserIndexFromLoggedUser();
  users[index] = user;
  window.localStorage.setItem("users", JSON.stringify(users));

  //aggiorno la playlist nel database con tutte le playlists
  window.localStorage.setItem("playlists", JSON.stringify(playlists));

  successPopupNewTrack(selectedPlaylist, selectedTrackName, user.username);
}

function successPopupNewTrack(playlistName, trackName, userName) {
  document.getElementById("add-song-menu").style.display = "none";
  document.getElementById("username-popup").innerHTML = userName;
  document.getElementById("track-name-popup").innerHTML = trackName;
  document.getElementById("playlist-name-popup").innerHTML = playlistName;
  document.getElementById("add-song-success").style.display = "block";
}
