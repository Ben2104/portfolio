import { experience } from "@/data/site";

export function Experience() {
  return (
    <section className="scr work-history" id="experience" aria-labelledby="experience-heading">
      <div className="wrap">
        <h2 className="lbl" id="experience-heading">Work experience</h2>
        <ol className="work-history__list">
          {experience.map((role) => (
            <li key={role.n}>
              <div>
                <p className="work-history__org">{role.org}</p>
                <h3>{role.role}</h3>
                <p className="work-history__dates">{role.when}</p>
              </div>
              <div className="work-history__detail">
                <p className="mono">{role.where}</p>
                <p className="lead">{role.text}</p>
                <ul>
                  {role.tags.map((tag) => <li className="tag" key={tag}>{tag}</li>)}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
