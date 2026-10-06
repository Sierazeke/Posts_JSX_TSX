import { useRef, useState } from "react";
import { getJSON } from "./api";
import SearchForm from "./components/SearchForm";
import Weather from "./components/Weather";

export default function App() {
  const [matches, setMatches] = useState([]);
  const [weather, setWeather] = useState(null); // { place, data }
  const [status, setStatus] = useState({ text: "", error: false });
  const [loading, setLoading] = useState(false);
  const latestRequest = useRef(0); // only the newest request may update the UI

  async function loadWeather(place) {
    const id = ++latestRequest.current;
    setMatches([]);
    setStatus({ text: "Loading forecast…", error: false });
    setLoading(true);
    try {
      const data = await getJSON("/weather", {
        lat: place.latitude,
        lon: place.longitude,
      });
      if (id !== latestRequest.current) return;
      setWeather({ place, data });
      setStatus({ text: "", error: false });
    } catch (err) {
      if (id === latestRequest.current) setStatus({ text: err.message, error: true });
    } finally {
      if (id === latestRequest.current) setLoading(false);
    }
  }

  async function handleSearch(name) {
    const id = ++latestRequest.current;
    setMatches([]);
    setWeather(null);
    setStatus({ text: "Searching…", error: false });
    setLoading(true);
    try {
      const { results = [] } = await getJSON("/geocode", { name });
      if (id !== latestRequest.current) return;

      if (!results.length) {
        setStatus({ text: "No city found. Check the spelling.", error: true });
      } else if (results.length === 1) {
        await loadWeather(results[0]); // takes over loading state itself
      } else {
        setMatches(results);
        setStatus({ text: "Pick a location:", error: false });
      }
    } catch (err) {
      if (id === latestRequest.current) setStatus({ text: err.message, error: true });
    } finally {
      if (id === latestRequest.current) setLoading(false);
    }
  }

  return (
    <main>
      <h1>Weather</h1>
      <SearchForm onSearch={handleSearch} />

      {loading && <div className="loader" role="progressbar" aria-label="Loading data" />}

      <ul id="matches">
        {matches.map((r) => (
          <li key={r.id}>
            <button type="button" onClick={() => loadWeather(r)}>
              {[r.name, r.admin1, r.country].filter(Boolean).join(", ")}
            </button>
          </li>
        ))}
      </ul>

      <p id="status" role="status" className={status.error ? "error" : ""}>
        {status.text}
      </p>

      {weather && <Weather place={weather.place} data={weather.data} />}
    </main>
  );
}