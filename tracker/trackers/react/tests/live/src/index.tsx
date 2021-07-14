import { createServer } from "miragejs"
import { ReactTracker, TrackerContextProvider } from '@objectiv/tracker-react';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Fake the whole backend with Mirage
let server = createServer({})
server.post("/endpoint")

const tracker = new ReactTracker({ endpoint: '/endpoint' });

console.log(tracker);

ReactDOM.render(
  <React.StrictMode>
    <TrackerContextProvider tracker={tracker}>
      <App />
    </TrackerContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
