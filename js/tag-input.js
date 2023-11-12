/* File JS contenente tutte le funzioni utili alla pagina last-steps.html per la gestione dei tag */

//Prendo gli elementi dal DOM
const input = document.querySelector('#tagInput');
const tagForm = document.querySelector('#tagForm');
const output = document.querySelector('.tags');
const max = document.querySelector('.max');

//outputTag crea il tag e lo mostra
function outputTag() {
  //Creo l'elememto tag
  const tag = `
    <span class="tag">
      <b>${input.value}</b>
      <span class="material-icons-outlined remove-btn">
        close
      </span>
    </span>
  `;
  userAddTag(input.value)
  //Mostro il tag
  output.innerHTML += tag;
   
  input.value = "";
}

tagForm.addEventListener('submit', e => {
  
  if(input.value === "") {
    e.preventDefault();
  }
  
  else if(output.children.length >= 4) {
    outputTag();
    input.disabled = true;
    input.placeholder = "Numero massimo di tag raggiunti!";
  }
  else {
    outputTag();
  }
  e.preventDefault();
});

input.addEventListener('input', e => {
  const rmvWhitespace = input.value.replace(/\s/g, '');
  input.value = rmvWhitespace.replace(/\s[^a-zA-Z0-9]/g, "");
});

window.addEventListener('click', e => {
  if(e.target.classList.contains('remove-btn')) {
    userRemoveTag(e.target.parentElement.innerText)
    e.target.parentElement.remove();
    input.disabled = false;
    input.placeholder = "Aggiungi i tuoi tag...";
  }
});

/* userAddTag aggiunge il tag nella lista dei tag dell'utente (lavora solo su loggedUser, le modifiche all'utente presente nella lista degli utenti avvengono con la funzione confirm) */
function userAddTag(tag) {
  user = JSON.parse(window.localStorage.getItem("loggedUser"))
  if (user.genresTag == null) {
    user.genresTag = []
    user.genresTag.push(tag)
  } else {
    user.genresTag.push(tag)
  }
  window.localStorage.setItem("loggedUser", JSON.stringify(user));
}

/*  userRemoveTag rimuove il tag dalla lista dei tag dell'utente (lavora solo su loggedUser, le modifiche all'utente presente nella lista degli utenti avvengono con la funzione confirm) */
function userRemoveTag(tag) {
  tag = tag.slice(0, tag.length-5).trim() //lo faccio perché viene fuori il nome del tag + spazio + close, quindi mi tolgo gli ultimi 5 caratteri (ovvero la lunghezza di close)
  console.log(tag)
  user = JSON.parse(window.localStorage.getItem("loggedUser"))
  if (user.genresTag.indexOf(tag) == user.genresTag.length-1) {
    user.genresTag.pop()
    window.localStorage.setItem("loggedUser", JSON.stringify(user));
  } else {
    var temp = user.genresTag[user.genresTag.length-1]
    user.genresTag[user.genresTag.length-1] = tag
    user.genresTag[user.genresTag.indexOf(tag)] = temp
    user.genresTag.pop()
    window.localStorage.setItem("loggedUser", JSON.stringify(user));
  }
}

/* getUserIndexFromLoggedUser ritorna l'indice dell'utente loggato all'interno dell'array contenente tutti gli utenti registrati */
function getUserIndexFromLoggedUser() {
  users = JSON.parse(window.localStorage.getItem("users"))
  loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"))
  for (i = 0; i < users.length; i++) {
    if (users[i].username == loggedUser.username) {
      return i
    }
  }
  return -1
}

/* confirm riporta le modifiche su loggedUser anche nell'utente presente nella lista degli utenti */
function confirm() {
  index = getUserIndexFromLoggedUser()
  users = JSON.parse(window.localStorage.getItem("users"))
  loggedUser = JSON.parse(window.localStorage.getItem("loggedUser"))
  users[index] = loggedUser
  window.localStorage.setItem("users", JSON.stringify(users))
  window.location.href = "home.html"
}