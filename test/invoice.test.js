'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function item(name, price, qty, hsn, gstRate) {
  return { name, sku: name, price, qty, hsn, gstRate };
}

function characterize(name, items, coupon, expectedInvoice, expectedCheckout) {
  test(name, function () {
    const order = { items, coupon };
    const figures = invoice.computeInvoiceFigures(order);
    const checkout = pricing.computeTotals(items, coupon);

    assert.deepEqual(figures, expectedInvoice);
    assert.deepEqual(
      {
        subtotal: checkout.subtotal,
        discount: checkout.discount,
        tax: checkout.tax,
        cgst: checkout.cgst,
        sgst: checkout.sgst,
        total: checkout.total
      },
      expectedCheckout
    );
  });
}

characterize(
  'CURRENT BEHAVIOUR: order #1001 invoice uses the supplied 18% and 5% GST rates',
  [
    item('Assam CTC Masala Chai 250g', 140, 2, '0902', 18),
    item('Unpolished Toor Dal 1kg', 165, 2, '0713', 5)
  ],
  '',
  {
    subtotal: 610,
    discount: 0,
    tax: 66.9,
    cgst: 33.45,
    sgst: 33.45,
    total: 676.9,
    rows: [
      { name: 'Assam CTC Masala Chai 250g', sku: 'Assam CTC Masala Chai 250g', hsn: '0902', qty: 2, price: 140, gstPercent: 18, line: 280, lineTax: 50.4 },
      { name: 'Unpolished Toor Dal 1kg', sku: 'Unpolished Toor Dal 1kg', hsn: '0713', qty: 2, price: 165, gstPercent: 5, line: 330, lineTax: 16.5 }
    ]
  },
  { subtotal: 610, discount: 0, tax: 66.9, cgst: 33.45, sgst: 33.45, total: 676.9 }
);

characterize(
  'CURRENT BEHAVIOUR: order #1002 SAVE10 discounts subtotal before GST',
  [
    item('Indrayani Basmati Rice 5kg', 640, 1, '1006', 5),
    item('Cold-Pressed Sunflower Oil 1L', 190, 2, '1512', 5)
  ],
  'SAVE10',
  {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9,
    rows: [
      { name: 'Indrayani Basmati Rice 5kg', sku: 'Indrayani Basmati Rice 5kg', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 },
      { name: 'Cold-Pressed Sunflower Oil 1L', sku: 'Cold-Pressed Sunflower Oil 1L', hsn: '1512', qty: 2, price: 190, gstPercent: 5, line: 380, lineTax: 17.1 }
    ]
  },
  { subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9 }
);

characterize(
  'CURRENT BEHAVIOUR: order #1004 SAVE10 honors the checkout discount cap before GST',
  [item('Cold-Pressed Groundnut Oil 5L', 1120, 2, '1508', 5)],
  'SAVE10',
  {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [
      { name: 'Cold-Pressed Groundnut Oil 5L', sku: 'Cold-Pressed Groundnut Oil 5L', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
    ]
  },
  { subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5 }
);

characterize(
  'CURRENT BEHAVIOUR: order #1008 no-coupon 18% GST invoice matches checkout',
  [
    item('Assam CTC Masala Chai 250g', 140, 1, '0902', 18),
    item('Kokum Sherbet Concentrate 750ml', 180, 2, '2106', 18)
  ],
  '',
  {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    rows: [
      { name: 'Assam CTC Masala Chai 250g', sku: 'Assam CTC Masala Chai 250g', hsn: '0902', qty: 1, price: 140, gstPercent: 18, line: 140, lineTax: 25.2 },
      { name: 'Kokum Sherbet Concentrate 750ml', sku: 'Kokum Sherbet Concentrate 750ml', hsn: '2106', qty: 2, price: 180, gstPercent: 18, line: 360, lineTax: 64.8 }
    ]
  },
  { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590 }
);

test('INVOICE FIX: order #1004 matches checkout HSN GST and capped pre-tax coupon', function () {
  const items = [item('Cold-Pressed Groundnut Oil 5L', 1120, 2, '1508', undefined)];
  const figures = invoice.computeInvoiceFigures({ items, coupon: 'SAVE10' });
  const checkout = pricing.computeTotals(items, 'SAVE10');

  assert.deepEqual(figures, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [
      {
        name: 'Cold-Pressed Groundnut Oil 5L',
        sku: 'Cold-Pressed Groundnut Oil 5L',
        hsn: '1508',
        qty: 2,
        price: 1120,
        gstPercent: 5,
        line: 2240,
        lineTax: 104.5
      }
    ]
  });
  assert.equal(figures.subtotal, checkout.subtotal);
  assert.equal(figures.discount, checkout.discount);
  assert.equal(figures.tax, checkout.tax);
  assert.equal(figures.total, checkout.total);
});
