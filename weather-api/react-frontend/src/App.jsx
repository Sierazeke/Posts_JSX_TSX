import { useRef, useState } from "react";
import { getJSON } from "./api";
import SearchForm from "./components/SearchForm";
import Weather from "./components/Weather";

const IDLE = { text: "", error: false };
const placeLabel = (r) => [r.name, r.admin1, r.country].filter(Boolean).join(", ");

export default function App() {
  const [matches, setMatches] = useState([]);
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState(IDLE);
  const [loading, setLoading] = useState(false);
  const latestRequest = useRef(0); 

  // Runs one async job; the shared loading/error/stale logic lives here.
  async function run(loadingText, job) {
    const id = ++latestRequest.current;
    const isCurrent = () => id === latestRequest.current;

    setMatches([]);
    setStatus({ text: loadingText, error: false });
    setLoading(true);
    try {
      await job(isCurrent);
    } catch (err) {
      if (isCurrent()) setStatus({ text: err.message, error: true });
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }

  async function fetchWeather(place, isCurrent) {
    const data = await getJSON("/weather", {
      lat: place.latitude,
      lon: place.longitude,
    });
    if (!isCurrent()) return;
    setWeather({ place, data });
    setStatus(IDLE);
  }

  const loadWeather = (place) =>
    run("Loading forecast…", (isCurrent) => fetchWeather(place, isCurrent));

  const handleSearch = (name) =>
    run("Searching…", async (isCurrent) => {
      setWeather(null);
      const { results = [] } = await getJSON("/geocode", { name });
      if (!isCurrent()) return;

      if (results.length === 0) {
        setStatus({ text: "No city found. Check the spelling.", error: true });
      } else if (results.length === 1) {
        setStatus({ text: "Loading forecast…", error: false });
        await fetchWeather(results[0], isCurrent); // same job, same id
      } else {
        setMatches(results);
        setStatus({ text: "Pick a location:", error: false });
      }
    });

  return (
    <main>
      <h1>Weather</h1>
      <SearchForm onSearch={handleSearch} />

      {loading && <div className="loader" role="progressbar" aria-label="Loading data" />}

      <ul id="matches">
        {matches.map((r) => (
          <li key={r.id}>
            <button type="button" onClick={() => loadWeather(r)}>
              {placeLabel(r)}
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