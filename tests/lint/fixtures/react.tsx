import { useEffect, useState } from "react";

export function Queue({ jobs, open }: { jobs: string[]; open: boolean }) {
  if (open) {
    const [count] = useState(0);
    console.info(count);
  }
  const [selected, setSelected] = useState(jobs[0]);
  useEffect(() => {
    setSelected(jobs[0]);
  }, []);
  return (
    <div>
      <img src="/avatar.png" />
      <div onClick={() => setSelected(undefined)}>{selected}</div>
      <button>Approve</button>
      {jobs.map((job, index) => (
        <span key={index}>{job}</span>
      ))}
    </div>
  );
}
