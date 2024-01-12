import React, {Component} from "react";
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import { Link } from 'react-router-dom';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';

import { useNavigate } from "react-router-dom";


export default function CreateRoomPage(props){

    const defaultVotes = 2

    const [state, setState] = React.useState({
        guest_can_pause: props.guestCanPause !== undefined ? props.guestCanPause : true,
        votes_to_skip: props.votesToSkip !== undefined ? props.votesToSkip : defaultVotes
    })

    const [error ,setError] = React.useState({
        errorMsg: "",
        successMsg: "",
    })
    

    // React.useEffect(() => {
    //     setState({
    //       guest_can_pause: props.guestCanPause !== undefined ? props.guestCanPause : state.guest_can_pause,
    //       votes_to_skip: props.votesToSkip !== undefined ? props.votesToSkip : state.votes_to_skip
    //     });
    // }, [props.guestCanPause, props.votesToSkip]);

    function handleVotesChange(event){
        setState( prev =>{
            return{
                ...prev,
                votes_to_skip : event.target.value
            }
        })
    }

    function handleGuestCanPauseChange(event){
        setState( prev => {
            return {
                ...prev,
                guest_can_pause : event.target.value === "true" ? true : false
            }
        })
    }

    //------------------------------------------------------------------------------------------------------------------------

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
    //const csrfToken = getCookie("csrftoken");
    ////console.log(csrfToken)
      
    //------------------------------------------------------------------------------------------------------------------------

    const navigate = useNavigate();

    function handleCreateButtonPressed(){
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            },
            body: JSON.stringify({
                votes_to_skip: state.votes_to_skip,
                guest_can_pause: state.guest_can_pause,
            }),
        }

        // This will send the a post request to the given url
        fetch("/api/create-room", requestOptions)
            .then((response) => response.json())
            .then((data) => {
                //console.log(data);
                navigate("/room/" + data.code);
            })
            .catch((error) => {
                console.error("Error creating room:", error);
                // Handle the error appropriately, e.g., show an error message to the user
            });
    }

    function handleUpdateButtonPressed(){
        const requestOptions = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            },
            body: JSON.stringify({
                votes_to_skip: state.votes_to_skip,
                guest_can_pause: state.guest_can_pause,
                code: props.roomCode
            }),
        }

        // This will send the a post request to the given url
        fetch("/api/update-room", requestOptions).then((response) => {
            if (response.ok) {
              setError(prev =>({
                ...prev,
                successMsg: "Room updated successfully!",
              }))
            } else {
              setError(prev =>({
                ...prev,
                errorMsg: "Error updating room"
              }))
            }
            props.updateCallback();
          });
    }

    function renderCreateButton(){
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={handleCreateButtonPressed}
                    >
                        Create A Room
                    </Button>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button color="secondary" variant="contained" to="/" component={Link}>
                        Back
                    </Button>
                </Grid>
            </Grid>
        )
    }

    function renderUpdateButton(){
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={handleUpdateButtonPressed}
                    >
                        Update Room
                    </Button>
                </Grid>
            </Grid>
        )
    }

    const title = props.update===true ? "Update Room" : "Create A Room"

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <Collapse
                    in={error.errorMsg != "" || error.successMsg != ""}
                >
                    {error.successMsg != "" ?
                        (<Alert
                            severity="success"
                            onClose={() => {
                                setError(prev =>({
                                    ...prev,
                                    successMsg: "",
                                }))
                            }}
                        >
                            {error.successMsg}
                        </Alert>)
                        
                        :

                        (<Alert
                            severity="error"
                            onClose={() => {
                                setError(prev =>({
                                    ...prev,
                                    errorMsg: "",
                                  }))
                            }}
                        >
                            {error.errorMsg}
                        </Alert>)
                    }
          </Collapse>
        </Grid>
            <Grid item xs={12} align="center">
                <Typography component="h4" variant="h4">
                    {title}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
            
                {/* The following portion of code with FormControl and RadioGroup will work with creating a checkbox
                    with options where only one can be selected at a time */}
                <FormControl component="fieldset">
                    <FormHelperText>
                        <div align="center">Guest Control of Playback State</div>
                    </FormHelperText>
                    <RadioGroup row defaultValue={state.guest_can_pause.toString()} onChange={handleGuestCanPauseChange}>
                        <FormControlLabel
                            value="true"
                            control={<Radio color="primary" />}
                            label="Play/Pause"
                            labelPlacement="bottom"
                        />
                        <FormControlLabel
                            value="false"
                            control={<Radio color="secondary" />}
                            label="No Control"
                            labelPlacement="bottom"
                        />
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl>
                    <TextField
                        required={true}
                        type="number"
                        defaultValue={state.votes_to_skip}
                        onChange={handleVotesChange}
                        inputProps={{
                            min: 1,
                            style: { textAlign: "center" },
                        }}
                    />
                    <FormHelperText>
                        <div align="center">Votes Required To Skip Song</div>
                    </FormHelperText>
                </FormControl>
            </Grid>
            {props.update===true ? renderUpdateButton() : renderCreateButton()}
        </Grid>
    )
}
