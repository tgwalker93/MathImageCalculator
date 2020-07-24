import React, { Component } from "react";
import { Col, Row, Container } from "../../components/Grid";
import { Input, Button } from "../../components/Form";
import API from "../../utils/API";
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";
import axios from 'axios';
import { withRouter } from 'react-router';
// import "bootstrap/dist/css/bootstrap.min.css";

class CalculatorPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            // Initially, no file is selected 
            selectedFile: null
        };
    }

    // On file select (from the pop up) 
    onFileChange = event => {

        // Update the state 
        this.setState({ selectedFile: event.target.files[0] });

    }; 

    // On file upload (click the upload button) 
    onFileUpload = () => {

        // Create an object of formData 
        const formData = new FormData();

        // Update the formData object 
        formData.append(
            "myFile",
            this.state.selectedFile,
            this.state.selectedFile.name
        );

        // Details of the uploaded file 
        console.log(this.state.selectedFile);

        // Request made to the backend api 
        // Send formData object 
        //axios.post("api/uploadfile", formData);

        var postObj = {
            src: "https://i.ytimg.com/vi/8hYSgKH2Mvs/maxresdefault.jpg"
        }

        var localHeaders = {
            "content-type": "application/json",
            "app_id": "tgwalker93_gmail_com_cc0d50",
            "app_key": "72c390b89e11c4263505"
        }

        axios.post('https://api.mathpix.com/v3/text', postObj, {
            headers: localHeaders
        })
            .then(function (response) {
                console.log("Post successful");
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });


    }; 

    // File content to be displayed after 
    // file upload is complete 
    fileData = () => {

        if (this.state.selectedFile) {

            return (
                <div>
                    <h2>File Details:</h2>
                    <p>File Name: {this.state.selectedFile.name}</p>
                    <p>File Type: {this.state.selectedFile.type}</p>
                    <p>
                        Last Modified:{" "}
                        {this.state.selectedFile.lastModifiedDate.toDateString()}
                    </p>
                </div>
            );
        } else {
            return (
                <div>
                    <br />
                    <h4>Choose before Pressing the Upload button</h4>
                </div>
            );
        }
    };


    componentDidMount() {


    }

    //Standard method for constantly updating input, since UI is constantly refreshing
    handleChange(e) {
        this.setState({ [e.target.id]: e.target.value });
    }

    render() {
        return (
            <Container id="calculatorContainer" fluid="true">
                <Row id="mainRow">
                    <Col size="sm-12">
                        
                        <div>
                            <h1>
                                GeeksforGeeks
                            </h1>
                            <h3>
                                File Upload using React!
                            </h3>
                            <div>
                                <input type="file" onChange={this.onFileChange} />
                                <button onClick={this.onFileUpload}>
                                    Upload!
                                 </button>
                            </div>
                            {this.fileData()}
                        </div>

                    </Col>
                </Row>

            </Container>
        );


    }
}

// export default Profile;
export default withRouter(CalculatorPage);