import React from 'react';
import {connect} from 'react-redux';

// Const actions
const AUTH = "AUTH";
const DEAUTH = "DEAUTH";

// actions
export const authAction = (username) => ({
    type: AUTH,
    payload: {username}
});
export const deauthAction = () => ({
    type: DEAUTH,
});

// reducer
const initialState = {
    isAuthed: false,
    username: '',
}
export const authReducer = (state = initialState, action) => {
    switch(action.type) {
        case AUTH:
            return {
                isAuthed: true,
                username: action.payload.username,
            }
        case DEAUTH: 
            return {
                isAuthed: false,
                username: '',
            }
        default:
            return state
    }
};

function AuthComponent(){
    return(<></>);
}
export default connect(null, null)(AuthComponent);



