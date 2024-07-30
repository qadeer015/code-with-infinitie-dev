
function filterStudents() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName("li");
    let results = document.querySelector(".results-wrapper");
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1 && input.value != '' ) {
            li[i].style.display = "block";
            ul.style.display="block";
    }
     else {
            li[i].style.display = "none";
        }
    }
}
function removeSearchResults(){
    ul = document.getElementById("myUL");
    ul.style.display = "none";
}
window.onkeydown=(event)=>{
    switch (event.key){
        case 'Enter':
            filterStudents();  
    }
}
//   menu open function
let menu = document.querySelector(".menu-bar");
let mobile = document.querySelector(".mobile");
let menuCancelBtn = document.querySelector(".menu-cancel-btn");
let content = document.querySelector(".wrapper");
menu.addEventListener('click',()=>{
 if(mobile.style.display=="block"){
    mobile.style.display="none";
    mobile.style.position="relative";
    mobile.style.bottom = "220px";
    content.style.display="block";
}
else{
    mobile.style.display="block";
    mobile.style.position="relative";
    mobile.style.bottom = "0px";
    content.style.display="none";
}
});
menuCancelBtn.addEventListener('click',()=>{
    if(mobile.style.display=="block"){
    mobile.style.display="none";
    content.style.display="block";
}
});
// theme changer function
let theme = document.querySelector(".theme-changer");
let header = document.querySelector(".header1");
let footer = document.querySelector(".footer");
theme.addEventListener('click',()=>{
    let body = document.querySelector('body');
if(header.style.color == "white"){
    header.classList.toggle("theme-color-blue");
    footer.classList.toggle("theme-color-blue");
    body.style.transition="1.5s";
    theme.classList.toggle('left');
    theme.classList.toggle('right');
}
else{
    header.classList.toggle("theme-color-black");
    footer.classList.toggle("theme-color-black");
    header.style.color="white";
    body.style.transition="1.5s";
    theme.classList.toggle('right');
    theme.classList.remove('left');

}
});
// search open onclick with mirror
let mirror = document.querySelector(".search-mirror");
let enableSearch = document.querySelector(".display-none")
let searchCancelBtn = document.querySelector(".searchCancelBtn");
mirror.addEventListener('click',()=>{
if(enableSearch.style.display=="block"){
    mirror.style.display="block";
    enableSearch.style.display="none";
}
else{
enableSearch.style.display="block";
searchCancelBtn.style.display="block";
menu.style.display="none";
mirror.style.display="none";
theme.style.display="none";
}
});
// search cancel function
searchCancelBtn.addEventListener('click',()=>{
if(searchCancelBtn.style.display=="block"){
    searchCancelBtn.style.display="none";
    mirror.style.display="block";
    menu.style.display="block";
    theme.style.display="block";
    enableSearch.style.display="none";
}
});