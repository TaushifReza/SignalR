/*let cloakSpan = document.getElementById("cloakCounter");
let stoneSpan = document.getElementById("stoneCounter");
let wandSpan = document.getElementById("wandCounter");

// Create connection
let connectionDeathlyHallows = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/dealthyHallows")
    .build();

// connect to method that hub invokes aka receive notification from hub
connectionDeathlyHallows.on("updateDealthyHallowCount", (cloak, stone, wand) => {
    cloakSpan.innerText = cloak.toString();
    stoneSpan.innerText = stone.toString();
    wandSpan.innerText = wand.toString();
});

// invoke hub methods aka send notification to hub

// start connection
function fulfilled() {
    connectionDeathlyHallows.innvoke("GetDeathlyHallowCount").then((result) => {
        cloakSpan.innerText = result.cloak.toString();
        stoneSpan.innerText = result.stone.toString();
        wandSpan.innerText = result.wand.toString();
    });
    // do something after connection is established
    console.log("Connection to User Hub Successful");
}

function rejected() {
    // do something if connection fails
    console.error("Connection to User Hub fails");
}

connectionDeathlyHallows.start().then(fulfilled, rejected);*/

let cloakSpan = document.getElementById("cloakCounter");
let stoneSpan = document.getElementById("stoneCounter");
let wandSpan = document.getElementById("wandCounter");

let cloakProgress = document.getElementById("cloakProgress");
let stoneProgress = document.getElementById("stoneProgress");
let wandProgress = document.getElementById("wandProgress");

// Create connection
let connectionDeathlyHallows = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/dealthyHallows")
    .build();

// Connect to method that hub invokes aka receive notification from hub
connectionDeathlyHallows.on("updateDealthyHallowCount", (cloak, stone, wand) => {
    // Update counters with animation
    animateCounter(cloakSpan, cloak);
    animateCounter(stoneSpan, stone);
    animateCounter(wandSpan, wand);

    // Update progress bars
    updateProgressBars(cloak, stone, wand);

    // Update last update time
    document.getElementById("lastUpdate").innerText = "Last updated: " + new Date().toLocaleTimeString();
});

// Add animation effect when counter changes
function animateCounter(element, newValue) {
    // Store old value
    const oldValue = parseInt(element.innerText) || 0;

    // Only animate if value changed
    if (oldValue !== newValue) {
        element.classList.add("text-danger");
        element.style.transform = "scale(1.2)";
        element.style.transition = "all 0.5s ease";

        setTimeout(() => {
            element.innerText = newValue.toString();
            element.classList.remove("text-danger");
            element.style.transform = "scale(1)";
        }, 300);
    } else {
        // Set the value even if it hasn't changed
        element.innerText = newValue.toString();
    }
}

// Update progress bars based on vote counts
function updateProgressBars(cloak, stone, wand) {
    const total = cloak + stone + wand;
    if (total > 0) {
        cloakProgress.style.width = ((cloak / total) * 100) + "%";
        stoneProgress.style.width = ((stone / total) * 100) + "%";
        wandProgress.style.width = ((wand / total) * 100) + "%";

        // Add aria attributes for accessibility
        cloakProgress.setAttribute("aria-valuenow", Math.round((cloak / total) * 100));
        stoneProgress.setAttribute("aria-valuenow", Math.round((stone / total) * 100));
        wandProgress.setAttribute("aria-valuenow", Math.round((wand / total) * 100));
    }
}

// Start connection
function fulfilled() {
    // Request current counts immediately when page loads
    connectionDeathlyHallows.invoke("GetDeathlyHallowCount").then((result) => {
        if (result) {
            // Update counter displays
            cloakSpan.innerText = result.cloak.toString();
            stoneSpan.innerText = result.stone.toString();
            wandSpan.innerText = result.wand.toString();

            // Initialize progress bars
            updateProgressBars(result.cloak, result.stone, result.wand);
        } else {
            // If result is undefined, try to get data via another connection method
            requestLatestCounts();
        }
    }).catch(error => {
        console.error("Error getting initial counts:", error);
        // Fallback - check if there's a specific error handler in your Hub
        requestLatestCounts();
    });

    // Update connection status
    document.getElementById("connectionStatus").textContent = "Connected";
    document.getElementById("connectionIndicator").classList.add("text-success");
    console.log("Connection to Deathly Hallows Hub Successful");
}

// Fallback method to request counts
function requestLatestCounts() {
    connectionDeathlyHallows.invoke("RequestLatestCounts").catch(function (err) {
        console.error("Error requesting latest counts: " + err.toString());
    });
}

function rejected() {
    document.getElementById("connectionStatus").textContent = "Disconnected";
    document.getElementById("connectionIndicator").classList.remove("text-success");
    document.getElementById("connectionIndicator").classList.add("text-danger");
    console.error("Connection to Deathly Hallows Hub failed");

    // Try to reconnect after a delay
    setTimeout(() => {
        connectionDeathlyHallows.start().then(fulfilled).catch(rejected);
    }, 5000);
}

// Add vote button functionality (optional AJAX approach)
document.querySelectorAll('.vote-btn').forEach(button => {
    button.addEventListener('click', function (e) {
        e.preventDefault();
        const voteUrl = this.getAttribute('href');

        // Show voting animation
        this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Voting...';
        this.disabled = true;

        // Send AJAX request instead of redirecting
        fetch(voteUrl)
            .then(response => {
                // Reset button after short delay
                setTimeout(() => {
                    this.innerHTML = 'Vote';
                    this.disabled = false;
                }, 1000);

                // If you want to manually trigger a refresh (backup)
                setTimeout(() => {
                    requestLatestCounts();
                }, 1500);
            })
            .catch(error => {
                console.error('Voting error:', error);
                this.innerHTML = 'Vote';
                this.disabled = false;
            });
    });
});

// Handle window events to ensure data is up-to-date
window.addEventListener('focus', function () {
    // Request latest counts when tab becomes active again
    if (connectionDeathlyHallows.state === signalR.HubConnectionState.Connected) {
        requestLatestCounts();
    }
});

// Special handler for page load after redirect
document.addEventListener('DOMContentLoaded', function () {
    // Check if we just came from a redirect (can use sessionStorage)
    const justVoted = sessionStorage.getItem('justVoted');
    if (justVoted) {
        // Clear the flag
        sessionStorage.removeItem('justVoted');

        // We'll request counts after connection is established
        console.log("Page loaded after vote - will request fresh data");
    }
});

// Start connection
connectionDeathlyHallows.start().then(fulfilled, rejected);

// Handle connection state changes
connectionDeathlyHallows.onclose(() => {
    document.getElementById("connectionStatus").textContent = "Disconnected";
    document.getElementById("connectionIndicator").classList.remove("text-success");
    document.getElementById("connectionIndicator").classList.add("text-danger");

    // Try to reconnect after a delay
    setTimeout(() => {
        connectionDeathlyHallows.start().then(fulfilled).catch(rejected);
    }, 5000);
});

// Store vote action before leaving page (for direct links)
document.querySelectorAll('a[href*="DeathlyHallows"]').forEach(a => {
    a.addEventListener('click', function () {
        sessionStorage.setItem('justVoted', 'true');
    });
});

// Add copy functionality to buttons
document.querySelectorAll(".copy-btn").forEach(button => {
    button.addEventListener("click", function () {
        const textToCopy = this.getAttribute("data-clipboard");
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = this.innerText;
            this.innerText = "Copied!";
            this.classList.add("btn-success");
            this.classList.remove("btn-outline-primary", "btn-outline-secondary", "btn-outline-warning");

            setTimeout(() => {
                this.innerText = originalText;
                this.classList.remove("btn-success");
                if (textToCopy.includes("cloak")) {
                    this.classList.add("btn-outline-primary");
                } else if (textToCopy.includes("stone")) {
                    this.classList.add("btn-outline-secondary");
                } else {
                    this.classList.add("btn-outline-warning");
                }
            }, 1500);
        });
    });
});

// Add animation styling
document.head.insertAdjacentHTML("beforeend", `
<style>
.hallows-card {
  transition: all 0.3s ease;
}
.hallows-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}
.counter-display {
  transition: all 0.3s ease;
}
.progress {
  height: 8px;
  transition: all 0.5s ease;
}
.vote-btn {
  min-width: 80px;
}
</style>
`);