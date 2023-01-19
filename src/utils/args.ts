/**
 * Get the active argument's name and value in the case of a single argument command
 * @param args - commande line arguments object
 * @returns the name and value of the argument
 */

function getActiveArgProps(args: any): [any, any] {
    const [name, value] = Object.entries(args).find(
        ([type, _query]) => type
    ) as [any, any];

    return [name, value];
}

export { getActiveArgProps };
