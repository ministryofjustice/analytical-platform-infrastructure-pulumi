import * as provider from "../modules/provider";
import * as logsBucket from "../modules/cloudtrailLogsBucket"
import * as kopsBucket from "../modules/kopsStateBucket"


let accountID = {
    "landing": '335823981503',
    "dev": "525294151996",
    "prod": "312423030077"
}

const region = "eu-west-1"

const landingProvider = provider.createProvider('arn:aws:iam::335823981503:role/terraform-infrastructure', region)

let tags = {
    "owner": "analytical-platform:analytics-platform-tech@digital.justice.gov.uk",
    "business-unit": "Platforms",
    "application": "analytical-platform",
    "is-production": "true",
}


// CLOUDTRAIL BUCKET
export const cloudtrailLogsBucketName = "cloudtrail.analytical-platform.service.justice.gov.uk"
const cloudtrailTrustedAccountList = [accountID['landing'], accountID['dev'], accountID['prod']]
const cloudtrail_logs_bucket = logsBucket.createCloudtrailLogsBucket(
    cloudtrailLogsBucketName, "eu-west-1", true, tags, landingProvider, cloudtrailTrustedAccountList, cloudtrailLogsBucketName
)


// KOPS STATE BUCKET
export const kopsStateBucketName = "kops.analytical-platform.service.justice.gov.uk"
const kopsTrustedAccountList = [accountID['dev'], accountID['prod']]
const kopsStateBucket =  kopsBucket.createKopsStateBucket(kopsStateBucketName, "eu-west-1", true, tags,
    landingProvider, kopsTrustedAccountList, kopsStateBucketName
)
