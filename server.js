const app = require("./src/app");
const PORT = process.env.PORT || 3052;

const server = app.listen(PORT, () => {
    console.log(`******* Server running on port http://localhost:${PORT} *******`);
    console.log(`******* Swagger running on::: http://localhost:${PORT}/docs *******`);
});

//# CRT + C -> server đóng
process.on('SIGINT', () => {
    server.close(() => { console.log('******* Server Exit *******'); });
});