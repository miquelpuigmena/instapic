import React from 'react';
import {connect} from 'react-redux';
import { push } from 'connected-react-router';
import {Link} from 'react-router-dom';

function HomeComponent(props)  {
    return (
        <div>
        {props.isAuthed
        ? <h1>Welcome Home {props.username}!</h1>
        :  <h1>Please <Link onClick={() => {props.redirectTo('login')}}>LOG IN</Link> before coming home!</h1>}
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
      username: state.auth.username,
      isAuthed: state.auth.isAuthed,
    }
  }
const mapDispatchToProps = (dispatch) => {
  return {
    redirectTo: (to) => {dispatch(push(to))},
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(HomeComponent);

