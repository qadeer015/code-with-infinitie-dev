
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