import React, { Component } from "react";
import { Col, Row, Container } from "../../components/Grid";
import { Input, Button, TextArea } from "../../components/Form";
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
            selectedFile: null,
            selectedFileBase64: "",
            result: "",
            lastAPIChoice: "",
            wolframXMLData: "",
            wolframSubPods: [],
            wolframInputFromMathPixReturn: "",
            choiceMade: false,
            uploadButtonClicked: false,
            callWolframAlphaAPIComplete: false,
            WolframAlphaInputText: "",
            searchButtonClicked: false
        };

    }

    // On file selected (from the pop up of the file explorer) 
    onFileChange = event => {

        // Update the state 
        this.setState({ selectedFile: event.target.files[0] });

    }; 

    buttonClicked = (nameOfButtonClicked) => {
        this.setState({
            lastAPIChoice: nameOfButtonClicked,
            choiceMade: true
        }, () => {

               // this.renderChoice();

            });

    }

    // On file upload (click the upload button) 
    onFileUpload = (nameOfButtonClicked) => {

        if(!this.state.selectedFile){
            return;
        }

        // Create an object of formData 
        const formData = new FormData();

        // Update the formData object 
        formData.append(
            "myFile",
            this.state.selectedFile,
            this.state.selectedFile.name

        );

        var localSelectedFileBase64;

        // Details of the uploaded file 
        this.getBase64(this.state.selectedFile, (result) => {
            localSelectedFileBase64 = result;

            if (localSelectedFileBase64.includes("base64") && nameOfButtonClicked === "GoogleVision"){
                console.log("found base64");
                localSelectedFileBase64 = result.substring(result.indexOf(",") + 1);
            }

            this.setState({
                selectedFileBase64: localSelectedFileBase64,
                lastAPIChoice: nameOfButtonClicked,
                uploadButtonClicked: true
            }, () => {
                if(nameOfButtonClicked === "MathPix") {
                    this.callMathPixAPI();
                }
                else if (nameOfButtonClicked === "GoogleVision") {
                    this.callGoogleVisionAPI();
                } 
                else if (nameOfButtonClicked === "WolframAlphaImage"){
                    this.callMathPixAPI();
                }
            });

        });

    }; 
    callWolframAlphaAPIWithTextInput() {

        this.setState({
            searchButtonClicked: true
        })

        var wolframAPIInput = "solve+";
        var arrOfNumsFromString = this.state.WolframAlphaInputText.match(/([\d\w]+)[\s]*[-=+*/]*[\s]*/g);
        for (var i = 0; i < arrOfNumsFromString.length; i++) {
            arrOfNumsFromString[i] = arrOfNumsFromString[i].replace(/=/g, '%3D');
            arrOfNumsFromString[i] = arrOfNumsFromString[i].replace(/\s/g, '');
            wolframAPIInput += arrOfNumsFromString[i];
        }
        this.callWolframAlphaAPI(wolframAPIInput);

    }

    callWolframAlphaAPI(input) {


        var localHeaders = {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }

        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        axios.get(proxyurl+'http://api.wolframalpha.com/v2/query?appid=KLVH4J-36KKQUULAH&input=' + input, {
            headers: localHeaders
        })
            .then((response) => {
                this.parseXML(response.data);
                this.setState({
                    callWolframAlphaAPIComplete: true
                })
            })
            .catch(function (error) {
                console.log(error);
            });

    }


    parseXML(raw) {
        var parseString = require('xml2js').parseString;
        var result = "";

        parseString(raw, (err, result) => {
            console.log(result);
            if (result.queryresult.$.error === 'false') {
                var pods = result.queryresult.pod;
                for (var i = 0; i < pods.length; i++) {
                    if (pods[i].subpod) {
                        for (var j = 0; j < pods[i].subpod.length; j++) {
                            if (pods[i].subpod[j]) {
                                if (pods[i].subpod[j].img) {
                                    for (var k = 0; k < pods[i].subpod[j].img.length; k++) {
                                        this.state.wolframSubPods.push(pods[i].subpod[j].img[k].$);
                                    }
                                }
                            }
                        }
                    }

                }
            } else {
                this.setState({
                    result: "There was an error in sending this request to WolframAlpha!"
                })
            }
        });
    }

    callGoogleVisionAPI() {
        var postObj = {
            imageBase64: this.state.selectedFileBase64
        }

        API.calculateImageLabel(postObj)
            .then(response => {

                if (!response.data.error) {
                    console.log("Calling google vision API was successful!");
                    console.log(response.data);
                    var newResult = "";
                    if (response.data.responses.length > 1) {
                        
                    }
                    for(var i=0; i<response.data.responses.length; i++) {
                        console.log("i is " + i);
                        newResult += "Your picture contains a " + response.data.responses[i].labelAnnotations[i].description
                        console.log(newResult);
                        newResult += "\n\n"
                        newResult += "I am approximately " + parseInt(response.data.responses[i].labelAnnotations[i].score * 100) + "% confident of this.\n\n"
                    }
                    console.log(newResult);
                    this.setState({
                        result: newResult
                    })
                    
                } else {
                    this.setState({
                        result: "There was an error with the image or the server!"
                    })
                }
            })

    }


    callMathPixAPI() {
        var postObj = {
            src: this.state.selectedFileBase64
        }

        var localHeaders = {
            "content-type": "application/json",
            "app_id": "tgwalker93_gmail_com_cc0d50",
            "app_key": "72c390b89e11c4263505"
        }

        axios.post('https://api.mathpix.com/v3/text', postObj, {
            headers: localHeaders
        })
            .then((response) => {
                console.log("Post successful");
                console.log(response);
                if(this.state.lastAPIChoice === "WolframAlphaImage"){
                    this.calculateResultBeforeCallingWolframAlpha(response.data);
                } else {
                    this.calculateResult(response.data);
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    calculateResultBeforeCallingWolframAlpha(responseData){
        if (responseData.confidence > .90) {
            var wolframAPIInput = "solve+";
            var imageText = responseData.text;
            var arrOfNumsFromString = imageText.match(/([\d\w]+)[\s]*[-=+*/]*[\s]*/g);
            for (var i = 0; i < arrOfNumsFromString.length; i++) {
                arrOfNumsFromString[i] = arrOfNumsFromString[i].replace(/=/g, '%3D');
                arrOfNumsFromString[i] = arrOfNumsFromString[i].replace(/\s/g, '');
                wolframAPIInput += arrOfNumsFromString[i];
            }

            this.callWolframAlphaAPI(wolframAPIInput);

        } else {
            this.setState({
                result: "I'm sorry I cannot read the image."
            })
        }
    }

    calculateResult(responseData) {
        if (responseData.confidence > .90){
            var imageText = responseData.text;
            var arrOfNumsFromString = imageText.match(/\d+/g);
            console.log(arrOfNumsFromString);
            if(imageText.includes("longdiv")){
                arrOfNumsFromString = imageText.match(/(\d\s)+/g);
                for(var i = 0; i<arrOfNumsFromString.length; i++) {
                    arrOfNumsFromString[i] = arrOfNumsFromString[i].replace(/\s/g, '');
                }
                if(arrOfNumsFromString.length == 2){
                    this.setState({
                        result: arrOfNumsFromString[1] + " divided by " + arrOfNumsFromString[0] + " = " + parseInt(arrOfNumsFromString[1]) / parseInt(arrOfNumsFromString[0]),
                        wolframInputFromMathPixReturn: "solve+" + arrOfNumsFromString[1] + "/" + arrOfNumsFromString[0]
                    })
                    return;
                }
            }
            if (arrOfNumsFromString.length !== 2){
                this.setState({
                    result: "There are two many numbers to calculate!"
                })
            }
            else if (imageText.includes("times")){
                
                this.setState({
                    result: arrOfNumsFromString[0] + " times " + arrOfNumsFromString[1] + " = " + parseInt(arrOfNumsFromString[0]) * parseInt(arrOfNumsFromString[1]),
                    wolframInputFromMathPixReturn: "solve+" + arrOfNumsFromString[0] + "*" + arrOfNumsFromString[1]
                })
            }
            else if (imageText.includes("div") ) {

                this.setState({
                    result: arrOfNumsFromString[0] + " divided by " + arrOfNumsFromString[1] + " = " + parseInt(arrOfNumsFromString[0]) / parseInt(arrOfNumsFromString[1]),
                    wolframInputFromMathPixReturn: "solve+"+arrOfNumsFromString[0]+"/"+arrOfNumsFromString[1]
                })
            }
            else if (imageText.includes("-")) {

                this.setState({
                    result: arrOfNumsFromString[0] + " minus " + arrOfNumsFromString[1] + " = " + (parseInt(arrOfNumsFromString[0]) - parseInt(arrOfNumsFromString[1])),
                    wolframInputFromMathPixReturn: "solve+" + arrOfNumsFromString[0] + "-" + arrOfNumsFromString[1]
                })
            }
            else if (imageText.includes("+")) {

                this.setState({
                    result: arrOfNumsFromString[0] + " plus " + arrOfNumsFromString[1] + " = " + (parseInt(arrOfNumsFromString[0]) + parseInt(arrOfNumsFromString[1])),
                    wolframInputFromMathPixReturn: "solve+" + arrOfNumsFromString[0] + "+" + arrOfNumsFromString[1]
                })
            }
        } else{
            this.setState({
                result: "I'm sorry I cannot read the image."
            })
        }
    }

    getBase64(file, cb) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            cb(reader.result)
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };

    }

    // File content to be displayed after 
    // file upload is complete 
    fileData = () => {

        if (this.state.selectedFile && this.state.lastAPIChoice !== "WolframAlphaInput") {

                return (
                    <div>
                        <h3>File Details:</h3>
                        <p>File Name: {this.state.selectedFile.name}</p>
                        <p>File Type: {this.state.selectedFile.type}</p>
                        <p>
                            Last Modified:{" "}
                            {this.state.selectedFile.lastModifiedDate.toDateString()}
                        </p>
                    </div>
                );
            

        } else if (this.state.lastAPIChoice === "WolframAlphaInput"){
                return (
                    <div>

                    </div>
                )
        } else {
            return (
                <div>
                    <h2>Please Upload your Image</h2>
                    <input id="chooseFileButton" type="file" onChange={this.onFileChange} />
                </div>
            );
        }
    };

    reset() {
        this.setState({
            selectedFile: null,
            selectedFileBase64: "",
            result: "",
            lastAPIChoice: "",
            wolframXMLData: "",
            wolframSubPods: [],
            wolframInputFromMathPixReturn: "",
            choiceMade: false,
            uploadButtonClicked: false,
            callWolframAlphaAPIComplete: false,
            WolframAlphaInputText: "",
            searchButtonClicked: false
        })
    }


    componentDidMount() {

    }

    //Standard method for constantly updating input, since UI is constantly refreshing
    handleChange(e) {
        this.setState({ [e.target.id]: e.target.value });
    }

    render() {
        return (
            <Container id="mainContainer" fluid="true">
                <Row id="headerRow">
                        <Col size="sm-12"> 
                            <h1 style={{ "textAlign": "center", "fontSize":"100px" }}>
                                Math Image Calculator
                                </h1>

                            {this.state.choiceMade ?
                                    <Button id="resetButton" variant="primary" onClick={() => this.reset()}>
                                        Reset
                        </Button>
                        
                        : ""}
                        </Col>
                </Row>
                <Container id="calculatorContainer" fluid="true">
                <Row id="mainRow">
                    <Col size="sm-12"> 
                        <div>
                            {this.state.choiceMade ?
                                <div>
                                    <div id="choiceMadeGroup">
                                        {this.state.lastAPIChoice === "WolframAlphaInput" ? 
                                        
                                        <div>
                                                <Input label="Enter your expression or equation!"
                                                    value={this.state.WolframAlphaInputText}
                                                    id="WolframAlphaInputText" onChange={this.handleChange.bind(this)} name="WolframAlphaInputText" />
                                                {this.state.searchButtonClicked ? <div></div> :
                                                <Button variant="primary" onClick={() => this.callWolframAlphaAPIWithTextInput()}>
                                                        Search
                                                </Button>
                                                 }
                                        </div> 
                                        : 
                                        <div></div>
                                         }
                                        {this.state.lastAPIChoice === "MathPix" && this.state.selectedFile && !this.state.callWolframAlphaAPIComplete && this.state.uploadButtonClicked ? 
                                        <div>
                                            <Button variant="primary" onClick={() => this.callWolframAlphaAPI(this.state.wolframInputFromMathPixReturn)}>
                                                    Show Details
                                            </Button>
                                        </div> : 
                                        <div>
                                            
                                        </div>}
                                    </div>
                                    <div id="uploadFileGroup">
                                        {this.fileData()}
                                        {this.state.uploadButtonClicked || this.state.lastAPIChoice === "WolframAlphaInput" ? 
                                        
                                        <div></div> 
                                        : 
                                        <div>
                                        <Button variant="primary" onClick={() => this.onFileUpload(this.state.lastAPIChoice)}>
                                                    Upload
                                                                            </Button>
                                        <Button variant="primary" onClick={() => this.reset()}>
                                        Cancel
                                        </Button>
                                        </div>}
                                    </div>
                                </div>

                                :
                                <div>
                                    <h1 style={{ "textAlign": "center" }}>What would you like to do?</h1>
                                <div id="buttonGroup">
                                    <Button variant="primary" onClick={() => this.buttonClicked("MathPix")}>
                                        Upload Image of Expression
                                     </Button>
                                    <Button variant="primary" onClick={() => this.buttonClicked("WolframAlphaImage")}>
                                            Upload Image of Equation
                                     </Button>
                                    <Button variant="primary" onClick={() => this.buttonClicked("GoogleVision")}>
                                        Upload Image to Find Shapes or Labels
                                     </Button>
                                    <Button variant="primary" onClick={() => this.buttonClicked("WolframAlphaInput")}>
                                        Input Text of Equation or Expression
                                     </Button>
                                </div>
                                </div>}
                        </div>
                        {this.state.result ?                         
                            <Container id="resultsContainer" fluid="true">
                                <h1>Results</h1>
                                <hr></hr>
                                <h1>
                                    {this.state.result.split("\n").map((i, key) => {
                                        return <div key={key}>{i}</div>;
                                    })}
                                </h1>
                                {this.state.wolframSubPods.map((subpod, key) => {
                                    return (
                                        <div>
                                            <img key={key}
                                                src={subpod.src}
                                                alt={subpod.alt}
                                                title={subpod.title}
                                                width={subpod.width}
                                                height={subpod.height}
                                                type={subpod.type}
                                                themes={subpod.themes}
                                                colorinvertable={subpod.colorinvertable} />
                                            <br />
                                            <br />
                                        </div>
                                    )
                                })}
                            </Container>                      
                        : ""}
                    </Col>
                </Row>
                </Container>
            </Container>
        );


    }
}

// export default Profile;
export default withRouter(CalculatorPage);