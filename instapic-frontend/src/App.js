import React from 'react';
import { Route, Switch } from 'react-router';
import MyNavbar from './features/Navbar';
import Auth from './features/Auth';
import SignUp from './features/Signup';
import Upload from './features/Upload';
import Login from './features/Login';
import Home from './features/Home';
import NotFound from './features/NotFound';
import Success from './features/SuccessUpload';

function AppComponent() {
  return (
    <div className="App">
      <Auth />
      <MyNavbar />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/home" component={Home} />
        <Route path="/signup" component={SignUp}/>
        <Route path="/login" component={Login}/>
        <Route path="/upload" component={Upload}/>
        <Route path="/success" component={Success}/>
        <Route path="*" component={NotFound}/>
      </Switch>
    </div>
  );
}

export default AppComponent;
