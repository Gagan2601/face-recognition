import React, { useState } from 'react';
import Navigation from './components/Navigation/Navigation.js';
import Logo from './components/Logo/Logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank.js';
import ParticlesBg from 'particles-bg';
import './App.css';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Signin from './components/Signin/Signin.js';
import Register from './components/Register/Register.js';

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '',
  },
};
const App = () => {
  const [state, setState] = useState(initialState);

  const onInputChange = (event) => {
    const { value } = event.target;
    setState((prevState) => ({ ...prevState, input: value }));
  }

  const calculateFaceLocation = (data) => {
    const clarifaiFaces = [];
    data.outputs.forEach((output) => {
      output.data.regions.forEach((region) => {
        const boundingBox = region.region_info.bounding_box;
        clarifaiFaces.push(boundingBox);
      });
    });
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    const faceLocations = clarifaiFaces.map((clarifaiFace) => {
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height),
      };
    });

    return faceLocations;
  }
  const loadUser = (data) => {
    setState((prevState) => ({
      ...prevState,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    }));
  }
  const displayFaceBox = (faceLocations) => {
    setState((prevState) => ({ ...prevState, box: faceLocations }));
  }
  const onButtonSubmit = () => {
    setState((prevState) => ({ ...prevState, imageUrl: state.input }));
    fetch('https://face-api-btzh.onrender.com/imageurl', {
      method: 'post',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: state.input })
    })
      .then(response => response.json())
      .then(result => {
        if (result && result.outputs) {
          const faceLocations = calculateFaceLocation(result);
          displayFaceBox(faceLocations);
          fetch('https://face-api-btzh.onrender.com/image', {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: state.user.id })
          })
            .then(response => response.json())
            .then(count => {
              setState((prevUser) => ({
                ...prevUser, user: {
                  ...prevUser.user,
                  entries: count
                }
              }));
            })
            .catch(error => console.log('Error updating user entries:', error));
        } else {
          console.log('Error: Image data not available.');
        }
      })
      .catch(error => console.log('Error fetching image data:', error));
  };
  const onRouteChange = (route) => {
    if (route === 'signout') {
      setState(initialState);
    } else if (route === 'home') {
      setState((prevState) => ({ ...prevState, isSignedIn: true, route: 'home' }));
    } else {
      setState((prevState) => ({ ...prevState, route }));
    }
  };
  const { isSignedIn, imageUrl, route, box, user } = state;
  return (
    <div className="App">
      <ParticlesBg color="#ffffff" type="cobweb" bg={true} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      {route === 'home'
        ? <div>
          <Logo />
          <Rank name={user.name} entries={user.entries} />
          <ImageLinkForm onInputChange={onInputChange} onButtonSubmit={onButtonSubmit} />
          <FaceRecognition box={box} imageUrl={imageUrl} />
        </div>
        : (
          route === 'signin'
            ? <Signin loadUser={loadUser} onRouteChange={onRouteChange} />
            : <Register loadUser={loadUser} onRouteChange={onRouteChange} />
        )
      }
    </div>
  );
}

export default App;
