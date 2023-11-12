/* File JS contenente le funzioni utili alla pagina settings.html per la gestione delle informazioni dell'utente loggato */

/* enterModifyUserView mostra il form di modifica dell'utente */
function enterModifyUserView() {
  document.getElementById("buttons-div").style.display = "none";
  var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));

  var oldUsername = loggedUser.username;
  var email = loggedUser.email;
  var oldProfilePic = loggedUser.image;
  var oldPassword = loggedUser.password;

  //mostro i valori già esistenti del form di modifica delle informazioni dell'utente
  document.getElementById("username-registration").value = oldUsername;
  document.getElementById("e-mail-registration").value = email;
  document.getElementById("user-pic").value = oldProfilePic;
  document.getElementById("psw-registration").value = oldPassword;
  document.getElementById("psw2-registration").value = oldPassword;

  document.getElementById("modify-user-div").style.display = "block";
}

/* confirmModify se l'utente ha modificato qualcosa, aggiorno l'utente con le nuove modifiche */
function confirmModify() {
  var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));

  var oldUsername = loggedUser.username;
  var email = loggedUser.email;
  var oldProfilePic = loggedUser.image;
  var oldPassword = loggedUser.password;

  //controllo se è cambiato qualcosa
  if (
    document.getElementById("username-registration").value == oldUsername &&
    document.getElementById("user-pic").value == oldProfilePic &&
    document.getElementById("psw-registration").value == oldPassword &&
    document.getElementById("psw2-registration").value == oldPassword
  ) {
    window.location.href = "settings.html";
    //se è cambiato qualcosa e le nuove informazioni rispettano gli standard allora modifico
  } else {
    if (checkUsername() && checkPsw() && checkPsw2()) {
      modify(loggedUser);
    }
  }
}

/* modify aggiorna l'utente con le nuove modifiche */
function modify(loggedUser) {
  loggedUser.username = document
    .getElementById("username-registration")
    .value.trim();
  loggedUser.image = document.getElementById("user-pic").value.trim();
  loggedUser.password = document
    .getElementById("psw-registration")
    .value.trim();

  var users = JSON.parse(window.localStorage.getItem("users"));
  index = getUserIndexFromLoggedUser();
  users[index] = loggedUser;

  window.localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
  window.localStorage.setItem("users", JSON.stringify(users));

  modifySuccessPopup(loggedUser.username);
}

/* modifySuccessPopup mostra un popup di avvenuta modifica delle informazioni dell'utente*/
function modifySuccessPopup(username) {
  document.getElementById("modify-user-div").style.display = "none";

  document.getElementById("username-popup").innerHTML = username;
  document.getElementById("modify-form-success").style.display = "block";
}

/* logOut effettua il logout dell'utente*/
function logOut() {
  window.localStorage.removeItem("loggedUser");
  window.location.href = "index.html";
}

/* deleteUser rimuove l'utente dal "database" degli utenti */
function deleteUser() {
  var loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"));
  var users = JSON.parse(window.localStorage.getItem("users"));

  //elimino l'utente dal "database" con tutti gli utenti
  if (users.lenght == 1) {
    users.pop();
  } else {
    users = users.filter((element) => element.email != loggedUser.email);
  }
  window.localStorage.setItem("users", JSON.stringify(users));
  window.localStorage.removeItem("loggedUser");
  window.location.href = "index.html";
}

/* toggleVisibility1 mostra o nasconde la password nel campo di input della nuova password */
function toggleVisibility1() {
  var x = document.getElementById("psw-registration");
  if (x.type === "password") {
    x.type = "text";
    document.getElementById("eye-icon1").innerText = "visibility_off";
  } else {
    x.type = "password";
    document.getElementById("eye-icon1").innerText = "visibility";
  }
}

/* toggleVisibility2 mostra o nasconde la password nel campo di reinserimento della nuova password */
function toggleVisibility2() {
  var x = document.getElementById("psw2-registration");
  if (x.type === "password") {
    x.type = "text";
    document.getElementById("eye-icon2").innerText = "visibility_off";
  } else {
    x.type = "password";
    document.getElementById("eye-icon1").innerText = "visibility";
  }
}
