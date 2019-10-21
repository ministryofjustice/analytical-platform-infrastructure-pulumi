import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export function createKopsStateBucket(bucketName: string, region: "eu-west-1", versioning: boolean, tags: {},
    provider: aws.Provider, trustedAccountList: string[], importResource?: string): any {

    var opts = {}
    if (importResource == undefined)
        opts = {provider: provider}
    else
        opts = {provider: provider, import: importResource}

    const kopsStateBucket = new aws.s3.Bucket(bucketName, {
        bucket: bucketName,
        region: region,
        acl: "private",
        versioning: {
            enabled: versioning,
        },

        serverSideEncryptionConfiguration: {
            rule: {
                applyServerSideEncryptionByDefault: {
                    sseAlgorithm: "AES256"
                }
            }
        },
        tags: tags,
    }, opts);

    var policyPrincipalList:any[] = [];
    for (let accountId of trustedAccountList) {
        policyPrincipalList.push(pulumi.concat("arn:aws:iam::", accountId, ":root"))
    }

    const kopsStateBucketPolicyDocument: aws.iam.PolicyDocument = {
        Version: "2012-10-17",
        Id: "crossAccountKopsStateBucketPolicy",
        Statement: [
            {
                Sid: "KopsStateAcl",
                Action: "s3:*",
                Principal: {
                   AWS: policyPrincipalList
                },
                Effect: "Allow",
                Resource: [
                    pulumi.concat(kopsStateBucket.arn),
                    pulumi.concat(kopsStateBucket.arn, "/*")
                ]
            },
        ],
    };

    const kopsStateBucketPolicy: aws.s3.BucketPolicy = new aws.s3.BucketPolicy(bucketName, {
        bucket: kopsStateBucket.id,
        policy: kopsStateBucketPolicyDocument,
    }, opts);

    return [kopsStateBucket, kopsStateBucketPolicy]

}
