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