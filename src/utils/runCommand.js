modukle.exports = {
    runCommand: async (command, args) => {
        try {
            const { stdout, stderr } = await exec(
                `${command} ${args.join(' ')}`
            );

            console.log(stdout);
            console.log(stderr);

            return stdout;
        } catch (e) {
            console.error(e);
            return e;
        }
    }
};
