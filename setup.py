
from setuptools import setup, find_packages
import os

def package_files(directory):
    paths = []
    for (path, directories, filenames) in os.walk(directory):
        for filename in filenames:
            paths.append(os.path.join('..', path, filename))
    return paths

extra_files = package_files('tinyde/static') + package_files('tinyde/templates')

setup(
    name='tinyde',
    version='0.1.0',
    packages=find_packages(include=['tinyde', 'tinyde.*']),
    include_package_data=True,
    install_requires=[
        'Flask',
        'flask-cors',
        'jedi',
        'click'
    ],
    package_data={
        '': extra_files,
    },
    entry_points='''
        [console_scripts]
        tinyde=tinyde.cli:cli
    ''',
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
)

