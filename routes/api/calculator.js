var path = require('path');
var request = require("request");
const axios = require('axios');
var express = require("express");
var app = express.Router();



app.post("/labelImage", function (req, res) {
    var imageBase64 = req.body.imageBase64;
    const apiKey = 'AIzaSyCbyM9nKuA3oBUAnQtiqxYvOCrFWwssSZs';
    const query = 'https://vision.googleapis.com/v1/images:annotate?key=' + apiKey;

    var localHeaders = {
        "Content-Type": "application/json"
    }
    var postObj = {
        "requests": [
            {
                "image": {
                    "content": imageBase64
                },
                "features": [
                    {
                        "type": "LABEL_DETECTION",
                        "maxResults": 1
                    }
                ]
            }
        ]
    }


    axios.post(query, postObj, {
        headers: localHeaders
    })
        .then((response) => {
            console.log("Post successful");
            res.json(response.data)
        })
        .catch(function (error) {
            console.log(error);
        });


})


module.exports = app;