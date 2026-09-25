"""Synthetic sample issues for first run only. No real client data."""

DEFAULT_APPLICATIONS = [
    "PDM", "Validation Tool", "Workflow Manager", "Release Portal", "CAD Data Exchange",
]

SEED_ISSUES = [
    {
        "id": "ER-123", "title": "Release package approval blocked", "system": "PDM",
        "status": "solved", "error": "ER-123",
        "apps": ["PDM", "Validation Tool", "Workflow Manager"],
        "problem": "While trying to approve the release package, the system shows an error and blocks the approval process.",
        "root": "Dependency validation was not executed. A required artifact is missing in the release package.",
        "solution": "Run dependency validation and include the missing artifact. Once validation is successful, resubmit the release package for approval.",
        "steps": [
            ["Open PDM and navigate to the Release Package.", "PDM"],
            ["Go to the Dependencies tab and review missing artifacts.", "PDM"],
            ["Run Dependency Validation.", "Validation Tool"],
            ["After successful validation, submit the package for approval.", "Workflow Manager"],
        ],
    },
    {
        "id": "PDM-045", "title": "Validation failed for dependency check", "system": "Validation Tool",
        "status": "review", "error": "PDM-045", "apps": ["PDM", "Validation Tool"],
        "problem": "Dependency check consistently fails even though all referenced parts exist in the current baseline.",
        "root": "Baseline reference was stale after a late part revision bump.",
        "solution": "Re-baseline the assembly and re-run the dependency check.",
        "steps": [
            ["Open the assembly in PDM.", "PDM"],
            ["Re-baseline to latest part revisions.", "PDM"],
            ["Re-run dependency validation.", "Validation Tool"],
        ],
    },
    {
        "id": "WF-067", "title": "Workflow stuck at approval step", "system": "Workflow Manager",
        "status": "in_progress", "error": "", "apps": ["Workflow Manager"],
        "problem": "Approval step shows 'in progress' indefinitely with no assigned approver visible.",
        "root": "Approver group mapping was removed during a recent AD group cleanup.",
        "solution": "Re-map the approval step to the correct AD security group and re-trigger the workflow.",
        "steps": [
            ["Open Workflow Manager admin console.", "Workflow Manager"],
            ["Locate the stuck workflow instance.", "Workflow Manager"],
            ["Re-map approver group.", "Workflow Manager"],
        ],
    },
    {
        "id": "ER-110", "title": "Baseline not found during release", "system": "PDM",
        "status": "solved", "error": "ER-110", "apps": ["PDM"],
        "problem": "Release process fails immediately with 'baseline not found' even though the baseline is visible in PDM.",
        "root": "Baseline was created in a different work context/branch than the release job was pointed at.",
        "solution": "Point the release job at the correct work context and retry.",
        "steps": [
            ["Verify work context in PDM.", "PDM"],
            ["Update release job context.", "PDM"],
            ["Retry release.", "PDM"],
        ],
    },
    {
        "id": "VAL-009", "title": "Rule check failed in validation", "system": "Validation Tool",
        "status": "critical", "error": "VAL-009", "apps": ["Validation Tool"],
        "problem": "Critical rule check fails for all release packages since this morning, blocking every release in the plant.",
        "root": "A validation rule set update was deployed with an overly strict threshold.",
        "solution": "Roll back the rule set to the previous version pending a fix; notify all engineers via the standard incident channel.",
        "steps": [
            ["Confirm rule set version currently active.", "Validation Tool"],
            ["Roll back to previous rule set version.", "Validation Tool"],
            ["Notify engineering teams.", "Workflow Manager"],
        ],
    },
    {
        "id": "ER-098", "title": "User not authorized for release", "system": "Workflow Manager",
        "status": "solved", "error": "ER-098", "apps": ["Workflow Manager", "PDM"],
        "problem": "Engineer with the right role cannot approve a release; system returns 'not authorized'.",
        "root": "User's AD group membership had not yet synced to the Workflow Manager permission cache.",
        "solution": "Force a permission cache refresh, or wait for the next scheduled sync (max 15 minutes).",
        "steps": [
            ["Check user's AD group membership.", "PDM"],
            ["Force permission cache refresh.", "Workflow Manager"],
        ],
    },
]
