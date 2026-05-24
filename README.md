# cicd-pipeline-demo

> Phase 1 Project 2 — full CI/CD pipeline: lint → test → build → push → SSH deploy

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=githubactions&logoColor=white)

## Pipeline architecture

```
git push to main
      │
      ▼
┌─────────────┐
│  Job 1      │  ESLint + Jest tests + coverage report
│  Test       │  fails if coverage below 80%
└──────┬──────┘
       │ passes
       ▼
┌─────────────┐
│  Job 2      │  docker build + push to Docker Hub
│  Build      │  tags: :latest + :git-sha
└──────┬──────┘
       │ pushed
       ▼
┌─────────────┐
│  Job 3      │  SSH into server → pull → stop → run → healthcheck
│  Deploy     │  auto rollback if health check fails
└─────────────┘
```

## Pipelines

| File | Trigger | Purpose |
|------|---------|---------|
| ci-cd.yml | push to main | Full pipeline |
| pr-check.yml | pull request | Validates PR before merge |

## Secrets required

| Secret | Description |
|--------|-------------|
| DOCKERHUB_USERNAME | Docker Hub username |
| DOCKERHUB_TOKEN | Docker Hub access token |
| SERVER_HOST | IP address of your VPS |
| SERVER_USER | SSH username |
| SERVER_SSH_KEY | Private SSH key |

## Local development

```bash
npm install
npm test
npm start
```

## Lessons learned
See docs/lessons-learned.md
