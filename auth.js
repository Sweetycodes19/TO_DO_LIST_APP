function login() {
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        alert("No account found. Please register first.");
        return;
      }

      if (user.email === email && user.password === password) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", user.username);

        if (user.profileCreated) {
          window.location.href = "index.html";
        } else {
          window.location.href = "create-profile.html";
        }
      } else {
        alert("Invalid credentials.");
      }
    }

    
function register() {
      const username = document.getElementById('regUsername').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value.trim();

      if (!username || !email || !password) {
        alert("All fields are required.");
        return;
      }

      // Check if user exists
      const existingUser = JSON.parse(localStorage.getItem("user"));
      if (existingUser && existingUser.email === email) {
        alert("Email already registered. Redirecting to login...");
        window.location.href = "login.html";
        return;
      }

      const newUser = { username, email, password, profileCreated: false };
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", username);

      window.location.href = "create-profile.html";
    }