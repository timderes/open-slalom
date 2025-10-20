# GitHub Copilot Instructions

## Purpose

- Provide concise guidance for GitHub Copilot suggestions in this repository.
- Emphasize security, license compliance, and maintainable code.

## Tone & Style

- Keep suggestions clear, direct and neutral.
- Prefer idiomatic, well-tested patterns. Avoid overly clever or obscure solutions.
- Keep explanations short (1–2 sentences) and code snippets small.

## Expectations

- Follow existing repository style and conventions.
- Prefer simple, secure solutions over optimizations that reduce readability.
- When proposing APIs or breaking changes, include migration notes and tests.

## Security & Licensing

- Do not suggest code that exposes secrets, credentials, or sensitive infrastructure details.
- Avoid copying proprietary or unlicensed code. Cite sources when necessary and ensure licenses permit reuse.
- Flag potential security risks and propose safer alternatives.

## Format & Examples

- Provide small code snippets (max ~30 lines) with a 1–2 sentence rationale.
- If multiple approaches are useful, list numbered alternatives with brief pros/cons.
- Prefer examples that include tests or usage notes when relevant.

## Review & Workflow

- For non-trivial changes, create a PR with tests and CI passing before merging.
- If unsure, open an issue labeled `copilot:review` instead of committing changes directly.

## Changes

- This file defines expected Copilot behavior for this repo. Update by PR.

# Kartslalom (Jugendkart Slalom / Superkart Slalom)

## Jugendkart Slalom (JKS)

Jugendkart Slalom is a motorsport discipline for young drivers aged 7 to 23 years. Older drivers may participate in Class 7. It involves navigating a kart through a course marked by cones, focusing on precision and control rather than speed. The driver gets a penalty for hitting cones or not driving correctly through the course (e.g. skipping or incorrectly navigating a course element). The sport emphasizes skill development, safety, and sportsmanship.

### Penalties

- Hitting a cone: 2 seconds penalty
- Skipping a course element: 10 seconds penalty

### Elements

- Gate (a pair of cones to drive between)
- Gasse: Obstacle consisting of 3 to 5 pylons per side
- Schweizer Slalom: A row of individual upright pylons placed at intervals of four to ten meters
- Kreisel: The circle has an inner radius of 10 meters and must be driven completely at least once; the entrance width is 3 m, the exit and the circle use the standard gate width of 1.65 m
- Ypsilon: The driving line is split or merged.
- S-Gasse: Consists of three alleys with five cones per side each, arranged like the letter "S".
- Z-Gasse: Three parallel alleys spaced 2–4 meters apart. To move from one alley to another, the kart must be turned 180°.
- Kasten: Cones are arranged in a rectangle with two openings using the standard gate width. An optional variant added in 2017 is the double box/chicane, where two boxes are joined and must be driven through.
- Schneckenhaus: A combination of two tasks: an alley and an imaginary circle. This task is driven like a snail shell.
- Kreuz: Two driving lines cross each other.
- Brezel: The most complex in terms of driving technique. It looks like a mushroom with three openings.
- Deutsches Eck: A 90-degree corner that is slightly eased on the inside like the Brezel.
  normales Eck: (angular or rounded) A 90-degree corner consisting of six cones.
- Wende: A task where three cones stand directly next to each other and a 180° or 90° turn is performed. If all three cones fall, the fault is still scored as if only one cone fell. The organizer must either require or allow which direction the turn is taken.
- Wechseltor: This task consists of two cone gates driven immediately one after the other. The cones of the Wechseltor are in a straight line. The distance between the gates is at least 1.5 m and at most 4 m.
- "Das Z": A task made up of three alleys and a turn. The alleys are arranged in the shape of the letter "Z". Between the alleys there is a turn that is driven once by 235°.

### Karts

- 6.5 PS four-stroke engines

### Classes

- Class 0: Age 7, (Bambini Kart, only in North-Rhine Westphalia)
- Class 1: Age 8-9
- Class 2: Age 10-11
- Class 3: Age 12-13
- Class 4: Age 14-15
- Class 5: Age 16-18
- Class 6: Age 19-23
- Class 7: Age 19 and older (Adults, "Trainer" class)

## Superkart Slalom (SKS)

Superkart Slalom (in some parts also 270er-Kartslalom) is a simliar to Jugendkart Slalom. The elements are placed further apart (10 to 20 meters) and the karts have more power, making it suitable for older and more experienced drivers.

### Penalties

- Hitting a cone: 3 second penalty
- Skipping a course element: 10 second penalty

### Classes

- Class 1: Age 12-14 years
- Class 2: Age 15-17 years
- Class 3: Age 18-20 years
- Class 4: Age 21-30 years

### Karts

- 9 PS four-stroke engines
