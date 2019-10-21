import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";


export function createCloudtrailLogsBucket(bucketName: string, region: "eu-west-1", versioning: boolean, tags: {},
    provider: aws.Provider, trustedAccountList: string[], importResource?: string, daysTransitionToStandardIa: number = 30,
    daysTransitionToGlacier: number = 60, daysExpiration: number = 1825, daysAbortIncompleteMultipartUpload: number = 7): any {

    var opts = {}
    if (importResource == undefined)
        opts = {provider: provider}
    else
        opts = {provider: provider, import: importResource}


    const cloudtrailLogsBucket = new aws.s3.Bucket(bucketName, {
        bucket: bucketName,
        region: region,
        acl: "private",
        versioning: {
            enabled: true,
        },
        lifecycleRules: [
            {
                id: "logs-transition",
                prefix: "",
                abortIncompleteMultipartUploadDays: daysAbortIncompleteMultipartUpload,
                enabled: true,
                transitions: [
                    {
                        days: daysTransitionToStandardIa,
                        storageClass: "STANDARD_IA",
                    },
                    {
                        days: daysTransitionToGlacier,
                        storageClass: "GLACIER",
                    },
                ],
                expiration: {
                    days: daysExpiration,
                },
            },
        ],
        serverSideEncryptionConfiguration: {
            rule: {
                applyServerSideEncryptionByDefault: {
                    sseAlgorithm: "AES256"
                }
            }
        },
        tags: tags,
    }, opts);


    var policyResourceList:any[] = [];
    for (let accountId of trustedAccountList) {
        policyResourceList.push(pulumi.concat(cloudtrailLogsBucket.arn, "/AWSLogs/", accountId, "/*"))
    }

    const cloudtrailLogsBucketPolicyDocument: aws.iam.PolicyDocument = {
        Version: "2012-10-17",
        Id: "crossAccountLogsBucketPolicy",
        Statement: [
            {
                Sid: "AWSCloudTrailAcl",
                Action: "s3:GetBucketAcl",
                Principal: {
                   Service: "cloudtrail.amazonaws.com"
                },
                Effect: "Allow",
                Resource: pulumi.interpolate `${cloudtrailLogsBucket.arn}`
            },
            {
                Sid: "AWSCloudTrailWrite",
                Effect: "Allow",
                Principal: {
                    Service: "cloudtrail.amazonaws.com"
                },
                Action: "s3:PutObject",
                Resource: policyResourceList,
                Condition: {
                    "StringEquals": {
                        "s3:x-amz-acl": "bucket-owner-full-control"
                    }
                }
            }
        ],
    };

    const cloudtrailLogsBucketPolicy = new aws.s3.BucketPolicy(bucketName, {
        bucket: cloudtrailLogsBucket.id,
        policy: cloudtrailLogsBucketPolicyDocument,
    }, opts);

    return [cloudtrailLogsBucket, cloudtrailLogsBucketPolicy]
}
