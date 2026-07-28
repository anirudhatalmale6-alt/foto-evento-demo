// Demo de galería para venta de fotos — lógica de selección, precios por paquete y flujo Yape.
const $ = s => document.querySelector(s);
const money = n => EVENT.currency + " " + n.toFixed(2);
const selected = new Set();
let lbIndex = 0;

/* ---------- Access gate (PIN por galería) ---------- */
$("#enter").addEventListener("click", tryEnter);
$("#pin").addEventListener("keydown", e => { if (e.key === "Enter") tryEnter(); });
function tryEnter(){
  const v = $("#pin").value.trim();
  if (v === "2025"){ $("#gate").style.display = "none"; }
  else { $("#pinerr").textContent = "PIN incorrecto. Prueba con 2025 (demo)."; }
}

/* ---------- Precios (pills en el hero) ---------- */
function renderPills(){
  const parts = [`<div class="pill">Foto individual <b>${money(EVENT.unit)}</b></div>`];
  EVENT.packages.forEach(p=>{
    const lbl = p.label || `Paquete ${p.qty} fotos`;
    parts.push(`<div class="pill">${lbl} <b>${money(p.price)}</b></div>`);
  });
  $("#pricepills").innerHTML = parts.join("");
}

/* ---------- Galería ---------- */
function renderGallery(){
  $("#gallery").innerHTML = EVENT.photos.map((p,i)=>`
    <div class="cell" data-i="${i}" data-id="${p.id}">
      <img src="${p.thumb}" loading="lazy" alt="${p.code}">
      <span class="code">${p.code}</span>
      <span class="pick">${selected.has(p.id)?"✓":""}</span>
    </div>`).join("");
  document.querySelectorAll(".cell").forEach(c=>{
    const i = +c.dataset.i;
    c.querySelector(".pick").addEventListener("click", e=>{ e.stopPropagation(); toggle(EVENT.photos[i].id); });
    c.addEventListener("click", ()=> openLb(i));
  });
  syncCells();
}
function syncCells(){
  document.querySelectorAll(".cell").forEach(c=>{
    const on = selected.has(c.dataset.id);
    c.classList.toggle("sel", on);
    c.querySelector(".pick").textContent = on ? "✓" : "";
  });
}

/* ---------- Selección ---------- */
function toggle(id){
  if (selected.has(id)) selected.delete(id); else selected.add(id);
  syncCells(); renderCart(); updateLbBtn();
}

/* ---------- Precio con mejor paquete ---------- */
function priceFor(qty){
  // subtotal por unidad
  const sub = qty * EVENT.unit;
  // busca el mejor precio combinando paquetes (simple: mejor paquete que cubra <=qty, resto individual)
  let best = sub, applied = null;
  EVENT.packages.slice().sort((a,b)=>b.qty-a.qty).forEach(pk=>{
    if (qty >= pk.qty){
      const rest = qty - pk.qty;
      const total = pk.price + rest * EVENT.unit;
      if (total < best){ best = total; applied = pk; }
    }
  });
  return { sub, total: best, discount: sub - best, applied };
}

/* ---------- Carrito ---------- */
function renderCart(){
  const ids = [...selected];
  $("#count").textContent = ids.length;
  $("#qty").textContent = ids.length;

  // paquetes disponibles
  $("#pkgs").innerHTML = EVENT.packages.map(p=>{
    const lbl = p.label || `Paquete ${p.qty} fotos`;
    return `<div class="pkg"><div>${lbl}<small>${p.qty} fotos por ${money(p.price)}</small></div><b>${money(p.price)}</b></div>`;
  }).join("");

  if (ids.length === 0){
    $("#items").innerHTML = `<div class="empty">Aún no has seleccionado fotos.<br>Toca el círculo de una foto para agregarla.</div>`;
  } else {
    $("#items").innerHTML = ids.map(id=>{
      const p = EVENT.photos.find(x=>x.id===id);
      return `<div class="li"><img src="${p.thumb}"><div>${p.code}<br><small style="color:var(--muted)">${money(EVENT.unit)}</small></div><button class="rm" data-id="${id}">Quitar</button></div>`;
    }).join("");
    document.querySelectorAll(".rm").forEach(b=> b.addEventListener("click",()=>toggle(b.dataset.id)));
  }

  const pr = priceFor(ids.length);
  $("#subtotal").textContent = money(pr.sub);
  $("#total").textContent = money(pr.total);
  if (pr.discount > 0.001){
    $("#discRow").style.display = "flex";
    $("#discLabel").textContent = pr.applied ? (pr.applied.label || `Paquete ${pr.applied.qty} fotos`) : "Descuento";
    $("#discVal").textContent = "- " + money(pr.discount);
  } else {
    $("#discRow").style.display = "none";
  }
}

/* ---------- Drawer ---------- */
function openCart(){ $("#drawer").classList.add("open"); $("#ov").classList.add("open"); }
function closeCart(){ $("#drawer").classList.remove("open"); $("#ov").classList.remove("open"); }
$("#openCart").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#ov").addEventListener("click", closeCart);

/* ---------- Lightbox ---------- */
function openLb(i){
  lbIndex = i;
  const p = EVENT.photos[i];
  $("#lbImg").src = p.full;
  $("#lbCode").textContent = p.code;
  updateLbBtn();
  $("#lb").classList.add("open");
}
function updateLbBtn(){
  const p = EVENT.photos[lbIndex];
  const on = selected.has(p.id);
  const b = $("#lbBuy");
  b.textContent = on ? "Quitar de mi selección" : "Agregar a mi selección";
  b.classList.toggle("on", on);
}
$("#lbBuy").addEventListener("click", ()=> toggle(EVENT.photos[lbIndex].id));
$("#lbClose").addEventListener("click", ()=> $("#lb").classList.remove("open"));
$("#lbPrev").addEventListener("click", ()=> openLb((lbIndex-1+EVENT.photos.length)%EVENT.photos.length));
$("#lbNext").addEventListener("click", ()=> openLb((lbIndex+1)%EVENT.photos.length));
document.addEventListener("keydown", e=>{
  if(!$("#lb").classList.contains("open")) return;
  if(e.key==="Escape") $("#lb").classList.remove("open");
  if(e.key==="ArrowLeft") $("#lbPrev").click();
  if(e.key==="ArrowRight") $("#lbNext").click();
});

/* ---------- Checkout Yape (aprobación manual) ---------- */
$("#checkout").addEventListener("click", ()=>{
  if(selected.size===0){ openCart(); return; }
  const pr = priceFor(selected.size);
  const ref = "FE-" + (1000 + Math.floor((selected.size*7+EVENT.unit)) ) + "-25";
  $("#modalBody").innerHTML = `
    <span class="badge">Pago con Yape</span>
    <h3>Confirma tu compra</h3>
    <div class="yapehead"><div class="yl">Yape</div>
      <div><div style="font-weight:800">${money(pr.total)}</div>
      <div style="font-size:12px;opacity:.85">${selected.size} foto(s) · Ref. ${ref}</div></div></div>
    <ol class="steps">
      <li>Abre tu app <b>Yape</b> y envía <b>${money(pr.total)}</b> al número del estudio (se muestra aquí en el sistema real).</li>
      <li>Coloca el código <b>${ref}</b> en el mensaje del Yapeo.</li>
      <li>Sube la captura o ingresa el código de operación aquí abajo.</li>
      <li>El fotógrafo <b>aprueba el pago</b> desde su panel y se habilita la descarga de tus fotos en alta, sin marca de agua.</li>
    </ol>
    <div class="upl" id="upl">📎 Toca para subir tu captura de Yape (demo)</div>
    <input id="opcode" placeholder="Código de operación (opcional)" style="width:100%;margin-top:10px;background:var(--panel2);border:1px solid var(--line);color:var(--txt);border-radius:10px;padding:12px">
    <div class="mfoot">
      <button class="gh" id="cancelPay">Cancelar</button>
      <button class="gp" id="confirmPay">Enviar comprobante</button>
    </div>
    <div class="note">Nota: en esta demo no se cobra nada. Así se verá el flujo real: el cliente envía el comprobante y tú lo apruebas manualmente desde el panel. El sistema queda preparado para la API automática de Yape en el futuro.</div>`;
  $("#modal").classList.add("open");
  $("#upl").addEventListener("click", ()=> $("#upl").textContent = "✓ captura_yape.jpg adjuntada (demo)");
  $("#cancelPay").addEventListener("click", closeModal);
  $("#confirmPay").addEventListener("click", ()=> showPending(ref));
});
function closeModal(){ $("#modal").classList.remove("open"); }
function showPending(ref){
  $("#modalBody").innerHTML = `
    <div class="ok">
      <div class="ring">✓</div>
      <h3>Comprobante enviado</h3>
      <p style="color:var(--muted);font-size:14px;line-height:1.55">Tu pedido <b>${ref}</b> quedó <b>pendiente de aprobación</b>.
      Cuando el fotógrafo confirme el Yapeo desde su panel, recibirás el enlace para descargar tus fotos en alta resolución, sin marca de agua.</p>
      <button class="gp" style="width:100%;border:none;border-radius:10px;padding:13px;font-weight:800;cursor:pointer" id="doneBtn">Entendido</button>
      <div class="note">En el panel de administración tú verías este pedido en estado “Por aprobar”, con la captura adjunta y el botón <b>Aprobar y liberar descarga</b>.</div>
    </div>`;
  $("#doneBtn").addEventListener("click", ()=>{ closeModal(); closeCart(); });
}

/* ---------- init ---------- */
renderPills(); renderGallery(); renderCart();
