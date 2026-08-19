let app;
module.exports = async (req, res) => {
  if (!app) {
    const backend = await import('../backend/server.js');
    app = backend.default;
  }
  return app(req, res);
};
