import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();
/* eslint-disable import/first */ // enableFetchMocks must be called before others are imported
import {
  act, render, fireEvent, waitForElement,
} from '@testing-library/react';
import * as React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { navigate } from '@reach/router';
import SelectTerm from '../../components/LandingPage/SelectTerm/SelectTerm';
import autoSchedulerReducer from '../../redux/reducer';

// Mocks navigate, so we can assert that it redirected to the correct url for Redirects to /schedule
// This must be outside of all describes in order to function correctly
jest.mock('@reach/router', () => ({
  navigate: jest.fn(),
}));

// Mocks the fetch call to api/terms
const mockTermsAPI = (): void => {
  fetchMock.mockResponseOnce(JSON.stringify({
    'Fall 2020': '202031',
    'Summer 2020': '202021',
    'Spring 2020': '202011',
    'Fall 2019': '201931',
    'Summer 2019': '201921',
    'Spring 2019': '201911',
  }));
};


describe('SelectTerm', () => {
  beforeEach(mockTermsAPI);

  afterEach(fetchMock.mockRestore);

  describe('Menu opens', () => {
    test('Menu opens after button is clicked', async () => {
      // arrange
      const store = createStore(autoSchedulerReducer);

      let getByText: Function;
      await act(async () => {
        ({ getByText } = render(
          <Provider store={store}>
            <SelectTerm />
          </Provider>,
        ));
      });

      // act
      const button = getByText('Select Term');
      act(() => { fireEvent.click(button); });

      // assert
      expect(document.getElementsByClassName('MuiPopover-root')[0]).not.toHaveAttribute('aria-hidden');
    });
  });

  describe('Menu is closed', () => {
    test('on initialization', async () => {
      // arrange/act
      const store = createStore(autoSchedulerReducer);

      await act(async () => {
        render(
          <Provider store={store}>
            <SelectTerm />
          </Provider>,
        );
      });

      // assert
      expect(document.getElementsByClassName('MuiPopover-root')[0]).toHaveAttribute('aria-hidden');
    });
  });

  describe('Redirects to /schedule', () => {
    test('When term is selected', async () => {
      // arrange
      const store = createStore(autoSchedulerReducer);

      let getByText: Function;
      await act(async () => {
        ({ getByText } = render(
          <Provider store={store}>
            <SelectTerm />
          </Provider>,
        ));
      });

      // act
      const button = getByText('Select Term');
      act(() => { fireEvent.click(button); });
      // Wait for SelectTerm to finish rendering
      const testSemester = await waitForElement(() => getByText('Fall 2020'));
      act(() => { fireEvent.click(testSemester); });

      // assert
      // see jest.mock at top of the file
      expect(navigate).toHaveBeenCalledWith('/schedule');
    });
  });
});
