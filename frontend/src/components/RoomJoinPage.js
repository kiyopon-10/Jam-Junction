import React from "react";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";

export default function RoomJoinPage(){

    const [state, setState] = React.useState({
        roomCode: "",
        error: ""
    })

    function handleTextFieldChange(event){
        setState(prev => ({
            ...prev,
            roomCode: event.target.value
        }))
    }

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

    const navigate = useNavigate();

    function roomButtonPressed(){
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            },
            body: JSON.stringify({
                code: state.roomCode
            }),
        }

        // This will send the a post request to the given url
        fetch("/api/join-room", requestOptions)
            .then((response) => {
                if(response.ok) {
                    navigate("/room/" + state.roomCode);
                }
                else{
                    setState(prev => ({
                        ...prev,
                        error: "Room not found"
                    }))
                }
            })
            .catch((error) => {
                console.log(error);
                // Handle the error appropriately, e.g., show an error message to the user
            });
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Typography variant="h4" component="h4">
                    Join a Room
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <TextField
                    error={state.error}
                    label="Code"
                    placeholder="Enter a Room Code"
                    value={state.roomCode}
                    helperText={state.error}
                    variant="outlined"
                    onChange={handleTextFieldChange}
                />
            </Grid>
            <Grid item xs={12} align="center">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={roomButtonPressed}
                >
                    Enter Room
                </Button>
            </Grid>
            <Grid item xs={12} align="center">
                <Button variant="contained" color="secondary" to="/" component={Link}>
                    Back
                </Button>
            </Grid>
        </Grid>
    )
}
