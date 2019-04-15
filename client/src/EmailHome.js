import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";


class EmailHome extends Component{
    constructor(props) {
        super(props);
        this.state={
            logInfo:{
                username: null,
                loggedIn: false,
            },
        };
    }
    componentDidMount() {
        this.checkForUser();
    }
    checkForUser(){
        fetch('/users')
            .then(response=>{
                return response.text();
            })
    }
}