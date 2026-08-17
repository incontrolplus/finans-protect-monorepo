#!/usr/bin/env python3
from setuptools import setup, find_packages

setup(
    name="openbalancer",
    version="1.4.2",
    packages=find_packages(),
    entry_points={
        "console_scripts": [
            "openbalancer = core.openbalancer:main",
        ],
    },
)
