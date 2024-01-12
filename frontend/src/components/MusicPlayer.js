import React from "react";

// import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';


export default function MusicPlayer(props){

    const songProgress = (props.time / props.duration) * 100;

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

    function pauseSong() {
      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
      };
      fetch("/spotify/pause", requestOptions);
    }
  
    function playSong() {
      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
      };
      fetch("/spotify/play", requestOptions);
    }

    function skipToNext(){
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
      };
      fetch("/spotify/next", requestOptions);
    }

    return (
        <Card>
          <Grid container alignItems="center">
            <Grid item align="center" xs={4}>
              <img src={props.image_url} height="100%" width="100%" />
            </Grid>
            <Grid item align="center" xs={8}>
              <Typography component="h5" variant="h5">
                {props.title}
              </Typography>
              <Typography color="textSecondary" variant="subtitle1">
                {props.artist}
              </Typography>
              <div>
              <IconButton
                onClick={() => {
                  props.is_playing ? pauseSong() : playSong();
                }}
              >
                  {props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton
                  onClick={()=>{
                    skipToNext();
                  }}
                >
                  <SkipNextIcon />
                  {props.votes} / {props.votes_required}
                </IconButton>
              </div>
            </Grid>
          </Grid>
          <LinearProgress variant="determinate" value={songProgress} />
        </Card>
      );
}