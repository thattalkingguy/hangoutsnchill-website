function searchSite() {

const search = document
.getElementById("searchInput")
.value
.toLowerCase();

if(search.includes("ai")){
window.location.href="academy.html";
}

else if(search.includes("why")){
window.location.href="why.html";
}

else if(search.includes("resource")){
window.location.href="resources.html";
}

else if(search.includes("payment")){
window.location.href="payments.html";
}

else if(search.includes("business")){
window.location.href="business.html";
}

else if(search.includes("music") || search.includes("atunbi")){
window.location.href="music.html";
}

else if(search.includes("contact")){
window.location.href="contact.html";
}

else{

alert("Sorry, nothing found. Try AI, WHY, Resources, Payments, Business or Atunbi.");

}

}
document.addEventListener("DOMContentLoaded", function () {

const input = document.getElementById("searchInput");

if(input){

input.addEventListener("keypress", function(event){

if(event.key === "Enter"){

searchSite();

}

});

}

});
function toggleTheme(){

document.body.classList.toggle("dark-mode");

if(document.body.classList.contains("dark-mode")){

localStorage.setItem("theme","dark");

}else{

localStorage.setItem("theme","light");

}

}

window.onload=function(){

const theme=localStorage.getItem("theme");

if(theme==="dark"){

document.body.classList.add("dark-mode");

}

}
window.addEventListener("load", function () {

setTimeout(function () {

const loader = document.getElementById("loader");

if (loader) {

loader.classList.add("hidden");

}

}, 2000);

});
async function askBuilderAI() {

const question = document.getElementById("userQuestion").value;

const answer = document.getElementById("aiAnswer");

if (question.trim() === "") {

answer.innerHTML = "Please type a question first.";

return;

}

answer.innerHTML = "🤖 Builder AI is thinking...";

try {

const response = await fetch("/api/chat", {

method: "POST",

headers: {

"Content-Type": "application/json"

},

body: JSON.stringify({

question: question

})

});

const data = await response.json();

if (data.success) {

answer.innerHTML = data.answer;

} else {

answer.innerHTML = "❌ " + data.error;

}

} catch (error) {

answer.innerHTML = "Unable to contact Builder AI.";

console.error(error);

}

}