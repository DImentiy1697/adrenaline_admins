let bookings = [];
let selectedService = null;
let selectedResource = null;
let selectedPrice = null;
let selectedPayment = null;

const hourSelect = document.getElementById("hour");
const minuteSelect = document.getElementById("minute");

for (let h = 11; h <= 22; h++) {
    const option = document.createElement("option");
    option.value = h;
    option.textContent = String(h).padStart(2, "0");
    hourSelect.appendChild(option);
}

for (let m = 0; m <= 59; m++) {
    const option = document.createElement("option");
    option.value = m;
    option.textContent = String(m).padStart(2, "0");
    minuteSelect.appendChild(option);
}

document.querySelectorAll(".service").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".service").forEach(b => b.classList.remove("selected"));
        button.classList.add("selected");
        selectedService = button.dataset.service;
        showResources();
    });
});

function showResources() {
    const resourceBlock = document.getElementById("resourceBlock");
    const resources = document.getElementById("resources");
    resources.innerHTML = "";

    let list = [];
    if (selectedService === "car") list = ["Машинка 1","Машинка 2","Машинка 3","Машинка 4","Машинка 5","Машинка 6","Машинка 7"];
    if (selectedService === "vr") list = ["VR 1","VR 2","VR 3"];
    if (selectedService === "ps") list = ["PS 1","PS 2"];

    list.forEach(resource => {
        const button = document.createElement("button");
        button.textContent = resource;
        button.addEventListener("click", () => {
            document.querySelectorAll("#resources button").forEach(b => b.classList.remove("selected"));
            button.classList.add("selected");
            selectedResource = resource;
            showPrices();
        });
        resources.appendChild(button);
    });

    resourceBlock.classList.remove("hidden");
    document.getElementById("priceBlock").classList.add("hidden");
    document.getElementById("paymentBlock").classList.add("hidden");
}

function showPrices() {
    const priceBlock = document.getElementById("priceBlock");
    const prices = document.getElementById("prices");
    prices.innerHTML = "";

    let priceList = selectedService === "ps" ? [100,150,200,300] : [200,300,500];
    priceList.push("Інша сума");

    priceList.forEach(price => {
        const button = document.createElement("button");
        button.textContent = price === "Інша сума" ? price : `${price} ₴`;

        button.addEventListener("click", () => {
            document.querySelectorAll("#prices button").forEach(b => b.classList.remove("selected"));
            button.classList.add("selected");

            if (price === "Інша сума") {
                selectedPrice = null;
                document.getElementById("customPriceBlock").classList.remove("hidden");
            } else {
                selectedPrice = price;
                document.getElementById("customPriceBlock").classList.add("hidden");
            }
            showPayment();
        });

        prices.appendChild(button);
    });

    priceBlock.classList.remove("hidden");
}

function showPayment() {
    document.getElementById("paymentBlock").classList.remove("hidden");

    document.querySelectorAll(".payment").forEach(button => {
        button.onclick = () => {
            document.querySelectorAll(".payment").forEach(b => b.classList.remove("selected"));
            button.classList.add("selected");
            selectedPayment = button.dataset.payment;
        };
    });
}

document.getElementById("addBooking").addEventListener("click", () => {
    const hour = hourSelect.value;
    const minute = minuteSelect.value;

    if (!hour || !minute) return alert("Вибери час");
    if (!selectedService || !selectedResource) return alert("Вибери послугу та номер");

    let price = selectedPrice;
    if (price === null) {
        price = Number(document.getElementById("customPrice").value);
        if (!price || price <= 0) return alert("Введи правильну суму");
    }

    if (!selectedPayment) return alert("Вибери спосіб оплати");

    bookings.push({
        id: Date.now(),
        time: `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`,
        resource: selectedResource,
        price,
        payment: selectedPayment
    });

    bookings.sort((a,b) => a.time.localeCompare(b.time));
    renderBookings();
    resetForm();
});

function renderBookings() {
    const container = document.getElementById("bookings");
    const emptyMessage = document.getElementById("emptyMessage");
    container.innerHTML = "";

    emptyMessage.style.display = bookings.length ? "none" : "block";

    bookings.forEach(booking => {
        const div = document.createElement("div");
        div.className = "booking";

        const paymentText = booking.payment === "cash" ? "💵 Готівка" : "💳 Термінал";

        div.innerHTML = `
            <div class="booking-top">
                <div>
                    <div class="booking-time">${booking.time}</div>
                    <div class="booking-info">${booking.resource} · ${booking.price} ₴ · ${paymentText}</div>
                </div>
                <button class="delete" onclick="deleteBooking(${booking.id})">🗑️</button>
            </div>
        `;

        container.appendChild(div);
    });

    updateStats();
}

function deleteBooking(id) {
    bookings = bookings.filter(booking => booking.id !== id);
    renderBookings();
}

function updateStats() {
    let cash = 0;
    let terminal = 0;

    bookings.forEach(booking => {
        if (booking.payment === "cash") cash += booking.price;
        if (booking.payment === "terminal") terminal += booking.price;
    });

    document.getElementById("cashTotal").textContent = `${cash} ₴`;
    document.getElementById("terminalTotal").textContent = `${terminal} ₴`;
    document.getElementById("total").textContent = `${cash + terminal} ₴`;
}

function resetForm() {
    hourSelect.value = "";
    minuteSelect.value = "";
    selectedService = null;
    selectedResource = null;
    selectedPrice = null;
    selectedPayment = null;

    document.querySelectorAll(".service, .payment").forEach(b => b.classList.remove("selected"));
    document.getElementById("resourceBlock").classList.add("hidden");
    document.getElementById("priceBlock").classList.add("hidden");
    document.getElementById("paymentBlock").classList.add("hidden");
    document.getElementById("customPriceBlock").classList.add("hidden");
    document.getElementById("customPrice").value = "";
}

document.getElementById("clearDay").addEventListener("click", () => {
    if (!bookings.length) return;
    if (confirm("Точно очистити всі бронювання?")) {
        bookings = [];
        renderBookings();
    }
});

renderBookings();
