const resources = {
  car: ["Машинка 1","Машинка 2","Машинка 3","Машинка 4","Машинка 5","Машинка 6","Машинка 7"],
  ps: ["PlayStation 1","PlayStation 2"],
  vr: ["VR 1","VR 2","VR 3"]
};

const prices = {
  car: [200,300,500],
  vr: [200,300,500],
  ps: [100,150,200,300]
};

const hour = document.getElementById("hour");
const minute = document.getElementById("minute");
const service = document.getElementById("service");
const resource = document.getElementById("resource");
const price = document.getElementById("price");
const customPrice = document.getElementById("customPrice");
const payment = document.getElementById("payment");
const body = document.getElementById("bookingsBody");

let bookings = JSON.parse(localStorage.getItem("adrenalineBookings") || "[]");

for(let h=11; h<=22; h++) hour.add(new Option(String(h).padStart(2,"0"), h));
for(let m=0; m<60; m++) minute.add(new Option(String(m).padStart(2,"0"), m));

function updateResources(){
  resource.innerHTML="";
  resources[service.value].forEach((name,i)=>resource.add(new Option(name,i)));
  price.innerHTML="";
  prices[service.value].forEach(v=>price.add(new Option(v+" ₴",v)));
  price.add(new Option("Інша сума","custom"));
  customPrice.hidden = true;
}
service.addEventListener("change", updateResources);
price.addEventListener("change", ()=>customPrice.hidden = price.value !== "custom");

function save(){localStorage.setItem("adrenalineBookings",JSON.stringify(bookings));}

function render(){
  bookings.sort((a,b)=>a.time.localeCompare(b.time));
  body.innerHTML="";
  document.getElementById("empty").style.display=bookings.length ? "none":"block";

  let cash=0, terminal=0;
  bookings.forEach((b,i)=>{
    if(b.payment==="cash") cash+=b.amount; else terminal+=b.amount;
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td><strong>${b.time}</strong></td>
      <td>${b.serviceName}</td>
      <td><span class="badge">${b.resource}</span></td>
      <td><strong>${b.amount} ₴</strong></td>
      <td>${b.payment==="cash"?"💵 Готівка":"💳 Термінал"}</td>
      <td><button class="delete" data-index="${i}">🗑</button></td>`;
    body.appendChild(tr);
  });

  document.getElementById("cashTotal").textContent=cash+" ₴";
  document.getElementById("terminalTotal").textContent=terminal+" ₴";
  document.getElementById("grandTotal").textContent=(cash+terminal)+" ₴";
  document.getElementById("count").textContent=bookings.length;
  document.getElementById("dateLabel").textContent=new Date().toLocaleDateString("uk-UA");
}

document.getElementById("addBooking").onclick=()=>{
  const amount=price.value==="custom" ? Number(customPrice.value) : Number(price.value);
  if(!amount || amount<0) return alert("Вкажи суму");

  bookings.push({
    time:`${String(hour.value).padStart(2,"0")}:${String(minute.value).padStart(2,"0")}`,
    service:service.value,
    serviceName:service.options[service.selectedIndex].text,
    resource:resource.options[resource.selectedIndex].text,
    amount,
    payment:payment.value
  });
  save(); render();
  customPrice.value="";
};

body.addEventListener("click",e=>{
  const btn=e.target.closest(".delete");
  if(!btn) return;
  bookings.splice(Number(btn.dataset.index),1);
  save(); render();
});

document.getElementById("clearDay").onclick=()=>{
  if(confirm("Очистити всі бронювання за сьогодні?")){
    bookings=[]; save(); render();
  }
};

updateResources();
render();
