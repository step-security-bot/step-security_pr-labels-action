import * as core from '@actions/core';
import {context} from '@actions/github';
import {keysFor} from './label-keys';
import {badge} from './log-format';
import {validateSubscription} from './subscription';

type LabelMap = Record<string, true>;

interface LabelSnapshot {
    /** null when the triggering event carries no pull request */
    map: LabelMap | null;
    envVars: string[];
}

function readPullRequestLabels(): Array<{name: string; color: string}> | undefined {
    return context.payload.pull_request?.labels;
}

function buildSnapshot(): LabelSnapshot {
    const labels = readPullRequestLabels();
    if (labels === undefined) {
        core.info('Event has no pull request payload; publishing empty results.');
        return {map: null, envVars: []};
    }

    core.info(`Pull request carries ${labels.length} label(s).`);
    const map: LabelMap = {};
    const envVars: string[] = [];

    for (const label of labels) {
        const {slug, envVar} = keysFor(label.name);
        map[slug] = true;
        envVars.push(envVar);
        core.info(`  ${badge(label.name, label.color)}  ->  ${slug}  |  $${envVar}`);
    }
    return {map, envVars};
}

function publish({map, envVars}: LabelSnapshot): void {
    envVars.forEach((name) => core.exportVariable(name, '1'));

    const slugs = map === null ? [] : Object.keys(map);
    const labelsOutput = slugs.length > 0 ? ` ${slugs.join(' ')} ` : '';

    core.setOutput('labels', labelsOutput);
    core.setOutput('labels-object', map);

    if (envVars.length > 0) {
        core.info(`Exported ${envVars.length} environment variable(s) with value 1 for later steps.`);
    }
    core.info(`outputs.labels = ${JSON.stringify(labelsOutput)}`);
    core.info(`outputs.labels-object = ${JSON.stringify(map)}`);
}

async function main(): Promise<void> {
    await validateSubscription();
    publish(buildSnapshot());
}

main().catch((error: unknown) => {
    core.setFailed(error instanceof Error ? error.message : String(error));
});
