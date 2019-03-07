import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import axios from 'axios'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

const mapStyles = {
  width: '80%',
  height: '100%',

};

const imageStyle = {
    width: '200px',
    height: '150px'
}

export class MapContainer extends Component {
    state = {
        showingInfoWindow: false,  //Hides or the shows the infoWindow
        activeMarker: {},          //Shows the active marker upon click
        selectedPlace: {},   //Shows the infoWindow to the selected place upon a marker
        restaurants : [],
        formatted_address : "",
        activeUser: 1,
        quizResults: [],
        completedQuizzes: []
      };

    //   After the component is mounted, fetch the data from the backend
    componentDidMount() {
      axios.get("http://localhost:3000/restaurants")
      .then(response => {
        this.setState({restaurants: response.data})
      })
      .catch(error => console.log(error))

      axios.get('/results')
      .then(response => {
        this.setState({ quizResults: response.data.results }, this.getResultsForUser)
      })
      .catch(error => console.log(error))

      // axios.get('/restaurants/1/quizzes')
    }

    onMarkerClick = (props, marker, e) =>
      this.setState({
        selectedPlace: props,
        activeMarker: marker,
        showingInfoWindow: true
    });

    onClose = props => {
      if (this.state.showingInfoWindow) {
        this.setState({
          showingInfoWindow: false,
          activeMarker: null
        });
      }
    };

    getResultsForUser = () => {
      this.state.quizResults.forEach((result) => {
        if (result.customer_id === this.state.activeUser) {
          this.setState({ completedQuizzes: this.state.completedQuizzes.concat(result.restaurant.id) }, () => {
            console.log(this.state.completedQuizzes)
          })
        }
      })
    }
  
    render() {
        let to = `/restauant/${this.state.selectedPlace.id}/quiz/${this.state.selectedPlace.id}`
        return (
          <Map
            google={this.props.google}
            zoom={14}
            style={mapStyles}
            initialCenter={{
             lat: 43.644345,
             lng: -79.402150
            }}
          >
          { this.state.restaurants.map((restaurant) => {

            fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + restaurant.latitude + ',' + restaurant.longitude + '&key=' + "AIzaSyDF0n1daTVqgT7582-gLCO-GOsUgsF2-LQ")
            .then((response) => response.json())
            .then((responseJson) => {
                console.log('ADDRESS GEOCODE is BACK!! => ' + JSON.stringify(responseJson.results[0].formatted_address));
            })

            return (
              <Marker
                key={restaurant.id}
                onClick={this.onMarkerClick}
                name= {restaurant.name} 
                id = {restaurant.id}
                image = {restaurant.image}
                description = {restaurant.description}
                position = {
                  {
                    lat : restaurant.latitude,
                    lng : restaurant.longitude
                  }
                }
              />
            ) 
          }) }
          
            <InfoWindow marker={this.state.activeMarker} visible={this.state.showingInfoWindow} onClose={this.onClose} >
              <div>
                <div>
                  <h4>{this.state.selectedPlace.name}</h4>
                  <p>{this.state.selectedPlace.description}</p>
                  <h3>{this.state.formatted_address}</h3>
                  <img style={imageStyle} src={this.state.selectedPlace.image}/>
                </div>
                {!this.state.completedQuizzes.includes(this.state.activeMarker.id) && 
                <div>
                  <p>There is currently no quiz for this restaurant. Please check back at a later time.</p>
                </div>
                }
                {!this.state.completedQuizzes.includes(this.state.activeMarker.id) &&
                    <Router>
                      <Link to={to}>Quiz</Link>
                    </Router>
                }
                {this.state.completedQuizzes.includes(this.state.activeMarker.id) && 
                <div>
                  <p>You've already completed this quiz! Please check
                    <Router>
                      <Link to={'/rewards'}> MyRewards </Link>
                    </Router>
                    to view your rewards.
                  </p>
                </div>
                }
              </div>
            </InfoWindow>
          </Map>
        );
      }
    }
    
export default GoogleApiWrapper({
  apiKey: 'AIzaSyDF0n1daTVqgT7582-gLCO-GOsUgsF2-LQ'
})(MapContainer);

// {!this.props.answeredRestaurants.includes(this.props.marker.id) &&
//   <Router>
//     <Link to={to}>Quiz</Link>
//   </Router>
//   }