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
        result.innerHTML = `<h3> Search Results : </h3>${matchedElements.join('<br>')}`;
        result.style.display = 'block';
    } else {
        result.innerHTML = 'No matching elements found';
        result.style.display = 'block';
    }
}
window.onkeydown=(event)=>{
    switch (event.key){
        case 'Enter':
            searchElement();  
    }
}