/**
 *
 * This file exports a function to check for required or recommended dependencies. Docker is no a hard dependency, but
 * it is recommended for deterministic visual test results across different platforms.
 *
 * */

const shell = require('shelljs');
const { CONSOLE_PREFIX } = require('./console-helpers');
require('colors');

const dependencyList = [
    {
        name: 'docker',
        displayName: 'Docker',
        required: false,
        instructions:
            'You need Docker to run tests in a container. You can download it from https://www.docker.com/'
    }
];

const checkDependency = (dependency, isRequired = dependency.required) => {
    if (typeof dependency === 'string') {
        const found = dependencyList.find(
            d => d.name.toLowerCase() === dependency.toLowerCase()
        );
        if (found) {
            return true;
        }
        console.error(
            `${CONSOLE_PREFIX} No dependency matches the name ${dependency}`.red
        );
        return false;
    }

    if (shell.which(dependency.name)) {
        console.log(
            `${CONSOLE_PREFIX} ${dependency.displayName} dependency was found`
                .green
        );
        return true;
    }
    console.log(
        `${CONSOLE_PREFIX} ${dependency.displayName} is missing. ${
            dependency.instructions
        }`[isRequired ? 'red' : 'yellow']
    );

    return false;
};

const checkDependencies = () => {
    dependencyList.forEach(dependency => checkDependency(dependency));
};

module.exports = {
    checkDependency,
    checkDependencies
};
