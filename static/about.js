(function () {
    const menuBtn = document.getElementById("about-menu-btn");
    const aboutBox = document.getElementById("about-box");
    const closeBtn = document.getElementById("close-about-btn");

    if (menuBtn && aboutBox) {
        menuBtn.addEventListener("click", () => {
            aboutBox.classList.toggle("hidden");
        });
    }
    if (closeBtn && aboutBox) {
        closeBtn.addEventListener("click", () => {
            aboutBox.classList.add("hidden");
        });
    }
})();