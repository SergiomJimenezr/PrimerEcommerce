const IVA = 0.21;

const productos = [
    { id: 1, nombre: "Zapatillas", precio: 25000 },
    { id: 2, nombre: "Campera", precio: 42000 },
    { id: 3, nombre: "Gorra", precio: 8000 }
];

let carrito = [];


function mostrarProductos() {
    console.log("Productos disponibles:");
    productos.forEach(p => {
        console.log(`${p.id}. ${p.nombre} - $${p.precio}`);
    });
}


function agregarAlCarrito() {
    let seguir = true;
    while (seguir) {
        const id = parseInt(prompt("Ingrese el ID del producto:"));
        const producto = productos.find(p => p.id === id);
        if (producto) {
            carrito.push(producto);
            alert(`${producto.nombre} agregado`);
        } else {
            alert("Producto no válido");
        }
        seguir = confirm("¿Agregar otro producto?");
    }
}


function mostrarResumenSinIVA() {
    let total = carrito.reduce((acc, p) => acc + p.precio, 0);
    alert("Total a pagar: $" + total);
}


function mostrarResumenConIVAyDescuento() {
    let totalSinIVA = carrito.reduce((acc, p) => acc + p.precio, 0);
    let totalConIVA = totalSinIVA * (1 + IVA);
    let resumen = `Total sin IVA: $${totalSinIVA}\nTotal con IVA: $${totalConIVA.toFixed(2)}`;

    const codigo = prompt("¿Tenés un código de descuento?");
    if (codigo && codigo.toLowerCase() === "di.ego") {
        const descuento = totalConIVA * 0.10;
        totalConIVA -= descuento;
        resumen += `\n\n🎉 Código válido: -$${descuento.toFixed(2)}\nTotal con descuento: $${totalConIVA.toFixed(2)}`;
    } else if (codigo) {
        resumen += `\n\n⚠️ Código inválido`;
    }

    alert(resumen);
    console.log(resumen);
}

function iniciarSimulador() {
mostrarProductos();
agregarAlCarrito();
mostrarResumenSinIVA();
mostrarResumenConIVAyDescuento();
}