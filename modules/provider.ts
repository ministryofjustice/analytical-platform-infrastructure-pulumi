import * as aws from "@pulumi/aws";


export function createProvider(roleARN: string, region: "eu-west-1"): aws.Provider {
    const provider = new aws.Provider(`${roleARN}`, {
        assumeRole: {
            roleArn: roleARN,
            sessionName: "PulumiSession",
            externalId: "PulumiApplication",
        },
        region: region,
    });
    return provider
}
