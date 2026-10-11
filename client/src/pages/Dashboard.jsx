
const features = [
  {
    icon: "🎯",
    title: "Career Matches",
    description: "Discover careers aligned with your interests.",
    page: "careers"
  },
  {
    icon: "📊",
    title: "My Skills",
    description: "Assess your strengths and skill levels.",
    page: "skills"
  },
  {
    icon: "🗺️",
    title: "Learning Roadmap",
    description: "Follow your personalized learning journey.",
    page: "roadmap"
  },
  {
    icon: "👤",
    title: "My Profile",
    description: "Manage your education and interests.",
    page: "profile"
  }
];

export default function Dashboard({ user, navigate }) {
  const firstName = user?.name?.trim()?.split(" ")[0] || "Learner";

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <span>YOUR CAREER JOURNEY</span>
        <h2>Welcome back, {firstName}!</h2>
        <p>
          Your career development starts here. Explore your
          recommendations, improve your skills and follow
          your personalized roadmap.
        </p>
        <button
          type="button"
          onClick={() => navigate("careers")}
        >
          Explore careers →
        </button>
      </section>

      <div className="dashboard-heading">
        <h3>Your career workspace</h3>
        <p>Choose what you would like to work on today.</p>
      </div>

      <div className="dashboard-grid">
        {features.map((feature) => (
          <button
            type="button"
            className="dashboard-feature"
            key={feature.page}
            onClick={() => navigate(feature.page)}
          >
            <span className="dashboard-feature-icon">
              {feature.icon}
            </span>
            <strong>{feature.title}</strong>
            <span>{feature.description}</span>
            <span className="dashboard-feature-link">
              Explore →
            </span>
          </button>
        ))}
      </div>

      <section className="dashboard-tip">
        <h3>💡 Your next step</h3>
        <p>
          Start by completing your profile and rating your
          current skills. CareerCompass can then use that
          information to generate more relevant recommendations.
        </p>
        <button
          type="button"
          onClick={() => navigate("profile")}
        >
          Update my profile →
        </button>
      </section>
    </div>
  );
}
