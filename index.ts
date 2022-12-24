/*
* This example simulates a small system that fetches a list of creatures from a RPG API and split them into groups
* based on their movement type, sorting the groups in decreasing order of initiative and other relevant information.
* */

interface Creature {
    armorClass: number,
    challengeRating: number,
    hitPoints: number,
    initiative: number;
    name: string,
    type: string;
    speed: number,
}

interface SwimmingCreature extends Creature {
    swimSpeed: number;
}

interface FlyingCreature extends Creature {
    flySpeed: number;
}

const isCreature = (entry: any): entry is Creature => {
    return ("challengeRating" in entry);
}

const isSwimmingCreature = (animal: Creature): animal is SwimmingCreature  => {
    return (animal as SwimmingCreature).swimSpeed > 0;
}

const isFlyingCreature = (animal: Creature): animal is FlyingCreature => {
    return (animal as FlyingCreature).flySpeed > 0;
}

const fetchData = async () => {
    const response = await fetch('www.api.com/creatures/list');

    if (!response.ok) {
        throw new Error(`Error when trying to fetch creatures ::: ${response.statusText}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
        return data.filter(isCreature);
    }
    else {
        throw new Error(`Error when trying to parse through data.`);
    }
};


const init = async () => {
    let loading = true;

    try {
        const data = await fetchData();

        const flyingCreatures = data.filter(isFlyingCreature);
        const swimmingCreatures = data.filter(isSwimmingCreature);

        const flyingCreaturesBySpeed = flyingCreatures
            .sort((a, b) => Math.max(b.speed, b.flySpeed) - Math.max(a.speed, a.flySpeed))
            .slice(0,5);
        const quickestSwimmingCreature = swimmingCreatures
            .reduce((prev, curr) => {
                if (!prev) {
                    return curr;
                }

                return Math.max(curr.swimSpeed, curr.speed) > Math.max(prev.swimSpeed, prev.speed) ? curr : prev;
            });
        const creaturesByDifficulty = data.sort((a, b) => b.challengeRating - a.challengeRating);

        console.log(`This is the list of creatures, ordered by difficulty: ${creaturesByDifficulty.map(entry => entry.name)}.`)
        console.log(`This is the quickest swimming creature in the current list: ${quickestSwimmingCreature.name}.`);
        console.log(`These are the 5 quickest flying creatures: ${flyingCreaturesBySpeed.map(entry => entry.name)}.`)
    } catch (error) {
        console.error(error);
    } finally {
        loading = false;
    }
}

init();