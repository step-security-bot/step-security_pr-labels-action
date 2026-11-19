[![StepSecurity Maintained Action](https://raw.githubusercontent.com/step-security/maintained-actions-assets/main/assets/maintained-action-banner.png)](https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions)

# PR Labels

Make the labels of a pull request available to the rest of your job. When a workflow runs for a pull request, this action reads the labels on it and publishes them as:

- **step outputs** (`labels` and `labels-object`), for use in `if:` conditions and expressions
- **environment variables** (`GITHUB_PR_LABEL_<NAME>=1`), for use in shell scripts in later steps

## Usage

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, labeled, unlabeled]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - id: pr-labels
        uses: step-security/pr-labels-action@v1

      # Condition on a step output: use the slug with a space on each side
      - name: Deploy preview
        if: contains(steps.pr-labels.outputs.labels, ' deploy-preview ')
        run: ./scripts/deploy-preview.sh

      # Same check using the JSON object
      - name: Build docs
        if: fromJSON(steps.pr-labels.outputs.labels-object)['documentation']
        run: make docs

      # Check an environment variable inside a script
      - name: Tests
        run: |
          ./scripts/test.sh
          if [ -n "$GITHUB_PR_LABEL_RUN_SLOW_TESTS" ]; then
            ./scripts/test-slow.sh
          fi
```

## Inputs

None. The action reads the pull request from the event payload of the current workflow run.

## Outputs

| Name | Description |
| --- | --- |
| `labels` | Label slugs separated by spaces, with a leading and trailing space, e.g. `" bug run-slow-tests "`. Empty string when there are no labels or no pull request. |
| `labels-object` | JSON object mapping each label slug to `true`, e.g. `{"bug":true}`. `{}` when the pull request has no labels, `null` when the event is not a pull request. |

## Environment variables

For every label, `GITHUB_PR_LABEL_<NAME>` is set to `1` for the remaining steps of the job.

## How label names are converted

| Label | Slug (outputs) | Environment variable |
| --- | --- | --- |
| `Run slow tests` | `run-slow-tests` | `GITHUB_PR_LABEL_RUN_SLOW_TESTS` |
| `Don't merge` | `dont-merge` | `GITHUB_PR_LABEL_DONT_MERGE` |
| `Café` | `café` | `GITHUB_PR_LABEL_CAFE` |

- Quote characters (straight and curly) are dropped in both forms.
- **Slug**: every run of characters other than letters and digits becomes one `-`, then the result is lowercased. Non-ASCII letters are kept.
- **Environment variable**: accents are folded to ASCII, every run of characters other than ASCII letters and digits becomes one `_`, then the result is uppercased.
