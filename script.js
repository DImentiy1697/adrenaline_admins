const dateEl=document.getElementById("date");
const timeEl=document.getElementById("time");
const serviceEl=document.getElementById("service");
const numberEl=document.getElementById("number");
const priceEl=document.getElementById("price");
const customWrap=document.getElementById("customWrap");
const customPriceEl=document.getElementById("customPrice");
const paymentEl=document.getElementById("payment");
const tbody=document.querySelector("#reportTable tbody");

const names={car:"Машинка",ps:"PlayStation",vr:"VR"};
const counts={car:7,ps:2,vr:3};

function today(){
  const d=new Date(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0");
  return `${d.getFullYear()}-${m}-${day}`;
}
dateEl.value=today();

function key(){return `adrenaline-report-${dateEl.value}`;}
function getData(){return JSON.parse(localStorage.getItem(key())||"[]");}
function saveData(data){localStorage.setItem(key(),JSON.stringify(data));}

function updateNumbers(){
  const n=counts[serviceEl.value];
  numberEl.innerHTML="";
  for(let i=1;i<=n;i++){
    const o=document.createElement("option"); o.value=i;o.textContent=i;numberEl.appendChild(o);
  }
}
function updatePrice(){
  customWrap.classList.toggle("hidden",priceEl.value!=="custom");
}
serviceEl.addEventListener("change",updateNumbers);
priceEl.addEventListener("change",updatePrice);
dateEl.addEventListener("change",render);

function add(){
  let price=priceEl.value==="custom"?Number(customPriceEl.value):Number(priceEl.value);
  if(!price || price<0){alert("Вкажи суму.");return;}
  const data=getData();
  data.push({
    id:Date.now(),
    time:timeEl.value,
    service:serviceEl.value,
    number:Number(numberEl.value),
    price,
    payment:paymentEl.value
  });
  data.sort((a,b)=>a.time.localeCompare(b.time));
  saveData(data); render();
}
document.getElementById("addBtn").addEventListener("click",add);

function money(n){return `${n.toLocaleString("uk-UA")} ₴`;}

function remove(id){
  saveData(getData().filter(x=>x.id!==id)); render();
}

function render(){
  const data=getData();
  tbody.innerHTML="";
  let totals={car:0,ps:0,vr:0,cash:0,card:0,all:0};
  for(let h=11;h<=22;h++){
    const hour=String(h).padStart(2,"0");
    const tr=document.createElement("tr");
    const hourData=data.filter(x=>x.time.startsWith(hour+":"));
    const cells={car:[],ps:[],vr:[],cash:[],card:[]};
    hourData.forEach(x=>{
      const item=document.createElement("div");
      item.className="cell-item";
      item.innerHTML=`<span>${x.time} №${x.number} — ${money(x.price)}</span><button class="del" title="Видалити">×</button>`;
      item.querySelector(".del").onclick=()=>remove(x.id);
      cells[x.service].push(item);
      cells[x.payment].push(x);
      totals[x.service]+=x.price; totals[x.payment]+=x.price; totals.all+=x.price;
    });
    const th=document.createElement("th"); th.textContent=`${hour}:00`; tr.appendChild(th);
    ["car","ps","vr"].forEach(s=>{
      const td=document.createElement("td");
      if(!cells[s].length) td.innerHTML='<span class="muted">—</span>';
      else cells[s].forEach(e=>td.appendChild(e));
      tr.appendChild(td);
    });
    ["cash","card"].forEach(p=>{
      const td=document.createElement("td");
      const sum=cells[p].reduce((a,x)=>a+x.price,0);
      td.textContent=sum?money(sum):"—";
      tr.appendChild(td);
    });
    const td=document.createElement("td"); 
    const sum=hourData.reduce((a,x)=>a+x.price,0);
    td.innerHTML=sum?`<b>${money(sum)}</b>`:"—"; tr.appendChild(td);
    tbody.appendChild(tr);
  }
  document.getElementById("totalCar").textContent=money(totals.car);
  document.getElementById("totalPs").textContent=money(totals.ps);
  document.getElementById("totalVr").textContent=money(totals.vr);
  document.getElementById("totalCash").textContent=money(totals.cash);
  document.getElementById("totalCard").textContent=money(totals.card);
  document.getElementById("totalAll").textContent=money(totals.all);
}

function reportText(){
  const data=getData();
  const d=new Date(dateEl.value+"T12:00:00");
  const date=d.toLocaleDateString("uk-UA");
  let lines=[`📋 ЗВІТ ЗА ${date}`,`━━━━━━━━━━━━━━━━━━━━`];
  for(let h=11;h<=22;h++){
    const hh=String(h).padStart(2,"0");
    const rows=data.filter(x=>x.time.startsWith(hh+":"));
    if(!rows.length) continue;
    lines.push(`${hh}:00`);
    rows.forEach(x=>lines.push(`  ${x.time} | ${names[x.service]} №${x.number} | ${x.price} ₴ | ${x.payment==="cash"?"Готівка":"Термінал"}`));
  }
  const cash=data.filter(x=>x.payment==="cash").reduce((a,x)=>a+x.price,0);
  const card=data.filter(x=>x.payment==="card").reduce((a,x)=>a+x.price,0);
  lines.push(`━━━━━━━━━━━━━━━━━━━━`,`💵 Готівка: ${cash} ₴`,`💳 Термінал: ${card} ₴`,`💰 РАЗОМ: ${cash+card} ₴`,`📌 Записів: ${data.length}`);
  return lines.join("\n");
}
document.getElementById("copyBtn").addEventListener("click",async()=>{
  try{
    await navigator.clipboard.writeText(reportText());
    alert("Звіт скопійовано — можна кидати в групу.");
  }catch(e){prompt("Скопіюй звіт:",reportText());}
});
document.getElementById("clearBtn").addEventListener("click",()=>{
  if(confirm("Очистити всі записи за цю дату?")){localStorage.removeItem(key());render();}
});

updateNumbers();updatePrice();render();
