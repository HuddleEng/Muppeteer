const { fork } = require('child_process');

// init the docker container in preparation for the test
const initTests = fork('e2e/run.js', ['--onlyInit', '--color'], {
    silent: true
});

initTests.stdout.on('data', data => {
    process.stdout.write(data.toString());
});

initTests.stderr.on('data', data => {
    process.stdout.write(data.toString());
});

initTests.on('message', message => {
    if (message.tag === 'STDOUT_HOOK_WS') {
        const ws = message.value;

        const runTests = fork(
            'node_modules/jest/bin/jest.js',
            [
                '--testMatch=**/e2e/**/*test.js',
                '--testPathIgnorePatterns=(/node_modules/|/examples/)',
                '--color'
            ],
            {
                env: { WEBSOCKET_URI: ws },
                silent: true
            }
        );

        runTests.stdout.on('data', data => {
            process.stdout.write(data.toString());
        });

        runTests.stderr.on('data', data => {
            process.stdout.write(data.toString());
        });

        runTests.on('exit', code => {
            if (code > 0) {
                process.exit(1);
            }
        });
    }
});
