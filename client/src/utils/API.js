import axios from "axios";

export default {

    // user: function () {
    //     return axios.get("/api/user");
    // },
    // sendForgotPasswordEmail(userObj) {
    //     return axios.post("/api/user/sendForgotPasswordEmail", userObj);
    // },

    calculateImageLabel(imageData) {
        return axios.post("/api/calculator/labelImage", imageData);
     },

};