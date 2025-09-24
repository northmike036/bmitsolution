/** @type {import("prettier").Config} */
module.exports = {
  plugins: [
    "prettier-plugin-prisma",
    "prettier-plugin-tailwindcss", // ⚠️ must be LAST
  ],
};