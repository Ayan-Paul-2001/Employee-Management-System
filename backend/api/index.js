const compiled = require('../dist/vercel');

module.exports = async (req, res) => {
  const handler = compiled.default || compiled;
  return handler(req, res);
};
