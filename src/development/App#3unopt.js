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
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

loadUser = (userData) => 
{
  // this.setState({user: userData});
  this.setState({user: {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    entries: userData.entries,
    joined: userData.joined
    }
  });
  console.log(this.state.user,userData);
}
//Test connection with backend - requires cors at backend
//fetch uses get by default
  // componentDidMount() {
  //   fetch('http://localhost:3000/')       //returns response
  //     .then(response => response.json())  //with response, use .json method to convert into
  //     .then(console.log)                  //same: .then(data => console.log(data))
  // }

  calculateFaceLocation = (dataAPI) => 
  {
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
    // console.log(this.state);
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.textInput)
    .then(response => 
    {
      if(response)
      {
        // console.log(this.state.id);
        //increase image count
        fetch('http://localhost:3000/image', {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({id: this.state.user.id})
          })
        .then(response => response.json())
        .then(count => {
          console.log(count);
          this.setState(Object.assign(this.state.user, { entries: count }))
        })
      }  
      this.displayFaceLocation(this.calculateFaceLocation(response)) //callBack: calcFace run first, and returns box, this return is arguments for displayFace
    })
    .catch(err => console.log(err));
  }

//DOES NOT WORK --> CHANGES THE USER OBJECT
// .then(count => this.setState({user: {entries: count}}));


  onRouteChange = (route) => 
  {
    if(route === 'SignOut')
    {
      this.setState({isSignedIn: false});
      this.setState({
          imageUrl: '',
          box: {}
        });
    }
    else if(route === 'Home')
    {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }

  render() 
  {
    const { isSignedIn, imageUrl, route, box } = this.state;
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
            <Rank name={this.state.user.name} entries={this.state.user.entries} />    
            <ImageLinkForm onInputChange={this.onInputChange} onSubmit={this.onButtonSubmit}/>
            <FaceRecognition imageUrl={imageUrl} box={box}/>
          </div>
          :
          (this.state.route === 'SignIn' 
            ?
            <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser} /> 
            :
            <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} /> 
          )
        }
      </div>
    );
  }
}

export default App;
