#!/usr/bin/env bash
set -e
set -x

VAULT_TOKEN=$1
GIT_BRANCH=$2
TARGET_ENV=$3

set +x
if [ -z "$TARGET_ENV" ]; then
    echo "TARGET_ENV argument not supplied; inferring from GIT_BRANCH '$GIT_BRANCH'."

    if [ "$GIT_BRANCH" == "dev" ]; then
        TARGET_ENV="dev"
    elif [ "$GIT_BRANCH" == "alpha" ]; then
        TARGET_ENV="alpha"
    elif [ "$GIT_BRANCH" == "perf" ]; then
        TARGET_ENV="perf"
    elif [ "$GIT_BRANCH" == "staging" ]; then
        TARGET_ENV="staging"
    elif [ "$GIT_BRANCH" == "master" ]; then
        TARGET_ENV="prod"
    else
        echo "Git branch '$GIT_BRANCH' is not configured to automatically deploy to a target environment"
        exit 1
    fi
fi

if [[ "$TARGET_ENV" =~ ^(dev|alpha|perf|staging|prod)$ ]]; then
    ENVIRONMENT=${TARGET_ENV}
else
    echo "Unknown environment: $TARGET_ENV - must be one of [dev, alpha, perf, staging, prod]"
    exit 1
fi

echo "Deploying branch '${GIT_BRANCH}' to ${ENVIRONMENT}"
set -x

PROJECT_NAME="broad-dsde-${ENVIRONMENT}"

DEPLOYER_SA_KEY_FILE="deploy_account.json"
# Get the tier specific credentials for the service account out of Vault
# Put key into SERVICE_ACCT_KEY_FILE
docker run --rm -e VAULT_TOKEN=${VAULT_TOKEN} broadinstitute/dsde-toolbox vault read --format=json "secret/dsde/martha/${ENVIRONMENT}/deploy-account.json" | jq .data > ${DEPLOYER_SA_KEY_FILE}

SHARED_SA_KEY="shared_sa_key.json"
docker run --rm -e VAULT_TOKEN=${VAULT_TOKEN} broadinstitute/dsde-toolbox vault read --format=json "secret/dsde/bond/mock-provider/user-service-account-key.json" | jq .data > ${SHARED_SA_KEY}

SOURCE_PATH=/source
# Process all Consul .ctmpl files
# Vault token is required by the docker image regardless of whether you having any data in Vault or not
docker run --rm -v $PWD:${SOURCE_PATH} \
  -e INPUT_PATH=${SOURCE_PATH} \
  -e OUT_PATH=${SOURCE_PATH} \
  -e ENVIRONMENT=${ENVIRONMENT} \
  -e VAULT_TOKEN=${VAULT_TOKEN} \
  -e RUN_CONTEXT=live \
  -e DNS_DOMAIN=NULL \
  broadinstitute/dsde-toolbox render-templates.sh

DEPLOYER_IMAGE=google/cloud-sdk:225.0.0
BUCKET="gs://wb-dev-mock-provider"

# Overriding ENTRYPOINT has some subtleties: https://medium.com/@oprearocks/how-to-properly-override-the-entrypoint-using-docker-run-2e081e5feb9d
docker run --rm \
    --entrypoint="/bin/bash" \
    -v $PWD:${SOURCE_PATH} \
    -e BASE_URL="https://us-central1-broad-dsde-${ENVIRONMENT}.cloudfunctions.net" \
    ${DEPLOYER_IMAGE} -c \
    "gcloud config set project ${PROJECT_NAME} &&
     gcloud auth activate-service-account --key-file ${SOURCE_PATH}/${DEPLOYER_SA_KEY_FILE} &&
     cd ${SOURCE_PATH} &&
     ./deploy/upload_to_bucket.sh resources/well-known.json ${BUCKET} &&
     ./deploy/upload_to_bucket.sh resources/token-object.json ${BUCKET} &&
     ./deploy/upload_to_bucket.sh ${SHARED_SA_KEY} ${BUCKET} &&
     ./deploy/deploy_functions.sh"
