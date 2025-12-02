# Smart To-Do List: CI/CD & Deployment Guide

**Document Version:** 1.0  
**Last Updated:** 2025-12-02  
**Status:** Phase 2 - Deployment Ready  
**Owner:** DevOps Engineer  

---

## 1. Overview

This document defines the CI/CD pipeline and deployment strategy for Smart To-Do List MVP. The goal is automated, reliable builds and deployments with minimal manual steps.

### Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        GitHub Repository                      │
│  (Code → Commit → Push to main or feature branch)            │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   GitHub Actions Workflow  │
        │   (CI/CD Pipeline)         │
        └────────┬───────────────────┘
                 │
    ┌────────────┼─────────────┐
    │            │             │
    ▼            ▼             ▼
 ┌─────┐  ┌──────────┐  ┌──────────┐
 │Lint │  │ Unit     │  │Integration│
 │ESL  │  │ Tests    │  │ Tests    │
 │Prty │  │Vitest    │  │Playwright│
 └─────┘  └──────────┘  └──────────┘
    │         │             │
    └─────────┼─────────────┘
              │
              ▼
        ┌─────────────┐
        │  Build      │
        │  Vite       │
        │  Production │
        └──────┬──────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌────────┐┌────────┐┌────────┐
│Staging ││GitHub  ││Vercel  │
│Server  ││Pages   ││(Opt)   │
└────────┘└────────┘└────────┘
    │          │          │
    └──────────┼──────────┘
               │
       ┌───────▼────────┐
       │  Production    │
       │  Deployment    │
       │  (on tag)      │
       └────────────────┘
```

---

## 2. CI/CD Pipeline Stages

### Stage 1: Lint & Code Quality (2 min)

**Trigger:** Every push to any branch  
**Status Checks:**
- ESLint (React, import, a11y rules)
- Prettier (code formatting)
- TypeScript compilation
- Dependency check (security)

**Commands:**
```bash
npm run lint        # ESLint
npm run format      # Prettier check
npm run type-check  # TypeScript
```

**Failure Action:** Block PR merge until fixed

---

### Stage 2: Unit & Component Tests (5 min)

**Trigger:** Every push to any branch  
**Coverage Target:** >80%

**Commands:**
```bash
npm run test        # Vitest all tests
npm run test:coverage  # Generate coverage report
```

**Coverage Report:**
- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

**Failure Action:** Block PR merge if coverage drops

---

### Stage 3: Build (3 min)

**Trigger:** Every push to main + pull requests  
**Build Target:** Production-optimized bundle

**Commands:**
```bash
npm run build       # Vite production build
```

**Build Validation:**
- Bundle size <100KB gzipped (excluding React)
- No build errors
- All imports resolved
- CSS properly bundled

**Artifacts:**
- `/dist/` folder
- Source maps (for debugging)
- Build report (bundle analysis)

**Failure Action:** Block PR merge

---

### Stage 4: Deploy to Staging (2 min)

**Trigger:** Every push to main branch  
**Target:** `staging.smarttodo.app` (or GitHub Pages staging)

**Process:**
1. Build production bundle
2. Upload to staging server
3. Run smoke tests
4. Post status to PR/commit

**Smoke Tests:**
```bash
curl https://staging.smarttodo.app/
# Check: 200 OK, HTML loads, no 404s
```

**Failure Action:** Notify team; don't deploy to production

---

### Stage 5: Deploy to Production (2 min)

**Trigger:** Git tag `v*` (e.g., `v1.0.0`)  
**Target:** Production domain (GitHub Pages or Vercel)

**Process:**
1. Verify tag is on main branch
2. Create production build
3. Deploy to production
4. Run post-deployment tests
5. Notify team

**Post-Deployment:**
- ✅ Smoke test production URL
- ✅ Check Lighthouse scores
- ✅ Verify all features working
- ✅ Monitor errors (Sentry optional)

**Failure Action:** Rollback to previous deployment

---

## 3. GitHub Actions Workflow

### File: `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main
      - develop
    tags:
      - v*.*.*
  pull_request:
    branches:
      - main

jobs:
  lint:
    name: Lint & Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Check code format (Prettier)
        run: npm run format:check
      
      - name: Type check (TypeScript)
        run: npm run type-check
  
  test:
    name: Unit & Component Tests
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
      
      - name: Comment coverage on PR
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
  
  build:
    name: Build Production Bundle
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build with Vite
        run: npm run build
      
      - name: Analyze bundle size
        run: npm run build:analyze
      
      - name: Archive dist folder
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
          retention-days: 1

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      
      - name: Download dist artifact
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to staging (GitHub Pages branch)
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add -f dist/
          git commit -m "Deploy to staging: ${{ github.sha }}"
          git push origin HEAD:staging --force
      
      - name: Run smoke tests
        run: |
          echo "Smoke test 1: Check deployed URL"
          curl -f https://ibe160.github.io/SG-Slitne/ || exit 1
          echo "✓ Smoke test passed"
      
      - name: Post deployment comment
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Deployed to staging: https://ibe160.github.io/SG-Slitne/'
            })

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: startsWith(github.ref, 'refs/tags/v') && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      
      - name: Verify tag on main
        run: |
          if ! git merge-base --is-ancestor HEAD main; then
            echo "❌ Tag not on main branch"
            exit 1
          fi
      
      - name: Download dist artifact
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to production (GitHub Pages)
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add -f dist/
          git commit -m "Release: ${{ github.ref_name }}"
          git push origin HEAD:production --force
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref_name }}
          release_name: Release ${{ github.ref_name }}
          body: |
            Production deployment of Smart To-Do List
            
            **Version:** ${{ github.ref_name }}
            **Commit:** ${{ github.sha }}
            **URL:** https://ibe160.github.io/SG-Slitne/
          draft: false
          prerelease: false
      
      - name: Post-deployment smoke test
        run: |
          echo "Testing production URL"
          curl -f https://ibe160.github.io/SG-Slitne/ || exit 1
          echo "✓ Production deployment verified"
      
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '🚀 Smart To-Do List v${{ github.ref_name }} deployed to production'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

---

## 4. Local Development Setup

### Prerequisites
- Node.js 18.x+ (check with `node --version`)
- npm 9.x+ (check with `npm --version`)
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/IBE160/SG-Slitne.git
cd SG-Slitne

# Install dependencies
npm install

# Verify setup
npm run type-check
npm run lint
npm run test
npm run build
```

### Development Commands

```bash
# Start development server (HMR enabled)
npm run dev              # Runs on http://localhost:5173

# Build for production
npm run build            # Output in dist/

# Preview production build locally
npm run preview

# Run tests in watch mode
npm run test            # Re-runs on file changes

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint            # ESLint

# Fix linting issues
npm run lint:fix        # ESLint --fix

# Check code format
npm run format:check    # Prettier

# Format all code
npm run format          # Prettier --write

# Type check
npm run type-check      # TypeScript

# Analyze bundle size
npm run build:analyze
```

---

## 5. Git Workflow & Branching Strategy

### Branch Strategy: Git Flow

```
main (production-ready)
  ├── hotfix/bug-fix-123 (urgent production fixes)
  │
develop (next release staging)
  ├── feature/user-stories (new features)
  ├── feature/ai-engine
  ├── feature/database
  │
  └── bugfix/issue-456 (bug fixes)
```

### Development Workflow

1. **Create feature branch** from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **Make commits** (atomic, descriptive)
   ```bash
   git commit -m "feat: add label suggestions to task creation"
   ```

3. **Push branch & create PR**
   ```bash
   git push origin feature/my-feature
   # Create PR on GitHub: feature/my-feature → develop
   ```

4. **GitHub Actions runs automatically**
   - Lint ✓
   - Tests ✓
   - Build ✓
   - Coverage report posted

5. **Code review** (require 1+ approvals)
   ```
   Reviewer checks:
   - Code quality
   - Test coverage
   - No breaking changes
   ```

6. **Merge to develop** (squash or merge commits)
   ```bash
   # GitHub UI: Squash and merge
   ```

7. **Deploy to staging** (automatic on main)
   ```
   Staging deployed at: https://ibe160.github.io/SG-Slitne/staging
   ```

8. **Create release** from `develop` → `main`
   ```bash
   git checkout main
   git pull origin main
   git merge develop --no-ff -m "Release v1.0.0"
   git tag -a v1.0.0 -m "Version 1.0.0"
   git push origin main --follow-tags
   ```

9. **Production deployment** (automatic on tag)
   ```
   Production deployed at: https://ibe160.github.io/SG-Slitne/
   GitHub Release created automatically
   ```

---

## 6. Commit Message Convention

### Format: Conventional Commits

```
type(scope): subject

body (optional)

footer (optional)
```

### Type
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no behavior change)
- `perf`: Performance improvement
- `test`: Test additions/updates
- `docs`: Documentation changes
- `style`: Code style (formatting, semicolons, etc.)
- `chore`: Build, dependencies, tooling

### Scope
- `ui`: User interface components
- `db`: Database/IndexedDB
- `ai`: AI engine services
- `api`: API integration
- `build`: Build process
- `ci`: CI/CD pipeline

### Examples

```bash
git commit -m "feat(ui): add task creation form with validation"
git commit -m "fix(ai): improve label suggestion accuracy"
git commit -m "perf(db): optimize IndexedDB queries with indexes"
git commit -m "test(db): add CRUD operation test suite"
git commit -m "docs(readme): update setup instructions"
```

---

## 7. Deployment Targets

### Option 1: GitHub Pages (Recommended for MVP)

**Advantages:**
- ✅ Free
- ✅ Zero configuration
- ✅ Automatic from repo
- ✅ Supports custom domain
- ✅ Good for static sites

**Setup:**
```bash
# Repo settings → Pages → Build from gh-pages branch
# Automatic deployment on merge to main
```

**URLs:**
- Staging: `https://ibe160.github.io/SG-Slitne/staging`
- Production: `https://ibe160.github.io/SG-Slitne/`

---

### Option 2: Vercel (Alternative)

**Advantages:**
- ✅ Better performance (edge deployment)
- ✅ Automatic preview deploys on PR
- ✅ Analytics included
- ✅ Free tier generous

**Setup:**
```bash
# Connect GitHub repo to Vercel
# Auto-deploy on push to main
# Preview URL auto-generated for PRs
```

**Installation:**
```bash
npm i -g vercel
vercel --prod
```

---

### Option 3: Netlify (Alternative)

**Advantages:**
- ✅ Competitor to Vercel
- ✅ Similar features
- ✅ Easy GitHub integration

**Setup:** Connect repo, configure build settings, deploy

---

## 8. Environment Variables

### `.env` File (Local Development)

```bash
# .env (never commit to git)
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Smart To-Do List
VITE_DEBUG=true
```

### `.env.production` File

```bash
# .env.production
VITE_API_URL=https://api.smarttodo.app
VITE_APP_NAME=Smart To-Do List
VITE_DEBUG=false
```

### GitHub Secrets (for Actions)

```
Settings → Secrets and variables → Actions

Secrets:
- SLACK_WEBHOOK (for notifications)
- CODECOV_TOKEN (for coverage)
- VERCEL_TOKEN (if using Vercel)
```

---

## 9. Release Management

### Version Numbering: Semantic Versioning

```
MAJOR.MINOR.PATCH
  1.   0.    0

MAJOR: Breaking changes
MINOR: New features (backward-compatible)
PATCH: Bug fixes
```

### Release Process

1. **Pre-Release Check**
   ```bash
   # Ensure all tests pass
   npm run test
   npm run build
   ```

2. **Update Version**
   ```bash
   npm version major|minor|patch
   # Updates package.json + git tag
   ```

3. **Create Release Notes**
   ```markdown
   # v1.0.0 - 2025-12-16
   
   ## Features
   - Add task CRUD operations
   - Add AI label suggestions
   
   ## Bug Fixes
   - Fix IndexedDB query performance
   
   ## Breaking Changes
   None
   ```

4. **Push & Tag**
   ```bash
   git push origin main --follow-tags
   # GitHub Actions triggers production deployment
   ```

5. **Monitor Deployment**
   - Check GitHub Actions workflow
   - Verify production URL loads
   - Review error logs (if applicable)

---

## 10. Rollback Strategy

### If Production Deployment Fails

1. **Immediate**: Alert team on Slack
2. **Revert tag**:
   ```bash
   git tag -d v1.0.0
   git push origin :refs/tags/v1.0.0
   ```
3. **Force previous version**:
   ```bash
   git reset --hard v0.9.0
   git push origin main --force
   ```
4. **Verify rollback**:
   ```bash
   curl https://ibe160.github.io/SG-Slitne/
   # Should show previous version
   ```

### Automated Rollback (Future)

- Monitor error rates post-deployment
- Automatic rollback if error rate >5% (Phase 2)

---

## 11. Monitoring & Observability

### Error Tracking (Phase 2)

**Sentry Setup:**
```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.Replay({ maskAllText: true, blockAllMedia: true }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Performance Monitoring

**Lighthouse CI (Phase 1.1):**
```bash
npm install -g @lhci/cli@latest
npm run lhci
# Reports: Performance, Accessibility, Best Practices, SEO
```

### Analytics (Phase 2)

- PostHog or Plausible (privacy-friendly, no tracking cookies)
- Track user engagement, feature adoption, retention

---

## 12. Troubleshooting

### Build Fails Locally

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18.x+

# Clear Vite cache
rm -rf .vite
npm run build
```

### Tests Fail Locally

```bash
# Run tests in verbose mode
npm run test -- --reporter=verbose

# Run specific test file
npm run test -- src/services/db/__tests__/taskService.test.ts

# Clear test cache
npm run test -- --clearCache
```

### GitHub Actions Fails

```
Check workflow logs:
GitHub → Actions → Workflow name → Latest run → Logs

Common issues:
- Node version mismatch (use 18.x)
- Dependencies not installed (use npm ci)
- Env vars not set (add to GitHub Secrets)
```

---

## 13. Performance Targets

### Build Performance

| Metric | Target | Acceptance |
|--------|--------|-----------|
| Build time | <10s | ✓ |
| Bundle size | <100KB gzipped | ✓ |
| Dev server startup | <3s | ✓ |
| HMR update time | <500ms | ✓ |

### Runtime Performance

| Metric | Target | Acceptance |
|--------|--------|-----------|
| Page load time | <2s | ✓ |
| Task creation | <200ms | ✓ |
| Task list render (100+) | <500ms | ✓ |
| AI suggestion generation | <200ms | ✓ |

### CI/CD Pipeline

| Stage | Target | Acceptance |
|-------|--------|-----------|
| Lint | <2 min | ✓ |
| Tests | <5 min | ✓ |
| Build | <3 min | ✓ |
| Deploy | <5 min | ✓ |
| **Total** | **<15 min** | **✓** |

---

## 14. Security Considerations

### Secrets Management
- Never commit `.env` files
- Use GitHub Secrets for sensitive values
- Rotate secrets quarterly

### Dependency Management
- Use `npm audit` to check for vulnerabilities
- Update dependencies monthly
- Review changelogs before updating

### Code Security
- ESLint rules for security (import aliases, etc.)
- No hardcoded API keys or tokens
- Use Content Security Policy (CSP) headers (Phase 2)

---

## 15. Documentation URLs

### Key Resources

| Resource | URL |
|----------|-----|
| GitHub Repo | https://github.com/IBE160/SG-Slitne |
| Staging | https://ibe160.github.io/SG-Slitne/staging |
| Production | https://ibe160.github.io/SG-Slitne/ |
| GitHub Actions | `.github/workflows/ci.yml` |
| Build Output | `dist/` (git ignored) |

---

## 16. Related Documents

- `docs/architecture.md` — System design
- `docs/tech-spike-plan.md` — Tech validation (Spike #2: Vite build setup)
- `docs/sprint-1-user-stories.md` — S1-US-1 (Project setup with CI/CD)

---

## 17. Appendix: GitHub Actions Secret Setup

### Create Secrets in GitHub

1. Go to repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret:

```
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
CODECOV_TOKEN=your-codecov-token
VERCEL_TOKEN=your-vercel-token  (if using Vercel)
```

---

## 18. Post-Launch Checklist

- [ ] Production URL works (visit URL in browser)
- [ ] All links functional (no 404s)
- [ ] App loads <2 seconds
- [ ] Tasks can be created/read/updated/deleted
- [ ] AI suggestions working
- [ ] Offline mode tested
- [ ] IndexedDB persistence verified
- [ ] Error logging configured (Sentry)
- [ ] Analytics configured (Phase 2)
- [ ] Team notified of production deployment

---

**Document Status:** ✅ APPROVED  
**Phase:** Phase 2 - Deployment Ready  
**Owner:** DevOps Engineer  
**Last Updated:** 2025-12-02  
**Execution Start:** Post-Sprint-1 (Week of 2025-12-16)  
**Production Launch:** TBD (after Sprint 1)
