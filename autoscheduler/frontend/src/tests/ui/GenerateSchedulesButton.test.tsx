import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

/* eslint-disable import/first */ // enableFetchMocks must be called before others are imported
import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import GenerateSchedulesButton from '../../components/SchedulingPage/GenerateSchedulesButton/GenerateSchedulesButton';
import autoSchedulerReducer from '../../redux/reducer';
import { updateCourseCard } from '../../redux/actions/courseCards';
import { SectionFilter, SectionSelected } from '../../types/CourseCardOptions';
import testFetch from '../testData';
import { GenerateSchedulesResponse } from '../../types/APIResponses';
import { errorGeneratingSchedulesMessage } from '../../redux/actions/schedules';
import setTerm from '../../redux/actions/term';

describe('Generate Schedules Button component', () => {
  beforeEach(fetchMock.mockReset);

  describe('makes an API call', () => {
    test('when the user clicks Fetch Schedules', () => {
      // arrange
      fetchMock.mockOnce('[]');

      const store = createStore(autoSchedulerReducer, applyMiddleware(thunk));
      const { getByText } = render(
        <Provider store={store}>
          <GenerateSchedulesButton />
        </Provider>,
      );

      // act
      fireEvent.click(getByText('Generate Schedules'));

      // assert
      expect(fetchMock).toBeCalledWith('scheduler/generate', expect.any(Object));
    });
  });

  describe('shows a loading spinner', () => {
    test('when the user clicks Fetch Schedules', async () => {
      // arrange
      const store = createStore(autoSchedulerReducer, applyMiddleware(thunk));
      const { getByText, findByRole } = render(
        <Provider store={store}>
          <GenerateSchedulesButton />
        </Provider>,
      );

      fetchMock.mockImplementation((): Promise<Response> => new Promise(
        (resolve) => setTimeout(resolve, 500, {
          json: (): any[] => [],
        }),
      ));

      // act
      fireEvent.click(getByText('Generate Schedules'));
      const loadingSpinner = await findByRole('progressbar');

      // assert
      expect(loadingSpinner).toBeInTheDocument();
    });
  });

  describe('Clicking generate schedules', () => {
    test('Sends a list of section numbers when customization level is Section', async () => {
      // arrange
      const store = createStore(autoSchedulerReducer, applyMiddleware(thunk));

      // Set the current term, as updateCourseCard will not go through if the term in the
      // store is undefined due to term mismatch checking
      const term = '201931';
      store.dispatch(setTerm(term));

      fetchMock.mockImplementationOnce(testFetch); // Mock api/sections
      store.dispatch<any>(updateCourseCard(0, {
        honors: SectionFilter.NO_PREFERENCE,
        remote: SectionFilter.NO_PREFERENCE,
        asynchronous: SectionFilter.EXCLUDE,
        course: 'CSCE 121',
      }, term));
      const { getByText } = render(
        <Provider store={store}>
          <GenerateSchedulesButton />
        </Provider>,
      );

      // Doesn't need to return anything valid
      fetchMock.mockOnce('[]'); // mocks scheduler/generate call

      const getCardSections = (): SectionSelected[] => (
        store.getState().termData.courseCards[0].sections
      );
      // wait for Redux to fill in sections
      await waitFor(() => expect(getCardSections()).not.toHaveLength(0));

      // Make all of the sections selected
      store.dispatch<any>(updateCourseCard(0, {
        sections: getCardSections().map((sec) => ({
          section: sec.section,
          selected: true,
          meetings: sec.meetings,
        })),
      }));

      // act
      fireEvent.click(getByText('Generate Schedules'));

      // second call is the /scheduler/generate call. Second index of that call is the body
      const { body } = fetchMock.mock.calls[1][1]; // Body is returned as a "blob"
      // Convert the body into a string, parse it into an object,
      // then get the honors & remote fields
      const { courses } = JSON.parse(body.toString());

      // assert
      expect(courses[0].sections).toEqual(['501']);
    });

    test('Does not send honors and remote', async () => {
      // NOTE: honors and remote mean something different to the backend, they were originally
      // used for the basic customization level. This functionality still exists but for proper
      // behavior with how we're currently sending data, they shouldn't be used.

      // arrange
      const store = createStore(autoSchedulerReducer, applyMiddleware(thunk));

      // Set the current term, as updateCourseCard will not go through if the term in the
      // store is undefined due to term mismatch checking
      const term = '201931';
      store.dispatch(setTerm(term));

      const { getByText } = render(
        <Provider store={store}>
          <GenerateSchedulesButton />
        </Provider>,
      );

      fetchMock.mockImplementationOnce(testFetch); // Mock api/sections
      // Doesn't need to return anything valid
      fetchMock.mockOnce('[]'); // mocks scheduler/generate call

      store.dispatch<any>(updateCourseCard(0, {
        honors: SectionFilter.NO_PREFERENCE,
        remote: SectionFilter.NO_PREFERENCE,
        asynchronous: SectionFilter.EXCLUDE,
        course: 'CSCE 121',
      }, term));

      const cardSections = store.getState().termData.courseCards[0].sections;

      // Make all of the sections selected
      store.dispatch<any>(updateCourseCard(0, {
        sections: cardSections.map((sec) => ({
          section: sec.section,
          selected: true,
          meetings: sec.meetings,
        })),
      }));

      // act
      await new Promise(setImmediate);
      fireEvent.click(getByText('Generate Schedules'));

      // second call is the /scheduler/generate call. Second index of that call is the body
      const { body } = fetchMock.mock.calls[1][1]; // Body is returned as a "blob"
      // Convert the body into a string, parse it into an object,
      // then get the honors & remote fields
      const { courses } = JSON.parse(body.toString());
      const { honors, remote } = courses[0];

      // assert
      // no_preference is the default value
      expect(remote).toEqual(SectionFilter.NO_PREFERENCE);
      expect(honors).toEqual(SectionFilter.NO_PREFERENCE);
    });

    test('only sends selected sections that match the current filters', async () => {
      // arrange
      const store = createStore(autoSchedulerReducer, applyMiddleware(thunk));

      // Set the current term, as updateCourseCard will not go through if the term in the
      // store is undefined due to term mismatch checking
      const term = '201931';
      store.dispatch(setTerm(term));

      const { getByText } = render(
        <Provider store={store}>
          <GenerateSchedulesButton />
        </Provider>,
      );

      fetchMock.mockImplementationOnce(testFetch); // Mock api/sections
      // Doesn't need to return anything valid
      fetchMock.mockOnce('[]'); // mocks scheduler/generate call

      store.dispatch<any>(updateCourseCard(0, {
        honors: SectionFilter.ONLY,
        remote: SectionFilter.EXCLUDE,
        asynchronous: SectionFilter.ONLY,
        mcallen: SectionFilter.EXCLUDE,
        // Add a selected section so its added to selectedSections internally
        course: 'CSCE 121',
      }, term));

      const cardSections = store.getState().termData.courseCards[0].sections;

      // Make all of the sections selected
      store.dispatch<any>(updateCourseCard(0, {
        sections: cardSections.map((sec) => ({
          section: sec.section,
          selected: true,
          meetings: sec.meetings,
        })),
      }));

      // act
      await new Promise(setImmediate);
      fireEvent.click(getByText('Generate Schedules'));

      // second call is the /scheduler/generate call. Second index of that call is the body
      const { body } = fetchMock.mock.calls[1][1]; // Body is returned as a "blob"
      // Convert the body into a string, parse it into an object,
      // then get the honors & remote fields
      const { courses } = JSON.parse(body.toString());
      const { sections } = courses[0];

      // assert
      expect(sections).toEqual(['502']);
    });
  });

  describe('shows an error snackbar', () => {
    test('when the backend returns no schedules', async () => {
      // arrange
      const store = createStore(autoSchedulerReducer, applyMiddleware(thunk));
      const { getByText, findByText } = render(
        <Provider store={store}>
          <GenerateSchedulesButton />
        </Provider>,
      );

      fetchMock.mockResponseOnce(JSON.stringify([]));

      // act
      fireEvent.click(getByText('Generate Schedules'));
      const errorMessage = await findByText(errorGeneratingSchedulesMessage);

      // assert
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('does not show an error snackbar', () => {
    test('when the backend returns schedules', async () => {
      // arrange
      const store = createStore(autoSchedulerReducer, applyMiddleware(thunk));
      const { queryByText, findByRole } = render(
        <Provider store={store}>
          <GenerateSchedulesButton />
        </Provider>,
      );

      const mockedResponse: GenerateSchedulesResponse = {
        schedules: [[], []],
        message: '',
      };
      fetchMock.mockResponseOnce(JSON.stringify(mockedResponse));

      // act
      fireEvent.click(queryByText('Generate Schedules'));
      await findByRole('progressbar');
      const errorMessage = queryByText('No schedules found. Try widening your criteria.');
      // finish all running promises
      await new Promise(setImmediate);

      // assert
      expect(errorMessage).not.toBeInTheDocument();
    });
  });
});
