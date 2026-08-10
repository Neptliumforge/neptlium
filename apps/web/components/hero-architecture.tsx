export function HeroArchitecture() {
  return (
    <div
      className="hero-capital-form"
      aria-label="Capital converging into a governed operating center"
    >
      <div className="hero-form-meta hero-form-meta-top">
        <span>Capital inputs</span>
        <b>Observed</b>
      </div>

      <div className="hero-form-field" aria-hidden="true">
        <span className="hero-form-axis" />
        <span className="hero-form-line hero-form-line-a" />
        <span className="hero-form-line hero-form-line-b" />
        <span className="hero-form-line hero-form-line-c" />
        <span className="hero-form-line hero-form-line-d" />
        <span className="hero-form-orbit" />
        <span className="hero-form-core">
          <i />
        </span>
        <span className="hero-form-output" />
      </div>

      <ol className="hero-form-sequence">
        <li>
          <span>01</span> Observe
        </li>
        <li>
          <span>02</span> Organize
        </li>
        <li>
          <span>03</span> Govern
        </li>
        <li>
          <span>04</span> Resolve
        </li>
      </ol>

      <div className="hero-form-meta hero-form-meta-bottom">
        <span>Operating center</span>
        <b>NT / 01</b>
      </div>
    </div>
  );
}
