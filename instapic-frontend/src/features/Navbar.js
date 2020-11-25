import {connect} from 'react-redux';
import { push } from 'connected-react-router';
import {deauthAction} from './Auth';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';


function MyNavbar(props) {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
            <Navbar.Brand color="#FFFF00" onClick={() => props.redirectTo('/home')}>Reap - InstaPic</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link onClick={() => props.redirectTo('/upload')}>Upload!</Nav.Link>
                </Nav>
                <Nav className="ml-auto">
                    {props.isAuthed
                        ?   (<><Nav.Link style={{color: '#FFFF00'}}>Welcome {props.username}</Nav.Link>
                            <Nav.Link onClick={() => {props.logOut(); props.redirectTo('/login');}}>Log Out</Nav.Link></>)
                        :   (<><Nav.Link onClick={() => props.redirectTo('/login')}>Log in</Nav.Link>
                            <Nav.Link onClick={() => props.redirectTo('/signup')}>Sign Up</Nav.Link></>)
                    }
                </Nav>
            </Navbar.Collapse>
        </Navbar>
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
        logOut: () => {dispatch(deauthAction())},
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(MyNavbar);
