#!/usr/bin/env python3
"""Compatibility wrapper for the packaged Game Design Skills Suite CLI."""

from game_design_skills_suite.cli import *  # noqa: F401,F403
from game_design_skills_suite.cli import main as _main


if __name__ == "__main__":
    _main()
