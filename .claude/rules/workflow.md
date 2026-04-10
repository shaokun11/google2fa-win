# Project Workflow & Engineering Rules

> **⚠️ MANDATORY: If you are an AI assistant (Claude), read this entire file before generating any code, plan, or response. Violation of these rules is unacceptable.**

## 1. The Core Pipeline (Strict 3-Phase Workflow)

All non-trivial tasks **MUST** execute through the following exact sequence. No phase may be skipped, and no phase may be executed out of order.

### Phase 1: Brainstorming (Socratic Design Refinement)

*Goal: Achieve crystal-clear design consensus before touching any code.*

1. **Explore:** Inspect relevant files, docs, and patterns.
2. **Inquire:** Ask clarifying questions *one at a time* (purpose, users, edge cases, non-goals).
3. **Propose:** Present 2-3 approaches with trade-offs and a recommendation.
4. **Document:** Write a Design Spec (e.g., to `docs/superpowers/specs/...`) detailing what and why.
5. **Approve:** You MUST receive explicit human approval on the spec before proceeding.

### Phase 2: Writing-Plans (Detailed Implementation Plans)

*Goal: Create an atomic, foolproof roadmap.*

1. **Scope:** Confirm file structure changes and new files required.
2. **Atomicity:** Break work into steps taking < 1 hour each. Every step MUST produce a verifiable outcome.
3. **Explicitness:** Provide exact commands, exact file paths, and exact code snippets. **NO placeholders** (no TBD, no "add similar logic here").
4. **Document:** Save the Implementation Plan (e.g., to `docs/superpowers/plans/...`).

### Phase 3: Executing-Plans (Batch Execution with Checkpoints)

*Goal: Autonomous, relentless execution of the plan.*

1. **Load & Lock:** Read the plan. Do not deviate.
2. **Execute:** Implement tasks sequentially. Do not request step-by-step confirmations.
3. **Self-Review:** After completing all tasks, perform a full diff review against the spec and plan to ensure consistency.

---

## 2. Execution Constraints (The "Iron Law")

These constraints override any default behaviors or other skill instructions:

- **NO Worktrees:** Never use `git worktree`. Work directly on the current branch.
- **Current-Branch Development Only:** Always develop directly on the branch that is currently checked out, regardless of branch name. Do not stop just because the branch is `master`, `main`, or another shared branch unless the user explicitly says otherwise.
- **NO Sub-Agents:** Never delegate tasks, use parallel execution, or spawn sub-agents. Single context only.
- **NO Branch-Hopping:** Do not use multi-branch implementation strategies.
- **Continuous Execution:** Once Phase 2 is complete, transition immediately to Phase 3. Do not pause for permission to begin.
- **Autonomous Decision Making:** If a minor implementation detail is ambiguous, make the most reasonable decision aligned with the design intent. Prioritize forward progress. Only stop for **true blockers** (e.g., fundamental architectural contradictions).
- **Inline Execution:** Always choose Inline Execution (Option 2) if presented with execution workflow choices.
- **NO PR Skills:** Do not use `superpowers:finishing-a-development-branch` or similar PR orchestration workflows.

---

## 3. The Verification & Commit Loop

This is a strict, unbreakable cycle for every atomic task during Phase 3.

0. **Feature Start Cleanliness:** Before starting any new feature or any new round of development, ensure the git working tree is clean. Do not begin new implementation work while unrelated changes remain unstaged or uncommitted unless the user explicitly approves it.
1. **Verify:** Run tests/lints against the *current HEAD*. Never rely on cached or previous test results.
2. **Start Check:** Ensure the project can actually start/run (not just build/test) using supported run commands.
3. **Cleanliness:** Ensure `.gitignore` covers all generated/runtime artifacts.
4. **Commit:** Commit immediately after a task passes verification.
5. **Clean State:** Ensure the git working tree is clean before starting the next task.
6. **Auto-Fix Loop:** If a problem is pointed out:
   - Fix it.
   - Re-verify on current HEAD automatically.
   - If it passes, commit automatically. Do not wait for confirmation.

---

## 4. Implementation Standards

- **Scope:** Only modify files directly related to the task.
- **Patterns:** Follow existing code style strictly. Do not introduce new patterns unless the design spec explicitly requires it.
- **Reuse:** Prefer existing modules/utilities over duplication.
- **Failure Handling:** If tests fail, analyze the root cause. If you cannot fix it after 3 attempts, **stop and revise the plan**. Do not guess blindly.
- **Breaking Changes:** Avoid. If unavoidable, update all affected callers and documentation in the same commit.

---

## 5. Testing Rules

- Tests must pass before committing. No exceptions.
- **Minimalism:** Write only unit tests.
- **Blacklist:** Do NOT write tests for routers, controllers, or stateful/integration-heavy entry points. Only test stateless logic.

---

## 6. Documentation Rules

- **Synchronous Updates:** Update docs immediately after code changes. Never defer.
- **Scope:** Update `.md` files for any behavior, architecture, API, or flow changes.
- **Milestones:** Record progress for every major milestone in project documentation.
- **Quality:** Docs must explain: What changed? Why? How to use it?

---

## 7. Critical Domain Rules (Security, DB, Finance)

- **Security:** NEVER log sensitive data (tokens, passwords, keys). Validate/sanitize all external inputs.
- **Database:** Schema changes MUST use migrations. NEVER modify schema directly. Ensure backward compatibility.
- **Financial/Critical Logic:**
  - All state changes must be traceable.
  - Prefer append-only logs over mutable state.
  - Operations MUST be idempotent (safe for retries).
  - Prevent duplicate execution of the same event.
  - Strictly validate inputs before applying changes.

---

## 8. System Quality Attributes

- **Logging:** Critical paths require structured logs. No silent failures. Errors must be logged or explicitly returned.
- **Performance:** Avoid N+1 queries. Prefer batch operations for DB/network calls.
- **Naming:** Names (files, vars, methods) must be meaningful, context-appropriate, and unambiguous. Clear abbreviations are allowed.
- **Language:** All documentation, comments, commit messages, and code names MUST be in English. (Exception: User-facing UI text may be localized).

---

## 9. Formatting & Style Quirks

- **Paths:** Always use relative paths in instructions, plans, memory, and communication. Avoid absolute paths unless a tool strictly requires them.
- **Blacklist Words:** Do not mention `rtk` in any repository Markdown documentation or `.md` files.