const $ = id => document.getElementById(id);

const hour = $("hour");
const minute = $("minute");
const service = $("service");
const number = $("number");
const price = $("price");
const customWrap = $("customWrap");
const customPrice = $("customPrice");
const payment = $("payment");
const rows = $("rows");
const empty = $("empty");
const count = $("count");
const cash = $("cash");
const terminal = $("terminal");
const total = $("total");
const date = $("date");

let records = JSON.parse(localStorage.getItem("adrenaline_records") || "[]");

for (let h = 11; h <= 22; h++) {
  hour.add(new Option(String(h).padStart(2,"0"), h));
}
for (let m = 0; m <= 59; m++) {
  minute.add(new Option(String(m).padStart(2,"0"), m));
}

date.value = new Date().toISOString().slice(0,10);

function updateNumbers() {
  const max = service.value === "Машинка" ? 7 : service.value === "PlayStation" ? 2 : 3;
  number.innerHTML = "";
  for (let i = 1; i <= max; i++) {
    number.add(new Option(String(i), i));
  }
}
service.addEventListener("change", updateNumbers);
price.addEventListener("change", () => {
  customWrap.classList.toggle("hidden", price.value !== "other");
});
updateNumbers();

function getAmount() {
  if (price.value === "other") return Number(customPrice.value || 0);
  return Number(price.value);
}

function save() {
  localStorage.setItem("adrenaline_records", JSON.stringify(records));
}

function money(n) {
  return `${n.toLocaleString("uk-UA")} ₴`;
}

function render() {
  rows.innerHTML = "";
  let c = 0, t = 0;

  const sorted = [...records].sort((a,b) => a.time.localeCompare(b.time));

  sorted.forEach(r => {
    if (r.payment === "Готівка") c += r.amount;
    else t += r.amount;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><b>${r.time}</b></td>
      <td>${r.service}</td>
      <td>${r.number}</td>
      <td><b>${money(r.amount)}</b></td>
      <td>${r.payment === "Готівка" ? "💵 Готівка" : "💳 Термінал"}</td>
      <td><button class="delete" data-id="${r.id}">🗑</button></td>
    `;
    rows.appendChild(tr);
  });

  empty.style.display = sorted.length ? "none" : "block";
  count.textContent = `${sorted.length} ${sorted.length === 1 ? "запис" : "записів"}`;
  cash.textContent = money(c);
  terminal.textContent = money(t);
  total.textContent = money(c + t);

  document.querySelectorAll(".delete").forEach(btn => {
    btn.onclick = () => {
      records = records.filter(r => r.id !== Number(btn.dataset.id));
      save();
      render();
    };
  });
}

$("addBtn").onclick = () => {
  const amount = getAmount();
  if (!amount || amount < 0) {
    alert("Вкажи суму.");
    return;
  }

  records.push({
    id: Date.now(),
    time: `${String(hour.value).padStart(2,"0")}:${String(minute.value).padStart(2,"0")}`,
    service: service.value,
    number: number.value,
    amount,
    payment: payment.value
  });

  save();
  render();
  customPrice.value = "";
};

$("clearBtn").onclick = () => {
  if (!records.length) return;
  if (confirm("Точно очистити весь звіт?")) {
    records = [];
    save();
    render();
  }
};

$("copyBtn").onclick = async () => {
  const selectedDate = date.value || new Date().toISOString().slice(0,10);
  const sorted = [...records].sort((a,b) => a.time.localeCompare(b.time));
  let c = 0, t = 0;

  const lines = [
    `📋 ЗВІТ ЗА ${selectedDate.split("-").reverse().join(".")}`,
    `━━━━━━━━━━━━━━━━━━━━`
  ];

  sorted.forEach((r, i) => {
    if (r.payment === "Готівка") c += r.amount;
    else t += r.amount;
    lines.push(`${i+1}. ${r.time} | ${r.service} №${r.number} | ${r.amount} ₴ | ${r.payment}`);
  });

  lines.push(`━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`💵 Готівка: ${c} ₴`);
  lines.push(`💳 Термінал: ${t} ₴`);
  lines.push(`💰 РАЗОМ: ${c+t} ₴`);
  lines.push(`📌 Записів: ${sorted.length}`);

  const text = lines.join("\n");
  try {
    await navigator.clipboard.writeText(text);
    $("copyBtn").textContent = "✅ Скопійовано!";
    setTimeout(() => $("copyBtn").textContent = "📋 Скопіювати звіт", 1400);
  } catch {
    prompt("Скопіюй звіт:", text);
  }
};

render();
