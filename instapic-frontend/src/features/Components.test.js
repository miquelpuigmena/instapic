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

describe('Unit testing components by checking usage flow', () => {
    describe('Sign Up workflow', () => {
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
            fireEvent.change(input, { target: { value: 'reap' } });
            expect(input.value).toBe('reap');
            expect(button.textContent).toBe('SIGN UP');
            fireEvent.click(button);
            expect(button.textContent).toBe('Loading...');
            await new Promise((r) => setTimeout(r, 500));
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
            fireEvent.change(input, { target: { value: 'reap' } });
            expect(input.value).toBe('reap');
            expect(button.textContent).toBe('SIGN UP');
            fireEvent.click(button);
            expect(button.textContent).toBe('Loading...');
            await new Promise((r) => setTimeout(r, 500));
            console.log(button.textContent);
            expect(button.textContent).toMatch(/^FAILED$/);
        });
    });

    describe('Log in workflow', () => {
        it('Should login a user', async () => {
            const {container} = render(
                <Provider store={store}>
                    <Login />
                </Provider>
                );
            const button = container.querySelector("#button-login");
            const inputGroup = container.querySelector("#input-group-login").childNodes;
            expect(inputGroup.length).toBe(2);
            const input = inputGroup[1];
            fireEvent.change(input, { target: { value: 'reap' } });
            expect(input.value).toBe('reap');
            expect(button.textContent).toBe('LOG IN');
            fireEvent.click(button);
            expect(button.textContent).toBe('Loading...');
            await new Promise((r) => setTimeout(r, 500));
            console.log(button.textContent);
            expect(button.textContent).toMatch(/^SUCCESS$/);
        });
        it('Should fail to login a user', async () => {
            const {container} = render(
                <Provider store={store}>
                    <Login />
                </Provider>
                );
            const button = container.querySelector("#button-login");
            const inputGroup = container.querySelector("#input-group-login").childNodes;
            expect(inputGroup.length).toBe(2);
            const input = inputGroup[1];
            fireEvent.change(input, { target: { value: 'reap-no-exist' } });
            expect(input.value).toBe('reap-no-exist');
            expect(button.textContent).toBe('LOG IN');
            fireEvent.click(button);
            expect(button.textContent).toBe('Loading...');
            await new Promise((r) => setTimeout(r, 500));
            console.log(button.textContent);
            expect(button.textContent).toMatch(/^SUCCESS$/);
        });
    });
    
    describe('Upload workflow', () => {
        it('Should upoad a file and description', async () => {
            const {container} = render(
                <Provider store={store}>
                    <Upload />
                </Provider>
                );
            const button = container.querySelector("#button-upload");
            const inputFile = container.querySelector("#file-input");
            const inputDesc = container.querySelector("#description-input");
            const file = new File(['my-picture.png'], './../test/reap.png', { type: 'image/png' })
            fireEvent.change(inputFile, { target: { file } });
            fireEvent.change(inputDesc, { target: { description: 'reap-test' }});
            expect(inputDesc.value).toBe('reap-test');
            console.log(inputFile.value);
            fireEvent.click(button);
            expect(button.textContent).toBe('Loading...');
            await new Promise((r) => setTimeout(r, 1000));
            expect(button.textContent).toMatch(/^SUCCESS$/);
        });
    });
    
});


