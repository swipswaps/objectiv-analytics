import { makeLinkContext, trackLinkClick, useTrackApplicationLoaded, useTracker } from "@objectiv/tracker-react";
import logo from './logo.svg';
import './App.css';

function App() {
  const tracker = useTracker();

  useTrackApplicationLoaded();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div
          className="App-link"
          onClick={
            () => trackLinkClick(makeLinkContext({id: 'test-link', href: '/', text: 'Track Link Click'}), tracker)
          }>
          Track Link Click
        </div>
      </header>
    </div>
  );
}

export default App;
