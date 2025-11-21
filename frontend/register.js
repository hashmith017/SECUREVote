const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (username.toLowerCase() === "pro") {
        alert("⚠️ You cannot register as 'pro'. Please choose another username.");
        return;
    }

    const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success) {
        alert("✅ Registration successful! Please login.");
        window.location.href = "login.html";
    } else {
        alert("⚠️ " + result.message);
    }
});
