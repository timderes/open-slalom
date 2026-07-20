# AGENTS.md

# Project Instructions

This file provides repository-wide instructions for AI coding assistants and autonomous agents working on this project.

These instructions apply to all files in the repository unless more specific instructions are provided elsewhere.

---

# Project

This project is about **Kartslalom**, including both:

- **Jugendkart Slalom (JKS)**
- **Superkart Slalom (SKS)**

The application should use the official terminology and rules whenever possible.

When uncertain about motorsport terminology, prefer the definitions in this document over general internet knowledge.

---

# Goals

When making changes:

- Preserve correctness over cleverness.
- Prefer readability over micro-optimizations.
- Keep the codebase easy to maintain.
- Avoid unnecessary complexity.
- Integrate naturally with the existing architecture.

---

# Coding Guidelines

## General

- Follow the existing coding style.
- Keep functions focused and reasonably small.
- Prefer composition over duplication.
- Use meaningful names.
- Remove dead code when encountered.
- Do not introduce unnecessary abstractions.

## Changes

When implementing features:

- Make the smallest reasonable change.
- Avoid unrelated refactoring.
- Preserve backwards compatibility unless explicitly requested.
- Mention breaking changes when unavoidable.

## Documentation

Update documentation whenever behavior, configuration or APIs change.

Document non-obvious decisions directly in the code when appropriate.

---

# Testing

For non-trivial changes:

- Add or update tests.
- Ensure existing tests continue to pass.
- Consider edge cases.
- Prefer deterministic tests.

---

# Security

Never:

- expose secrets
- hardcode credentials
- introduce insecure defaults
- bypass authentication or authorization
- ignore obvious security issues

Prefer secure defaults whenever possible.

---

# Dependencies

Before adding new dependencies:

- Prefer the standard library when sufficient.
- Reuse existing project dependencies.
- Avoid large dependencies for small problems.
- Keep the dependency graph simple.

---

# Performance

Optimize only when justified.

Prefer:

- readable code
- correct algorithms
- maintainable implementations

Avoid premature optimization.

---

# Code Style

Prefer:

- descriptive variable names
- explicit logic
- small reusable functions
- consistent formatting

Avoid:

- deeply nested logic
- magic numbers
- duplicated code
- unnecessary comments explaining obvious code
- Unreadable or hard-to-read code for humans

---

# Domain Knowledge

## Jugendkart Slalom (JKS)

Jugendkart Slalom is a motorsport discipline for young drivers.

Drivers navigate a course marked by traffic cones.

The objective is precision and vehicle control rather than maximum speed.

Time penalties are added for mistakes.

### Penalties

- Cone hit: **2 seconds**
- Skipped or incorrectly driven course element: **10 seconds**

### Course Elements

Use the official terminology consistently.

- Gate
- Gasse
- Schweizer Slalom
- Kreisel
- Ypsilon
- S-Gasse
- Z-Gasse
- Kasten
- Doppelkasten / Chicane
- Schneckenhaus
- Kreuz
- Brezel
- Deutsches Eck
- Normales Eck
- Wende
- Wechseltor
- Das Z

Do not invent new names for these elements.

### Kart

- 6.5 HP four-stroke engine

### Classes

| Class | Age                   |
| ----- | --------------------- |
| 0     | 7 (NRW Bambini)       |
| 1     | 8–9                   |
| 2     | 10–11                 |
| 3     | 12–13                 |
| 4     | 14–15                 |
| 5     | 16–18                 |
| 6     | 19–23                 |
| 7     | 24+ (Adult / Trainer) |

---

## Superkart Slalom (SKS)

Superkart Slalom uses more powerful karts and larger distances between course elements than Jugendkart Slalom.

### Penalties

- Cone hit: **3 seconds**
- Skipped element: **10 seconds**

### Kart

- 9 HP four-stroke engine

### Classes

| Class | Age                   |
| ----- | --------------------- |
| 1     | 12–14                 |
| 2     | 15–17                 |
| 3     | 18–20                 |
| 4     | 21–30                 |
| 5     | 31+ (Adult / Trainer) |

---

# Terminology

Use these terms consistently.

Preferred terms:

- cone
- gate
- course
- run
- penalty
- class
- driver
- kart
- marshal
- event
- timing

Avoid translating established motorsport terminology into artificial alternatives.

---

# AI Assistant Behavior

When answering questions or modifying code:

- Explain important decisions briefly.
- Ask for clarification if requirements are ambiguous.
- Do not invent APIs or project structures.
- Respect existing architecture.
- Keep generated examples concise.
- Prefer official rules over assumptions.

If information is missing, explicitly state assumptions instead of presenting them as facts.
