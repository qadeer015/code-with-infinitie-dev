function searchElement() {
    let matchedElements = [];
    const searchClasses = document.getElementById('searchBox').value.trim().split(/\s+/);
    var elements = document.getElementsByClassName('video');

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
function searchElement() {
    let matchedElements = [];
    const searchClasses = document.getElementById('searchBox').value.trim().split(/\s+/);
    var elements = document.getElementsByClassName('video');

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

document.getElementById('searchBox').addEventListener('click', function () {
    document.getElementById('cancelBtn').style.display = "block";
    
});

document.getElementById('cancelBtn').addEventListener('click', function () {
    document.getElementById('searchBox').value = '';
    document.getElementById('cancelBtn').style.display = "none";
    document.querySelector("#searchResult").style.display="none";
    document.querySelector(".wrapper").style.visibility="visible";
});
window.onkeydown = (event) => {
    switch (event){
        case 'Enter' :
            searchElement();
    }
}
