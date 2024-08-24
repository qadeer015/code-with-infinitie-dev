
function filterStudents() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1 && input.value != '' ) {
            li[i].style.display = "block";
            a.style.color = "blue";
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
    menuCancelBtn.style.display="block";
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
theme.addEventListener('click',()=>{
    document.body.classList.toggle("dark-theme");
if(document.body.classList.contains("dark-theme")){
    theme.classList.toggle('right');
}
else{
    theme.classList.remove('left');
    theme.classList.toggle('right');
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

window.addEventListener('resize', function() {
    if (window.innerWidth > 1200) {
        mobile.style.display = '';
        searchCancelBtn.style.display='';
        theme.style.display='';
        menu.style.display='none';
        mirror.style.display='';
        enableSearch.style.display='';
        content.style.display = '';  
    }
    else{
        searchCancelBtn.style.display=' ';
        menu.style.display='';
        enableSearch.style.display='none';
    }
});
//   announcement open function
var accordions = document.getElementsByClassName("accordian");

for (var i = 0; i < accordions.length; i++) {
    accordions[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        var icon = this.querySelector(".fa-solid");

        if (panel.style.display === "block") {
            panel.style.display = "none";
            icon.classList.remove("fa-minus");
            icon.classList.add("fa-plus");
        } else {
            panel.style.display = "block";
            icon.classList.remove("fa-plus");
            icon.classList.add("fa-minus");
        }
    });
}