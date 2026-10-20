const $ = id => document.getElementById(id);

const serviceNames = { car: "Машинка", ps: "PlayStation", vr: "VR" };
const counts = { car: 7, ps: 2, vr: 3 };
const prices = {
  car: [200, 300, 500],
  vr: [200, 300, 500],
  ps: [100, 150, 200, 300]
};

let entries = JSON.parse(localStorage.getItem("adrenaline_entries") || "[]");

function today() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}

$("date").value = today();

for (let h = 11; h <= 22; h++) {
  const o = document.createElement("option");
  o.value = h; o.textContent = String(h).padStart(2,"0");
  $("hour").appendChild(o);
}
for (let m = 0; m < 60; m++) {
  const o = document.createElement("option");
  o.value = m; o.textContent = String(m).padStart(2,"0");
  $("minute").appendChild(o);
}

function updateNumbers() {
  const service = $("service").value;
  $("number").innerHTML = "";
  for (let i = 1; i <= counts[service]; i++) {
    const o = document.createElement("option");
    o.value = i; o.textContent = i;
    $("number").appendChild(o);
  }

  $("amount").innerHTML = "";
  prices[service].forEach(p => {
    const o = document.createElement("option");
    o.value = p; o.textContent = `${p} ₴`;
    $("amount").appendChild(o);
  });
  const other = document.createElement("option");
  other.value = "other"; other.textContent = "Інша сума";
  $("amount").appendChild(other);
  $("customAmountBox").classList.add("hidden");
}
$("service").addEventListener("change", updateNumbers);
$("amount").addEventListener("change", () => {
  $("customAmountBox").classList.toggle("hidden", $("amount").value !== "other");
});
updateNumbers();

function save() {
  localStorage.setItem("adrenaline_entries", JSON.stringify(entries));
}

function selectedDay() {
  return $("date").value;
}

$("addBtn").addEventListener("click", () => {
  let amount = $("amount").value === "other"
    ? Number($("customAmount").value)
    : Number($("amount").value);

  if (!amount || amount < 0) {
    alert("Вкажи суму.");
    return;
  }

  entries.push({
    id: Date.now() + Math.random(),
    date: selectedDay(),
    hour: Number($("hour").value),
    minute: Number($("minute").value),
    service: $("service").value,
    number: Number($("number").value),
    amount,
    payment: $("payment").value
  });

  save();
  $("customAmount").value = "";
  render();
});

$("date").addEventListener("change", render);

$("clearBtn").addEventListener("click", () => {
  if (!confirm("Очистити всі записи за цей день?")) return;
  entries = entries.filter(e => e.date !== selectedDay());
  save();
  render();
});

function render() {
  const day = selectedDay();
  const dayEntries = entries.filter(e => e.date === day);

  const body = $("tbody");
  body.innerHTML = "";

  for (let h = 11; h <= 22; h++) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = `${String(h).padStart(2,"0")}:00`;
    tr.appendChild(th);

    const cols = [];
    for (let i = 1; i <= 13; i++) {
      const td = document.createElement("td");
      td.className = "empty";
      td.textContent = "—";
      cols.push(td);
      tr.appendChild(td);
    }

    const hourEntries = dayEntries
      .filter(e => e.hour === h)
      .sort((a,b) => a.minute - b.minute);

    hourEntries.forEach(e => {
      let index;
      if (e.service === "car") index = e.number - 1;
      if (e.service === "ps") index = 7 + e.number - 1;
      if (e.service === "vr") index = 9 + e.number - 1;

      const td = cols[index];
      if (td.classList.contains("empty")) {
        td.classList.remove("empty");
        td.textContent = "";
      }

      const span = document.createElement("span");
      span.className = "cell-entry";
      const paymentLabel = e.payment === "cash" ? "💵 НАЛ" : "💳 ТЕРМІНАЛ";
      span.innerHTML = `${String(e.hour).padStart(2,"0")}:${String(e.minute).padStart(2,"0")} / ${e.amount} ₴ <span class="payment-label">${paymentLabel}</span> <span class="delete" title="Видалити">×</span>`;
      span.querySelector(".delete").onclick = () => {
        entries = entries.filter(x => x.id !== e.id);
        save(); render();
      };
      td.appendChild(span);
    });

    body.appendChild(tr);
  }

  let cash = 0, terminal = 0;
  const totals = {car:0, ps:0, vr:0};
  dayEntries.forEach(e => {
    totals[e.service] += e.amount;
    if (e.payment === "cash") cash += e.amount;
    else terminal += e.amount;
  });

  $("carTotal").textContent = `${totals.car} ₴`;
  $("psTotal").textContent = `${totals.ps} ₴`;
  $("vrTotal").textContent = `${totals.vr} ₴`;
  $("cashTotal").textContent = `${cash} ₴`;
  $("terminalTotal").textContent = `${terminal} ₴`;
  $("grandTotal").textContent = `${cash + terminal} ₴`;
}

function reportText() {
  const day = selectedDay();
  const dayEntries = entries.filter(e => e.date === day);
  const lines = [`ADRENALINE — ЗВІТ ЗМІНИ`, `Дата: ${day}`, ""];
  for (let h = 11; h <= 22; h++) {
    const row = dayEntries.filter(e => e.hour === h).sort((a,b) => a.minute-b.minute);
    if (!row.length) {
      lines.push(`${String(h).padStart(2,"0")}:00 —`);
      continue;
    }
    lines.push(`${String(h).padStart(2,"0")}:00`);
    row.forEach(e => {
      const p = e.payment === "cash" ? "готівка" : "термінал";
      lines.push(`  ${String(e.hour).padStart(2,"0")}:${String(e.minute).padStart(2,"0")} | ${serviceNames[e.service]} ${e.number} | ${e.amount} ₴ | ${p}`);
    });
  }
  let cash=0, terminal=0;
  dayEntries.forEach(e => e.payment === "cash" ? cash += e.amount : terminal += e.amount);
  lines.push("", `Готівка: ${cash} ₴`, `Термінал: ${terminal} ₴`, `РАЗОМ: ${cash + terminal} ₴`);
  return lines.join("\n");
}

$("copyBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(reportText());
    const old = $("copyBtn").textContent;
    $("copyBtn").textContent = "✅ Скопійовано";
    setTimeout(() => $("copyBtn").textContent = old, 1400);
  } catch {
    alert(reportText());
  }
});

render();
