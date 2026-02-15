const urlBase = 'http://64.225.16.120/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";



function doRegister()
{
	const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	let login = document.getElementById("registerEmail").value;
	if (!validEmailRegex.test(login)) {
		document.getElementById("registerResult").innerHTML = "Please enter a valid email address.";
		return;
	}
	let password = document.getElementById("registerPassword").value;
	let firstName = document.getElementById("registerFirstName").value;
	let lastName = document.getElementById("registerLastName").value;

	document.getElementById("registerResult").innerHTML = "";
	
	let tmp = {login:login,password:password,firstName:firstName,lastName:lastName};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/Register.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				if(jsonObject.error.length > 0){
					document.getElementById("registerResult").innerHTML = jsonObject.error;
				}else{
					document.getElementById("registerResult").innerHTML = "User has been registered";

					userId = jsonObject.id;
					firstName = jsonObject.firstName;
					lastName = jsonObject.lastName;

					saveCookie();

					window.location.href = "contacts.html";
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("registerResult").innerHTML = err.message;
	}

}

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "contacts.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "login.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "login.html";
}

function addContact(){
	let contactFirstName = document.getElementById("firstName").value;
	let contactLastName = document.getElementById("lastName").value;
	let contactEmail = document.getElementById("email").value;
	let contactPhone = document.getElementById("phone").value;

	document.getElementById("addContactResult").innerHTML = "";

	let tmp = {firstName:contactFirstName,lastName:contactLastName,email:contactEmail,phone:contactPhone,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200){
				document.getElementById("addContactResult").innerHTML = "Contact has been added";
				document.getElementById("firstName").value = "";
				document.getElementById("lastName").value = "";
				document.getElementById("email").value = "";
				document.getElementById("phone").value = "";
			}
		};
		xhr.send(jsonPayload);
	}catch(err){
		document.getElementById("addContactResult").innerHTML = err.message;
	}

}

function loadContacts()
{
	readCookie();

	let tmp = {userId:userId,limit:10};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/GetContacts.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				let jsonObject = JSON.parse( xhr.responseText );
				let list = document.getElementById("myUL");
				list.innerHTML = "";

				if( jsonObject.error && jsonObject.error.length > 0 )
				{
					list.innerHTML = "<li>No contacts found</li>";
					return;
				}

				for( let i = 0; i < jsonObject.results.length; i++ )
				{
					let li = document.createElement("li");
					let a = document.createElement("a");
					a.href = "#";
					a.textContent = jsonObject.results[i];
					li.appendChild(a);
					list.appendChild(li);
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("myUL").innerHTML = "<li>Error loading contacts</li>";
	}
}

function searchContact()
{
	let search = document.getElementById("searchText").value;
	document.getElementById("contactSearchResult").innerHTML = "";
	
	let contactList = "";

	let tmp = {search:search,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchContacts.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("contactSearchResult").innerHTML = "Contact(s) has been retrieved";
				let jsonObject = JSON.parse( xhr.responseText );
				for( let i=0; i<jsonObject.results.length; i++ ){
					contactList += jsonObject.results[i].firstName + " " + jsonObject.results[i].lastName + " - " + jsonObject.results[i].email + " - " + jsonObject.results[i].phone;
					if( i < jsonObject.results.length - 1 ){
						contactList += "<br />\r\n";
					}
				}
				document.getElementsByTagName("p")[0].innerHTML = contactList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactSearchResult").innerHTML = err.message;
	}
}
