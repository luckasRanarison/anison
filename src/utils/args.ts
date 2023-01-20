/**
 * Get the active argument in the case of a single argument command
 * @param args - commande line arguments object
 * @returns the name and value of the argument as an object
 */

function getActiveArg(args: any): { name: string; value: any } {
    const [name, value] = Object.entries(args).find(
        ([name, _]) => name && name !== "source"
    ) as [any, any];

    return { name, value };
}

export { getActiveArg };
