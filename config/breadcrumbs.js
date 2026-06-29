module.exports.trail = function trail(items) {
  return [{ label: "Dashboard", href: "/" }, ...items];
};
module.exports.label = function label(text) {
  return { breadcrumbLabel: text };
};
