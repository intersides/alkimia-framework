import ElementState from '../ElementState.js';

const Attr = ElementState.Attr;
const UNIT_PRICE = 9.99;

const $quantity = document.getElementById('quantity');
const $badge    = document.getElementById('badge');
const $total    = document.getElementById('total');
const $checkout = document.getElementById('checkout');
const $add      = document.getElementById('add');
const $remove   = document.getElementById('remove');

const [count, setCount] = ElementState([
    { el: $quantity, attrs: [{ name: Attr.TEXT }] },
    { el: $badge,    attrs: [
        { name: Attr.TEXT },
        { name: Attr.HIDDEN, transform: function(v) { return v === 0; } }
    ]},
    { el: $total,    attrs: [
        { name: Attr.TEXT, transform: function(v) { return '€' + (v * UNIT_PRICE).toFixed(2); } }
    ]},
    { el: $checkout, attrs: [
        { name: Attr.DISABLED, transform: function(v) { return v === 0; } }
    ]}
]);

setCount(0);

$add.addEventListener('click', function() {
    setCount(count.value + 1);
});

$remove.addEventListener('click', function() {
    if (count.value > 0) {
        setCount(count.value - 1);
    }
});

$checkout.addEventListener('click', function() {
    alert('Checkout: ' + count.value + ' items — ' + $total.textContent);
});
