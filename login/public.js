import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseApp = initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
});
const auth = getAuth(firebaseApp);

const message = document.querySelector("#message");
const profile = document.querySelector("#profile");

async function api(path, options = {}) {
  const token = await auth.currentUser.getIdToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });
  if (!response.ok) throw new Error((await response.json()).error || "Request failed");
  return response.json();
}

document.querySelector("#login-form").addEventListener("submit", async event => {
  event.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    message.textContent = "Logged in.";
  } catch (error) {
    message.textContent = error.message;
  }
});

document.querySelector("#register").addEventListener("click", async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    message.textContent = "Account created.";
  } catch (error) {
    message.textContent = error.message;
  }
});

document.querySelector("#save-profile").addEventListener("click", async () => {
  try {
    await api("/api/profile", {
      method: "PUT",
      body: JSON.stringify({ displayName: document.querySelector("#display-name").value })
    });
    message.textContent = "Profile saved.";
  } catch (error) {
    message.textContent = error.message;
  }
});

document.querySelector("#logout").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async user => {
  profile.hidden = !user;
  if (!user) return;
  try {
    const data = await api("/api/profile");
    document.querySelector("#user-email").textContent = data.email || user.email;
    document.querySelector("#display-name").value = data.displayName || "";
  } catch (error) {
    message.textContent = error.message;
  }
});