import { useState } from "react";

export default function SearchForm({ onSearch }) {
  const [city, setCity] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const name = city.trim();
    if (name) onSearch(name);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="search"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City name, e.g. Riga"
        autoComplete="off"
        required
        minLength={2}
        aria-label="City name"
      />
      <button type="submit">Search</button>
    </form>
  );
}