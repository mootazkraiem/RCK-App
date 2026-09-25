"""
Bootstrap CLI for creating team members' accounts on the server.

There is no self-registration endpoint by design -- an unauthenticated
"create my own account" API is an open door on a tool whose whole point is
restricting access to the team. Whoever administers the server runs this
locally on the server machine to add each person.

This is also the ONLY way to create or promote a super_admin account --
the in-app "Manage Users" interface lets a super_admin create admins and
technicians, and an admin create technicians, but neither can mint another
super_admin over the network. That stays a deliberate, physical-access-to-
the-server action.

Run (on the server machine):
    python -m server.create_user alice "Alice Engineer"
    (you'll be prompted for a password, not passed on the command line
    where it could end up in shell history)
"""

import argparse
import getpass
import sys

from server.store import ROLES, IssueStore, app_data_dir


def main():
    parser = argparse.ArgumentParser(description="Create, deactivate, or re-role a Release Knowledge Capture user.")
    parser.add_argument("username")
    parser.add_argument("display_name", nargs="?", default="")
    parser.add_argument("--deactivate", action="store_true", help="Deactivate this user instead of creating them.")
    parser.add_argument("--role", choices=ROLES, default="technician",
                         help="Role to create the new user with (default: technician).")
    parser.add_argument("--set-role", choices=ROLES, default=None,
                         help="Change an EXISTING user's role instead of creating a new account.")
    args = parser.parse_args()

    store = IssueStore(app_data_dir() / "issues.db")

    if args.deactivate:
        store.deactivate_user(args.username)
        print(f"User '{args.username}' deactivated.")
        return

    if args.set_role:
        try:
            store.set_role(args.username, args.set_role)
        except ValueError as e:
            print(str(e), file=sys.stderr)
            sys.exit(1)
        print(f"User '{args.username}' is now role: {args.set_role}.")
        return

    password = getpass.getpass("Password for new user: ")
    confirm = getpass.getpass("Confirm password: ")
    if password != confirm:
        print("Passwords did not match.", file=sys.stderr)
        sys.exit(1)
    if len(password) < 8:
        print("Password must be at least 8 characters.", file=sys.stderr)
        sys.exit(1)

    try:
        user = store.create_user(args.username, password, args.display_name, role=args.role)
    except ValueError as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

    print(f"Created user '{user['username']}' ({user['display_name']}) -- role: {user['role']}.")


if __name__ == "__main__":
    main()
