//Emmet: auto-close tag --> ctrl-E
import React from 'react';
import './App.css';
import 'tachyons';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';

import Particles from 'react-particles-js';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
 apiKey: '2b68bbbf227e4e92897cf6a12db1dd68'
});

//object to store parameters for particles
 const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

class App extends React.Component 
{
  constructor()
  {
    super();
    this.state = {
      textInput: '',
      imageUrl: '',
      box: {},
      route: 'SignIn',
      isSignedIn: false
    }
  }

  calculateFaceLocation = (dataAPI) => {
    // this.setState({box: dataAPI.outputs[0].data.regions[0].region_info.bounding_box})
    const clarifaiFace = dataAPI.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage'); //named in FaceRecognition
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col*width,
      topRow: clarifaiFace.top_row*height,
      rightCol: width - (clarifaiFace.right_col*width),
      bottomRow: height - (clarifaiFace.bottom_row*height)
    }
  }

  displayFaceLocation = (boxCoord) => 
  {
    this.setState({box: boxCoord});
  }

  onInputChange = (event) => 
  {
    this.setState({textInput: event.target.value});
  }

  onButtonSubmit = () => 
  {
    this.setState({imageUrl: this.state.textInput})
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.textInput)
    .then(response => this.displayFaceLocation(this.calculateFaceLocation(response))) //callBack: calcFace run first, and returns box, this return is arguments for displayFace
    // .then(response => this.calculateFaceLocation(response))
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => 
  {
    if(route === 'SignOut')
    {
      this.setState({isSignedIn: false})
    }
    else if(route === 'Home')
    {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }

  render() 
  {
    const { isSignedIn, imageUrl, route, box } = this.state
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
        {route === 'Home' 
          ?
          <div>
            <Logo/>        
            <Rank/>    
            <ImageLinkForm onInputChange={this.onInputChange} onSubmit={this.onButtonSubmit}/>
            <FaceRecognition imageUrl={imageUrl} box={box}/>
          </div>
          :
          (this.state.route === 'SignIn' 
            ?
            <SignIn onRouteChange={this.onRouteChange} /> 
            :
            <Register onRouteChange={this.onRouteChange} /> 
          )
        }
      </div>
    );
  }
}

export default App;
