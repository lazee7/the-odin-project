"use strict";

const errorEl = document.getElementById("error");
const password = document.getElementById("password");

const confirmPassword = document.getElementById("confirmPassword");

const form = document.querySelector("form");

function validatePassword() {
  if (password.value !== confirmPassword.value) {
    return false;
  }
  return true;
}

function handleFormSubmit(event) {
  event.preventDefault();

  const isPasswordValid = validatePassword();

  if (!isPasswordValid) {
    errorEl.textContent = "*passwords do not match";
  }
}

function validatePasswordInput() {
  if (password.validity.patternMismatch) {
    password.setCustomValidity(
      "password must include one uppercase, one number and at least 8 characters long"
    );
  }
}

form.addEventListener("submit", handleFormSubmit);

password.addEventListener("input", validatePasswordInput);
