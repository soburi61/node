document.querySelectorAll('.increase-absences').forEach(button => {
    button.addEventListener('click', async (event) => {
      const subjectId = event.target.dataset.subjectId;
      const response = await fetch(`/increaseAbsences?subject_id=${subjectId}`);
      const data = await response.json();
      event.target.textContent = `欠課:${data.absences}`;
    });
  });

document.querySelectorAll('.increase-tardies').forEach(button => {
  button.addEventListener('click', async (event) => {
    const subjectId = event.target.dataset.subjectId;
    const response = await fetch(`/increaseTardies?subject_id=${subjectId}`);
    const data = await response.json();
    event.target.textContent = `遅刻:${data.tardies}`;
  });
});