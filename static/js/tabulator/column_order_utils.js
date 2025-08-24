// static/js/tabulator/order_utils.js
export function resolveColumnsOrder(json, sample) {
  return Array.isArray(json.columns_order) && json.columns_order.length
    ? json.columns_order
    : Object.keys(sample);
}
