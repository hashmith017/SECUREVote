const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success && result.otpSent) {
        localStorage.setItem("otpUser", result.username);
        window.location.href = "otp.html";
    } else {
        alert("⚠️ " + (result.message || "An error occurred."));
    }
});