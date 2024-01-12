import React from "react";

import {
    BrowserRouter as Router,
    //Switch,
    Routes,
    Route,
    Link,
    //Redirect,
    //useNavigate,
    Navigate
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

    React.useEffect(() => {
        const componentDidMount = async () => {
            fetch("/api/user-in-room")
                .then((response) => response.json())
                .then((data) => {
                    //console.log("From api :",data.code)
                    setState({
                      roomCode: data.code,
                    })
                    //console.log("From api state.roomCode =", state.roomCode)
                });
        }
        componentDidMount()
    }, []);

    function clearRoomCode(){
      setState({
        roomCode: null
      })
    }


    function renderHomePage() {
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
          <Route path="/" element={ state.roomCode !== null ? ( <Navigate to={`/room/${state.roomCode}`} /> ) : ( renderHomePage() )}/>
          <Route path='/room/:roomCode' element={<Room leaveRoomCallback = {clearRoomCode}/>}/>
        </Routes>
      </Router>
    )

}