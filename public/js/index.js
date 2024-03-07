/* eslint-disable */
import "@babel/polyfill";
import { login, logout } from "./login";

const loginForm = document.querySelector(".form--login");
const logoutBtn = document.querySelector(".nav__el--logout");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
    console.log("I was submitted bro!!");
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}
