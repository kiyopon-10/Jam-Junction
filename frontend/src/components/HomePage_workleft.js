import React from "react";

import {
    BrowserRouter as Router,
    //Switch,
    Routes,
    Route,
    Link,
    //Redirect,
    useNavigate,
  } from "react-router-dom";

import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./createRoomPage";
import Room from "./Room";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";


export default function HomePage(){

    const [state, setState] = React.useState({
        roomCode: null
    })

    // async () => {
    //     fetch("/api/user-in-room")
    //         .then((response) => response.json())
    //         .then((data) => {
    //             setRoomCode(data.code);
    //         });
    // };

    React.useEffect(() => {
        const componentDidMount = async () => {
            fetch("/api/user-in-room")
                .then((response) => response.json())
                .then((data) => {
                    console.log(data.code)
                    setState({
                        roomCode: data.code,
                    })
                    //console.log(state.roomCode)
                });
        }
        componentDidMount()
    }, []);

    // React.useEffect(() => {
    //   const componentDidMount = async () => {
    //     try {
    //       const response = await fetch("/api/user-in-room");
  
    //       if (!response.ok) {
    //         // Handle non-successful response (e.g., 404, 500)
    //         throw new Error(`HTTP error! Status: ${response.status}`);
    //       }
  
    //       const data = await response.json();
  
    //       setState({
    //         roomCode: data.code,
    //       });
  
    //       console.log("Updated Room Code:", data.code);
    //     } catch (error) {
    //       // Handle any errors that occurred during the fetch or JSON parsing
    //       console.error("Error fetching room code:", error);
    //     }
    //   };
  
    //   componentDidMount();
    // }, []);
      

    function renderHomePage() {

      if(state.roomCode){
        // return(
        //   <p>Hey lol</p>
        // )
        const navigate = useNavigate();
        let dynamicPath = "/room/" + state.roomCode;
        console.log(dynamicPath);
        navigate(dynamicPath);
        return null
      }
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} align="center">
            <Typography variant="h3" compact="h3">
              House Party
            </Typography>
          </Grid>
          <Grid item xs={12} align="center">
            <ButtonGroup disableElevation variant="contained" color="primary">
              <Button color="primary" to="/join" component={Link}>
                Join a Room
              </Button>
              <Button color="secondary" to="/create" component={Link}>
                Create a Room
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      );
        
    }


    return (
      <Router>
        <Routes>
          <Route path='/join' element={<RoomJoinPage />}/>
          <Route path='/create' element={<CreateRoomPage />}/>
          <Route path='/' element={renderHomePage()} />
          <Route path='/room/:roomCode' element={<Room />}/>
        </Routes>
      </Router>
    )

}