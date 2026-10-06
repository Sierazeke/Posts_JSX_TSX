import { describe, deg } from "../utils";

function Current({ place, current: c }) {
  return (
    <div className="now">
      <div className="temp">{deg(c.temperature_2m)}</div>
      <div>
        <div>{[place.name, place.country].filter(Boolean).join(", ")}</div>
        <div className="meta">{describe(c.weather_code)}</div>
        <div className="meta">
          Feels like {deg(c.apparent_temperature)} · Wind{" "}
          {Math.round(c.wind_speed_10m)} km/h · Humidity {c.relative_humidity_2m}%
        </div>
      </div>
    </div>
  );
}

function Hourly({ hourly: h, currentTime }) {
  // times are local strings like "2026-10-06T13:00"
  let start = h.time.findIndex((t) => t >= currentTime.slice(0, 13) + ":00");
  if (start < 0) start = 0;
  const indexes = h.time.slice(start, start + 24).map((_, i) => start + i);

  return (
    <div className="hours">
      {indexes.map((i) => (
        <div className="hour" key={h.time[i]}>
          <span>{h.time[i].slice(11, 16)}</span>
          <b>{deg(h.temperature_2m[i])}</b>
          <span className="meta">{h.precipitation_probability[i] ?? 0}% rain</span>
        </div>
      ))}
    </div>
  );
}

function Daily({ daily: d }) {
  return (
    <div>
      {d.time.map((date, i) => (
        <div className="day" key={date}>
          <span>
            {new Date(date + "T00:00").toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
          <span className="meta">
            {describe(d.weather_code[i])} · {d.precipitation_sum[i]} mm
          </span>
          <span className="rng">
            {deg(d.temperature_2m_min[i])} / {deg(d.temperature_2m_max[i])}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Weather({ place, data }) {
  return (
    <section>
      <Current place={place} current={data.current} />
      <h2>Next 24 hours</h2>
      <Hourly hourly={data.hourly} currentTime={data.current.time} />
      <h2>7 days</h2>
      <Daily daily={data.daily} />
    </section>
  );
}