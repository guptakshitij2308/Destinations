/* eslint-disable */
import "@babel/polyfill";
import { login, logout } from "./login";
import { updateData } from "./updateSettings";

const loginForm = document.querySelector(".form--login");
const logoutBtn = document.querySelector(".nav__el--logout");
const updateBtn = document.querySelector(".form-user-data");
const updatePasswordBtn = document.querySelector(".form-user-password");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
    console.log("I was submitted bro!!");
  });
}

if (updateBtn) {
  updateBtn.addEventListener("submit", (e) => {
    // console.log("Submitted.");
    e.preventDefault();

    const form = new FormData();

    // const email = document.getElementById("email").value;
    // const name = document.getElementById("name").value;
    // updateData({ name, email }, "data");

    // Here we are basically recreating the multipart form data ; hence the name multer
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);

    updateData(form, "data");

    // console.log("Updated bro!!");
  });
}

if (updatePasswordBtn) {
  updatePasswordBtn.addEventListener("submit", async (e) => {
    // console.log("Submitted.");
    // document.querySelector(".btn--save-password").textContent = "Updating...";
    e.preventDefault();
    const password = document.getElementById("password-current").value;
    const newPassword = document.getElementById("password").value;
    const confirmPassword = document.getElementById("password-confirm").value;
    await updateData(
      {
        currentPassword: password,
        password: newPassword,
        passwordConfirm: confirmPassword,
      },
      "password",
    );
    // console.log("Updated bro!!");
    // document.querySelector(".btn--save-password").textContent = "Save Password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
    location.reload(true);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}
