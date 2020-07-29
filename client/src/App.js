import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import Calculator from "./pages/calculator"
import API from "./utils/API";

import "./App.css";

class App extends Component {

  constructor() {
    super()
    this.state = {

    }
  }
  componentDidMount() {
 
  }

  render() {

    //IF USER IS NOT AUTHENTICATED, RENDER JUST THE LANDING PAGE
    return (
      <div className="App">
        <div>

          <Route exact path="/calculator"
            render={() =>
              <Calculator
                
              />} />

          <Route exact path="/" render={() => (
            <Redirect to="/calculator" />
          )} />

          <Redirect from="*" to="/calculator" /> 

        </div>
      </div>
    )
  }

}
export default App;
// export default App;