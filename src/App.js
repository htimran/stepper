import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import Steppermodule from './components/Stepper';


class App extends Component {
  render() {
    return (
      <div className="App">       
        <h1>Stepper</h1>        
        <Steppermodule />
      </div>
    )
  }
}

export default App;
