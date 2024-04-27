"use strict";

const openSidebar = document.querySelector("#open-sidebar");

const closeSidebar = document.querySelector("#close-menu");

const sidebar = document.querySelector(".sidebar");

function toggleSidebar() {
  sidebar.classList.toggle("hide");
}

openSidebar.addEventListener("click", toggleSidebar);

closeSidebar.addEventListener("click", toggleSidebar);
