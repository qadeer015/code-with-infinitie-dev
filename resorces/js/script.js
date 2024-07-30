function searchElement() {
    let matchedElements = [];
    const searchClasses = document.getElementById('searchBox').value.trim().split(/\s+/);
    const elements = document.getElementsByClassName('video');

    let result = document.getElementById('searchResult');
    result.innerHTML = '';
    result.style.display = 'none';

    for (let element of elements) {
        let matches = searchClasses.every(searchClass => element.classList.contains(searchClass));
        if (matches) {
            matchedElements.push(element.outerHTML);
        }
    }
    
    if (matchedElements.length > 0) {
        result.innerHTML = `<h3> Search Results :<span class="search-text-color">${searchClasses}</span>  </h3>${matchedElements.join('<br>')}`;
        result.style.display = 'block';
    } else {
        result.innerHTML = `
                    <div><span class="did-u-mean"> Did you mean: </span><span class="search-text-color">${searchClasses}</span></div>
                    <div>No results containing all your search terms were found.</div>
                    <div>Your search - <span class="search-text-color">${searchClasses}</span> - did not match any documents.</div>
                    <h5> Suggestions: </h5>
                    <ul>
                        <li>Make sure that all words are spelled correctly.</li>
                        <li>Try different keywords.</li>
                        <li>Try more general keywords.</li>
                        <li>Try fewer keywords.</li>
                    </ul>
                `;
                result.style.display = 'block';
    }
}
window.onkeydown=(event)=>{
    switch (event.key){
        case 'Enter':
            searchElement();  
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
theme.addEventListener('click',()=>{
    let body = document.querySelector('body');
if(header.style.color == "white"){
    header.classList.toggle("theme-color-blue");
    body.style.transition="1.5s";
    theme.classList.toggle('left');
    theme.classList.toggle('right')
}
else{
    header.classList.toggle("theme-color-black");
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