function filterLectures() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("searchBox");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myLectures");
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