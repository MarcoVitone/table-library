module.exports = new Proxy({}, {
  get(_target, name) {
    if (name === '__esModule') return true;
    const icon = require('@mui/icons-material/' + name);
    return icon.default || icon;
  },
});
