import React from "react";
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from './store';

import Home from './Home';
import SignUp from './Signup';
import Login from './Login';
import Upload from './Upload';
import Navbar from './Navbar';
import NotFound from './NotFound';
import SuccessUpload from './SuccessUpload';

// Mount tests on Container
let container = null;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
});

afterEach(() => {
    // cleanup on exiting
    container.remove();
    container = null;
});
// Don't show errors from console
// console.error = jest.fn();
describe('Unit testing each component by rendering', () => {
    describe('It renders correctly', () => {
        // Simple components which only intention is to render
        //  Home, NotFound, SuccessUpload
        it('Should render Home', () => {
            const {container} = render(
                <Provider store={store}>
                    <Home />
                </Provider>
                );
            // Home with no authenticated user
            expect(container.textContent).toContain('before coming home!');
        });
        it('Should render NotFound', () => {
            const {container} = render(
                <Provider store={store}>
                    <NotFound />
                </Provider>
                );
            expect(container.textContent).toBe('Not Found');
        });
        it('Should render SuccessUpload', () => {
            const {container} = render(
                <Provider store={store}>
                    <SuccessUpload />
                </Provider>
                );
            expect(container.textContent).toBe('Successfully uploaded file!');
        });
        it('Should render Navbar', () => {
            const {container} = render(
                <Provider store={store}>
                    <Navbar />
                </Provider>
                );
            expect(container.querySelector("#basic-navbar-brand").textContent).toBe('Reap - InstaPic');
        });
        it('Should render SignUp', () => {
            const {container} = render(
                <Provider store={store}>
                    <SignUp />
                </Provider>
                );
            expect(container.querySelector("#button-signup").textContent).toBe('SIGN UP');
        });
        it('Should render Login', () => {
            const {container} = render(
                <Provider store={store}>
                    <Login />
                </Provider>
                );
            expect(container.querySelector("#button-login").textContent).toBe('LOG IN');
        });
        it('Should render Upload', () => {
            const {container} = render(
                <Provider store={store}>
                    <Upload />
                </Provider>
                );
            // Upload with no user logged in
            expect(container.textContent).toContain('before coming home!');
        });
    });
});

describe('Unit && integration testing components by checking usage flow', () => {
    describe('UnitTest: Navbar', () => {
        it('Should click buttons', () => {
            const {container} = render(
                <Provider store={store}>
                    <Navbar />
                </Provider>
                );
                
            const buttonLogin = container.querySelector("#navbar-log-in");
            fireEvent.click(buttonLogin);
            expect(buttonLogin.value).toBe('Log in');
            const buttonSignup = container.querySelector("#navbar-sign-up");
            fireEvent.click(buttonSignup);
            expect(buttonSignup.value).toBe('Sign Up');
            const buttonUpload = container.querySelector("#basic-navbar-nav-upload");
            fireEvent.click(buttonUpload);
            expect(buttonUpload.value).toBe('Upload!');
            expect(container.querySelector("#basic-navbar-brand").textContent).toBe('Reap - InstaPic');
        });
    });
    
    describe('UnitTest: Sign Up workflow', () => {
        it('Should register a new user', async () => {
            const {container} = render(
                <Provider store={store}>
                    <SignUp />
                </Provider>
                );
            const button = container.querySelector("#button-signup");
            const inputGroup = container.querySelector("#input-group-signup").childNodes;
            expect(inputGroup.length).toBe(2);
            const input = inputGroup[1];
            fireEvent.change(input, { target: { value: 'reap-signup1' } });
            expect(input.value).toBe('reap-signup1');
            expect(button.textContent).toBe('SIGN UP');
            fireEvent.click(button);
            expect(button.textContent).toBe('Loading...');
            await new Promise((r) => setTimeout(r, 1000));
            expect(button.textContent).toMatch(/^SUCCESS$/);
        });
        it('Should fail to register a new user (duplicate user)', async () => {
            const {container} = render(
                <Provider store={store}>
                    <SignUp />
                </Provider>
                );
            const button = container.querySelector("#button-signup");
            const inputGroup = container.querySelector("#input-group-signup").childNodes;
            expect(inputGroup.length).toBe(2);
            const input = inputGroup[1];
            fireEvent.change(input, { target: { value: 'reap-signup2' } });
            expect(input.value).toBe('reap-signup2');
            expect(button.textContent).toBe('SIGN UP');
            fireEvent.click(button);
            expect(button.textContent).toBe('Loading...');
            await new Promise((r) => setTimeout(r, 1000));
            console.log(button.textContent);
            expect(button.textContent).toMatch(/^SUCCESS$/);
            // repeat same signup!
            fireEvent.change(input, { target: { value: 'reap-signup2' } });
            expect(input.value).toBe('reap-signup2');
            fireEvent.click(button);
            expect(button.textContent).toBe('Loading...');
            await new Promise((r) => setTimeout(r, 1000));
            console.log(button.textContent);
            expect(button.textContent).toMatch(/^FAILED$/);
        });
    });

    describe('IntegrationTest: Log in workflow', () => {
        it('Should login a user', async () => {
            // Register
            const {container} = render(
                <Provider store={store}>
                    <SignUp />
                    <Login />
                </Provider>
            );
            const buttonSignup = container.querySelector("#button-signup");
            const inputGroupSignup = container.querySelector("#input-group-signup").childNodes;
            expect(inputGroupSignup.length).toBe(2);
            const inputSignup = inputGroupSignup[1];
            fireEvent.change(inputSignup, { target: { value: 'reap-login1' } });
            expect(inputSignup.value).toBe('reap-login1');
            expect(buttonSignup.textContent).toBe('SIGN UP');
            fireEvent.click(buttonSignup);
            expect(buttonSignup.textContent).toBe('Loading...');
            await new Promise((r) => setTimeout(r, 1000));
            expect(buttonSignup.textContent).toMatch(/^SUCCESS$/);

            // login
            const button = container.querySelector("#button-login");
            const inputGroup = container.querySelector("#input-group-login").childNodes;
            expect(inputGroup.length).toBe(2);
            const input = inputGroup[1];
            fireEvent.change(input, { target: { value: 'reap-login1' } });
            expect(input.value).toBe('reap-login1');
            expect(button.textContent).toBe('LOG IN');
            fireEvent.click(button);
            expect(button.textContent).toBe('Loading...');
            await new Promise((r) => setTimeout(r, 1000));
            expect(button.textContent).toMatch(/^SUCCESS$/);
        });
        it('Should fail to login a user  (user not registered)', async () => {
            // login non registered user
            const {container} = render(
                <Provider store={store}>
                    <Login />
                </Provider>
                );
            const button = container.querySelector("#button-login");
            const inputGroup = container.querySelector("#input-group-login").childNodes;
            expect(inputGroup.length).toBe(2);
            const input = inputGroup[1];
            fireEvent.change(input, { target: { value: 'reap-no-exist1' } });
            expect(input.value).toBe('reap-no-exist1');
            expect(button.textContent).toBe('LOG IN');
            fireEvent.click(button);
            expect(button.textContent).toBe('Loading...');
            await new Promise((r) => setTimeout(r, 1000));
            expect(button.textContent).toMatch(/^FAILED$/);
        });
    });
    
    describe('IntegrationTest: Upload workflow', () => {
        it('Should fail to upload a file and description (no auth provided)', async () => {
            // Register
            const {container} = render(
                <Provider store={store}>
                    <SignUp />
                    <Login />
                    <Upload />
                </Provider>
            );
            const buttonSignup = container.querySelector("#button-signup");
            const inputGroupSignup = container.querySelector("#input-group-signup").childNodes;
            expect(inputGroupSignup.length).toBe(2);
            const inputSignup = inputGroupSignup[1];
            fireEvent.change(inputSignup, { target: { value: 'reap-upload1' } });
            expect(inputSignup.value).toBe('reap-upload1');
            expect(buttonSignup.textContent).toBe('SIGN UP');
            fireEvent.click(buttonSignup);
            expect(buttonSignup.textContent).toBe('Loading...');
            await new Promise((r) => setTimeout(r, 1000));
            expect(buttonSignup.textContent).toMatch(/^SUCCESS$/);

            // login
            const button = container.querySelector("#button-login");
            const inputGroup = container.querySelector("#input-group-login").childNodes;
            expect(inputGroup.length).toBe(2);
            const input = inputGroup[1];
            fireEvent.change(input, { target: { value: 'reap-upload1' } });
            expect(input.value).toBe('reap-upload1');
            expect(button.textContent).toBe('LOG IN');
            fireEvent.click(button);
            expect(button.textContent).toBe('Loading...');
            await new Promise((r) => setTimeout(r, 1000));
            expect(button.textContent).toMatch(/^SUCCESS$/);

            

            // // upload
            // const button = container.querySelector("#button-upload");
            // const inputFile = container.querySelector("#file-input");
            // const inputDesc = container.querySelector("#description-input");
            // const file = new File(['my-picture.png'], './../test/reap.png', { type: 'image/png' })
            // fireEvent.change(inputFile, { target: { file } });
            // fireEvent.change(inputDesc, { target: { description: 'reap-upload1-description' }});
            // expect(inputDesc.value).toBe('reap-upload1-description');
            // fireEvent.click(button);
            // expect(button.textContent).toBe('Loading...');
            // await new Promise((r) => setTimeout(r, 1000));
            // expect(button.textContent).toMatch(/^FAILED$/);
        });
    });
    
});


