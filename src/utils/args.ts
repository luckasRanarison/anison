/**
 * Get the active argument in the case of a single argument command
 * @param args - commande line arguments object
 * @returns the name and value of the argument as an object
 */

function getActiveArg(args: any): { name: string; value: string } {
    for (const key in args) {
        if (key && key !== "source") {
            return { name: key, value: args[key] };
        }
    }

    throw new Error("error: No argument specified");
}

export { getActiveArg };
