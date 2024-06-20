function compreAgora(produto) {
    const url = `compra.html?produto=${encodeURIComponent(produto)}`;
    window.location.href = url;
}
