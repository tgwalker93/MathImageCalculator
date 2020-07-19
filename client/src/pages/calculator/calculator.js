import React, { Component } from "react";
import { Col, Row, Container } from "../../components/Grid";
import { Input, Button } from "../../components/Form";
import API from "../../utils/API";
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
// import "bootstrap/dist/css/bootstrap.min.css";

class CalculatorPage extends Component {
    constructor(props) {
        super(props)
        this.state = {

        };
    }

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
                        
                        <h1> Hello, world!!</h1>


                    </Col>
                </Row>

            </Container>
        );


    }
}

// export default Profile;
export default withRouter(CalculatorPage);