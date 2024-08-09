<<<<<<< HEAD
function filterStudents() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName("li");
    
    // Loop through all list items
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        
        // Check if input value is in the text content
        if (txtValue.toUpperCase().indexOf(filter) > -1 && input.value != '') {
            li[i].style.display = "block";
            ul.style.display = "block";
            
            // Split text value to highlight the matched portion
            var regex = new RegExp(`(${filter})`, 'gi');
            var highlightedText = txtValue.replace(regex, '<span style="color: blue;">$1</span>');
            a.innerHTML = highlightedText;
        } else {
            li[i].style.display = "none";
            // Reset the inner HTML to original text to remove previous highlights
            a.innerHTML = txtValue;
        }
    }
}
=======
function filterStudents() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName("li");
    
    // Loop through all list items
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        
        // Check if input value is in the text content
        if (txtValue.toUpperCase().indexOf(filter) > -1 && input.value != '') {
            li[i].style.display = "block";
            ul.style.display = "block";
            
            // Split text value to highlight the matched portion
            var regex = new RegExp(`(${filter})`, 'gi');
            var highlightedText = txtValue.replace(regex, '<span style="color: blue;">$1</span>');
            a.innerHTML = highlightedText;
        } else {
            li[i].style.display = "none";
            // Reset the inner HTML to original text to remove previous highlights
            a.innerHTML = txtValue;
        }
    }
}
>>>>>>> d8d84363e9adeea97824613f6772e76b5fc75793
