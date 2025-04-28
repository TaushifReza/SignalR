/*// Create connection
let connectionUserCount = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/userCount")
    .build();

// connect to method that hub invokes aka receive notification from hub
connectionUserCount.on("updateTotalViews", (value) => {
    let newCountSpan = document.getElementById("totalViewsCounter");
    newCountSpan.innerText = value.toString();
});

connectionUserCount.on("updateTotalUsers", (value) => {
    let newCountSpan = document.getElementById("totalUsersCounter");
    newCountSpan.innerText = value.toString();
});

// invoke hub methods aka send notification to hub
function newWindowLoadedOnClient() {
    connectionUserCount.send("NewWindowLoaded");
}

// start connection
function fulfilled() {
    // do something after connection is established
    console.log("Connection to User Hub Successful");
    newWindowLoadedOnClient();
}

function rejected() {
    // do something if connection fails
    console.error("Connection to User Hub fails");
}

connectionUserCount.start().then(fulfilled, rejected);*/

// Create connection
let connectionUserCount = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/userCount")
    .build();

// Connect to method that hub invokes aka receive notification from hub
connectionUserCount.on("updateTotalViews", (value) => {
    let newCountSpan = document.getElementById("totalViewsCounter");
    newCountSpan.innerText = value.toString();
    animateCounter(newCountSpan);
});

connectionUserCount.on("updateTotalUsers", (value) => {
    let newCountSpan = document.getElementById("totalUsersCounter");
    newCountSpan.innerText = value.toString();
    animateCounter(newCountSpan);
});

// Add animation effect when counter changes
function animateCounter(element) {
    element.classList.add("text-danger");
    element.style.transform = "scale(1.1)";
    element.style.transition = "transform 0.3s ease";

    setTimeout(() => {
        element.classList.remove("text-danger");
        element.style.transform = "scale(1)";
    }, 700);
}

// Invoke hub methods aka send notification to hub
function newWindowLoadedOnClient() {
    connectionUserCount.send("NewWindowLoaded");
}

// Start connection
function fulfilled() {
    console.log("Connection to User Hub Successful");
    document.getElementById("connectionStatus").textContent = "Connected";
    document.getElementById("connectionIndicator").classList.add("text-success");
    newWindowLoadedOnClient();
}

function rejected() {
    console.error("Connection to User Hub fails");
    document.getElementById("connectionStatus").textContent = "Disconnected";
    document.getElementById("connectionIndicator").classList.remove("text-success");
    document.getElementById("connectionIndicator").classList.add("text-danger");
}

connectionUserCount.start().then(fulfilled, rejected);

// Handle connection state changes
connectionUserCount.onclose(() => {
    document.getElementById("connectionStatus").textContent = "Disconnected";
    document.getElementById("connectionIndicator").classList.remove("text-success");
    document.getElementById("connectionIndicator").classList.add("text-danger");

    // Try to reconnect after a delay
    setTimeout(() => connectionUserCount.start(), 5000);
});

// Add refresh button functionality
document.getElementById("refreshButton").addEventListener("click", function () {
    this.disabled = true;
    let refreshIcon = this.querySelector("svg");
    refreshIcon.style.animation = "rotate 1s linear";

    // Manual refresh functionality
    newWindowLoadedOnClient();

    setTimeout(() => {
        this.disabled = false;
        refreshIcon.style.animation = "";
    }, 1000);
});

// Add animation for refresh button
document.head.insertAdjacentHTML("beforeend", `
<style>
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.card {
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}
</style>
`);