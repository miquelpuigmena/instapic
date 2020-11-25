import React from 'react';
import {connect} from 'react-redux';
import { push } from 'connected-react-router';
// import styles from './styles.module.css';
import axios from 'axios';

// front-end
import Form from "react-bootstrap/Form";
import Button from 'react-bootstrap/Button';
import "./styles.css";

// constants
const SIGN_UP_IDLE = "SIGNUP_IDLE";
const SIGN_UP_REQ = "SIGNUP_REQ";
const SIGN_UP_SUCCESS = "SIGNUP_SUCCESS";
const SIGN_UP_FAIL = "SIGNUP_FAIL";

const STATE_IDLE = 1;
const STATE_IS_LOADING = 2;
const STATE_FAILED_REGISTER = 3;
const STATE_SUCCESS_REGISTER = 4;

// actions
const signupAction = (username) => ({
  type: SIGN_UP_REQ,
  payload: {username}
});
const signupSuccessAction = () => ({
  type: SIGN_UP_SUCCESS,
});
const signupFailAction = () => ({
  type: SIGN_UP_FAIL,
});
const goToIdleAction = () => ({
  type: SIGN_UP_IDLE,
});
const redirectTo = (to) => dispatch => {
  dispatch(push(to));
};

// async action
const asyncSignup = username => dispatch => {
  dispatch(signupAction(username));
  axios
    .post(`http://${process.env.API_HOST}:${process.env.API_PORT}/api/v1/register`, {
      name: username
    })
    .then(res => {
      console.log("Signup response ", res);
      dispatch(signupSuccessAction());
      dispatch(redirectTo('/login'));
    })
    .catch(err => {console.log(`Failed to signup err='${err}'`);dispatch(signupFailAction())});
}

// reducer
const initialState = {
  status: STATE_IDLE,
  username: ''
}
export const signupReducer = (state = initialState, action) => {
  switch(action.type) {
    case SIGN_UP_IDLE:
      return {
        ...state,
        status: STATE_IDLE,
      }
    case SIGN_UP_REQ: 
      return {
        ...state,
        status: STATE_IS_LOADING,
        username: action.payload.username,
      }
    case SIGN_UP_SUCCESS:
      return {
        ...state,
        status: STATE_SUCCESS_REGISTER,
      }
    case SIGN_UP_FAIL:
      return {
        ...state,
        status: STATE_FAILED_REGISTER,     
      }
    default:
      return state
  }
}

// Almomst Stateless Component
class SignupComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
    };
    this.buttonText = 'SIGN UP';
  }
  handleChange = (username) => {
    this.setState({username});
    if (this.props.status === STATE_FAILED_REGISTER) {
      // First change after a failed status 
      this.props.goToIdle();
    }
  };  
  shouldComponentUpdate(nextProps) {
    switch(nextProps.status) {
      case STATE_IDLE:
        this.buttonText = 'SIGN UP';
        break;
      case STATE_IS_LOADING:
        this.buttonText = 'Loading...';
        break;
      case STATE_SUCCESS_REGISTER:
        this.buttonText = nextProps.username; 
        break;
      case STATE_FAILED_REGISTER:
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
          <Form.Group size="lg" controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              autoFocus
              type="username"
              value={this.state.username}
              onChange={e => this.handleChange(e.target.value)}
            />
          </Form.Group>
          <Button className="btn btn-primary" block size="lg" onClick={() => this.props.signup(this.state.username)} >
            {this.buttonText}
          </Button>
        </Form>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    username: state.signup.username,
    status: state.signup.status
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
      signup: (username) => {dispatch(asyncSignup(username))},
      goToIdle: () => {dispatch(goToIdleAction())},
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(SignupComponent);
