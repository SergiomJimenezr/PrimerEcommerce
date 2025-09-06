const IVA = 0.21;
const CODIGO_DESCUENTO = "di.ego";

let catalogo = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let envio = 0;
let descuento = 0;

const toast = (text, bg="#222") => Toastify({ text, duration: 2000, gravity: "top", position: "right", backgroundColor: bg }).showToast();

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const money = (n) => n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function cargarProductos() {
    try {
    const res = await fetch("data/productos.json");
    if (!res.ok) throw new Error("No se pudo cargar productos");
    catalogo = await res.json();
    renderCatalogo();
} catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudo cargar el catálogo. Verifica data/productos.json", "error");
    }
}

function renderCatalogo() {
    const grid = $("#gridProductos");
    grid.innerHTML = "";

catalogo.forEach(p => {
    const precioConIVA = p.precioSinIVA * (1 + IVA);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
    <img src="${p.img}" alt="${p.nombre}" onclick="abrirModal(${p.id})" onerror="this.onerror=null;this.src='img/placeholder.jpg'">
    <h3>${p.nombre}</h3>
    <p>Sin IVA: $${money(p.precioSinIVA)}</p>
    <p>Con IVA: $${money(precioConIVA)}</p>
    <div class="acciones">
        <button onclick="abrirModal(${p.id})">Ver más</button>
        <button onclick="agregarAlCarrito(${p.id}, 'M', 1)">Agregar</button>
    </div>
    `;
    grid.appendChild(card);
});
}

function abrirModal(id) {
const p = catalogo.find(x => x.id === id);
if (!p) return;

$("#modalImg").src = p.img;
$("#modalImg").onerror = function(){ this.onerror=null; this.src="img/placeholder.jpg"; }
$("#modalNombre").textContent = p.nombre;
$("#modalPrecio").textContent = `Precio con IVA: $${money(p.precioSinIVA * (1 + IVA))}`;
$("#modalTalle").value = "";
$("#modalCantidad").value = 1;

$("#modalAgregar").onclick = () => {
    const talle = $("#modalTalle").value;
    const cant = parseInt($("#modalCantidad").value) || 1;
    if (!talle) {
    toast("Elegí un talle", "#ff5252");
    return;
    }
    agregarAlCarrito(id, talle, cant);
    cerrarModal();
};

    $("#modal").style.display = "block";
}
function cerrarModal(){ $("#modal").style.display = "none"; }
$("#cerrarModal").addEventListener("click", cerrarModal);

function agregarAlCarrito(id, talle = "", cantidad = 1) {
const p = catalogo.find(x => x.id === id);
if (!p) return;

const idx = carrito.findIndex(item => item.id === id && item.talle === talle);
if (idx >= 0) {
    carrito[idx].cantidad += cantidad;
} else {
    carrito.push({
        id: p.id,
        nombre: p.nombre,
        precioSinIVA: p.precioSinIVA,
        img: p.img,
        talle,
        cantidad
    });
}
guardarCarrito();
renderCarrito();
parpadeoContador();
toast("Agregado al carrito");
}

function renderCarrito() {
const ul = $("#listaCarrito");
ul.innerHTML = "";
carrito.forEach((item, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
    <span>${item.nombre} ${item.talle ? `(Talle ${item.talle})` : ""} × ${item.cantidad}</span>
    <div>
        <button onclick="cambiarCantidad(${i}, -1)">−</button>
        <button onclick="cambiarCantidad(${i}, 1)">+</button>
        <button class="peligro" onclick="eliminarDelCarrito(${i})">❌</button>
    </div>
    `;
    ul.appendChild(li);
});
actualizarTotales();
actualizarContador();
}

function cambiarCantidad(index, delta) {
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
    guardarCarrito(); renderCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito(); renderCarrito();
}

function actualizarTotales() {
const subtotalSinIVA = carrito.reduce((acc, it) => acc + it.precioSinIVA * it.cantidad, 0);
const iva = subtotalSinIVA * IVA;
const totalSinEnvio = subtotalSinIVA + iva;
const total = Math.max(totalSinEnvio + envio - descuento, 0);

$("#subtotal").textContent = `Subtotal: $${money(subtotalSinIVA)}`;
$("#iva").textContent = `IVA (21%): $${money(iva)}`;
$("#envio").textContent = `Envío: $${money(envio)}`;
$("#descuento").textContent = `Descuento: $${money(descuento)}`;
$("#total").textContent = `Total: $${money(total)}`;
}

function actualizarContador(){ $("#contadorCarrito").textContent = carrito.reduce((a,i)=>a+i.cantidad,0); }
function parpadeoContador(){
    const c = $("#contadorCarrito");
    c.classList.add("parpadeo");
    setTimeout(()=>c.classList.remove("parpadeo"), 800);
}

function guardarCarrito(){ localStorage.setItem("carrito", JSON.stringify(carrito)); }

$("#vaciarCarrito").addEventListener("click", async () => {
const ok = await Swal.fire({ title:"Vaciar carrito", text:"¿Seguro que querés vaciarlo?", icon:"warning", showCancelButton:true, confirmButtonText:"Sí, vaciar" });
if (ok.isConfirmed){
    carrito = []; guardarCarrito(); renderCarrito(); toast("Carrito vaciado","#ff5252");
    }
});


$("#aplicarDescuento").addEventListener("click", () => {
const input = $("#codigoDescuento").value.trim().toLowerCase();
const subtotalSinIVA = carrito.reduce((acc, it) => acc + it.precioSinIVA * it.cantidad, 0);
const iva = subtotalSinIVA * IVA;
const base = subtotalSinIVA + iva + envio;

if (input === CODIGO_DESCUENTO) {
    descuento = base * 0.10;
    toast("Descuento aplicado ✓", "#1abc9c");
} else {
    descuento = 0;
    toast("Código inválido", "#ff5252");
}
actualizarTotales();
});

// Envío
$("#metodoEnvio").addEventListener("change", (e) => {
    envio = Number(e.target.value) || 0;
    actualizarTotales();
});

function precargarFormulario(){
    $("#nombre").value = "Diego";
    $("#apellido").value = "Pérez";
    $("#email").value = "diego@example.com";
    $("#telefono").value = "1155555555";
    $("#direccion").value = "Av. Siempre Viva 742";
    $("#ciudad").value = "CABA";
    $("#provincia").value = "Buenos Aires";
    $("#cp").value = "1001";
}
precargarFormulario();

$("#formCheckout").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (carrito.length === 0) {
    toast("Tu carrito está vacío", "#ff5252");
    return;
}

    const reqIds = ["nombre","apellido","email","telefono","direccion","ciudad","provincia","cp"];
    for (const id of reqIds){
    const el = $("#"+id);
    if (!el.value.trim()){
        el.focus();
        toast("Completá: "+id, "#ff5252");
        return;
    }
}

const orderId = "DIEGO-" + Math.floor(Math.random()*1e8).toString(16).toUpperCase();
await Swal.fire({
    title: "¡Compra confirmada!",
    html: `Tu número de orden es <b>${orderId}</b>.<br>Te enviamos el detalle al email.`,
    icon: "success",
    confirmButtonText: "Aceptar"
});

    carrito = []; guardarCarrito(); renderCarrito();
    $("#formCheckout").reset();
    precargarFormulario();
    $("#codigoDescuento").value = "";
    descuento = 0; envio = 0; $("#metodoEnvio").value = "0";
    actualizarTotales();
});


cargarProductos().then(() => {
    renderCarrito();
});