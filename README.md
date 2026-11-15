# Stratus: AWS Cloud Practitioner (CLF-C02) study platform

Static site in plain HTML/CSS/JS. There is no build step and no dependencies.

## Run it

Option 1 (simplest): double-click `index.html`, or from a terminal:

    ./run.sh

Option 2 (local web server, http://localhost:8341):

    ./run.sh serve

Stop the server with Ctrl+C. On macOS, if `python3 -m http.server` gives a
PermissionError inside Documents, use Option 1 or copy the folder elsewhere.

## Progress and reset

Progress is stored in the browser's localStorage (key `stratus.clf-c02.v1`),
so it survives closing the tab. It is per browser and per origin: `file://`
and `http://localhost:8341` keep separate progress. Use the app's reset button
to clear it.

## Validate content

Open `tools/validate.html` in the browser (or via `./run.sh serve`).

## Contents

- 10 lectures (`data/lectures/m01.js` to `m10.js`), each with ELI5, stories, diagrams,
  comparison tables, memory hooks, exam tips, traps, recall prompts and knowledge checks.
- 10 module quizzes of 30 questions each (15 definition + 15 situational).
- Section A: 50 Clean Notes questions. Section B: 45 Knowledge Check + Slido questions.
- Section C: 120-question Final Boss (60 definition + 60 situational, weighted by CLF-C02
  domain: 29 / 36 / 41 / 14), with Practice and timed Exam Simulation modes.
- 515 questions in total. `tools/validate.html` checks counts, schema and lecture completeness.
