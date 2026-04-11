# Claude Enterprise Starter

[English](#-english) | [中文](#-中文)

---

## 📖 English

> 🚀 Enterprise-grade Claude Code configuration template with Agent Team orchestration, Rage Mode automation, TDD workflow, and production-ready configurations.

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-blue)](https://code.claude.com)
[![Version](https://img.shields.io/badge/Version-2.6.0-green)](./CLAUDE.md)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

### Core Architecture

**What It Does**: This is not an application framework — it's a **development engine configuration layer** for Claude Code. It provides AI Agent orchestration, quality gates, automated pipelines, and production-ready configurations that let Claude Code autonomously develop enterprise-grade projects.

**How It Works**: Projects go through a 5-phase pipeline (Phase 0: Init → Phase 0.5: Product Design [optional, GStack] → Phase 1: Requirements → Phase 2: Development → Phase 3: Testing → Phase 4: UX Review → Phase 5: Deployment), with each phase requiring quality gate passage. A separate GAN Harness loop (Planner → Generator → Evaluator) handles quality-driven feature development.

**Key Metrics**: 15 Agent roles | 38 Skills | 16 Hook scripts | 9 Rule files | 7 Automation configs