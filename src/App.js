import React from 'react';

import 'tachyons';

import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Particles from 'react-particles-js';

import './App.css';

//object to store parameters for particles
const particlesOptions = {
	particles: {
		number: {
			value: 30,
			density: {
				enable: true,
				value_area: 800,
			},
		},
	},
};

const initialState = {
	textInput: '',
	imageUrl: '',
	boxes: [],
	route: 'SignIn',
	isSignedIn: false,
	user: {
		id: '',
		name: '',
		email: '',
		entries: 0,
		joined: '',
	},
};
class App extends React.Component {
	constructor() {
		super();
		this.state = initialState;
	}

	loadUser = userData => {
		this.setState({
			user: {
				id: userData.id,
				name: userData.name,
				email: userData.email,
				entries: userData.entries,
				joined: userData.joined,
			},
		});
	};

	calculateFaceLocation = dataAPI => {
		const image = document.getElementById('inputImage'); //named in FaceRecognition
		const width = Number(image.width);
		const height = Number(image.height);

		const faceBoxes = dataAPI.outputs[0].data.regions.map(
			({
				region_info: {
					bounding_box: {left_col, top_row, right_col, bottom_row},
				},
			}) => ({
				leftCol: left_col * width,
				topRow: top_row * height,
				rightCol: width - right_col * width,
				bottomRow: height - bottom_row * height,
			})
		);

		return faceBoxes;
	};

	displayFaceLocation = boxes => {
		this.setState({boxes});
	};

	onInputChange = event => {
		this.setState({textInput: event.target.value});
	};

	onButtonSubmit = async () => {
		this.setState({imageUrl: this.state.textInput, boxes: []});

		try {
			const res = await fetch('https://sheltered-sierra-80993.herokuapp.com/imageurl', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					input: this.state.textInput,
				}),
			});

			const apiProcessedFaceData = await res.json();

			if (apiProcessedFaceData) {
				this.displayFaceLocation(this.calculateFaceLocation(apiProcessedFaceData)); //callBack: calcFace run first, and returns box, this return is argument for displayFace

				try {
					//increase image count
					const res = await fetch('https://sheltered-sierra-80993.herokuapp.com/image', {
						method: 'PUT',
						headers: {'Content-Type': 'application/json'},
						body: JSON.stringify({id: this.state.user.id}),
					});

					const count = await res.json();

					this.setState(Object.assign(this.state.user, {entries: count})); //required as user object cannot be changed
				} catch (e) {
					console.log({e}, 'error processing image data and/or getting user count');
				}
			}
		} catch (e) {
			console.log({e}, 'error getting image data processed');
		}
	};

	onRouteChange = route => {
		if (route === 'SignOut') {
			this.setState(initialState);
		} else if (route === 'Home') {
			this.setState({isSignedIn: true});
		}
		this.setState({route: route});
	};

	render() {
		const {isSignedIn, imageUrl, route, boxes} = this.state;
		return (
			<div className='App'>
				<Particles className='particles' params={particlesOptions} />
				{/* <div>
					<Logo />
					<Rank name={this.state.user.name} entries={this.state.user.entries} />
					<ImageLinkForm
						onInputChange={this.onInputChange}
						onSubmit={this.onButtonSubmit}
					/>
					<FaceRecognition imageUrl={imageUrl} boxes={boxes} />
				</div> */}
				<Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
				{route === 'Home' ? (
					<div>
						<Logo />
						<Rank name={this.state.user.name} entries={this.state.user.entries} />
						<ImageLinkForm
							onInputChange={this.onInputChange}
							onSubmit={this.onButtonSubmit}
						/>
						<FaceRecognition imageUrl={imageUrl} boxes={boxes} />
					</div>
				) : this.state.route === 'SignIn' ? (
					<SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
				) : (
					<Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
				)}
			</div>
		);
	}
}

export default App;
