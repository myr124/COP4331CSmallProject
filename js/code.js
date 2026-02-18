const urlBase = "http://sharkscove.site/LAMPAPI";
const extension = "php";

let userId = 0;
let firstName = "";
let lastName = "";

const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(password) {
  const errors = [];
  if (password.length < 8 || password.length > 32) {
    errors.push("Password must be 8 to 32 characters");
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push("Password must contain at least one letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  return errors;
}

function checkPasswordRequirements() {
  const password = document.getElementById("registerPassword").value;

  const reqLength = document.getElementById("req-length");
  const reqLetter = document.getElementById("req-letter");
  const reqNumber = document.getElementById("req-number");
  const reqSpecial = document.getElementById("req-special");

  // Check length (8-32 characters)
  if (password.length >= 8 && password.length <= 32) {
    reqLength.classList.add("fulfilled");
    reqLength.classList.remove("unfulfilled");
  } else {
    reqLength.classList.add("unfulfilled");
    reqLength.classList.remove("fulfilled");
  }

  // Check for letter
  if (/[a-zA-Z]/.test(password)) {
    reqLetter.classList.add("fulfilled");
    reqLetter.classList.remove("unfulfilled");
  } else {
    reqLetter.classList.add("unfulfilled");
    reqLetter.classList.remove("fulfilled");
  }

  // Check for number
  if (/[0-9]/.test(password)) {
    reqNumber.classList.add("fulfilled");
    reqNumber.classList.remove("unfulfilled");
  } else {
    reqNumber.classList.add("unfulfilled");
    reqNumber.classList.remove("fulfilled");
  }

  // Check for special character
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    reqSpecial.classList.add("fulfilled");
    reqSpecial.classList.remove("unfulfilled");
  } else {
    reqSpecial.classList.add("unfulfilled");
    reqSpecial.classList.remove("fulfilled");
  }
}

function doRegister() {
  let login = document.getElementById("registerEmail").value;
  // if (!validEmailRegex.test(login)) {
  // 	document.getElementById("registerResult").innerHTML = "Please enter a valid email address.";
  // 	return;
  // }
  if (login.length == 0) {
    document.getElementById("registerResult").innerHTML =
      "Please enter a username.";
    return;
  }
  let password = document.getElementById("registerPassword").value;
  let firstName = document.getElementById("registerFirstName").value;
  let lastName = document.getElementById("registerLastName").value;

  // Validate password
  let passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) {
    document.getElementById("registerResult").innerHTML =
      passwordErrors.join("<br>");
    return;
  }

  let hash = md5(password);
  document.getElementById("registerResult").innerHTML = "";

  let tmp = {
    login: login,
    password: hash,
    firstName: firstName,
    lastName: lastName,
  };
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/Register." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);
        if (jsonObject.error.length > 0) {
          document.getElementById("registerResult").innerHTML =
            jsonObject.error;
        } else {
          document.getElementById("registerResult").innerHTML =
            "User has been registered";

          userId = jsonObject.id;
          firstName = jsonObject.firstName;
          lastName = jsonObject.lastName;

          saveCookie();

          window.location.href = "contacts.html";
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("registerResult").innerHTML = err.message;
  }
}

function doLogin() {
  userId = 0;
  firstName = "";
  lastName = "";

  let login = document.getElementById("loginName").value;
  let password = document.getElementById("loginPassword").value;
  var hash = md5(password);

  document.getElementById("loginResult").innerHTML = "";

  // let tmp = {login:login,password:password};
  var tmp = { login: login, password: hash };
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/Login." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);
        userId = jsonObject.id;

        if (userId < 1) {
          document.getElementById("loginResult").innerHTML =
            "User/Password combination incorrect";
          return;
        }

        firstName = jsonObject.firstName;
        lastName = jsonObject.lastName;

        saveCookie();

        window.location.href = "contacts.html";
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("loginResult").innerHTML = err.message;
  }
}

function saveCookie() {
  let minutes = 20;
  let date = new Date();
  date.setTime(date.getTime() + minutes * 60 * 1000);
  document.cookie =
    "firstName=" +
    firstName +
    ",lastName=" +
    lastName +
    ",userId=" +
    userId +
    ";expires=" +
    date.toGMTString();
}

function readCookie() {
  userId = -1;
  let data = document.cookie;
  let splits = data.split(",");
  for (var i = 0; i < splits.length; i++) {
    let thisOne = splits[i].trim();
    let tokens = thisOne.split("=");
    if (tokens[0] == "firstName") {
      firstName = tokens[1];
    } else if (tokens[0] == "lastName") {
      lastName = tokens[1];
    } else if (tokens[0] == "userId") {
      userId = parseInt(tokens[1].trim());
    }
  }

  if (userId < 0) {
    window.location.href = "index.html";
  } else {
    //		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
  }
}

function doLogout() {
  userId = 0;
  firstName = "";
  lastName = "";
  document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
  window.location.href = "index.html";
}

function addContact() {
  let contactFirstName = document.getElementById("firstName").value;
  let contactLastName = document.getElementById("lastName").value;
  let contactEmail = document.getElementById("email").value;
  let contactPhoneRaw = document.getElementById("phone").value;

  let resultEl = document.getElementById("addContactResult");
  resultEl.classList.remove("success");

  // Check if first name is empty
  if (contactFirstName.trim().length === 0) {
    resultEl.innerHTML = "Please enter a first name.";
    return;
  }

  // Check if last name is empty
  if (contactLastName.trim().length === 0) {
    resultEl.innerHTML = "Please enter a last name.";
    return;
  }

  // Check email
  if (!validEmailRegex.test(contactEmail)) {
    resultEl.innerHTML = "Please enter a valid email address.";
    return;
  }

  // Check phone number is 10 digits
  const cleanedPhone = ("" + contactPhoneRaw).replace(/\D/g, "");
  if (cleanedPhone.length !== 10) {
    resultEl.innerHTML = "Please enter a valid 10-digit phone number.";
    return;
  }

  // Format phone number
  const phoneMatch = cleanedPhone.match(/^(\d{3})(\d{3})(\d{4})$/);
  let contactPhone = phoneMatch
    ? `(${phoneMatch[1]}) ${phoneMatch[2]}-${phoneMatch[3]}`
    : contactPhoneRaw;

  document.getElementById("addContactResult").innerHTML = "";

  let tmp = {
    firstName: contactFirstName,
    lastName: contactLastName,
    email: contactEmail,
    phone: contactPhone,
    userId: userId,
  };
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/AddContact." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let resultEl = document.getElementById("addContactResult");
        resultEl.innerHTML = "Contact has been added";
        resultEl.classList.add("success");
        document.getElementById("firstName").value = "";
        document.getElementById("lastName").value = "";
        document.getElementById("email").value = "";
        document.getElementById("phone").value = "";
        loadContacts();
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("addContactResult").innerHTML = err.message;
  }
}

function loadContacts() {
  readCookie();

  let tmp = { userId: userId, limit: 10 };
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/GetContacts." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);
        let list = document.getElementById("myUL");
        list.innerHTML = "";

        if (jsonObject.error && jsonObject.error.length > 0) {
          list.innerHTML = "<li>No contacts found</li>";
          return;
        }

        for (let i = 0; i < jsonObject.results.length; i++) {
          let c = jsonObject.results[i];
          list.appendChild(buildContactLi(c));
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("myUL").innerHTML =
      "<li>Error loading contacts</li>";
  }
}

function buildContactLi(c) {
  let li = document.createElement("li");
  li.dataset.id = c.id;

  let info = document.createElement("div");
  info.className = "contact-info";

  let name = document.createElement("span");
  name.className = "contact-name";
  name.textContent = c.firstName + " " + c.lastName;
  info.appendChild(name);

  let details = document.createElement("span");
  details.className = "contact-details";
  let parts = [];
  if (c.email) parts.push(c.email);
  if (c.phone) parts.push(c.phone);
  details.textContent = parts.join(" | ");
  info.appendChild(details);

  let actions = document.createElement("div");
  actions.className = "contact-actions";

  let editBtn = document.createElement("button");
  editBtn.className = "icon-btn";
  editBtn.title = "Edit";
  editBtn.innerHTML = "&#9998;";
  editBtn.onclick = function () {
    startEdit(li, c);
  };
  actions.appendChild(editBtn);

  let deleteBtn = document.createElement("button");
  deleteBtn.className = "icon-btn delete-btn";
  deleteBtn.title = "Delete";
  deleteBtn.innerHTML = "&#10006;";
  deleteBtn.onclick = function () {
    deleteContact(c.firstName, c.lastName);
  };
  actions.appendChild(deleteBtn);

  li.appendChild(info);
  li.appendChild(actions);
  return li;
}

function deleteContact(firstName, lastName) {
  if (!confirm("Delete " + firstName + " " + lastName + "?")) return;

  let tmp = { firstName: firstName, lastName: lastName };
  let jsonPayload = JSON.stringify(tmp);
  let url = urlBase + "/DeleteContact." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      loadContacts();
    }
  };
  xhr.send(jsonPayload);
}

function startEdit(li, c) {
  li.innerHTML = "";
  li.className = "editing";

  let form = document.createElement("div");
  form.className = "edit-form";

  let fName = document.createElement("input");
  fName.type = "text";
  fName.value = c.firstName;
  fName.placeholder = "First Name";
  let lName = document.createElement("input");
  lName.type = "text";
  lName.value = c.lastName;
  lName.placeholder = "Last Name";
  let email = document.createElement("input");
  email.type = "text";
  email.value = c.email;
  email.placeholder = "Email";
  let phone = document.createElement("input");
  phone.type = "text";
  phone.value = c.phone;
  phone.placeholder = "Phone";

  let btnRow = document.createElement("div");
  btnRow.className = "edit-btn-row";

  let saveBtn = document.createElement("button");
  saveBtn.className = "submit-btn";
  saveBtn.textContent = "Save";
  saveBtn.onclick = function () {
    let updated = {
      id: c.id,
      firstName: fName.value,
      lastName: lName.value,
      email: email.value,
      phone: phone.value,
      userId: userId,
    };
    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + "/UpdateContact." + extension, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        loadContacts();
      }
    };
    xhr.send(JSON.stringify(updated));
  };

  let cancelBtn = document.createElement("button");
  cancelBtn.className = "submit-btn";
  cancelBtn.textContent = "Cancel";
  cancelBtn.onclick = function () {
    loadContacts();
  };

  btnRow.appendChild(saveBtn);
  btnRow.appendChild(cancelBtn);

  form.appendChild(fName);
  form.appendChild(lName);
  form.appendChild(email);
  form.appendChild(phone);
  form.appendChild(btnRow);
  li.appendChild(form);
}

function searchContact() {
  let search = document.getElementById("searchName").value;

  let tmp = { search: search, userId: userId };
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/SearchContact." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);
        let list = document.getElementById("myUL");
        list.innerHTML = "";

        if (jsonObject.error && jsonObject.error.length > 0) {
          list.innerHTML = "<li>No contacts found</li>";
          return;
        }

        for (let i = 0; i < jsonObject.results.length; i++) {
          let c = jsonObject.results[i];
          list.appendChild(buildContactLi(c));
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("myUL").innerHTML =
      "<li>Error searching contacts</li>";
  }
}
