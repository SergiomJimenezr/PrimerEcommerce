const IVA = 0.21;

function withFallback(src) {
    return src || "img/placeholder.jpg";
}

const productos = [
{
    id: 1,
    nombre: "Shorts de lino",
    precioSinIVA: 18000,
    precioConIVA: (18000 * (1 + IVA)).toFixed(2),
    img: "img/ShortLinoAzul.jpeg",
},
{
    id: 2,
    nombre: "Shorts de algodón",
    precioSinIVA: 15000,
    precioConIVA: (15000 * (1 + IVA)).toFixed(2),
    img: "img/ShortAlgodonGris.jpeg",
},
{
    id: 3,
    nombre: "Camisas de lino",
    precioSinIVA: 25000,
    precioConIVA: (25000 * (1 + IVA)).toFixed(2),
    img: "img/CamisaLino1.jpeg",
},
{
    id: 4,
    nombre: "Remeras de algodón",
    precioSinIVA: 12000,
    precioConIVA: (12000 * (1 + IVA)).toFixed(2),
    img: "img/Remera2.jpeg",
},
{
    id: 5,
    nombre: "Joggin de algodón",
    precioSinIVA: 22000,
    precioConIVA: (22000 * (1 + IVA)).toFixed(2),
    img: "img/Jogging.jpeg",
},
{
    id: 6,
    nombre: "Remera Básica",              // 👈 cambiado
    precioSinIVA: 28000,
    precioConIVA: (28000 * (1 + IVA)).toFixed(2),
    img: "img/RemeraBeige.jpeg",          // 👈 usa tu archivo real
},
{
    id: 7,
    nombre: "Conjunto Campera y Joggin algodón",
    precioSinIVA: 48000,
    precioConIVA: (48000 * (1 + IVA)).toFixed(2),
    img: "img/ConjuntoJogging.jpeg",
    },
];

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function mostrarCatalogo() {
    const contenedor = document.getElementById("catalogo");
    contenedor.innerHTML = "";

    productos.forEach((p) => {
    const div = document.createElement("div");
    div.classList.add("producto");

    div.innerHTML = `
        <img src="${p.img}" alt="${p.nombre}" class="producto-img"
            onclick="abrirModal(${p.id})"
            onerror="this.onerror=null;this.src='img/placeholder.jpg';">
        <h3>${p.nombre}</h3>
        <p>Sin IVA: $${p.precioSinIVA}</p>
        <p>Con IVA: $${p.precioConIVA}</p>
        <button onclick="abrirModal(${p.id})">Ver más</button>
        <button onclick="agregarAlCarrito(${p.id}, '')">Agregar</button>
    `;

    contenedor.appendChild(div);
    });
}

function agregarAlCarrito(id, talle) {
    const producto = productos.find((p) => p.id === id);
    const productoConTalle = { ...producto, talle };
    carrito.push(productoConTalle);
    guardarCarrito();
    mostrarCarrito();
    mostrarMensaje(`✅ ${producto.nombre}${talle ? " (Talle " + talle + ")" : ""} agregado al carrito`);

    const contador = document.getElementById("contadorCarrito");
    contador.classList.add("parpadeo");
    setTimeout(() => contador.classList.remove("parpadeo"), 800);
}

function mostrarCarrito() {
    const lista = document.getElementById("carrito");
    lista.innerHTML = "";
    carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${item.nombre} ${item.talle ? "(Talle " + item.talle + ")" : ""} - $${item.precioConIVA}`;
    const btn = document.createElement("button");
    btn.textContent = "❌";
    btn.onclick = () => eliminarDelCarrito(index);
    li.appendChild(btn);
    lista.appendChild(li);
});
    calcularTotal();
    actualizarContador();
}


function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    mostrarCarrito();
}

function calcularTotal() {
    const total = carrito.reduce((acc, p) => acc + parseFloat(p.precioConIVA), 0);
    document.getElementById("total").textContent = `Total: $${total.toFixed(2)}`;
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function actualizarContador() {
    document.getElementById("contadorCarrito").textContent = carrito.length;
}

document.getElementById("vaciarCarrito").addEventListener("click", () => {
    carrito = [];
    guardarCarrito();
    mostrarCarrito();
});

document.getElementById("aplicarDescuento").addEventListener("click", () => {
    const codigo = document.getElementById("codigoDescuento").value.trim().toLowerCase();
    if (codigo === "di.ego") {
    let total = carrito.reduce((acc, p) => acc + parseFloat(p.precioConIVA), 0);
    const descuento = total * 0.1;
    const totalFinal = total - descuento;
    document.getElementById("total").textContent = `Total con descuento: $${totalFinal.toFixed(2)}`;
    mostrarMensaje(`🎉 Descuento aplicado: -$${descuento.toFixed(2)}`);
    } else {
    mostrarMensaje("⚠️ Código inválido");
    }
});

function mostrarMensaje(texto) {
    const mensaje = document.getElementById("mensaje");
    mensaje.textContent = texto;
    setTimeout(() => (mensaje.textContent = ""), 3000);
}

function abrirModal(id) {
    const p = productos.find((x) => x.id === id);
    const imgEl = document.getElementById("modalImg");
    imgEl.src = withFallback(p.img);
    imgEl.onerror = function () {
    this.onerror = null;
    this.src = "img/placeholder.jpg";
};

    document.getElementById("modalNombre").textContent = p.nombre;
    document.getElementById("modalPrecio").textContent = `Precio con IVA: $${p.precioConIVA}`;

    const select = document.getElementById("modalTalle");
    select.value = "";

    document.getElementById("modalAgregar").onclick = () => {
    const talle = select.value;
    if (!talle) {
        mostrarMensaje("⚠️ Selecciona un talle antes de agregar");
        return;
    }
    agregarAlCarrito(p.id, talle);
    cerrarModal();
    };

    document.getElementById("modal").style.display = "block";
}

function cerrarModal() {
    document.getElementById("modal").style.display = "none";
}
document.getElementById("cerrarModal").addEventListener("click", cerrarModal);

mostrarCatalogo();
mostrarCarrito();