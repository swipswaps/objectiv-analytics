import { makeLinkContext, trackLinkClick, useTrackApplicationLoaded, useTracker } from "@objectiv/tracker-react";
import './App.css';

function App() {
  const tracker = useTracker();

  useTrackApplicationLoaded();

  return (
    <div className="App">
      <header className="App-header">
        <div
          className="App-link"
          onClick={
            () => trackLinkClick(makeLinkContext({id: 'test-link', href: '/', text: 'Track 1 Link Click'}), tracker)
          }>
          Track 1 Link Click
        </div>

        <br />

        <div
          className="App-link"
          onClick={
            () => {
              Array.from(Array(55)).forEach((x, i) => trackLinkClick(makeLinkContext({id: 'test-link', href: '/', text: 'Track 55 Link Click'}), tracker));
            }
          }>
          Track 55 Link Click
        </div>

      </header>
    </div>
  );
}

export default App;
