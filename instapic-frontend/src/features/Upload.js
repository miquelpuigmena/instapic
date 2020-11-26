import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
// front-end
import "./styles.css";
import util from 'util';
// constants
const UPLOAD_IDLE = "UPLOAD_IDLE";
const UPLOAD_REQ = "UPLOAD_REQ";
const UPLOAD_SUCCESS = "UPLOAD_SUCCESS";
const UPLOAD_FAIL = "UPLOAD_FAIL";
const STATE_IDLE = 1;
const STATE_IS_LOADING = 2;
const STATE_FAILED_UPLOAD = 3;
const STATE_SUCCESS_UPLOAD = 4;
// actions
const uploadAction = () => ({
  type: UPLOAD_REQ,
});
const uploadSuccessAction = () => ({
  type: UPLOAD_SUCCESS,
});
const uploadFailAction = () => ({
  type: UPLOAD_FAIL,
});
const goToIdleAction = () => ({
  type: UPLOAD_IDLE,
});
const redirectTo = (to) => dispatch => {
  dispatch(push(to));
};
// async action
const asyncUpload = (file, description, useCredentials) => dispatch => {
  try {
    dispatch(uploadAction());
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      }
    };
    axios
      .post(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/v1/upload`, 
        formData, 
        // not using credentials if in test and use credentials deactivated
        {withCredentials: useCredentials}, 
        config
      )
      .then(res => {
        dispatch(uploadSuccessAction());
        dispatch(redirectTo('/success'));
      })
      .catch(err => { console.log(`Failed to upload err='${err}'`); dispatch(uploadFailAction()); });
  } catch (err) {
    console.log(`Failed to upload err='${err}'`);
    dispatch(uploadFailAction());
  }

};
// reducer
const initialState = {
  status: STATE_IDLE,
};
export const uploadReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPLOAD_IDLE:
      return {
        status: STATE_IDLE,
      };
    case UPLOAD_REQ:
      return {
        status: STATE_IS_LOADING,
      };
    case UPLOAD_SUCCESS:
      return {
        status: STATE_SUCCESS_UPLOAD,
      };
    case UPLOAD_FAIL:
      return {
        status: STATE_FAILED_UPLOAD,
      };
    default:
      return state;
  }
};

// Almomst Stateless Component
class UploadComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filename: '',
      description: '',
      file: null,
    };
    this.useCredentials = (typeof this.props.useCredentials === 'undefined') ? true: this.props.useCredentials;
    this.buttonText = 'UPLOAD';
  }
  handleFileChange = (file) => {
    this.setState({ filename: file.name });
    this.setState({ file });
    if (this.props.status !== STATE_IS_LOADING) {
      // First change after a failed status 
      this.props.goToIdle();
    }
  };
  handleDescriptionChange = (description) => {
    console.log('new desc ', description);
    this.setState({ description });
    if (this.props.status !== STATE_IS_LOADING) {
      this.props.goToIdle();
    }
  };
  onFormSubmit = () => {
    if (this.state.file !== null && this.state.description !== ''){
      this.props.upload(this.state.file, this.state.description, this.useCredentials);
    }
  }
  shouldComponentUpdate(nextProps) {
    switch (nextProps.status) {
      case STATE_IDLE:
        this.buttonText = 'UPLOAD';
        break;
      case STATE_IS_LOADING:
        this.buttonText = 'Loading...';
        break;
      case STATE_SUCCESS_UPLOAD:
        this.buttonText = 'SUCCESS';
        break;
      case STATE_FAILED_UPLOAD:
        this.buttonText = 'FAILED';
        break;
      default:
        return false;
    }
    return true;
  };

  render() {
    return (
      <div>
        {this.props.isAuthed
          ? (
            <div>
              <h1>File Upload</h1>
              <input id="file-input" type="file" onChange={(e) => this.handleFileChange(e.target.files[0])} />
              <br></br>
              <br></br>
              <input id="description-input" type="text" placeholder="description" onChange={(e) => this.handleDescriptionChange(e.target.value)} />
              <br></br>
              <br></br>
              <Button id="button-upload" onClick={() => {this.onFormSubmit()}}>{this.buttonText}</Button>
            </div>
          )
          : <h1>Please <p onClick={() => this.props.redirectTo('/login')}>LOG IN</p> before coming home!</h1>}
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    isAuthed: state.auth.isAuthed,
    status: state.upload.status,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    upload: (file, description, useCredentials) => { dispatch(asyncUpload(file, description, useCredentials)); },
    goToIdle: () => { dispatch(goToIdleAction()); },
    redirectTo: (to) => { dispatch(push(to)); },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(UploadComponent);
