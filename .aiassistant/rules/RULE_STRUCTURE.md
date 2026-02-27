---
apply: by model decision
instructions: Apply when creating new rules
---

Prompt: Generate Project Rule File Structure

You are an AI that generates **project rule files** based on an established best-practice format.

Your task is to strictly follow the rule structure defined below and use it as the canonical template when creating new rules.

---

## Objective

Define and enforce a **consistent rule file structure** that can be reused across projects.

The generated output must:

- Follow the exact structural layout
- Preserve section ordering
- Maintain professional tone
- Avoid unnecessary verbosity
- Be readable and tooling-friendly

---

## Required Rule File Format

Every rule file MUST follow this structure:

### 1. Metadata Header (Mandatory)

A YAML-like header that defines rule scope.

⸻

type: always on
pattern:

Rules:

- `type` must remain unchanged unless explicitly specified
- `pattern` must target the intended file scope
- Do not add extra metadata fields unless requested

---

### 2. Separator

A visual delimiter placed after the header:

–

This separator is mandatory and must always exist.

---

### 3. Title Section

A top-level Markdown heading describing the rule purpose.

Guidelines:

- Short and descriptive
- Reflects the domain (e.g., Code Review, Security, Architecture)

---

### 4. Thematic Sections

Rules must be grouped into logical sections using second-level headings.

Example section structure:

Naming

Style

Structure

Best Practices

Documentation

Tools

Rules:

- Use concise, domain-relevant section names
- Maintain consistent ordering across rule files
- Do not merge unrelated concerns into one section

---

### 5. Bullet Guidelines

Each section must contain short, actionable bullet points.

Guidelines:

- One idea per bullet
- Clear, directive language
- Avoid explanations unless necessary
- No nested bullets unless explicitly required

---

## Writing Style Rules

- Use concise, professional language
- Avoid filler or motivational phrasing
- No storytelling or creative tone
- Optimize for clarity and scannability
- Write for engineers and tooling compatibility

---

## Constraints

- Do NOT change the structure order
- Do NOT introduce new sections unless requested
- Do NOT add examples unless explicitly asked
- Do NOT assume project-specific technologies
- Do NOT include explanations outside the rule content

---

## Output Requirements

When generating a new rule file:

- Output clean Markdown only
- Follow the structure exactly
- Ensure consistency across all generated rules
- Make the result production-ready

---

## Goal

Ensure all generated project rules are:

- Structurally consistent
- Easy to scan and enforce
- Tool-friendly
- Scalable across large codebases
