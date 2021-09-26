//Emmet: auto-close tag --> ctrl-E
import React from 'react';
import './App.css';
import 'tachyons';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
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
    }
  }

  calculateFaceLocation = (dataAPI) => {
    this.setState({box: dataAPI.outputs[0].data.regions[0].region_info.bounding_box})
  }

  onInputChange = (event) => {
    this.setState({textInput: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.textInput})
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.textInput)
    .then(
      (response) => {
      // response object: https://www.clarifai.com/models/face-detection-image-recognition-model-a403429f2ddf4b49b307e318f00e528b-detection
      // console.log(response);
      //regions = faces --> use only the first one for now
      // console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
      this.calculateFaceLocation(response);

    },
      (err) => {
      // there was an error
    }
  );
  }

  render() 
  {
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />
        <div>
        <Navigation/>
        <Logo/>        
        <Rank/>    
        <ImageLinkForm onInputChange={this.onInputChange} onSubmit={this.onButtonSubmit}/>
        <FaceRecognition imageUrl={this.state.imageUrl}/>
        </div>
      </div>
    );
  }
}

export default App;
