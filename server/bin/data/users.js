const bcrypt = require("bcrypt");
const config = require("../../src/config");

const addYear = (date, yearAmount) => {
  return new Date(date.setFullYear(new Date().getFullYear() + yearAmount));
};

const addMonth = (date, monthAmount) => {
  return new Date(date.setMonth(new Date().getMonth() + monthAmount));
};

const addDay = (date, dayAmount) => {
  return new Date(date.setDate(new Date().getDate() + dayAmount));
};

exports.users = [
  {
    "email": "jean@gmail.com",
    name: "jean",
    password: bcrypt.hashSync("Foobarbaz123@", config.auth.SALT),
    role: "superadmin",
    verified: true,
    expiresAt: addYear(new Date(), 1),
  },
  {
    "email": "marie@gmail.com",
    name: "marie",
    password: bcrypt.hashSync("Foobarbaz123@", config.auth.SALT),
    role: "editor",
    verified: true,
    expiresAt: addMonth(new Date(), 3),
  },
  {
    "email": "joao@gmail.com",
    name: "joao",
    password: bcrypt.hashSync("Foobarbaz123@", config.auth.SALT),
    role: "editor",
    verified: true,
    expiresAt: addDay(new Date(), 9),
  },
  {
    "email": "maria@gmail.com",
    name: "maria",
    password: bcrypt.hashSync("Foobarbaz123@", config.auth.SALT),
    role: "admin",
    verified: true,
    expiresAt: null,
  },
];
