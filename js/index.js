/* File JS contenente tutte le funzioni utili alla pagina index.html per la registrazione e il login degli utenti */

/* cardRegistrazione nasconde tutti gli elementi della pagina mostrando solo il div della registrazione */
function cardRegistrazione() {
  document.getElementById("login-div").style.display = "none";
  document.getElementById("registration-success").style.display = "none";
  document.getElementById("registration-error").style.display = "none";
  document.getElementById("login-error").style.display = "none";
  document.getElementById("registration-div").style.display = "flex";
}

/* cardLogin nasconde tutti gli elementi della pagina mostrando solo il div del login */
function cardLogin() {
  document.getElementById("registration-success").style.display = "none";
  document.getElementById("registration-error").style.display = "none";
  document.getElementById("registration-div").style.display = "none";
  document.getElementById("login-error").style.display = "none";
  document.getElementById("login-div").style.display = "flex";
}

/* successPopup nasconde tutti gli elementi della pagina mostrando solo il popup di avvenuta registrazione dell'utente mostrando l'username inserito dall'utente appena registrato */
function successPopup() {
  document.getElementById("login-div").style.display = "none";
  document.getElementById("registration-div").style.display = "none";
  document.getElementById("registration-error").style.display = "none";
  document.getElementById("login-error").style.display = "none";
  document.getElementById("registration-success").style.display = "flex";

  document.getElementById("username-popup").innerHTML = JSON.parse(window.localStorage.getItem("loggedUser")).username
}

/* errorPopup nasconde tutti gli elementi della pagina mostrando solo il popup di errore nel caso in cui un utente si registri con una mail già presente */
function errorPopup() {
  document.getElementById("login-div").style.display = "none";
  document.getElementById("registration-div").style.display = "none";
  document.getElementById("registration-success").style.display = "none";
  document.getElementById("login-error").style.display = "none";
  document.getElementById("registration-error").style.display = "flex";
}

/* loginErrorPopup nasconde tutti gli elementi della pagina mostrando solo il popup di errore nel caso in cui un utente effetui il log in con credenziali sbagliate */
function loginErrorPopup() {
  document.getElementById("login-div").style.display = "none";
  document.getElementById("registration-div").style.display = "none";
  document.getElementById("registration-success").style.display = "none";
  document.getElementById("registration-error").style.display = "none";
  document.getElementById("login-error").style.display = "flex";
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

/* findUser ritorna TRUE se trova l'utente user all'interno dell'array users */
function findUser(users, user) {
  return users.some((u) => u.email == user.email);
}

/* checkUsername controlla che venga inserito l'username */
function checkUsername() {
  var username = document.getElementById('username-registration')
  if (username.value.trim() === "") {
    setError(username, "Username is required");
    return false;
  } else {
    removeError(username);
    return true;
  }
}

/* checkEmail controlla che venga inserita una mail e che questa sia valida */
function checkEmail() {
  var email = document.getElementById('e-mail-registration')
  if (email.value.trim() === "") {
    setError(email, "Email is required");
    return false;
  } else if (!isValidEmail(email.value.trim())) {
    setError(email, "Provide a valid email address");
    return false;
  }
  removeError(email);
  return true;
}

/* checkPsw controlla che venga inserita una password di almeno 5 caratteri */
function checkPsw() {
  var psw = document.getElementById('psw-registration')
  if (psw.value.trim() === "") {
    setError(psw, "Password is required");
    return false;
  } else if (psw.value.trim().length < 5) {
    setError(psw, "Password must be at least 5 character.");
    return false;
  }
  removeError(psw);
  return true;
}

/* checkPsw2 controlla che venga inserita la stessa password */
function checkPsw2() {
  var psw = document.getElementById('psw-registration')
  var psw2 = document.getElementById('psw2-registration') 
  if (psw2.value.trim() === "") {
    setError(psw2, "Please confirm your password");
    return false;
  } else if (psw2.value.trim() !== psw.value.trim()) {
    setError(psw2, "Passwords doesn't match");
    return false;
  }
  removeError(psw2);
  return true;
}

/* setError aggiunge la classe error all'elemento element e il relativo messaggio message */
function setError(element, message) {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");

  errorDisplay.innerText = message;
  inputControl.classList.add("error");
}

/* removeError rimuove la classe error dall'elemento element */
function removeError(element) {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".error");

  errorDisplay.innerText = "";
  inputControl.classList.remove("error");
}

/* isValidEmail controlla che l'email inserita sia valida usando le REGEX */
function isValidEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/* validation richiama la funzione registration() se tutti i dati sono inseriti correttamente */
function validation() {
  if (checkUsername() && checkEmail() && checkPsw() && checkPsw2()) {
    registration();
  }
}

/* registration crea e inserisce l'utente nell'array users contenente tutti gli array registrati */
function registration() {
  //se è il primo utente registrato allora creo l'array users
  users = window.localStorage.getItem("users");
  if (users == null) {
    users = [];
  } else {
    users = JSON.parse(users);
  }

  var imageURL = "SpotifApi/No_image_available.svg.png"

  if (document.getElementById("user-pic").value != "") {
    imageURL = document.getElementById("user-pic").value
  }

  //creo l'utente con i dati inseriti
  user = {
    username: document.getElementById("username-registration").value,
    email: document.getElementById("e-mail-registration").value,
    image: imageURL,
    password: document.getElementById("psw-registration").value,
    genresTag: null,
    ownedGroups: null,
    subscribedGroups: null,
    playlists: null,
    followedPlaylists: null,
  };

  //se trovo l'utente nell'array degli utenti allora mostro il popup di errore, altrimenti inserisco l'utente nell'array degli utenti e aggiorno l'array degli utenti nel local sotorage
  //loggedUser serve per ricordarmi qual è l'utente loggato al momento
  if(findUser(users, user)) {
    errorPopup();
  } else {
    users.push(user);
    window.localStorage.setItem("users", JSON.stringify(users));
    window.localStorage.setItem("loggedUser", JSON.stringify(user));
    successPopup();
  }
}

/* login gestisce il login degli utenti */
function login() {
  //prendo l'array di utenti dal local storage
  users = window.localStorage.getItem("users");
  if (users == null) {
    users = [];
  } else {
    users = JSON.parse(users);
  }
  //creo un utente con i dati inseriti nel login
  user = {
    email: document.getElementById("e-mail-login").value,
    password: document.getElementById("psw-login").value,
  };

  //se non trovo un utente con quell'email e quella password allora mostro un popup di errore, altrimenti loggedUser diventa l'utente che ho trovato
  //la funzione rimanda automaticamente alla homepage home.html 
  if (
    users.find((u) => u.email == user.email && u.password == user.password) ==
    undefined
  ) {
    loginErrorPopup();
  } else {
    loggedUser = users.find(
      (u) => u.email == user.email && u.password == user.password
    );
    window.localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
    window.location.href = "home.html";
  }
}