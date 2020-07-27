const router = require("express").Router();

const calculatorRoutes = require("./calculator");

var express = require("express");
var app = express.Router();

//ROUTES GO HERE

//Calculator Routes
app.use("/calculator", calculatorRoutes);


module.exports = app;
