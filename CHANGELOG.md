# Changelog

All notable changes to this project will be documented in this file.

## [3.2.0] - 2026-04-26

### Added
- CE Plugin deep integration — 5 skills (brainstorm/plan/work/review/compound) fully automated
- Knowledge Compounder agent (agents/knowledge-compounder.md) — auto experience extraction at phase transitions
- Multi-Review Architecture — CE + Codex + Built-in triple review at every phase boundary
- Version delivery automation (scripts/release.js) — automated CHANGELOG, version sync, git tag
- CE health check script (scripts/ce-health-check.js) — validates CE plugin configuration
- docs/dev/progress.md template for /ce-work structured progress tracking
- workConfig in SSOT for ce-work integration settings
- ganConfig.multiReview for GAN loop multi-dimensional review

### Changed
- /ce-work replaces standalone TDD as core development engine (TDD is now a sub-step within ce-work)
- CE plugin is now a REQUIRED dependency (phase advancement blocked without it)
- Review-Champion requiredSkills: added ce-review + ce-brainstorm
- Frontend/Backend-Java/Backend-Python/GAN-Generator requiredSkills: added ce-work
- orchestrate.sh: run_codex_phase_hook → run_multi_review_hook (CE + Codex + Compound)
- gan-harness.sh: added run_gan_ce_review for GAN iteration CE review
- auto-start-agents.js: added CE dependency reminder + ce-work workflow injection
- settings.json: compoundEngineering.skills now includes all 5 CE skills
- teams/full/config.json: added Knowledge-Compounder (16→17 agents)
