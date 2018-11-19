#!/usr/bin/env bash

set -e
set -x

SOURCE_FILE=$1
BUCKET=$2

echo "Uploading file: ${SOURCE_FILE} to bucket: ${BUCKET}"

# Create the object in the bucket
gsutil cp ${SOURCE_FILE} ${BUCKET}

TARGET_GS_URL=${BUCKET}/$(basename ${SOURCE_FILE})
echo "Object created at: ${TARGET_GS_URL}"

# Set permissions so that All Users can read the object
gsutil acl ch -u AllUsers:R ${TARGET_GS_URL}

# Update the Cache Controls so that the file is not cached (so that we can update it and see our changes right away)
gsutil setmeta -h 'Cache-Control:private, max-age=0, no-transform' ${TARGET_GS_URL}