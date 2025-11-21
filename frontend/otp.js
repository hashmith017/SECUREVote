const otpForm = document.getElementById("otpForm");
const otpStatus = document.getElementById("otpStatus");

const username = localStorage.getItem("otpUser");
if (!username) {
    window.location.href = "login.html";
}

otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    otpStatus.textContent = "Verifying...";

    const otp = document.getElementById("otp").value;

    const response = await fetch("http://localhost:3000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, otp })
    });

    const result = await response.json();

    if (result.success) {
        // --- Success! Save the token and log in ---
        localStorage.setItem("token", result.token);
        localStorage.removeItem("otpUser"); // Clean up

        if (result.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }
    } else {
        otpStatus.textContent = "⚠️ " + result.message;
    }
});