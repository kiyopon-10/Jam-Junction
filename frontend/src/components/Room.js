import React from "react";
import { useParams, useNavigate} from 'react-router-dom';

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import CreateRoomPage from "./createRoomPage";
import MusicPlayer from "./MusicPlayer";

export default function Room(props){

    function getCookie(name) {
        var cookieValue = null;
        if(document.cookie && document.cookie !== "") {
            var cookies = document.cookie.split(";");
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === name + "=") {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const [state, setState] = React.useState({
        votesToSkip: 2,
        guestCanPause: false,
        isHost: false,
        showSettings: false,
        spotifyAuthenticated: false,
        song : {}
    })
    
    const { roomCode } = useParams();
    // This line uses the useParams hook from React Router to extract the roomCode parameter from the URL. It's a common way to access 
    // URL parameters in functional components when using React Router.

    const [roomCodeState, setRoomCodeState] = React.useState(roomCode);

    //console.log(roomCodeState)
    
    const navigate = useNavigate();

    function authenticateSpotify(){
        console.log("Inside the authenticateSpotify function")
        fetch("/spotify/is-authenticated")
            .then((response) => response.json())
            .then((data) => {
                setState(prev => ({
                    ...prev,
                    spotifyAuthenticated: data.status
                }));
                console.log("Is Authenticated : ",data.status);
                if(!data.status) {
                    fetch("/spotify/get-auth-url")
                        .then((response) => response.json())
                        .then((data) => {
                            window.location.replace(data.url);  // Javascript function for accessing a link
                        });
                }
            });
    }

    function getRoomDetails(){
        fetch('../api/get-room' + '?code=' + roomCodeState)
            .then((response) => {
                if (!response.ok) {
                    props.leaveRoomCallback();
                    navigate("../");
                }
                return response.json();
            })
            .then((data) => {
                setState(prev => ({
                    ...prev,
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host,
                }));
                console.log("Is host :",data.is_host)
                if(data.is_host === true) {
                    console.log("going to call the authenticate spotify function")
                    authenticateSpotify();
                }
            })
            .catch((error) => {
                console.error("Error creating room:", error);
                // Handle the error appropriately, e.g., show an error message to the user
            })
    };

    React.useEffect(() => {
        getRoomDetails();
    }, [roomCodeState]);

    function getCurrentSong() {
        fetch("/spotify/current-song")
          .then((response) => {
            if (!response.ok) {
              console.error('Error fetching current song:', response.status, response.statusText);
              return {};
            } else {
              return response.json();
            }
          })
          .then((data) => {
            setState((prev) => ({
              ...prev,
              song: data,
            }));
            console.log(data);
          })
          .catch((error) => {
            console.error('Error during fetch:', error);
          });
      }
      

    React.useEffect(()=>{
        const intervalId = setInterval(getCurrentSong, 1000);

        //Cleanup function:
        return ()=>{
            clearInterval(intervalId)
        }
    }, [])

    
    function leaveButtonPressed(){
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            },
        };
        fetch("../api/leave-room", requestOptions).then((_response) => {
            props.leaveRoomCallback();
            navigate("../");
        });
    }

    function updateShowSettings(value){
        setState(prev => ({
            ...prev,
            showSettings: value
        }))
    }


    function renderSettingsButton(){
        return (
            <Grid item xs={12} align="center">
              <Button
                variant="contained"
                color="primary"
                onClick={() => updateShowSettings(true)}
              >
                Settings
              </Button>
            </Grid>
          );
    }

    function renderSettings() {
        return (
          <Grid container spacing={1}>
            <Grid item xs={12} align="center">
              <CreateRoomPage
                update={true}
                votesToSkip={state.votesToSkip}
                guestCanPause={state.guestCanPause}
                roomCode={roomCodeState}
                updateCallback={()=>{
                    getRoomDetails()
                }}
              />
            </Grid>
            <Grid item xs={12} align="center">
              <Button
                variant="contained"
                color="secondary"
                onClick={() => updateShowSettings(false)}
              >
                Close
              </Button>
            </Grid>
          </Grid>
        );
      }
    
    if(state.showSettings){
        return renderSettings()
    }
    else{
        return(
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography variant="h4" component="h4">
                        Code: {roomCodeState}
                    </Typography>
                </Grid>
                <MusicPlayer {...state.song} />
                {state.isHost ? renderSettingsButton() : null}
                <Grid item xs={12} align="center">
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={leaveButtonPressed}
                    >
                        Leave Room
                    </Button>
                </Grid>
            </Grid>
        )
    }
    
}



// The initial Room Page :


// return(
//     <Grid container spacing={1}>
//         <Grid item xs={12} align="center">
//             <Typography variant="h4" component="h4">
//                 Code: {roomCodeState}
//             </Typography>
//         </Grid>
//         <Grid item xs={12} align="center">
//             <Typography variant="h6" component="h6">
//                 Votes: {state.votesToSkip}
//             </Typography>
//         </Grid>
//         <Grid item xs={12} align="center">
//             <Typography variant="h6" component="h6">
//                 Guest Can Pause: {state.guestCanPause.toString()}
//             </Typography>
//         </Grid>
//         <Grid item xs={12} align="center">
//             <Typography variant="h6" component="h6">
//                 Host: {state.isHost.toString()}
//             </Typography>
//         </Grid>
//         {state.isHost ? renderSettingsButton() : null}
//         <Grid item xs={12} align="center">
//             <Button
//                 variant="contained"
//                 color="secondary"
//                 onClick={leaveButtonPressed}
//             >
//                 Leave Room
//             </Button>
//         </Grid>
//     </Grid>
// )




