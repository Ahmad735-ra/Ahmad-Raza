document.getElementById("clickBtn")?.addEventListener("click", function() {
    if (typeof showToast === "function") {
        showToast("Thank you for visiting my portfolio!", "success");
    } else {
        console.log("Thank you for visiting my portfolio!");
    }
});
