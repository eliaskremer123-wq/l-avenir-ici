import LavenirExperience from "./components/LavenirExperience";

export default function Home() {
  return (
    <>
      <style>{`
        body,
        .experience-backdrop__base {
          background-color: #0f172a;
        }
      `}</style>
      <LavenirExperience />
    </>
  );
}
