import React from 'react';
import {connect} from 'react-redux';
import { push } from 'connected-react-router';
import axios from 'axios';
import {authAction} from './Auth';

// front-end
import Form from "react-bootstrap/Form";
import Button from 'react-bootstrap/Button';
import "./styles.css";

// constants
const LOGIN_IDLE = "LOGIN_IDLE";
const LOGIN_REQ = "LOGIN_REQ";
const LOGIN_SUCCESS = "LOGIN_SUCCESS";
const LOGIN_FAIL = "LOGIN_FAIL";

const STATE_IDLE = 1;
const STATE_IS_LOADING = 2;
const STATE_FAILED_LOGIN = 3;
const STATE_SUCCESS_LOGIN = 4;

// actions
const loginAction = (username) => ({
    type: LOGIN_REQ,
    payload: {username}
});
const loginSuccessAction = () => ({
    type: LOGIN_SUCCESS,
});
const loginFailAction = () => ({
    type: LOGIN_FAIL,
});
const goToIdleAction = () => ({
    type: LOGIN_IDLE,
});
const redirectTo = (to) => dispatch => {
    dispatch(push(to));
};


// async action
const asyncLogin = username => dispatch => {
    dispatch(loginAction(username));
    axios
        .post(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/v1/login`, {
            // This one should include cookie gathered by browser at register action!
            name: username,
        }, {withCredentials:true})
        .then(res => {
            dispatch(loginSuccessAction());
            dispatch(authAction(username));
            dispatch(redirectTo('/home'));
        })
        .catch(err => {console.log(`Failed to login err='${err}'`);dispatch(loginFailAction())});
}


// reducer
const initialState = {
    status: STATE_IDLE,
    username: '',
    isLoggedIn: false,
}
export const loginReducer = (state = initialState, action) => {
    switch(action.type) {
        case LOGIN_IDLE:
            return {
                ...state,
                status: STATE_IDLE,
            }
        case LOGIN_REQ: 
            return {
                ...state,
                status: STATE_IS_LOADING,
                username: action.payload.username,
            }
        case LOGIN_SUCCESS:
            return {
                ...state,
                status: STATE_SUCCESS_LOGIN,
                isLoggedIn: true,
            }
        case LOGIN_FAIL:
            return {
                ...state,
                status: STATE_FAILED_LOGIN,     
            }
        default:
        return state
    }
}
  
// Almomst Stateless Component
class LoginComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
        };
        this.buttonText = 'LOG IN';
    }
    handleChange = (username) => {
        this.setState({username});
        if (this.props.status === STATE_FAILED_LOGIN) {
            // First change after a failed status 
            this.props.goToIdle();
        }
    };  
    shouldComponentUpdate(nextProps) {
        switch(nextProps.status) {
        case STATE_IDLE:
            this.buttonText = 'LOG IN';
            break;
        case STATE_IS_LOADING:
            this.buttonText = 'Loading...';
            break;
        case STATE_SUCCESS_LOGIN:
            this.buttonText = nextProps.username; 
            break;
        case STATE_FAILED_LOGIN:
            this.buttonText = 'FAILED';
            break;
        default:
            return false;
        }
        return true;
    };

    render() {
        return (
            <div className="MyForm">
                <Form onSubmit={() => {return false;}}>
                <Form.Group size="lg" controlId="username" id="input-group-login">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                    autoFocus
                    type="username"
                    value={this.state.username}
                    onChange={e => this.handleChange(e.target.value)}
                    />
                </Form.Group>
                <Button id="button-login" className="btn-warning" block size="lg" onClick={() => this.props.login(this.state.username)} >
                    {this.buttonText}
                </Button>
                </Form>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        username: state.login.username,
        status: state.login.status
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        login: (username) => {dispatch(asyncLogin(username))},
        goToIdle: () => {dispatch(goToIdleAction())},
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(LoginComponent);
  



