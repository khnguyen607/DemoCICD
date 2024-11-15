_setEffect();
document.addEventListener("DOMContentLoaded", async () => {
  await _getLayouts();
  _setStatus();
});

async function _getLayouts() {
  try {
    // Get components
    var components = document.createElement("div");
    components.innerHTML = await Helper.fetchHTML(
      "./shared/components/layout.html"
    );
    document.querySelector("header").innerHTML =
      components.querySelector("header").innerHTML;
    document.querySelector("nav").innerHTML =
      components.querySelector("nav").innerHTML;
    document.querySelector("footer").innerHTML =
      components.querySelector("footer").innerHTML;

    var page = Helper.getParameter("page");
    if (page && page != "home") {
      document
        .querySelector(`.nav-item a[href='./?page=${page}']`)
        .classList.add("active");
    } else {
      document.querySelector(`.nav-item a[href='./']`).classList.add("active");
    }
  } catch (error) {
    console.error("Error loading HTML:", error);
  }
}

async function _setEffect() {
  var style = document.createElement("style");
  style.innerHTML = `        
    body {
        opacity: 0;
        /* Apply transition effect to opacity property */
        transition: opacity 0.5s ease-in-out;
    }
    body.show {
        opacity: 1;
    }
    `;
  document.head.appendChild(style);

  setTimeout(function () {
    var body = document.querySelector("body");
    body.classList.add("show");
  }, 100);
}

async function addScript(script) {
  var scriptElement = document.createElement("script");
  scriptElement.src = script;
  document.body.appendChild(scriptElement);
}

async function _setStatus() {
  if (Helper.getCookie("user_id")) document.querySelector("#loginIcon").classList.add("d-none");
  else document.querySelector("#logoutIcon").classList.add("d-none");
}
